import { env } from 'next-runtime-env'

export const isProduction =
  env('NEXT_PUBLIC_ENV')?.toLocaleLowerCase() === 'production'
