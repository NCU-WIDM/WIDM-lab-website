import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import ProjectType from '@/components/ProjectType'; 
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

  const groupedProjects = {};

  projectsDatas.forEach((project) => {
    const categories = Array.isArray(project.types) && project.types.length > 0 ? project.types : ['other'];
    categories.forEach((type) => {
      if (!groupedProjects[type]) {
        groupedProjects[type] = [];
      }
      groupedProjects[type].push(project);
    });
  });
  
  Object.keys(groupedProjects).forEach(type => {
    groupedProjects[type].sort((a, b) => {
      const seqA = a.sequence || 0;
      const seqB = b.sequence || 0;
      return seqA - seqB;
    });
  });
  
  const sortedTypes = Object.keys(groupedProjects).sort();
  
  // Get all projects with interactive demos
  const projectsWithDemos = projectsDatas.filter(project => project.link);
  const hasDemos = projectsWithDemos.length > 0;

  return (
    <>
      <PageSEO
        title={`Projects - ${siteMetadata.author}`}
        description="A list of projects I have built"
      />
      <div className="mx-auto max-w-6xl">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Projects
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-prose">
            Our research lab focuses on developing cutting-edge AI solutions for various domains.
          </p>
        </div>
        
        {hasDemos && (
          <div className="mb-12 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="mb-4 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Interactive Demos Available
              </h2>
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              The following projects have interactive demos that you can try right away:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectsWithDemos.slice(0, 3).map((project) => (
                <a 
                  key={project.id}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center rounded-md bg-white p-3 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                >
                  <div className="mr-3 h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                    {project.icon_existed ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}/project/${project.id}/project-icon`}
                        alt={project.name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Try live demo</p>
                  </div>
                </a>
              ))}
              {projectsWithDemos.length > 3 && (
                <div className="flex items-center justify-center rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    +{projectsWithDemos.length - 3} more projects with demos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!projectsDatas.length && (
          <div className="text-center py-20">
            <h2 className="text-xl">No Projects found.</h2>
          </div>
        )}
        
        {sortedTypes.length > 0 && (
          <div className="flex flex-col space-y-12">
            <div className="flex flex-wrap gap-4 mb-8">
              {sortedTypes.map((type) => (
                <a 
                  key={type}
                  href={`#${type}`} 
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-primary-100 dark:bg-gray-800 dark:hover:bg-primary-900 text-sm font-medium transition-colors"
                >
                  {type}
                </a>
              ))}
            </div>
            
            {sortedTypes.map((type) => (
              <div key={type} id={type} className="scroll-mt-24">
                <ProjectType projects={groupedProjects[type]} />
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