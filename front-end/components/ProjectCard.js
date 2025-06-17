import SocialIcon from './social-icons'
import { useRouter } from 'next/router'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'
import { useState } from 'react'

function UiwFolder(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}><path fill="black" d="M9.566 5.838a1.36 1.36 0 0 1-1.347-1.135L7.984 3.22a.45.45 0 0 0-.45-.378H1.818a.45.45 0 0 0-.454.447v13.422a.45.45 0 0 0 .454.447h16.364c.25 0 .454-.2.454-.447V6.285a.45.45 0 0 0-.454-.447zm0-1.342h8.616c1.004 0 1.818.8 1.818 1.79V16.71c0 .988-.814 1.789-1.818 1.789H1.818C.814 18.5 0 17.699 0 16.71V3.29C0 2.3.814 1.5 1.818 1.5h5.716a1.81 1.81 0 0 1 1.797 1.514z"></path></svg>);
}

const ProjectCard = ({ project_id, title, description, summary, project_link, github, tags, members, types, sequence, start_time, end_time, icon, icon_existed }) => {
  const router = useRouter()
  const [isTagsExpanded, setIsTagsExpanded] = useState(false)
  
  const isEmpty = (str) => {
    return str === undefined || str === null || str.trim() === '';
  };
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 格式化日期顯示
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' });
  };

  // 格式化時間範圍顯示
  const formatDateRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '';
    
    const start = startTime ? formatDate(startTime) : '';
    const end = endTime ? formatDate(endTime) : 'Present';
    
    if (startTime && endTime) {
      return `${start} - ${end}`;
    } else if (startTime) {
      return `${start} - Present`;
    } else {
      return `- ${end}`;
    }
  };

  // 格式化成員顯示 - 顯示所有成員
  const formatMembers = (membersList) => {
    if (!membersList || membersList.length === 0) return '';
    return membersList.join(', ');
  };

  const handleCardClick = () => {
    router.push(`/project/${project_id}`);
  };

  const handleTagsToggle = (e) => {
    e.stopPropagation();
    setIsTagsExpanded(!isTagsExpanded);
  };

  // 智能決定顯示的標籤數量，避免換行
  const getMaxVisibleTags = () => {
    if (!tags || tags.length <= 2) return tags ? tags.length : 0;
    // 如果標籤很多，保守顯示2個，確保有空間放展開按鈕
    return 2;
  };
  
  const maxVisibleTags = getMaxVisibleTags();
  const visibleTags = isTagsExpanded ? tags : (tags && tags.slice(0, maxVisibleTags));
  const hasMoreTags = tags && tags.length > maxVisibleTags;

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-700/30 cursor-pointer relative
        ${project_link ? '' : 'hover:shadow-xl'}
      `}
      onClick={handleCardClick}
    >
      {/* 右上角連結按鈕 */}
      <div className="absolute top-3 right-3 flex space-x-2 z-10">
        {project_link && (
          <a 
            href={project_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
            onClick={(e) => e.stopPropagation()}
            title="Visit project website"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        )}
        {github && (
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
            <SocialIcon kind="github" href={github} size="5" />
          </div>
        )}
      </div>

      {/* 內容區域 */}
      <div className="flex flex-col p-3 pr-16">
        {/* 上半部分 - 包含圖片、標題和專案資訊 */}
        <div className="flex items-center mb-3">
          {/* 專案圖片 - 顯示在左側 */}
          {icon_existed && (
            <div className="mr-3 flex-shrink-0">
              <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                <img
                  className="h-12 w-12 object-contain"
                  src={`${API_URL}/project/${project_id}/project-icon`}
                  alt={title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/static/images/placeholder.svg';
                  }}
                />
              </div>
            </div>
          )}
          
          {/* 右側內容區域 - 標題和資訊，垂直居中對齊icon */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* 專案標題 */}
            <h3 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              {title}
            </h3>

            {/* 專案資訊行 - 時間、人員、標籤 */}
            <div className="flex items-center flex-wrap text-sm text-gray-600 dark:text-gray-400 gap-x-4 gap-y-1 mt-1">
              {/* 時間信息 */}
              {(start_time || end_time) && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-medium">
                    {formatDateRange(start_time, end_time)}
                  </span>
                </div>
              )}

              {/* 分隔符 */}
              {(start_time || end_time) && members && members.length > 0 && (
                <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
              )}

              {/* 人員信息 */}
              {members && members.length > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                  <span className="font-medium">{formatMembers(members)}</span>
                </div>
              )}

              {/* 分隔符 - 人員和標籤之間 */}
              {members && members.length > 0 && visibleTags && visibleTags.length > 0 && (
                <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
              )}

              {/* 標籤 - 會自動換行 */}
              {visibleTags && visibleTags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200 flex-shrink-0"
                >
                  {tag}
                </span>
              ))}

              {/* 展開/收合按鈕 */}
              {hasMoreTags && (
                <button
                  onClick={handleTagsToggle}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
                  title={isTagsExpanded ? '收合標籤' : `還有 ${tags.length - maxVisibleTags} 個標籤`}
                >
                  <span className="font-medium text-xs">
                    {isTagsExpanded ? '收合' : `+${tags.length - maxVisibleTags}`}
                  </span>
                  <svg 
                    className={`w-2.5 h-2.5 transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description || 'No description about this project.'}
        </p>
      </div>
    </div>
  )
}

export default ProjectCard