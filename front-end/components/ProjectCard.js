import SocialIcon from './social-icons'
import Link from '@/components/Link'
import FolderIcon from './icon'

const ProjectCard = ({ project_id, title, description, project_link, github, tags, members, icon }) => {
  // 使用環境變數來設置 API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://widm-back-end.nevercareu.space';

  return (
    <div className="md p-4 md:w-1/2" style={{ maxWidth: '544px' }}>
      <div className="h-full transform overflow-hidden rounded-md border-2 border-solid border-gray-200 bg-transparent bg-opacity-20 transition duration-500 hover:scale-105 hover:rounded-md hover:border-primary-500 hover:bg-gray-200 dark:border-gray-700 dark:hover:border-primary-500 dark:hover:bg-gray-800">
        <div className="p-6">
          <Link
            href={`/projectTasks/${project_id}`}
            key={project_id}
            className="hover:scale-105 transition-transform duration-300"
          >
            <div className="flex flex-row items-center justify-between">
              <div className="flex justify-center my-2 w-full">
                <img 
                  className="w-36 invert-0 dark:invert"
                  src={`${API_URL}/project/${project_id}/project-icon`}  // 使用環境變數的 API URL
                  alt="Project Icon" 
                  onError={(e) => e.target.style.display = 'none'} 
                />
              </div>
            </div>
            <p className="mb-3 text-2xl font-bold leading-8 tracking-tight text-black dark:text-white">{title}</p>
            <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
          </Link>

          <div className="flex flex-row justify-between">
            {tags && tags.length > 0 && (
              <div className="text-sm text-gray-400">
                {tags.map((tag, index) => (
                  <span key={index}>
                    {tag}
                    {index < tags.length - 1 && ' \u2022 '}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-row justify-between">
            {members && members.length > 0 && (
              <div className="text-sm text-gray-400">
                {members.map((member, index) => (
                  <span key={index}>
                    {member}
                    {index < members.length - 1 && ' \u2022 '}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-row justify-between">
              <div className="mx-1.5">
                {project_link ? <SocialIcon kind="website" href={project_link} size="6" /> : null}
              </div>
              <div className="mx-1.5">
                {github ? <SocialIcon kind="github" href={github} size="6" /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
