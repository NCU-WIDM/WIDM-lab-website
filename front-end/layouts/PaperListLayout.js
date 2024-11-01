import React, { useState } from 'react'
import MultiSelect from '../components/MultiSelect'  // 引入自製的多選下拉選單
import Tag from '@/components/Tag'
import formatDate from '@/lib/utils/formatDate'
import { FaFileDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [error, setError] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])  // 儲存選中的 type 條件

  const filteredPapersPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.authors + frontMatter.tags.join(' ') + frontMatter.origin + frontMatter.types.join(' ')
    const keywords = searchValue.toLowerCase().split(' ').filter(Boolean)

    const isKeywordMatch = keywords.every((keyword) => searchContent.toLowerCase().includes(keyword))
    const isTypeMatch = selectedTypes.length === 0 || selectedTypes.some((type) => frontMatter.types.includes(type))

    return isKeywordMatch && isTypeMatch
  })

  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue && selectedTypes.length === 0
      ? initialDisplayPosts
      : filteredPapersPosts

  return (
    <>
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="flex items-center gap-4">
            <input
              aria-label="Search papers"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search papers"
              className="rounded-md border border-gray-400 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
              style={{ width: '400px' }}
            />
            <div style={{ width: '300px' }}>
              <MultiSelect selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} />
            </div>
          </div>
        </div>
        <ul className="list-none">
          {!filteredPapersPosts.length && <h2 className="m-2 text-lg">No Papers found.</h2>}
          {displayPosts.map((frontMatter) => {
            const { id, uniqueId, authors, link, origin, publish_year, tags, title, types, update_time } = frontMatter
            return (
              <li
                key={`li-paper-${id}-${uniqueId}`}
                className="list-none py-6 transition duration-100 hover:scale-105 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <article className="space-y-2 bg-transparent bg-opacity-20 p-2 transition duration-200 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 xl:grid xl:grid-cols-2 xl:items-baseline xl:space-y-3">
                  <dl>
                    <dd className="text-sm font-normal leading-6 text-gray-500 dark:text-gray-400">
                      <a>Publish Year {publish_year}</a>
                      {' • － '}
                      <time dateTime={update_time}>Update by {formatDate(update_time)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-5 xl:col-span-4">
                    <div className="space-y-1">
                      <div>
                        <h2 className="text-2xl font-bold leading-8 tracking-tight">
                          <span className="text-gray-900 transition duration-500 ease-in-out hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-500">
                            {title}
                          </span>
                        </h2>
                      </div>
                      <div className="flex flex-wrap">
                        {tags && tags.length > 0 && tags.map((tag) => <Tag key={tag} text={tag} />)}
                      </div>
                      <div className="prose flex max-w-none justify-between pt-2 text-gray-500 dark:text-gray-400">
                        <div className="not-prose flex flex-col">
                          {authors && authors.length > 0 && <p>Author: {authors.join(', ')}</p>}
                          {types && types.length > 0 && <p>Type: {types.join(', ')}</p>}
                        </div>
                        <div className="flex gap-4">
                          <div className="text-2xl font-bold content-center text-cyan-600/70">{origin}</div>
                          <FaExternalLinkAlt
                            className={`cursor-pointer text-4xl ${link === '' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'}`}
                            onClick={() => window.open(link, '_blank')}
                            style={{ pointerEvents: link === '' ? 'none' : 'auto' }}
                          />
                          <FaFileDownload
                            className={`cursor-pointer text-4xl ${frontMatter.paper_existed === false ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'}`}
                            onClick={() => frontMatter.paper_existed === true && download_attachment(id)}
                            style={{ pointerEvents: frontMatter.paper_existed === '' ? 'none' : 'auto' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      <ToastContainer />
      {/* {pagination && pagination.totalPages > 1 && !searchValue && !selectedTypes.length && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )} */}
    </>
  )
}
