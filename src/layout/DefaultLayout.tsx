import { Footer, Header } from '@/components/shared/layout'
import { cn } from '@/utils/cn'

export const DefaultLayout = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <>
      <Header />
      <main
        className={cn(
          'relative z-[1] px-4 md:px-0 pb-4 md:pb-0 pt-[4rem] min-h-screen',
          className,
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
