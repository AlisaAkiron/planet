import { UA_HEADER, cachedFetchJson, cachedFetchText } from '../fetch-cache.ts'
import { buildFileSnippet, parseLineRange } from './file-snippet.ts'
import { compactNumber, formatMonthYear } from './format.ts'
import { toLanguageStats } from './language-colors.ts'
import type { CardMeta, LinkCardProvider } from './types.ts'

const API = 'https://api.github.com'

const HEADERS = {
  Accept: 'application/vnd.github+json',
  ...UA_HEADER,
}

interface GhRepo {
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  owner: { avatar_url: string }
}

interface GhUser {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  followers: number
  following: number
  public_repos: number
  company: string | null
  blog: string | null
  location: string | null
  created_at: string
}

interface GhSearch {
  total_count: number
}

interface GhIssue {
  title: string
  state: string
  merged_at?: string | null
  draft?: boolean
}

const RESERVED = new Set([
  'about',
  'apps',
  'collections',
  'contact',
  'customer-stories',
  'enterprise',
  'events',
  'explore',
  'features',
  'issues',
  'join',
  'login',
  'marketplace',
  'notifications',
  'organizations',
  'orgs',
  'pricing',
  'pulls',
  'security',
  'settings',
  'sponsors',
  'topics',
  'trending',
])

export const github: LinkCardProvider = {
  name: 'github',
  match: url => {
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
      return null
    }
    const parts = url.pathname.split('/').filter(Boolean)
    const [owner, repo, section, ...rest] = parts
    if (!owner || RESERVED.has(owner.toLowerCase())) return null
    if (parts.length === 1) return { kind: 'profile', info: { owner } }
    if (parts.length === 2) return { kind: 'repo', info: { owner, repo } }
    if (section === 'pull' && rest[0]) {
      return { kind: 'pull', info: { owner, repo, number: rest[0] } }
    }
    if (section === 'issues' && rest[0]) {
      return { kind: 'issue', info: { owner, repo, number: rest[0] } }
    }
    if ((section === 'blob' || section === 'tree') && rest.length >= 2) {
      const info: Record<string, string> = {
        owner,
        repo,
        ref: rest[0],
        path: rest.slice(1).join('/'),
        ...parseLineRange(url.hash.slice(1)),
      }
      return { kind: 'file', info }
    }
    return null
  },
  fetchMeta: async ({ kind, info }): Promise<CardMeta | null> => {
    if (kind === 'repo') {
      const repoPath = `${info.owner}/${info.repo}`
      const prQuery = encodeURIComponent(`repo:${repoPath} is:pr is:open`)
      const [repo, languages, prSearch] = await Promise.all([
        cachedFetchJson<GhRepo>(`${API}/repos/${repoPath}`, {
          headers: HEADERS,
        }),
        cachedFetchJson<Record<string, number>>(
          `${API}/repos/${repoPath}/languages`,
          { headers: HEADERS },
        ),
        cachedFetchJson<GhSearch>(
          `${API}/search/issues?q=${prQuery}&per_page=1`,
          { headers: HEADERS },
        ),
      ])
      if (!repo) return null
      const extra: Record<string, string> = {
        stars: compactNumber(repo.stargazers_count),
        forks: compactNumber(repo.forks_count),
      }
      if (prSearch) {
        // open_issues_count includes PRs — subtract for the real count
        extra.prs = compactNumber(prSearch.total_count)
        extra.issues = compactNumber(
          Math.max(0, repo.open_issues_count - prSearch.total_count),
        )
      } else {
        extra.issues = compactNumber(repo.open_issues_count)
      }
      const stats = toLanguageStats(languages)
      return {
        title: repo.full_name,
        description: repo.description ?? undefined,
        image: repo.owner.avatar_url,
        extra,
        languages:
          stats.length > 0
            ? stats
            : toLanguageStats(repo.language ? { [repo.language]: 1 } : null),
      }
    }
    if (kind === 'profile') {
      const user = await cachedFetchJson<GhUser>(`${API}/users/${info.owner}`, {
        headers: HEADERS,
      })
      if (!user) return null
      const extra: Record<string, string> = {
        followers: compactNumber(user.followers),
        following: compactNumber(user.following),
        repos: compactNumber(user.public_repos),
      }
      if (user.location) extra.location = user.location
      if (user.company) extra.company = user.company
      if (user.blog) extra.website = user.blog
      const joined = formatMonthYear(user.created_at)
      if (joined) extra.joined = joined
      return {
        title: user.name ?? `@${user.login}`,
        description: user.bio ?? undefined,
        image: user.avatar_url,
        extra,
      }
    }
    if (kind === 'file') {
      // raw.githubusercontent.com is a fixed constant host, not derived
      // from user input.
      const raw = await cachedFetchText(
        `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.ref}/${info.path}`,
        { headers: HEADERS },
      )
      if (raw === null) return null
      return buildFileSnippet(raw, info.path, info)
    }
    if (kind === 'pull' || kind === 'issue') {
      const path = kind === 'pull' ? 'pulls' : 'issues'
      const item = await cachedFetchJson<GhIssue>(
        `${API}/repos/${info.owner}/${info.repo}/${path}/${info.number}`,
        { headers: HEADERS },
      )
      if (!item) return null
      const state = item.merged_at
        ? 'merged'
        : item.draft
          ? 'draft'
          : item.state
      return { title: item.title, extra: { state } }
    }
    return null
  },
}
