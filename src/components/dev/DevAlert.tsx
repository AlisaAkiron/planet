'use client'

import { FC, useState } from 'react'

import { isProduction } from '@/lib/env'

export const DevAlert: FC = () => {
  const [isShow, setIsShow] = useState(true)

  return (
    <>
      {isProduction && isShow && (
        <div
          role="alert"
          className="alert fixed left-0 right-0 top-0 z-50 mx-auto my-4 max-w-[80%] shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-info"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">ATTENTION</h3>
            <div className="text-xs">本站正在开发中</div>
          </div>
          <div className="space-x-2">
            <button className="btn btn-sm" onClick={() => setIsShow(false)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  )
}
