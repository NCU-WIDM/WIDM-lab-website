import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import PaperListLayout from '@/layouts/PaperListLayout';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';
import Link from '@/components/Link';

const Papers = ({ posts, initialDisplayPosts, timeoutError }) => {
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
      <PageSEO title={`Papers - ${siteMetadata.author}`} description={siteMetadata.description} />
      <PaperListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        title="Papers"
      />
    </>
  );
};

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.paper, { timeout: 10000 });
    const papersWithId = response.data.response.map((paper, index) => ({
      ...paper,
      uniqueId: `${paper.attachment}-${paper.id}-${index}`,
    }));

    const POSTS_PER_PAGE = response.data.response.length;
    const initialDisplayPosts = papersWithId.slice(0, POSTS_PER_PAGE);

    return {
      props: {
        posts: papersWithId,
        initialDisplayPosts,
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        posts: [],
        initialDisplayPosts: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}

export default Papers;
