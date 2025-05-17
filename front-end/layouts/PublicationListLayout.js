// layouts/PublicationLayout.tsx
import React, { useState } from 'react'
import Link from 'next/link'

export default function PublicationLayout({ posts }) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedTypes, setSelectedTypes] = useState('')

  // 獲取所有可用的類型選項
  const typeOptions = Array.from(new Set(posts.flatMap(post => post.types)));

  // 根據年份分組論文
  const groupedByYear = posts.reduce((acc, post) => {
    const year = post.publish_year
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(post)
    return acc
  }, {})

  // 年份降序排序
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a)

  // 過濾邏輯
  const filterPosts = () => {
    let filteredPosts = {...groupedByYear}
    
    if (searchValue || selectedTypes) {
      Object.keys(filteredPosts).forEach(year => {
        filteredPosts[year] = filteredPosts[year].filter(post => {
          const searchContent = (post.title + post.authors + post.conference).toLowerCase()
          const searchMatch = !searchValue || searchContent.includes(searchValue.toLowerCase())
          const typeMatch = !selectedTypes || post.types.includes(selectedTypes)
          return searchMatch && typeMatch
        })
      })
    }

    return filteredPosts
  }

  const filteredGroupedPosts = filterPosts()

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            Publication
          </h1>
          <div className="flex-1 max-w-lg">
            <input
              aria-label="Search papers"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search papers"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <select
            value={selectedTypes}
            onChange={(e) => setSelectedTypes(e.target.value)}
            className="w-48 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Types</option>
            {typeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedYears.map(year => (
          <div key={year} className="space-y-4 py-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {year}
            </h2>
            {filteredGroupedPosts[year].length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No papers found</p>
            ) : (
              <div className="space-y-4">
                {filteredGroupedPosts[year].map((paper) => (
                  <Link
                    key={paper.uniqueId}
                    href={`/papers/${paper.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {paper.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {paper.authors.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {paper.conference}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
