/// <reference lib="webworker" />
import { createMemoryCache, processMarkdown } from '@planet/markdown'
import { FAILURE_TTL_SECONDS } from '../render-options'
import type { WorkerRequest, WorkerResponse } from './renderer'

/**
 * Browser-mode rendering: the whole pipeline runs here, off the main
 * thread, so typing stays smooth through renders and shiki's first WASM
 * compile. Nothing about the document leaves the device; only link-card
 * metadata requests go out, straight to the providers.
 */

// Browsers send their own User-Agent, and setting one makes a request
// non-simple — the CORS preflight that forces is rejected by metadata
// APIs that would otherwise answer a simple cross-origin GET.
//
// Redirects are left to the browser: it hides a manual redirect's status
// and Location (an opaque response), so the renderer's same-host hop
// can't run here. That hop guards servers against being pivoted to other
// hosts; a browser fetching under CORS has nothing to guard.
const browserFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers)
  headers.delete('user-agent')
  return fetch(input, { ...init, headers, redirect: 'follow' })
}

const options = {
  cache: createMemoryCache(),
  failureTtl: FAILURE_TTL_SECONDS,
  fetch: browserFetch,
  cardFailures: true,
  untrustedHtml: true,
}

const post = (message: WorkerResponse) => self.postMessage(message)

// Latest wins: while a render runs, only the newest request waits; any
// request it replaces is answered as superseded, never rendered.
let queued: WorkerRequest | null = null
let running = false

const drain = async () => {
  running = true
  while (queued) {
    const { id, markdown } = queued
    queued = null
    try {
      post({ id, result: await processMarkdown(markdown, options) })
    } catch (error) {
      post({
        id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  running = false
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  if (queued) post({ id: queued.id, superseded: true })
  queued = event.data
  if (!running) void drain()
})
