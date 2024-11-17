import { FC, ReactNode } from 'react'
import type { HTMLElementProps } from './html'

export type WithChildren<T> = T & { children?: ReactNode }

export type FCC<T = {}> = FC<WithChildren<T>>
export type FCCD<T = {}> = FCC<
  T & {
    className?: string
  }
>

export type HTML<T> = FC<HTMLElementProps<T>>
