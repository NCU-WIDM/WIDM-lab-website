import React, { useState } from 'react'
import MultiSelect from '../components/MultiSelect'  // 引入自製的多選下拉選單
import Tag from '@/components/Tag'
import formatDate from '@/lib/utils/formatDate'
import { processDataRoutes } from 'routes/api';
import { defaultHttp } from 'utils/http';
import { FaFileDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'

export default function ListLayout({ posts, title, initialDisplayPosts = [], groupBy = 'type' }) {
  const router = useRouter();
  const [error, setError] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])  // 儲存選中的 type 條件

  // 取得分組依據
  let groupOptions = [];
  let postsByGroup = {};

  if (groupBy === 'year') {
    // 以年份分組，並由新到舊排序
    console.log('原始資料：', posts);
    console.log('所有論文的年份：', posts.map(post => post.publish_year));
    
    // 修改分組邏輯，確保所有年份都被包含
    const allYears = posts.map(post => {
      const year = post.publish_year ? post.publish_year.toString().slice(0, 4) : '';
      console.log('處理年份：', post.publish_year, '->', year);
      return year;
    }).filter(year => year !== ''); // 過濾掉空值
    
    console.log('處理後的年份列表：', allYears);
    groupOptions = [...new Set(allYears)].sort((a, b) => b - a);
    console.log('分組後的年份選項：', groupOptions);
    
    groupOptions.forEach(year => {
      postsByGroup[year] = posts.filter(post => {
        const postYear = post.publish_year ? post.publish_year.toString().slice(0, 4) : '';
        const isMatch = postYear === year;
        if (isMatch) {
          console.log(`找到 ${year} 年的論文：`, post.title);
        }
        return isMatch;
      });
      console.log(`${year}年的論文數量：`, postsByGroup[year].length);
    });
  } else {
    // 預設以 type 分組
    groupOptions = Array.from(new Set(posts.flatMap(post => post.types)));
    groupOptions.forEach(type => {
      postsByGroup[type] = posts.filter(post => post.types.includes(type));
    });
  }

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

  // 依 groupOptions 重新分組 displayPosts
  let displayPostsByGroup = {};
  groupOptions.forEach(group => {
    if (groupBy === 'year') {
      displayPostsByGroup[group] = displayPosts.filter(post => post.publish_year.slice(0, 4) === group);
    } else {
      displayPostsByGroup[group] = displayPosts.filter(post => post.types.includes(group));
    }
  });

  const download_attachment = async (id) => {
    try {
      const response = await defaultHttp.get(
        `${processDataRoutes.paper}/${id}/paper-attachment`, 
        { 
          responseType: 'blob',
          timeout: 10000 
        }
      );
  
      if (response.status === 200) {
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'downloaded-file';
  
        if (contentDisposition && contentDisposition.includes('attachment')) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        }
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        toast.success('檔案下載成功！');
        return true;
      }
      throw new Error('檔案下載失敗！');
    } catch (error) {
      console.error('檔案下載失敗:', error.message);
      if (error.code === 'ECONNABORTED') {
        toast.error('下載超時！請稍後再試。');
      } else if (error.response?.status === 404) {
        toast.error('檔案不存在！');
      } else {
        toast.error('檔案下載失敗！');
      }
      return false;
    }
  };
      
  return (
      <>
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="pt-6 pb-8 md:space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12">
              Papers
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative max-w-lg flex-grow">
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
              <div className="w-full md:w-48">
                <MultiSelect selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} typeOptions={groupOptions} />
              </div>
            </div>
          </div>
        </div>
        <ul className="list-none">
          {!filteredPapersPosts.length && <h2 className="m-2 text-lg">No Papers found.</h2>}
          {/* 分組顯示，每個 group 一個區塊 */}
          <div>
            {groupOptions.map(group => (
              displayPostsByGroup[group] && displayPostsByGroup[group].length > 0 && (
                <div key={group} className="mb-8">
                  <h2 className="text-2xl font-bold text-pink-700 mb-2">{group}</h2>
                  <ul className="list-none">
                    {displayPostsByGroup[group].map((frontMatter) => (
                      <li
                        key={`li-paper-${frontMatter.id}-${frontMatter.uniqueId}`}
                        className="list-none transition duration-100 hover:scale-105 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        style={{ maxHeight: '280px', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.maxHeight = 'none';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.maxHeight = '280px';
                        }}
                        onClick={() => router.push(`/papers/${frontMatter.id}`)}
                      >
                        <article className="space-y-2 bg-transparent bg-opacity-20 p-2 transition duration-200 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 xl:grid xl:grid-cols-2 xl:items-baseline xl:space-y-3">
                          <div className="space-y-5 xl:col-span-4">
                            <div className="space-y-1">
                              <div>
                                <h2 className="text-xl font-bold leading-6 tracking-tight">
                                  <span className="text-gray-900 transition duration-500 ease-in-out hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-500">
                                    {frontMatter.title}
                                  </span>
                                </h2>
                              </div>
                              <div className="prose flex max-w-none justify-between text-gray-500 dark:text-gray-400">
                                <div className="not-prose flex flex-col w-7/8">
                                  {frontMatter.authors && frontMatter.authors.length > 0 && (
                                    <p className="text-orange-500">Author: {frontMatter.authors.join(', ')}</p>
                                  )}
                                  {frontMatter.origin && frontMatter.origin.length > 0 && (
                                    <p className="text-cyan-600/70">Conference: {frontMatter.origin} {frontMatter.publish_year.slice(0, 4)}</p>
                                  )}
                                </div>
                                <div className="flex gap-4 items-center w-1/8 justify-end">
                                  <div className="relative group flex items-center">
                                    <FaExternalLinkAlt
                                      className={`text-2xl ${frontMatter.link === '' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 cursor-pointer'}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        frontMatter.link && window.open(frontMatter.link, '_blank')
                                      }}
                                      style={{ pointerEvents: frontMatter.link === '' ? 'none' : 'auto' }}
                                    />
                                    <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs text-white bg-gray-600 rounded shadow-lg ${!frontMatter.link ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer'} group-hover:flex hidden whitespace-nowrap`}>
                                      {frontMatter.link !== '' ? '連結'  : '無連結' }
                                    </div>
                                  </div>
                                  <div className="relative group flex items-center">
                                    <FaFileDownload
                                      className={`text-2xl cursor-pointer ${frontMatter.paper_existed === false ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        frontMatter.paper_existed && download_attachment(frontMatter.id)
                                      }}
                                      style={{ pointerEvents: frontMatter.paper_existed === true ? 'auto' : 'none' }}
                                    />
                                    <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs text-white bg-gray-600 rounded shadow-lg ${frontMatter.paper_existed === false ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer'} group-hover:flex hidden whitespace-nowrap`}>
                                      {frontMatter.paper_existed === true ? '檔案下載' : '無檔案'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </ul>
      </div>
      <ToastContainer />
      {/* {pagination && pagination.totalPages > 1 && !searchValue && !selectedTypes.length && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )} */}
    </>
  )
}
