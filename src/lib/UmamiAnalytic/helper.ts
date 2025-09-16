import type { UmamiAnalyticsProps, UmamiConfig } from './types'

export const createUmamiConfig = (props: UmamiAnalyticsProps): UmamiConfig => {
  return {
    url: props.url ?? '',
    websiteId: props.websiteId ?? '',
    domains: props.domains,
    scriptAttributes: props.scriptAttributes,
  }
}
