export interface UmamiAnalyticsProps {
  /**
   * The URL of your Umami instance
   */
  url?: string

  /**
   * Your website tracking ID
   */
  websiteId?: string

  /**
   * Custom domains for the analytics script
   */
  domains?: string[]

  /**
   * Additional script attributes
   */
  scriptAttributes?: Record<string, string>
}

export interface UmamiConfig {
  url: string
  websiteId: string
  domains?: string[]
  scriptAttributes?: Record<string, string>
}

export interface PageviewData {
  url?: string
  title?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  utm_id?: string
  // biome-ignore lint/suspicious/noExplicitAny: Unami accepts any additional custom properties
  [key: string]: any
}

export type UTMFetcher = (utmId: string) => Promise<Partial<PageviewData>>
