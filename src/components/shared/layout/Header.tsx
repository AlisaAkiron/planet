import { Link } from '@tanstack/react-router'

export const Header = () => {
  return (
    <header className="navbar fixed top-0 right-0 left-0 z-50 h-16 bg-base-100/80 backdrop-blur-md">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">
          迷いの森
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex"></div>
      <div className="navbar-end"></div>
    </header>
  )
}
