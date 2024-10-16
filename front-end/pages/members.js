import siteMetadata from '@/data/siteMetadata'
import { PageSEO } from '@/components/SEO'
import { Icon } from '@iconify/react';
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'
import { useState } from 'react';

export const Members = ({ members }) => {
  // State to control the display of members (showing 'current' or 'graduated')
  const [filter, setFilter] = useState('current');

  // 使用環境變數來設置 API URL
  const API_URL = process.env.API_URL || 'https://widm-back-end.nevercareu.space';

  // Group members by their position and filter based on the selected filter
  const groupByPosition = members.reduce((acc, member) => {
    const isGraduated = member.graduate_year !== null;
    if ((filter === 'current' && !isGraduated) || (filter === 'graduated' && isGraduated)) {
      if (!acc[member.position]) {
        acc[member.position] = [];
      }
      acc[member.position].push(member);
    }
    return acc;
  }, {});

  return (
    <>
      <PageSEO title={`Members - ${siteMetadata.author}`} description="What I use" />
      <div className="mx-auto max-w-4xl divide-y divide-gray-200 dark:divide-gray-700">
        <div className="flex items-center justify-between border-b border-gray-300 space-y-2 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 pb-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Members
          </h1>
          <div className="flex mb-0 items-end space-x-6">
            <button 
              onClick={() => setFilter('current')} 
              className={`text-gray-600 hover:text-gray-900 dark:text-gray-100 ${filter === 'current' ? 'font-bold' : ''}`}>
              在學
            </button>
            <button 
              onClick={() => setFilter('graduated')} 
              className={`text-gray-600 hover:text-gray-900 dark:text-gray-100 ${filter === 'graduated' ? 'font-bold' : ''}`}>
              畢業
            </button>
          </div>
        </div>

        <div className="container py-12">
          {Object.keys(groupByPosition).map((position, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{position}</h2>
              <div className="flex flex-row flex-wrap">
                {groupByPosition[position].map((member, idx) => (
                  <div
                    key={idx}
                    className="group mb-4 w-full cursor-pointer rounded-xl p-6 backdrop-filter transition duration-100 hover:scale-[1.02] hover:bg-gray-300 hover:bg-opacity-40 dark:hover:bg-gray-500 dark:hover:bg-opacity-40 md:w-1/2"
                  >
                    <div className="flex items-center justify-start">
                      <div className="flex-shrink-0 p-3 font-sans text-gray-700 dark:text-gray-50 ">
                        {member.image_existed ? (
                          <img
                            src={`${API_URL}/member/${member.id}/member-image`} // 使用環境變數的 API URL
                            alt="Member Icon"
                            className="h-28 w-28 rounded-md"
                          />
                        ) : (
                          <Icon icon="charm:person" style={{ color: 'black', height: '7rem', width: '7rem' }} />
                        )}
                      </div>
                      <div className="flex flex-col p-3">
                        <p className="text-2xl truncate font-bold leading-5 text-gray-800 dark:text-white sm:text-base lg:text-2xl">
                          {member.name}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 sm:text-base lg:text-base">
                          {member.name_en}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base lg:text-sm xl:text-base">
                          {member.intro}
                        </p>
                        {/* Show graduation year if the member is graduated */}
                        {filter === 'graduated' && member.graduate_year && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Graduate Year: {member.graduate_year}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// 使用 getStaticProps 在構建時獲取資料
export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.member);
    const members = response.data.response;

    return {
      props: {
        members,
      },
    }
  } catch (error) {
    console.error('API 調用失敗:', error.message);
    return {
      props: {
        members: [],
      },
    }
  }
}

export default Members;
