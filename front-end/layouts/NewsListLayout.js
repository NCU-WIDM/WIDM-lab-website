import Link from '@/components/Link'
import { useState } from 'react'
import Pagination from '@/components/Pagination'

export default function ListLayout({ posts, title, initialDisplayPosts = [] }) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  // Get unique news types
  const newsTypes = ['all', ...new Set(posts.flatMap(post => 
    Array.isArray(post.types) ? post.types : post.types ? [post.types] : []
  ))]

  const filteredNewsPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.sub_title
    const matchesSearch = searchContent.toLowerCase().includes(searchValue.toLowerCase())
    const matchesType = selectedType === 'all' || 
      (Array.isArray(frontMatter.types) 
        ? frontMatter.types.includes(selectedType)
        : frontMatter.types === selectedType)
    return matchesSearch && matchesType
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts = initialDisplayPosts.length > 0 && !searchValue && selectedType === 'all' 
    ? initialDisplayPosts 
    : filteredNewsPosts

  return (
    <>
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="pt-6 pb-8 md:space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12">
              {title}
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative max-w-lg flex-grow">
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
              <div className="w-full md:w-64">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full rounded-md border border-gray-400 bg-white px-4 py-2 pr-8 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  {newsTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All News' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <ul className='list-none'>
          {!filteredNewsPosts.length && <h2 className=' m-2 text-lg'>No News found.</h2>}
          {displayPosts.map((frontMatter) => {
            const { id, uniqueId, title, create_time } = frontMatter
            return (
              <Link
                href={`/news/${id}`}
                key={id}
                className="group block border-b border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <li key={uniqueId} className="list-none py-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{create_time}</span>
                  </div>
                </li>
              </Link>
            )
          })}
        </ul>
      </div>
      {/* {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )} */}
    </>
  )
}
