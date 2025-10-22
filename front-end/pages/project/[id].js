import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';
import { PageSEO } from '@/components/SEO';
import siteMetadata from '@/data/siteMetadata';
import { IoMdReturnLeft } from "react-icons/io";

const ProjectDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const response = await defaultHttp.get(processDataRoutes.project + `/${id}`);
          setProject(response.data.response);
          setError(null);
        } catch (err) {
          setError('Failed to load project data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Project not found.</div>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title={`${project.name} - ${siteMetadata.author}`}
        description={project.summary || project.description}
      />
      <article>
        <div className="flex items-center justify-between">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1
              style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}
              className="text-[33px] font-extrabold text-gray-800/80 drop-shadow-lg text-wrap text-center dark:text-white"
            >
              {project.name}
            </h1>
            <p className="text-lg text-center text-gray-500 dark:text-gray-400 mt-1">{project.summary}</p>
          </div>
          <button onClick={() => router.back()} className="p-2 border border-gray-400 rounded text-gray-600 hover:bg-gray-100">
            <IoMdReturnLeft size={24} />
          </button>
        </div>
        <hr className="my-4 border-gray-300" />
        <div
          className="prose dark:prose-dark max-w-none mx-auto w-full project-content-container"
          dangerouslySetInnerHTML={{
            __html: project.content,
          }}
        />
      </article>
    </>
  );
};

export default ProjectDetailPage; 