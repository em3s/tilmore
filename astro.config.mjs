import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://em3s.github.io',
  base: '/tilmore',
  integrations: [
    starlight({
      title: '문제해결을 위한 수학적 사고',
      description: '수학은 사고의 뼈대다. 차별점은 여기서 나온다.',
      defaultLocale: 'root',
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      sidebar: [
        { label: '소개', link: '/' },
        { label: '읽는 법', link: '/intro/' },
        { label: '회차', autogenerate: { directory: 'sessions' } },
        { label: '범위 밖', link: '/scope/' },
      ],
    }),
  ],
});
