import { cn } from '@/utils/cn'

const START_YEAR = 2024

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  const copyrightYear =
    currentYear === START_YEAR
      ? `${START_YEAR}`
      : `${START_YEAR}-${currentYear}`

  return (
    <footer
      className={cn(
        'relative z-[1] py-10 px-4 sm:px-10 mt-6',
        'border-t border-gray-300 dark:border-gray-600',
        'text-base-content/80 text-sm',
      )}
    >
      <div className="relative mx-auto max-w-7xl lg:px-8 text-center md:text-left">
        {/* Line 1 */}
        <p>
          <span>© {copyrightYear} </span>
          <a
            className="link-hover link"
            href="https://alisaqaq.moe"
            target="_blank"
            rel="noreferrer"
          >
            Alisa Akiron
          </a>
          <span>.</span>
        </p>
        <p>
          <span>Powered by </span>
          <a
            className="link link-hover"
            href="https://github.com/AlisaAkiron/Atmos"
            target="_blank"
            rel="noreferrer"
          >
            Atmos
          </a>
          <span> & </span>
          <a
            className="link link-hover"
            href="https://github.com/AlisaAkiron/planet"
            target="_blank"
            rel="noreferrer"
          >
            planet
          </a>
          <span className="text-base-content/50"> | </span>
          <a
            className="link link-hover"
            href="https://icp.gov.moe/?keyword=20241270"
            target="_blank"
            rel="noreferrer"
          >
            萌 ICP 备 20241270 号
          </a>
          <span className="text-base-content/50"> | </span>
          <a
            className="link link-hover"
            href="https://travel.moe/go.html?travel=on"
            target="_blank"
            rel="noreferrer"
          >
            异次元之旅
          </a>
        </p>
      </div>
    </footer>
  )
}
