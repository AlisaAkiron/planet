import {
  type UmamiAnalyticsProps,
  UmamiAnalyticsProvider,
} from '@/lib/UmamiAnalytic'

export const UmamiProvider = ({ children }: { children: React.ReactNode }) => {
  const umamiConfig: UmamiAnalyticsProps = import.meta.env.PROD
    ? {
        url: 'https://umami.alisaqaq.moe',
        websiteId: 'ba92d41a-ee5c-4f25-8ff6-d3e8c9728ce9',
        domains: ['alisaqaq.moe'],
        scriptAttributes: {
          async: 'true',
          defer: 'true',
        },
      }
    : {
        url: 'https://umami.alisaqaq.moe',
        websiteId: 'b4dbc717-e2d5-463d-943b-8d64f7c9e491',
        domains: ['localhost'],
        scriptAttributes: {
          async: 'true',
          defer: 'true',
        },
      }

  return (
    <UmamiAnalyticsProvider config={umamiConfig}>
      {children}
    </UmamiAnalyticsProvider>
  )
}
