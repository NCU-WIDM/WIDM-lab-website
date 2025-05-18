import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';
import { IoMdReturnLeft } from "react-icons/io";
import ProjectTimeline from '@/components/ProjectTimeline';
import { motion } from 'framer-motion';

const ProjectTask = ({ projectTasks, error, title, description, timeoutError }) => {
  const router = useRouter();

  useEffect(() => {
    if (timeoutError) {
      router.push('/timeout'); // 超時時跳轉到 /timeout
    }
  }, [timeoutError, router]);

  if (error) {
    return <div>載入失敗: {error}</div>;
  }

  if (router.isFallback) {
    return <div>載入中...</div>;
  }

  return (
    <>
      <PageSEO title={`Project Task - ${siteMetadata.author}`} description={siteMetadata.description} />
      <div className="mx-auto max-w-2xl">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {title || '無法加載標題'}
            </h1>
            <button onClick={() => router.back()} className="p-2 border border-gray-400 rounded text-gray-600 hover:bg-gray-100">
              <IoMdReturnLeft size={24} />
            </button>
          </div>
          
          <p className="text-md leading-7 text-gray-500 dark:text-gray-400">
            {description || '無法加載描述'}
          </p>
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3, duration: 0.9 }}
          variants={{
            hidden: {
              opacity: 0.5,
              y: 10,
            },
            visible: {
              opacity: 1,
              y: 0,
            },
          }}
        >
          <ProjectTimeline items={projectTasks || []} />
        </motion.div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  try {
    const response = await defaultHttp.get(processDataRoutes.project);
    const projects = response.data.response;

    const paths = projects.map((project) => ({
      params: { id: project.id.toString() },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('API 調用失敗:', error.message);
    return {
      paths: [],
      fallback: true,
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const response = await defaultHttp.get(`${processDataRoutes.project}/${params.id}/task`, { timeout: 10000 });
    const projectTasks = response.data.response;

    const projectResponse = await defaultHttp.get(`${processDataRoutes.project}/${params.id}`, { timeout: 10000 });
    const project = projectResponse.data.response;

    return {
      props: {
        projectTasks,
        title: project.name || '',
        description: project.description || '',
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        projectTasks: null,
        error: error.message || 'This project task does not exist.',
        title: '',
        description: '',
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}

export default ProjectTask;
