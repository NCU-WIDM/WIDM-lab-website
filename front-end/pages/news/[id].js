import { useRouter } from 'next/router'
import siteMetadata from '@/data/siteMetadata'
import { PageSEO } from '@/components/SEO'
import { IoMdReturnLeft } from "react-icons/io"
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

const NewsDetail = ({ news, error }) => {
  const router = useRouter()

  if (error) {
    return <div>載入失敗: {error}</div>
  }

  if (router.isFallback) {
    return <div>載入中...</div>
  }

  return (
    <>
      <PageSEO title={`News - ${siteMetadata.author}`} description={siteMetadata.description} />
      <article>
        <div className="flex items-center justify-between">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1
              style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}
              className="text-[33px] font-extrabold text-gray-800/80 drop-shadow-lg text-wrap text-center dark:text-white"
            >
              {news.title}
            </h1>
            <p className="text-lg text-gray-800 mt-1">{news.sub_title}</p>
            <p className="text-lg text-gray-400 mt-2">update by: {news.update_time}</p>
          </div>
          <button onClick={() => router.back()} className="p-2 border border-gray-400 rounded text-gray-600 hover:bg-gray-100">
            <IoMdReturnLeft size={24} />
          </button>
        </div>
        <hr className="my-4 border-gray-300" />
        <div
          className="mx-auto w-full news-content-container"
          dangerouslySetInnerHTML={{
            __html: news.content,
          }}
        />
      </article>
    </>
  )
}

export async function getStaticPaths() {
  try {
    const response = await defaultHttp.get(processDataRoutes.news);
    const newsList = response.data.response;

    const paths = newsList.map((news) => ({
      params: { id: news.id.toString() },
    }))

    return {
      paths,
      fallback: true, // 如果未預先生成的頁面，首次訪問時會生成
    }
  } catch (error) {
    console.error('API 調用失敗:', error.message);
    return {
      paths: [],
      fallback: true,
    }
  }
}

export async function getStaticProps({ params }) {
  try {
    const response = await defaultHttp.get(`${processDataRoutes.news}/${params.id}`);
    const news = response.data.response;

    return {
      props: {
        news,
      },
    }
  } catch (error) {
    console.error('API 調用失敗:', error.message);

    return {
      props: {
        news: null,
        error: error.message,
      },
    }
  }
}

export default NewsDetail
