const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Content Security Policy
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
  img-src 'self' blob: data: https://maps.gstatic.com https://maps.googleapis.com;
  media-src 'none';
  connect-src 'self' https://maps.googleapis.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com;
  frame-src giscus.app https://www.google.com https://maps.google.com;
`;

// Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

// 使用環境變數來設定 API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  images: {
    domains: [
      'i.scdn.co',
      'pbs.twimg.com',
      'cdn.discordapp.com',
      'avatars.githubusercontent.com',
      'github.com',
      's3.us-west-2.amazonaws.com',
      'via.placeholder.com',
      'images.unsplash.com',
      'dwgyu36up6iuz.cloudfront.net',
      'cdn.hashnode.com',
      'res.craft.do',
      'res.cloudinary.com',
      'maps.googleapis.com',  // 加入 Google Maps 圖片資源
      'maps.gstatic.com',     // 加入 Google Maps 圖片資源
      API_URL.replace(/^https?:\/\//, ''), // 將 API_URL 的域名部分新增到允許圖片域名
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts', 'scripts', 'api-client'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/public/terms.html',
        destination: '/pages/api/html.js',
      },
      {
        source: '/api/:path((?!auth).*)', // 排除 /api/auth 路徑
        destination: `${API_URL}/:path*`, // 使用環境變數來設置 API URL
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
      config.resolve.fallback = {
        fs: false,
        module: false,
        path: false,
        os: false,
      };
    }

    if (!isServer) {
      config.devServer = {
        ...config.devServer,
        proxy: {
          '/api': {
            target: API_URL, // 使用環境變數來設置代理的目標 URL
            changeOrigin: true,
            secure: false,
            bypass: (req) => {
              if (req.url.startsWith('/api/auth')) {
                return req.url;
              }
            },
          },
        },
      };
    }

    return config;
  },
  env: {
    NEXTAUTH_URL: 'http://localhost:3000/api/auth',
  },
});
