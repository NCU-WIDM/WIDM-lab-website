import SocialIcon from './social-icons'
import Link from '@/components/Link'

function UiwFolder(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}><path fill="black" d="M9.566 5.838a1.36 1.36 0 0 1-1.347-1.135L7.984 3.22a.45.45 0 0 0-.45-.378H1.818a.45.45 0 0 0-.454.447v13.422a.45.45 0 0 0 .454.447h16.364c.25 0 .454-.2.454-.447V6.285a.45.45 0 0 0-.454-.447zm0-1.342h8.616c1.004 0 1.818.8 1.818 1.79V16.71c0 .988-.814 1.789-1.818 1.789H1.818C.814 18.5 0 17.699 0 16.71V3.29C0 2.3.814 1.5 1.818 1.5h5.716a1.81 1.81 0 0 1 1.797 1.514z"></path></svg>);
}

const ProjectCard = ({ project_id, title, description, summary, project_link, github, tags, members, types, sequence, start_time, end_time, icon, icon_existed }) => {
  const isEmpty = (str) => {
    return str === undefined || str === null || str.trim() === '';
  };
  const displaySummary = isEmpty(summary)
    ? (description ? description.slice(0, 80) + (description.length > 80 ? '...' : '') : 'No description about this project.')
    : summary;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-700/30
      ${project_link ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''}
      ${project_link ? 'hover:scale-105 hover:-translate-y-1' : 'hover:shadow-xl'}
    `}>
      <Link
        href={`/projectTasks/${project_id}`}
        key={project_id}
        className="flex flex-col flex-grow"
      >
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 pt-[56.25%]">
          {project_link && (
            <div className="absolute top-0 right-0 z-10 m-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 animate-pulse">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Live Demo
              </span>
            </div>
          )}
          {icon_existed ? (
            <img
              className="absolute top-0 left-0 h-full w-full object-contain p-4"
              src={`${API_URL}/project/${project_id}/project-icon`}
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/static/images/placeholder.svg';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <UiwFolder className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-6">
          <h3 className="mb-2 text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          
          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <p className="flex-grow mb-4 text-sm text-gray-600 dark:text-gray-400">
            {displaySummary}
          </p>
          
          {project_link && (
            <a 
              href={project_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mr-2 h-4 w-4" 
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
              Try Demo
            </a>
          )}
          
          {start_time && (
            <div className="mt-auto mb-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mr-1.5 h-3.5 w-3.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span>{end_time ? `${start_time} - ${end_time}` : `${start_time} - now`}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-center justify-between">
          {members && members.length > 0 && (
            <div className="flex-1 truncate text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Contributors: </span>
              {members.map((member, index) => (
                <span key={index} className="inline-block">
                  {member}
                  {index < members.length - 1 && <span className="mx-1">•</span>}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                  />
                </svg>
              </a>
            )}
            {github && (
              <SocialIcon kind="github" href={github} size="6" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard