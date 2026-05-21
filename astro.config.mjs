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
