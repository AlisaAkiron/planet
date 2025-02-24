import { FC, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { FCC } from '@/types'

type MenuItem = {
  name: string
  url?: string
  children: {
    name: string
    url: string
    enable: boolean
  }[]
}

const menuItems: MenuItem[] = [
  {
    name: '首页',
    url: '/',
    children: [
      { name: '自述', url: '/me', enable: false },
      { name: '关于', url: '/about', enable: false },
      { name: '联系', url: '/contact', enable: false },
    ],
  },
  {
    name: '文章',
    url: '/posts',
    children: [
      { name: '编程', url: '/category/programming', enable: false },
      { name: '折腾', url: '/category/toss', enable: false },
      { name: '日志', url: '/category/logs', enable: false },
      { name: '归档', url: '/archive', enable: false },
    ],
  },
  {
    name: '标签',
    url: '/tags',
    children: [],
  },
  {
    name: '更多',
    children: [
      { name: '友链', url: '/friends', enable: false },
      { name: '项目', url: '/projects', enable: false },
      {
        name: '跃迁',
        url: 'https://travel.moe/go.html?travel=on',
        enable: true,
      },
    ],
  },
]

export const Menu: FC = () => {
  return (
    <div className="join">
      {menuItems.map((item, index) => (
        <li key={index} className="join-item w-16">
          <MenuDropDown menuItem={item} />
        </li>
      ))}
    </div>
  )
}

const MenuDropDown: FC<{
  menuItem: MenuItem
}> = ({ menuItem }) => {
  const path = usePathname()
  const router = useRouter()

  const mainElementClicked = useCallback((url: string) => {
    router.push(url)
  }, [])

  if (menuItem.children.length == 0) {
    return (
      <Link
        href={menuItem.url || ''}
        className="flex w-full items-center justify-center"
      >
        {menuItem.name}
      </Link>
    )
  }

  const mainElementName =
    menuItem.url === undefined || path == '/'
      ? menuItem.name
      : (menuItem.children.find((item) => item.url.startsWith(path))?.name ??
        menuItem.name)

  return (
    <div
      className="dropdown dropdown-center dropdown-hover"
      onClick={() => {
        mainElementClicked(menuItem.url || '')
      }}
    >
      <div tabIndex={0} className="flex w-full items-center justify-center">
        {mainElementName}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 border-base-200 z-1 mt-1.5 w-32 rounded-2xl border p-4 shadow"
      >
        {menuItem.children.map((item, index) => (
          <li key={index} className={cn(item.enable ? '' : 'menu-disabled')}>
            {item.enable ? (
              <Link
                href={item.url || ''}
                className="flex w-full items-center justify-center"
              >
                {item.name}
              </Link>
            ) : (
              <WIPIndicator>
                <Link
                  href={item.url || ''}
                  className="flex w-full items-center justify-center"
                >
                  {item.name}
                </Link>
              </WIPIndicator>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const WIPIndicator: FCC = ({ children }) => {
  return (
    <>
      <div className="inline-flex">
        {children}
        <span className="badge badge-info badge-soft badge-xs">WIP</span>
      </div>
    </>
  )
}
