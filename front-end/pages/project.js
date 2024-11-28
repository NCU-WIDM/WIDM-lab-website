import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import ProjectCard from '@/components/ProjectCard';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';

const Projects = ({ projectsDatas, timeoutError }) => {
  const router = useRouter();

  useEffect(() => {
    if (timeoutError) {
      router.push('/timeout'); // 發生 timeout 時跳轉到 /timeout
    }
  }, [timeoutError, router]);

  if (timeoutError) {
    return null; // 發生超時時，不渲染內容
  }

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
          <div className="m-4 flex flex-wrap">
            {!projectsDatas.length && <h2 className="text-lg">No Projects found.</h2>}
            {projectsDatas.map((d) => (
              <ProjectCard
                key={d.id}
                project_id={d.id}
                title={d.name}
                description={d.description}
                summary={d.summary}
                github={d.github}
                tags={d.tags}
                icon={d.icon}
                members={d.members}
                start_time={d.start_time}
                end_time={d.end_time}
                project_link={d.link}
                icon_existed={d.icon_existed}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.project, { timeout: 10000 });
    const projectsDatas = response.data.response;

    return {
      props: {
        projectsDatas,
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        projectsDatas: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}

export default Projects;
