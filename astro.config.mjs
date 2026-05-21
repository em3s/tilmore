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
      customCss: ['katex/dist/katex.min.css'],
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
          items: [
            { label: '리더 열기', link: '/staffhotdog/', attrs: { target: '_blank' } },
            { label: '#1 — MapReduce', link: '/staffhotdog/?book=01', attrs: { target: '_blank' } },
            { label: '#2 — Latency Numbers', link: '/staffhotdog/?book=02', attrs: { target: '_blank' } },
            { label: '#3 — Bloom Filter', link: '/staffhotdog/?book=03', attrs: { target: '_blank' } },
          ],
        },
      ],
    }),
  ],
});
