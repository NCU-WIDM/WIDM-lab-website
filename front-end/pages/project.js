import siteMetadata from '@/data/siteMetadata'
import ProjectCard from '@/components/ProjectCard'
import { PageSEO } from '@/components/SEO'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

const Projects = ({ projectsDatas }) => {
  return (
    <>
      <PageSEO
        title={`Projects - ${siteMetadata.author}`}
        description="A list of projects I have built"
      />
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Projects
          </h1>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            {projectsDatas.map((d) => (
              <ProjectCard
                key={d.id}
                project_id={d.id}
                title={d.name}
                description={d.description}
                github={d.github}
                tags={d.tags}
                icon={d.icon}
                members={d.members}
                project_link={d.link}
                icon_existed={d.icon_existed}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.project);
    const projectsDatas = response.data.response;

    return {
      props: {
        projectsDatas,
      },
    }
  } catch (error) {
    console.error('API 調用失敗:', error.message);

    return {
      props: {
        projectsDatas: [],
      },
    }
  }
}

export default Projects
