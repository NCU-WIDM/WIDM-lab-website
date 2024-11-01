// pages/activates.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import siteMetadata from '@/data/siteMetadata';
import { PageSEO } from '@/components/SEO';
import Activate from '@/components/Activate';
import { defaultHttp } from 'utils/http';
import { processDataRoutes } from 'routes/api';

export default function ActivatePage({ activates, timeoutError }) {
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
        title={`Activates - ${siteMetadata.author}`}
        description="A collection of activities."
      />
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between border-b border-gray-300 space-y-2 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 pb-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Activates
          </h1>
        </div>

        {!activates.length && <h2 className="m-2 text-lg">No Activate found.</h2>}
        {activates.map((activate) => (
          <Activate key={activate.id} {...activate} />
        ))}
      </div>
    </>
  );
}

// 使用 getStaticProps 在構建時獲取資料
export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.activity, { timeout: 10000 });
    const activates = response.data.response;

    return {
      props: {
        activates,
        timeoutError: false,
      },
    };
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        activates: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}
