import Link from '@/components/Link'
import { useState } from 'react'
import Pagination from '@/components/Pagination'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredNewsPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.sub_title
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts = initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredNewsPosts

  return (
    <>
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          {/* 大標題 */}
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>

          {/* 搜索框 */}
          <div className="relative max-w-lg">
            <input
              aria-label="Search news"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search news"
              className="block w-full rounded-md border border-gray-400 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul className='list-none'>
          {!filteredNewsPosts.length && <h2 className=' m-2 text-lg'>No News found.</h2>}
          {displayPosts.map((frontMatter) => {
            const { id, uniqueId, sub_title, title, content, create_time } = frontMatter
            return (
              <Link
                href={`/news/${id}`}
                key={id}
                className="group flex bg-transparent bg-opacity-20 px-2 transition duration-100 hover:scale-105 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-300"
              >
                <li key={uniqueId} className="list-none py-6">
                  <article className="space-y-2 bg-transparent bg-opacity-20 p-2 transition duration-200 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-3">
                    <div className="space-y-5 xl:col-span-4">
                      <div className="space-y-1">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            {title}
                          </h2>
                        </div>
                        <div>{sub_title}</div>
                      </div>
                      {/* 調整 create_time 的樣式 */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{create_time}</p>
                    </div>
                  </article>
                </li>
              </Link>

            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
