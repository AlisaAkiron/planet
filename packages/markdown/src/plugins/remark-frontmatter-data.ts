import { parse as parseYaml } from 'yaml'
import type { Root } from 'mdast'
import type { VFile } from 'vfile'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type Frontmatter = Record<string, JsonValue>

declare module 'vfile' {
  interface DataMap {
    frontmatter: Frontmatter
  }
}

/** Parses the YAML frontmatter node (isolated by remark-frontmatter) into vfile data. */
export const remarkFrontmatterData = () => (tree: Root, file: VFile) => {
  const node = tree.children[0]
  if (node?.type !== 'yaml') return
  try {
    const parsed: unknown = parseYaml(node.value)
    file.data.frontmatter =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Frontmatter)
        : {}
  } catch {
    file.data.frontmatter = {}
  }
}
