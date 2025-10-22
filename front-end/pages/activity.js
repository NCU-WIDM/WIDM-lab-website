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
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="pt-6 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12">
              Activities
            </h1>
          </div>
        </div>

        <div className="py-12 flex justify-center">
          <div className="w-full max-w-2xl">
            {!activities.length && <h2 className="m-2 text-lg">No Activity found.</h2>}
            {activities.map((activity) => (
                <Activity key={activity.id} {...activity} />
            ))}
          </div>
        </div>
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
