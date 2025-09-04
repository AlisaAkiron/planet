import { Route, Switch } from 'wouter'
import { NotFoundPage } from './404'
import { HomePage } from './pages/HomePage'

export const AppRouter = () => {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  )
}
