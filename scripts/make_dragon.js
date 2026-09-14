import fs from 'fs';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFF8D" />
      <stop offset="40%" stop-color="#FFAB00" />
      <stop offset="80%" stop-color="#FF3D00" />
      <stop offset="100%" stop-color="rgba(255,61,0,0)" />
    </radialGradient>
    <linearGradient id="dragonBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="35%" stop-color="#FFB300" />
      <stop offset="70%" stop-color="#E65100" />
      <stop offset="100%" stop-color="#8D2200" />
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D84315" />
      <stop offset="50%" stop-color="#FF9100" />
      <stop offset="100%" stop-color="#FFEA00" />
    </linearGradient>
  </defs>

  <!-- Auspicious Cloud Swirls -->
  <path d="M 40 320 Q 90 260, 160 310 T 310 300" fill="none" stroke="#FFB300" stroke-width="6" opacity="0.5" stroke-linecap="round" />
  <path d="M 100 90 Q 180 30, 260 90 T 360 80" fill="none" stroke="#FFB300" stroke-width="6" opacity="0.5" stroke-linecap="round" />

  <!-- Coiling Chinese Imperial Dragon Body (S-Curve) -->
  <path d="M 70 310 C 30 190, 130 100, 230 100 C 310 100, 360 170, 330 260 C 300 330, 190 340, 130 300 Z" fill="url(#dragonBodyGrad)" filter="drop-shadow(0px 8px 12px rgba(0,0,0,0.3))" />
  <path d="M 95 285 C 60 190, 140 125, 225 125 C 290 125, 335 180, 310 250 C 285 300, 190 305, 145 275 Z" fill="#FF8F00" />
  <path d="M 120 260 C 95 190, 155 155, 220 155 C 265 155, 300 195, 285 240 C 270 270, 195 275, 160 255 Z" fill="#FFD54F" opacity="0.95" />

  <!-- Dragon Scale Detail Ridge Lines -->
  <path d="M 130 150 Q 170 190, 220 150 T 290 160" fill="none" stroke="#D84315" stroke-width="5" stroke-linecap="round" />
  <path d="M 110 210 Q 160 250, 220 210 T 310 220" fill="none" stroke="#D84315" stroke-width="5" stroke-linecap="round" />
  <path d="M 140 270 Q 190 300, 250 270" fill="none" stroke="#D84315" stroke-width="5" stroke-linecap="round" />

  <!-- Back Spine Fins -->
  <path d="M 230 100 L 245 75 L 255 102 L 275 80 L 282 110 L 305 92 L 308 125 Z" fill="url(#flameGrad)" />

  <!-- Flaming Pearl of Wisdom (แก้วมังกร) -->
  <circle cx="320" cy="120" r="38" fill="url(#ballGlow)" />
  <circle cx="320" cy="120" r="20" fill="#FFF9C4" />
  <path d="M 285 120 Q 250 80, 210 95 Q 260 135, 285 120 Z" fill="url(#flameGrad)" />

  <!-- Snorting Fire Flames -->
  <path d="M 330 160 Q 380 180, 390 140 Q 355 130, 330 160 Z" fill="#FF3D00" />
  <path d="M 310 180 Q 360 210, 375 180 Q 345 165, 310 180 Z" fill="#FF9100" />

  <!-- Chinese Dragon Head, Horns, Eyes & Whiskers -->
  <path d="M 300 160 C 330 130, 360 140, 350 175 C 340 195, 310 200, 290 180 Z" fill="#E65100" />
  <!-- Whiskers -->
  <path d="M 335 170 Q 385 220, 395 195" fill="none" stroke="#FFE082" stroke-width="7" stroke-linecap="round" />
  <path d="M 320 180 Q 365 240, 380 225" fill="none" stroke="#FFE082" stroke-width="5" stroke-linecap="round" />
  <!-- Horns -->
  <path d="M 290 130 Q 310 80, 335 75 Q 320 105, 305 135 Z" fill="#FFF" stroke="#FFA000" stroke-width="3" />
  <!-- Eye -->
  <circle cx="315" cy="155" r="10" fill="#FFF" stroke="#B71C1C" stroke-width="4" />
  <circle cx="317" cy="155" r="5" fill="#000" />
</svg>`;

fs.writeFileSync('public/chinese_dragon_pattern.svg', svgContent);
console.log('Successfully created public/chinese_dragon_pattern.svg');
