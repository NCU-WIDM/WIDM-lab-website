import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { navigation } from '@/data/nav'
import CommandPalette from './CommandPalette'
import LayoutMessage from './LayoutMessage'
import ThemeSwitch from './ThemeSwitch'
import { useRouter } from 'next/router'
// import DropMenu from './DropMenu.js'
// import Logo from '@/data/logo.svg'
// import MobileNav from './MobileNav'
import { useEffect, useState } from 'react'
import NavDropdown from './NavDropdown'

const LayoutWrapper = ({ children }) => {
  const router = useRouter()
  const [path, setPath] = useState('')

  useEffect(() => {
    setPath(router.asPath)
  }, [router.asPath])

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex flex-col">
          {/* Lab Title */}
          {/* <div className="w-full border-b border-gray-200 dark:border-gray-700">
            <div className="mx-auto max-w-6xl py-6 sm:py-10 lg:py-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl md:text-4xl">
                Web Intelligence Data Mining Lab
              </h1>
            </div>
          </div> */}

          {/* Navigation */}
          <div className="mx-auto w-full max-w-6xl pr-4 py-4 border-b border-gray-200 dark:border-gray-700 sm:pr-6 lg:pr-8">
            <div className="flex items-center justify-between">

              {/* <Link href="/" aria-label={siteMetadata.headerTitle}>
                <div className="text-primary-color dark:text-primary-color-dark text-lg font-semibold sm:text-xl">
                  {`~${path}`}
                </div>
              </Link> */}
              {/* # LOGOS */}
              <div className="flex items-center space-x-4">
                <Link href="/" aria-label={siteMetadata.headerTitle}>
                  <div className="flex items-center space-x-3">
                    <img
                      src="/static/images/logo.png"
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      Web Intelligence<br className="hidden sm:block" />
                      &amp; Data Mining
                    </span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex">
                  <div className="flex items-center h-12">
                    {headerNavLinks.map((link) =>
                      link.dropdown ? (
                        <div
                        key={link.title}
                        className="link-underline rounded py-1 px-2 text-gray-900 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700 sm:py-2 sm:px-3"
                        >
                        <NavDropdown
                          title={link.title}
                          href={link.href}
                          dropdown={link.dropdown}
                        />
                        </div>
                      ) : (
                        <Link
                          key={link.title}
                          href={link.href}
                          className="link-underline rounded py-1 px-2 text-gray-900 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700 sm:py-2 sm:px-3"
                        >
                          {link.title}
                          </Link>
                      )
                    )}
                  </div>
                </div>
                <CommandPalette navigation={navigation} />
                <ThemeSwitch />
                <LayoutMessage />
              </div>
            </div>
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
