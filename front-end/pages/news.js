import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import NewsListLayout from '@/layouts/NewsListLayout';
import { PageSEO } from '@/components/SEO';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';

const News = ({ posts, initialDisplayPosts, timeoutError }) => {
  const router = useRouter();

  useEffect(() => {
    if (timeoutError) {
      router.push('/timeout'); // 發生 timeout 時跳轉到 /timeout
    }
  }, [timeoutError, router]);

  if (timeoutError) {
    return null; // 超時時不渲染內容
  }

  return (
    <>
      <PageSEO title={`News - ${siteMetadata.author}`} description={siteMetadata.description} />
      <NewsListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        title="News"
      />
    </>
  );
};

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.news, { timeout: 10000 });

    // 確保每個 news 都有唯一的 `id`
    const newsWithId = response.data.response.map((news, index) => ({
      ...news,
      uniqueId: `${news.id}-${index}`, // 生成唯一鍵
    }));

    const POSTS_PER_PAGE = response.data.response.length;
    const initialDisplayPosts = newsWithId.slice(0, POSTS_PER_PAGE);

    return {
      props: {
        posts: newsWithId,
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

export default News;
