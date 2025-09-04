import { Route } from 'wouter'
import { HomePage } from './pages/HomePage'

export const AppRouter = () => {
  return <Route path="/" component={HomePage} />
}
