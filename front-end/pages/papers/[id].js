import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';
import { IoMdReturnLeft } from "react-icons/io";
import Tag from '@/components/Tag';
import formatDate from '@/lib/utils/formatDate';

const PaperDetail = ({ paper, error, timeoutError }) => {
  const router = useRouter();

  useEffect(() => {
    if (timeoutError) {
      router.push('/timeout');
    }
  }, [timeoutError, router]);

  if (error) {
    return <div>載入失敗: {error}</div>;
  }

  if (router.isFallback) {
    return <div className="flex justify-center items-center min-h-screen">載入中...</div>;
  }

  if (!paper) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">找不到此論文</h1>
          <button 
            onClick={() => router.push('/papers')} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回論文列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageSEO title={`${paper.title} - ${siteMetadata.author}`} description={paper.sub_title} />
      <div className="mx-auto max-w-2xl">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold leading-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-9 md:text-4xl md:leading-10">
              {paper.title}
            </h1>
            <button onClick={() => router.back()} className="p-2 border border-gray-400 rounded text-gray-600 hover:bg-gray-100">
              <IoMdReturnLeft size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              {paper.sub_title}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {paper.tags && paper.tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>

            <div className="prose text-gray-500 dark:text-gray-400">
              <p className="text-orange-500">Author: {paper.authors && paper.authors.join(', ')}</p>
              <p>Publish Year: {paper.publish_year}</p>
              <p>Update by: {formatDate(paper.update_time)}</p>
            </div>

            <div className="prose max-w-none text-gray-500 dark:text-gray-400">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">摘要</h3>
              <p className="whitespace-pre-wrap">{paper.description.replace(/\n/g, '')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  try {
    const response = await defaultHttp.get(processDataRoutes.paper);
    const papers = response.data.response;

    // 確保 papers 是數組且不為空
    if (!Array.isArray(papers) || papers.length === 0) {
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const paths = papers.map((paper) => ({
      params: { id: paper.id.toString() },
    }));

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
    // 先獲取所有論文列表
    const listResponse = await defaultHttp.get(processDataRoutes.paper, { timeout: 10000 });
    const papers = listResponse.data.response;
    
    // 找到對應 ID 的論文
    const paper = papers.find(p => p.id.toString() === params.id);

    if (!paper) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        paper,
        error: null,
        timeoutError: false,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('獲取論文詳情失敗:', error);
    const isTimeout = error.code === 'ECONNABORTED';
    
    if (isTimeout) {
      return {
        props: {
          paper: null,
          error: null,
          timeoutError: true,
        },
      };
    }

    return {
      notFound: true,
    };
  }
}

export default PaperDetail; 