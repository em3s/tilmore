import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://em3s.github.io',
  base: '/tilmore',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    starlight({
      title: 'tilmore',
      description: 'Today I Learned and More',
      // PWA — '홈 화면에 추가' 시 풀스크린 앱처럼 (iOS는 manifest + apple 메타로 동작)
      head: [
        { tag: 'link', attrs: { rel: 'manifest', href: '/tilmore/manifest.webmanifest' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/tilmore/icons/icon-192.png' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: 'tilmore' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'default' } },
        { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' } },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      customCss: ['katex/dist/katex.min.css', './src/styles/hotdog.css'],
      sidebar: [
        {
          label: '문제해결을 위한 수학적 사고',
          items: [
            { label: '읽는 법', link: '/intro/' },
            { label: '회차', autogenerate: { directory: 'sessions' } },
            { label: '범위 밖', link: '/scope/' },
          ],
        },
        {
          label: '스태프 핫도그',
          autogenerate: { directory: 'staffhotdog' },
        },
      ],
    }),
  ],
});
