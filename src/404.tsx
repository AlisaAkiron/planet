import { Link } from 'wouter'
import { DefaultLayout } from './layout/DefaultLayout'
import { cn } from './utils/cn'

export const NotFoundPage = () => {
  return (
    <DefaultLayout className="flex items-center justify-center">
      <div className={cn('flex flex-col gap-8 justify-center items-center')}>
        <h1 className="text-4xl font-semibold">404 - Not Found</h1>

        <button className="btn btn-primary py-3 px-6">
          <Link href="/" target="_self">
            返回主页
          </Link>
        </button>
      </div>
    </DefaultLayout>
  )
}
