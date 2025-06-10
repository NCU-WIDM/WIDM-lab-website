import { useEffect, useState } from 'react';
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
      router.push('/timeout');
    }
  }, [timeoutError, router]);

  if (timeoutError) {
    return null;
  }

  // 根據 sequence 排序所有專案
  const sortedProjects = [...projectsDatas].sort((a, b) => {
    const seqA = a.sequence || 0;
    const seqB = b.sequence || 0;
    return seqA - seqB;
  });

  return (
    <>
      <PageSEO
        title={`Projects - ${siteMetadata.author}`}
        description={siteMetadata.description}
      />
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="pt-6 pb-8 md:space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12">
              Projects
            </h1>
          </div>
        </div>
        
        {projectsDatas && projectsDatas.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No projects found.
          </div>
        )}
        
        {projectsDatas && projectsDatas.length > 0 && (
          <div className="flex flex-col gap-3">
            {sortedProjects.map((project) => (
              <div key={project.id} className="w-full">
                <ProjectCard
                  project_id={project.id}
                  title={project.name}
                  description={project.description}
                  summary={project.summary}
                  github={project.github}
                  tags={project.tags}
                  icon={project.icon}
                  members={project.members}
                  types={project.types}
                  start_time={project.start_time}
                  end_time={project.end_time}
                  project_link={project.link}
                  icon_existed={project.icon_existed}
                  sequence={project.sequence}
                />
              </div>
            ))}
          </div>
        )}
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