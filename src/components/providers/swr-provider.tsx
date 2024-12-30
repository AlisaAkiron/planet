'use client'

import { SWRConfig, SWRConfiguration } from 'swr'

import { FCC } from '@/types'

export const SWRProvider: FCC = ({ children }) => {
  return (
    <>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        {children}
      </SWRConfig>
    </>
  )
}
