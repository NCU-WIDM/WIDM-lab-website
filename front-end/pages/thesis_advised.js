import siteMetadata from '@/data/siteMetadata'
import PaperListLayout from '@/layouts/PaperListLayout'
import { PageSEO } from '@/components/SEO'
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'

const Thesis_paper = ({ posts, initialDisplayPosts, timeoutError }) => {
  if (timeoutError) return null

  return (
    <>
      <PageSEO title={`Thesis Advised - ${siteMetadata.author}`} description={siteMetadata.description} />
      <PaperListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        groupBy="type"
        title="Thesis Advised"
      />
    </>
  )
}

export async function getStaticProps() {
  try {
    const response = await defaultHttp.get(processDataRoutes.paper, { timeout: 10000 })
    // 只取 type 包含 'Thesis Advised' 的論文
    const papersWithId = response.data.response
      .filter(paper =>
        paper.types.some(type => type.toLowerCase().includes('thesis'))
      )
      .map((paper, index) => ({
        ...paper,
        uniqueId: `${paper.attachment}-${paper.id}-${index}`,
      }))

    return {
      props: {
        posts: papersWithId,
        initialDisplayPosts: papersWithId,
        timeoutError: false,
      },
    }
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED'
    return {
      props: {
        posts: [],
        initialDisplayPosts: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    }
  }
}

export default Thesis_paper
