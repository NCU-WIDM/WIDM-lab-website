import { currentDayName } from '@/lib/utils/dateUtils'
import Link from './Link'
import NowPlayingFooter from './NowPlayingFooter'

export default function Footer() {
  const dayName = currentDayName()

  return (
    <footer>
      <div className="mt-10 flex flex-col items-center">
        <div className="">
          <NowPlayingFooter />
        </div>
        <div className="mb-2 hidden text-sm text-gray-500 dark:text-gray-400 md:flex">
          <div className="mx-1"> WIDM{` © ${new Date().getFullYear()}`} </div>
          {`•`}
          <div className="mx-1">
            <Link href="https://qod.shakiltech.com/" className="link-underline">
              Have a good {dayName}!
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
