'use client'

import { FC } from 'react'

import cfg from '@/config'

export const Footer: FC = () => {
  const f = cfg.footer
  const currentYear = new Date().getFullYear()
  const copyrightYear =
    currentYear === f.copyright.startYear
      ? `${f.copyright.startYear}`
      : `${f.copyright.startYear}-${currentYear}`

  return (
    <footer className="relative z-[1] mt-16 border-t border-gray-300 py-8 text-sm text-base-content/80 dark:border-gray-600">
      <div className="px-4 sm:px-8">
        <div className="relative mx-auto max-w-7xl lg:px-8">
          <div className="mt-12 space-y-3 text-center md:mt-6 md:text-left">
            <p>
              <span>© {copyrightYear} </span>
              <a
                className="link-hover link"
                href={f.copyright.url}
                target="_blank"
              >
                {f.copyright.holder}
              </a>
              <span>.</span>
            </p>
          </div>
          <div className="text-center md:text-left">
            <p>
              <span>
                <span>Powered by </span>
                <a
                  className="link-hover link"
                  href="https://github.com/AlisaAkiron/Atmos"
                  target="_blank"
                >
                  Atmos
                </a>
                <span> & </span>
                <a
                  className="link-hover link"
                  href="https://github.com/AlisaAkiron/planet"
                  target="_blank"
                >
                  planet
                </a>
              </span>
              {f.icp ? (
                <>
                  <span className="text-base-content/50"> | </span>
                  <span>
                    <a
                      className="link-hover link"
                      href={f.icp.url}
                      target="_blank"
                    >
                      {f.icp.text}
                    </a>
                  </span>
                </>
              ) : (
                <></>
              )}
              {f.moeTravel ? (
                <>
                  <span className="text-base-content/50"> | </span>
                  <span>
                    <a
                      className="link-hover link"
                      href="https://travel.moe/go.html?travel=on"
                      target="_blank"
                    >
                      异次元之旅
                    </a>
                  </span>
                </>
              ) : (
                <></>
              )}
            </p>
          </div>

          {/* <div className="mt-6 block text-center md:absolute md:bottom-0 md:right-0 md:mt-0">
            <div className="relative inline-block">
              <ThemeSwitch />
            </div>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
