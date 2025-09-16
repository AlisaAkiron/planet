import { Route, Switch } from 'wouter'
import { NotFoundPage } from './404'
import { useCleanUTM } from './hooks/useCleanUTM'
import { HomePage } from './pages/HomePage'

export const AppRouter = () => {
  useCleanUTM()

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  )
}
