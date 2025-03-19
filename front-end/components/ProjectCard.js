import SocialIcon from './social-icons'
import Link from '@/components/Link'

function UiwFolder(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}><path fill="black" d="M9.566 5.838a1.36 1.36 0 0 1-1.347-1.135L7.984 3.22a.45.45 0 0 0-.45-.378H1.818a.45.45 0 0 0-.454.447v13.422a.45.45 0 0 0 .454.447h16.364c.25 0 .454-.2.454-.447V6.285a.45.45 0 0 0-.454-.447zm0-1.342h8.616c1.004 0 1.818.8 1.818 1.79V16.71c0 .988-.814 1.789-1.818 1.789H1.818C.814 18.5 0 17.699 0 16.71V3.29C0 2.3.814 1.5 1.818 1.5h5.716a1.81 1.81 0 0 1 1.797 1.514z"></path></svg>);
}

const ProjectCard = ({ project_id, title, description, summary, project_link, github, tags, members, start_time, end_time, icon, icon_existed }) => {
  const isEmpty = (str) => {
    return str === undefined || str === null || str.trim() === '';
  };
  const displaySummary = isEmpty(summary)
    ? (description ? description.slice(0, 80) + (description.length > 80 ? '...' : '') : 'No description about this project.')
    : summary;
  // 使用環境變數來設置 API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="md p-4 md:w-1/3" style={{ maxWidth: '544px' }}>
      <div className="h-full transform overflow-hidden rounded-md border-2 border-solid border-gray-200 bg-transparent bg-opacity-20 transition duration-500 hover:scale-105 hover:rounded-md hover:border-primary-500 hover:bg-gray-200 dark:border-gray-700 dark:hover:border-primary-500 dark:hover:bg-gray-800">
        <div className="p-6">
          <Link
            href={`/projectTasks/${project_id}`}
            key={project_id}
            className="hover:scale-105 transition-transform duration-300"
          >
            <div className="flex flex-row items-center justify-between">
              <div className="flex justify-center my-2 w-full h-52">
                {icon_existed ? (
                  <img
                    className="w-30 h-30 invert-0 dark:invert"
                    src={`${API_URL}/project/${project_id}/project-icon`}  // 使用環境變數的 API URL
                    alt="Project Icon"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="w-44 h-44"></div> // 保留空間但不顯示內容
                  // <UiwFolder className="w-full h-5/6 invert-0 dark:invert" />
                )}
              </div>
            </div>
            <p className="mb-3 text-3xl font-bold leading-8 tracking-tight text-black dark:text-white">{title}</p>
            {/* <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p> */}
            <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{displaySummary}</p>
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
          {start_time ? (
            <div className="flex flex-row justify-between">
                <div className="text-sm text-gray-400">
                  {end_time ? `${start_time} - ${end_time}` : `${start_time} - now`}
                </div>
            </div>)
          : null}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
