// Realistic sample crop leaf images encoded as SVG data URIs for immediate 1-click diagnosis testing

function createLeafSvg(title: string, leafColor: string, spotsColor: string, pattern: 'spots' | 'blight' | 'curled' | 'healthy'): string {
  let markings = '';

  if (pattern === 'spots') {
    markings = `
      <circle cx="80" cy="90" r="14" fill="${spotsColor}" opacity="0.85" />
      <circle cx="80" cy="90" r="8" fill="#3E2723" opacity="0.9" />
      <circle cx="120" cy="130" r="18" fill="${spotsColor}" opacity="0.85" />
      <circle cx="120" cy="130" r="10" fill="#3E2723" opacity="0.9" />
      <circle cx="100" cy="180" r="12" fill="${spotsColor}" opacity="0.8" />
      <circle cx="65" cy="150" r="10" fill="${spotsColor}" opacity="0.75" />
      <circle cx="130" cy="80" r="10" fill="${spotsColor}" opacity="0.85" />
    `;
  } else if (pattern === 'blight') {
    markings = `
      <path d="M 50 60 Q 90 90 70 140 Q 40 180 35 120 Z" fill="${spotsColor}" opacity="0.88" />
      <path d="M 120 70 Q 155 100 145 160 Q 120 150 110 110 Z" fill="${spotsColor}" opacity="0.85" />
      <path d="M 85 170 Q 110 200 90 230 Q 75 210 80 185 Z" fill="#2E1B0F" opacity="0.9" />
    `;
  } else if (pattern === 'curled') {
    markings = `
      <path d="M 40 100 Q 70 80 90 120 Q 80 160 50 140 Z" fill="${spotsColor}" opacity="0.75" />
      <path d="M 100 120 Q 140 110 130 170 Q 110 160 95 140 Z" fill="${spotsColor}" opacity="0.8" />
      <path d="M 50 60 Q 100 70 80 100 Z" fill="#E65100" opacity="0.7" />
    `;
  } else if ((pattern as any) === 'rust') {
    markings = `
      <ellipse cx="80" cy="80" rx="3" ry="12" fill="${spotsColor}" opacity="0.9" transform="rotate(15 80 80)" />
      <ellipse cx="86" cy="110" rx="3" ry="14" fill="${spotsColor}" opacity="0.9" transform="rotate(15 86 110)" />
      <ellipse cx="92" cy="140" rx="3.5" ry="16" fill="${spotsColor}" opacity="0.95" transform="rotate(10 92 140)" />
      <ellipse cx="110" cy="90" rx="3" ry="12" fill="${spotsColor}" opacity="0.9" transform="rotate(-10 110 90)" />
      <ellipse cx="115" cy="130" rx="3.5" ry="15" fill="${spotsColor}" opacity="0.95" transform="rotate(-15 115 130)" />
      <ellipse cx="120" cy="170" rx="3" ry="12" fill="${spotsColor}" opacity="0.9" transform="rotate(-15 120 170)" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 200 260">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </radialGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${leafColor}"/>
          <stop offset="70%" stop-color="#15803D"/>
          <stop offset="100%" stop-color="#14532D"/>
        </linearGradient>
      </defs>
      <rect width="200" height="260" fill="url(#bg)" rx="12"/>
      
      <!-- Leaf Shadow -->
      <path d="M 100 20 C 160 70 170 180 100 240 C 30 180 40 70 100 20 Z" fill="#000000" opacity="0.3" transform="translate(4, 6)" />
      
      <!-- Leaf Body -->
      <path d="M 100 20 C 160 70 170 180 100 240 C 30 180 40 70 100 20 Z" fill="url(#leafGrad)" stroke="#166534" stroke-width="2"/>
      
      <!-- Main Stem Vein -->
      <path d="M 100 25 Q 100 130 100 250" stroke="#86EFAC" stroke-width="3" fill="none" opacity="0.8"/>
      
      <!-- Side Veins -->
      <path d="M 100 70 Q 125 60 145 75" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M 100 70 Q 75 60 55 75" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>
      
      <path d="M 100 115 Q 130 105 152 120" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M 100 115 Q 70 105 48 120" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>
      
      <path d="M 100 160 Q 125 155 145 170" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M 100 160 Q 75 155 55 170" stroke="#86EFAC" stroke-width="1.8" fill="none" opacity="0.6"/>

      <!-- Disease / Pathology Markings -->
      ${markings}

      <!-- Caption badge -->
      <rect x="12" y="224" width="176" height="24" rx="6" fill="#020617" opacity="0.85" />
      <text x="100" y="240" fill="#E2E8F0" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleImage {
  id: string;
  name: string;
  crop: string;
  diseaseHint: string;
  dataUrl: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample_tomato_blight',
    name: 'Tomato Early Blight',
    crop: 'Tomato (Solanum lycopersicum)',
    diseaseHint: 'Concentric rings & yellow halos',
    dataUrl: createLeafSvg('Tomato Early Blight', '#4ADE80', '#B45309', 'spots'),
  },
  {
    id: 'sample_rice_blight',
    name: 'Rice Bacterial Blight',
    crop: 'Paddy Rice (Oryza sativa)',
    diseaseHint: 'Marginal wilting & necrosis',
    dataUrl: createLeafSvg('Rice Bacterial Blight', '#86EFAC', '#854D0E', 'blight'),
  },
  {
    id: 'sample_cotton_curl',
    name: 'Cotton Leaf Curl Virus',
    crop: 'Cotton (Gossypium hirsutum)',
    diseaseHint: 'Upward curling & enation',
    dataUrl: createLeafSvg('Cotton Leaf Curl Virus', '#FDE047', '#D97706', 'curled'),
  },
  {
    id: 'sample_wheat_rust',
    name: 'Wheat Yellow Stripe Rust',
    crop: 'Wheat (Triticum aestivum)',
    diseaseHint: 'Linear rows of yellow pustules',
    dataUrl: createLeafSvg('Wheat Yellow Stripe Rust', '#86EFAC', '#EA580C', 'rust' as any),
  },
  {
    id: 'sample_citrus_canker',
    name: 'Citrus Bacterial Canker',
    crop: 'Citrus / Lemon (Citrus limon)',
    diseaseHint: 'Raised corky spots with yellow halo',
    dataUrl: createLeafSvg('Citrus Bacterial Canker', '#4ADE80', '#92400E', 'spots'),
  },
  {
    id: 'sample_healthy_apple',
    name: 'Healthy Organic Bell Pepper',
    crop: 'Capsicum / Pepper',
    diseaseHint: 'Vibrant green, no lesions',
    dataUrl: createLeafSvg('Healthy Crop Foliage', '#22C55E', '#16A34A', 'healthy'),
  },
];
