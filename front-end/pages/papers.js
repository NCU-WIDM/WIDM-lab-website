import siteMetadata from '@/data/siteMetadata'
import PaperListLayout from '@/layouts/PaperListLayout'
import { PageSEO } from '@/components/SEO'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

// export const POSTS_PER_PAGE = 20

const Papers = ({ posts, initialDisplayPosts, pagination, error }) => {
  if (error) {
    return <div>載入失敗: {error}</div>
  }

  return (
    <>
      <PageSEO title={`Papers - ${siteMetadata.author}`} description={siteMetadata.description} />
      <PaperListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="Papers"
      />
    </>
  )
}

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.paper);

    // 確保每個 paper 都有唯一的 `id`
    const papersWithId = response.data.response.map((paper, index) => ({
      ...paper,
      uniqueId: `${paper.attachment}-${paper.id}-${index}`, // 生成唯一鍵
    }))

    const POSTS_PER_PAGE = response.data.response.length;

    const initialDisplayPosts = papersWithId.slice(0, POSTS_PER_PAGE)
    // const pagination = {
    //   currentPage: 2,
    //   totalPages: Math.ceil(papersWithId.length / POSTS_PER_PAGE),
    // }

    return {
      props: {
        posts: papersWithId,
        initialDisplayPosts,
      },
    }
  } catch (error) {
    console.error('API 調用失敗:', error.message);

    return {
      props: {
        posts: [],
        initialDisplayPosts: [],
        error: error.message,
      },
    }
  }
}

export default Papers
