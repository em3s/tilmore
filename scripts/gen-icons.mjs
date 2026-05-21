// PWA 앱 아이콘 생성 (폰트 의존 없이 도형으로). 종이 톤 + 강조색 카드 + 텍스트 라인 모티프.
// 재생성: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(new URL('..', import.meta.url).pathname, 'public/icons');
mkdirSync(OUT, { recursive: true });

// 콘텐츠는 중앙 ~55%에 배치 → maskable 안전영역(중앙 80% 원) 안에 들어감
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#faf9f5"/>
  <rect x="116" y="116" width="280" height="280" rx="60" fill="#c2410c"/>
  <rect x="176" y="200" width="160" height="22" rx="11" fill="#faf9f5"/>
  <rect x="176" y="245" width="160" height="22" rx="11" fill="#faf9f5"/>
  <rect x="176" y="290" width="104" height="22" rx="11" fill="#faf9f5"/>
</svg>`;
const buf = Buffer.from(svg);

for (const size of [192, 512]) {
  await sharp(buf).resize(size, size).png().toFile(join(OUT, `icon-${size}.png`));
  console.log(`icon-${size}.png`);
}
console.log('done →', OUT);
