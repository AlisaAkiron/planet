import { createMemoryCache, processMarkdown } from '@planet/markdown'
import { createServerFn } from '@tanstack/react-start'
import { FAILURE_TTL_SECONDS, MAX_DOCUMENT_BYTES } from '../render-options.ts'
import { loadConfig } from './config.ts'
import type { SerializedRender } from '../protocol.ts'

/** The page's settings; the root loader fetches them. */
export const getPreviewConfig = createServerFn({ method: 'GET' }).handler(() =>
  loadConfig(),
)

const cache = createMemoryCache()

/**
 * Server-side rendering of a document, as on the site: the pipeline runs
 * here and the page receives the hast tree. Like the site's renderMarkdown,
 * the tree crosses the RPC boundary as one JSON string instead of
 * thousands of nodes for the serializer to walk.
 */
export const renderDocument = createServerFn({ method: 'POST' })
  .validator((input: { content: string }) => {
    if (typeof input?.content !== 'string') {
      throw new Error('renderDocument requires { content: string }')
    }
    // Characters, not bytes; the production listener caps raw bodies too.
    if (input.content.length > MAX_DOCUMENT_BYTES) {
      throw new Error('document too large')
    }
    return { content: input.content }
  })
  .handler(async ({ data }): Promise<SerializedRender> => {
    const { tree, ...rest } = await processMarkdown(data.content, {
      cache,
      failureTtl: FAILURE_TTL_SECONDS,
      cardFailures: true,
      untrustedHtml: true,
    })
    return { ...rest, tree: JSON.stringify(tree) }
  })
