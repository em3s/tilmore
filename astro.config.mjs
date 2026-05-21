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
        { tag: 'script', content: "if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('/tilmore/sw.js',{scope:'/tilmore/'}).catch(function(){})})}" },
        // ?view=book 이면 그 원문 페이지 위에 이북 엔진을 오버레이로 마운트
        { tag: 'script', content: "(function(){try{var u=new URL(location.href);if(u.searchParams.get('view')==='book'&&/\\/staffhotdog\\/book\\d+\\//.test(u.pathname)){document.documentElement.classList.add('hd-ebook-active');var s=document.createElement('script');s.src='/tilmore/staffhotdog-reader.js';s.defer=true;document.head.appendChild(s);}}catch(e){}})();" },
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
