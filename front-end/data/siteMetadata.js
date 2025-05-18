const siteMetadata = {
  title: 'WIDM laboratory website',
  author: 'WIDM',
  headerTitle: '',
  description: 'Web Intelligence and Data Mining Laboratory (Web 智慧與資料探勘實驗室)',
  snippets: '',
  language: 'en-us',
  theme: 'system', // system, dark or light
  siteUrl: '',
  siteRepo: '',
  siteLogo: '',
  image: '/static/images/avatar.png',
  socialBanner: '',
  email: '',
  labName: 'Web 智慧與資料探勘實驗室',
  address: '(320317) 桃園市中壢區中大路 300 號 工程五館三樓 B317-1',
  contactNumber: '886-3-422-7151 #35348',
  github: '',
  twitter: '',
  linkedin: '',
  website: '',
  locale: 'en-US',
  analytics: {
    plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    simpleAnalytics: false, // true or false
    umamiWebsiteId: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    googleAnalyticsId: 'G-F6V2QTJ628', // e.g. UA-000000-2 or G-XXXXXXX
  },
  newsletter: {
    provider: 'emailOctopus',
  },
  comment: {
    provider: 'giscus',
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      // theme example: light, dark, dark_dimmed, dark_high_contrast
      // transparent_dark, preferred_color_scheme, custom
      theme: 'light',
      inputPosition: 'bottom',
      lang: 'en',
      darkTheme: 'dark',
      themeURL: '',
    },
  },
  socialAccount: {
    twitter: '',
  },
}

module.exports = siteMetadata
