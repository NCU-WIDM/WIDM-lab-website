import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';
import { IoMdReturnLeft } from "react-icons/io";

const ProjectTask = ({ projectTasks, error, timeoutError }) => {
  const router = useRouter();

  useEffect(() => {
    if (timeoutError) {
      router.push('/timeout'); // 發生超時時跳轉到 /timeout
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
      <article>
        <div className="flex items-center justify-between">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1
              style={{ overflowWrap: 'anywhere' }}
              className="text-4xl font-extrabold text-gray-800/80 drop-shadow-lg text-wrap dark:text-white"
            >
              {projectTasks ? projectTasks.title : '無法加載標題'}
            </h1>
            <p className="text-lg text-gray-400 mt-1">
              {projectTasks ? projectTasks.sub_title : '無法加載子標題'}
            </p>
          </div>
          <button onClick={() => router.back()} className="p-2 border border-gray-400 rounded text-gray-600 hover:bg-gray-100">
            <IoMdReturnLeft size={24} />
          </button>
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="mx-auto w-full max-w-4xl" dangerouslySetInnerHTML={{ __html: projectTasks?.content || '無法加載內容' }} />
      </article>
    </>
  );
};

export async function getStaticPaths() {
  try {
    const response = await defaultHttp.get(processDataRoutes.project);
    const projects = response.data.response;

    const paths = projects.flatMap((project) =>
      (project.tasks || []).map((task) => ({
        params: { id: project.id.toString(), project_id: task.id.toString() },
      }))
    );

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('API 調用失敗:', error.message);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const response = await defaultHttp.get(`${processDataRoutes.project}/${params.id}/task/${params.project_id}`, { timeout: 10000 });
    const projectTasks = response.data.response;

    return {
      props: {
        projectTasks,
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        projectTasks: null,
        timeoutError: isTimeout,
        error: error.message,
      },
      revalidate: 60,
    };
  }
}

export default ProjectTask;
