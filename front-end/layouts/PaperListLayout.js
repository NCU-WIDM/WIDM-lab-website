import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import { FaFileDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [error, setError] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.authors + frontMatter.tags.join(' ') + frontMatter.origin 
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  const download_attachment = async (id) => {
    try {
      console.log('Download:', id);
      const response = await defaultHttp.get(`${processDataRoutes.paper}/${id}/paper-attachment`, {
        responseType: 'blob',
      });
  
      // 從 Content-Disposition 標頭中提取文件名
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'downloaded-file'; // 設定一個預設的檔名

      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch != null && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
  
      const blob = new Blob([response.data], { type: response.data.type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;  // 使用從 header 中提取的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      toast.success('Download!', { progressBar: false });
    } catch (error) {
      toast.error('Download Error!', { progressBar: false });
      console.error('Download Error:', error.message);
      if (error.response) {
        console.error('API Response Error:', error.response.body);
      }
      setError(error.message);
    }
  };
  

  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  console.log('displayPosts:', displayPosts)

  return (
    <>
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label="Search papers"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search papers"
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
          {!filteredBlogPosts.length && 'No posts found.'}
          {displayPosts.map((frontMatter) => {
            const {
              id,
              uniqueId,
              create_time,
              paper_existed,
              authors,
              link,
              origin,
              publish_year,
              tags,
              title,
              update_time,
            } = frontMatter

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


                      {/* <div>{origin}</div> */}

                      <div className="flex flex-wrap">
                        {tags && tags.length > 0 && tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>

                      <div className="prose flex max-w-none justify-between pt-2 text-gray-500 dark:text-gray-400">
                        { authors && authors.length > 0 &&
                        <p>Author: {authors.join(', ')}</p>
                        }
                        <div className='flex gap-4'>

                          <div className='text-2xl font-bold content-center text-cyan-600/70	'>{origin}</div>

                          <FaExternalLinkAlt
                            className={`cursor-pointer text-4xl ${
                              link === '' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'
                            }`}
                            onClick={() => {
                              window.open(link, '_blank');
                            }}
                            style={{ pointerEvents: link === '' ? 'none' : 'auto' }}
                          />

                          <FaFileDownload
                            className={`cursor-pointer text-4xl ${
                              paper_existed === false ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'
                            }`}
                            onClick={() => {
                              if (paper_existed === true) {
                                download_attachment(id);
                              }
                            }}
                            style={{ pointerEvents: paper_existed === '' ? 'none' : 'auto' }}
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
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
