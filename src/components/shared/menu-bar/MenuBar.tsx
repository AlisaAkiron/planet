'use client'

import { FC } from 'react'
import Link from 'next/link'

import { Menu } from './menu'

export const MenuBar: FC = () => {
  return (
    <div className="navbar fixed top-0 right-0 left-0 z-50">
      <div className="navbar-start">
        {/* <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <MenuIcon />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <Menu />
          </ul>
        </div> */}
        <Link href="/" className="btn btn-ghost text-xl">
          迷いの森
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <Menu />
        </ul>
      </div>
      <div className="navbar-end"></div>
    </div>
  )
}
