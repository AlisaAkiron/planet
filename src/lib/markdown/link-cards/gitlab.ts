import { GITLAB_HOSTS } from '@/config/domains'
import { UA_HEADER, cachedFetchJson, cachedFetchText } from '../fetch-cache.ts'
import { buildFileSnippet, parseLineRange } from './file-snippet.ts'
import { compactNumber } from './format.ts'
import { toLanguageStats } from './language-colors.ts'
import type { CardMeta, LinkCardProvider } from './types.ts'

interface GlProject {
  path_with_namespace: string
  description: string | null
  star_count: number
  forks_count: number
  open_issues_count?: number
  avatar_url: string | null
}

interface GlMergeRequest {
  title: string
  state: string
  draft?: boolean
}

interface GlIssue {
  title: string
  state: string
}

interface GlUser {
  name: string
  username: string
  avatar_url: string | null
}

interface GlGroup {
  name: string
  full_name?: string
  description: string | null
  avatar_url: string | null
}

/** GitLab says 'opened'; the card badges use GitHub-style 'open'. */
const normalizeState = (state: string, draft?: boolean) =>
  state === 'opened' ? (draft ? 'draft' : 'open') : state

// Self-hosted instances often sit behind anti-bot filters that reject
// requests without a User-Agent.
const HEADERS = UA_HEADER

const normalizeHost = (host: string) => host.toLowerCase().replace(/\.$/, '')

// Hosts come from the central domain config; anything else renders as a
// plain link and is never fetched for metadata.
const gitlabHosts = new Set(GITLAB_HOSTS.map(normalizeHost))

export const gitlab: LinkCardProvider = {
  name: 'gitlab',
  match: url => {
    if (!gitlabHosts.has(normalizeHost(url.hostname))) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return null
    const marker = parts.indexOf('-')
    if (marker === -1) {
      const info = { host: url.hostname, path: parts.join('/') }
      return parts.length === 1
        ? { kind: 'profile', info }
        : { kind: 'project', info }
    }
    const project = parts.slice(0, marker).join('/')
    const resource = parts[marker + 1]
    const rest = parts.slice(marker + 2)
    const info: Record<string, string> = { host: url.hostname, path: project }
    if (resource === 'merge_requests' && rest[0]) {
      return { kind: 'mr', info: { ...info, number: rest[0] } }
    }
    if (resource === 'issues' && rest[0]) {
      return { kind: 'issue', info: { ...info, number: rest[0] } }
    }
    if (resource === 'blob' && rest.length >= 2) {
      info.ref = rest[0]
      info.file = rest.slice(1).join('/')
      Object.assign(info, parseLineRange(url.hash.slice(1)))
      return { kind: 'file', info }
    }
    return { kind: 'project', info }
  },
  // Public REST API on the whitelisted host. match() already guarantees
  // the host is registered; this re-check keeps the SSRF invariant local —
  // renderMarkdown is a public endpoint, so this must never fetch a host
  // the site owner didn't explicitly whitelist.
  fetchMeta: async ({ kind, info }): Promise<CardMeta | null> => {
    const host = normalizeHost(info.host)
    if (!gitlabHosts.has(host)) return null
    const api = `https://${host}/api/v4`
    const project = encodeURIComponent(info.path)
    if (kind === 'project') {
      const [data, languages] = await Promise.all([
        cachedFetchJson<GlProject>(`${api}/projects/${project}`, {
          headers: HEADERS,
        }),
        cachedFetchJson<Record<string, number>>(
          `${api}/projects/${project}/languages`,
          { headers: HEADERS },
        ),
      ])
      if (!data) return null
      const extra: Record<string, string> = {
        stars: compactNumber(data.star_count),
        forks: compactNumber(data.forks_count),
      }
      if (data.open_issues_count !== undefined) {
        extra.issues = compactNumber(data.open_issues_count)
      }
      return {
        title: data.path_with_namespace,
        description: data.description ?? undefined,
        image: data.avatar_url ?? undefined,
        extra,
        languages: toLanguageStats(languages),
      }
    }
    if (kind === 'file') {
      const filePath = encodeURIComponent(decodeURIComponent(info.file))
      const raw = await cachedFetchText(
        `${api}/projects/${project}/repository/files/${filePath}/raw?ref=${encodeURIComponent(info.ref)}`,
        { headers: HEADERS },
      )
      if (raw === null) return null
      return buildFileSnippet(raw, info.file, info)
    }
    if (kind === 'mr') {
      const mr = await cachedFetchJson<GlMergeRequest>(
        `${api}/projects/${project}/merge_requests/${info.number}`,
        { headers: HEADERS },
      )
      if (!mr) return null
      return {
        title: mr.title,
        extra: { state: normalizeState(mr.state, mr.draft) },
      }
    }
    if (kind === 'issue') {
      const issue = await cachedFetchJson<GlIssue>(
        `${api}/projects/${project}/issues/${info.number}`,
        { headers: HEADERS },
      )
      if (!issue) return null
      return {
        title: issue.title,
        extra: { state: normalizeState(issue.state) },
      }
    }
    if (kind === 'profile') {
      // A single path segment is a user or a top-level group — try both.
      const users = await cachedFetchJson<GlUser[]>(
        `${api}/users?username=${encodeURIComponent(info.path)}`,
        { headers: HEADERS },
      )
      const user = users?.[0]
      if (user) {
        // No bio in the public listing; the card shows the @handle itself
        return {
          title: user.name,
          image: user.avatar_url ?? undefined,
        }
      }
      const group = await cachedFetchJson<GlGroup>(
        `${api}/groups/${project}?with_projects=false`,
        { headers: HEADERS },
      )
      if (!group) return null
      return {
        title: group.full_name ?? group.name,
        description: group.description ?? undefined,
        image: group.avatar_url ?? undefined,
      }
    }
    return null
  },
}
