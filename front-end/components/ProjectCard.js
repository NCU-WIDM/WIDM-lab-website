import SocialIcon from './social-icons'
import { useRouter } from 'next/router'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

function UiwFolder(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}><path fill="black" d="M9.566 5.838a1.36 1.36 0 0 1-1.347-1.135L7.984 3.22a.45.45 0 0 0-.45-.378H1.818a.45.45 0 0 0-.454.447v13.422a.45.45 0 0 0 .454.447h16.364c.25 0 .454-.2.454-.447V6.285a.45.45 0 0 0-.454-.447zm0-1.342h8.616c1.004 0 1.818.8 1.818 1.79V16.71c0 .988-.814 1.789-1.818 1.789H1.818C.814 18.5 0 17.699 0 16.71V3.29C0 2.3.814 1.5 1.818 1.5h5.716a1.81 1.81 0 0 1 1.797 1.514z"></path></svg>);
}

const ProjectCard = ({ project_id, title, description, summary, project_link, github, tags, members, types, sequence, start_time, end_time, icon, icon_existed }) => {
  const router = useRouter()
  
  const isEmpty = (str) => {
    return str === undefined || str === null || str.trim() === '';
  };
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleCardClick = () => {
    router.push(`/project/${project_id}`);
  };

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-700/30 cursor-pointer
        ${project_link ? '' : 'hover:shadow-xl'}
      `}
      onClick={handleCardClick}
    >
      {/* 內容區域 */}
      <div className="flex flex-col p-3">
        {/* 標題區域 - 包含圖片和專案名稱 */}
        <div className="flex items-center mb-2">
          {/* 專案圖片 - 顯示在標題左側 */}
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
          
          {/* 專案標題 */}
          <h3 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description || 'No description about this project.'}
        </p>
        
        {/* 底部區域 - 包含標籤和連結 */}
        <div className="mt-auto flex items-center justify-between">
          {/* 左側標籤 */}
          <div className="flex flex-wrap gap-1">
            {tags && tags.length > 0 && tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 右側連結 */}
          <div className="flex flex-shrink-0 space-x-3">
            {project_link && (
              <a 
                href={project_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Visit project website"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
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
              <div onClick={(e) => e.stopPropagation()}>
                <SocialIcon kind="github" href={github} size="6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard