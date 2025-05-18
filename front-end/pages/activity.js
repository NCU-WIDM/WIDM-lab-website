// pages/activity.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import { PageSEO } from '@/components/SEO';
import Activity from '@/components/Activity';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';

export default function ActivityPage({ activities, timeoutError }) {
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
      <PageSEO
        title={`Activities - ${siteMetadata.author}`}
        description="A collection of activities."
      />
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between border-b border-gray-300 space-y-2 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 pb-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Activities
          </h1>
        </div>

        {!activities.length && <h2 className="m-2 text-lg">No Activity found.</h2>}
        {activities.map((activity) => (
          <Activity key={activity.id} {...activity} />
        ))}
      </div>
    </>
  );
}

// 使用 getStaticProps 在構建時獲取資料
export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.activity, { timeout: 10000 });
    const activities = response.data.response;

    return {
      props: {
        activities,
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        activities: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}
