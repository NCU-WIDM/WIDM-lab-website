import React, { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'

export default function NavDropdown({ title, href, dropdown }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Menu as="div" className="relative inline-flex items-center">
      <div 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex items-center">
          <Link
            key={title}
            href={href}
          >
            <span className="relative inline-block">
              {title}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </span>
          </Link>
          <Menu.Button 
            className="rounded hover:bg-gray-200 
              dark:hover:bg-gray-700 text-sm ml-1"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          show={isOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items 
            static
            className="
              absolute right-0 top-full mt-2
              w-auto min-w-max
              rounded-md
              bg-white shadow-2xl
              border border-gray-200 dark:border-gray-700
              ring-1 ring-black ring-opacity-5
              focus:outline-none z-50
              transition-all duration-200 ease-in-out
              dark:bg-gray-900 dark:border-gray-700
            "
          >
            {dropdown.map((item) => (
              <Menu.Item key={item.title}>
                {({ active }) => (
                  <div
                    className={`
                      block text-center px-2 py-2
                      text-gray-900 dark:text-gray-100
                      bg-white dark:bg-gray-800
                      hover:underline decoration-pink-500 hover:bg-pink-100 dark:hover:bg-gray-700
                      transition-colors duration-150
                      overflow-hidden
                    `}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  )
}
