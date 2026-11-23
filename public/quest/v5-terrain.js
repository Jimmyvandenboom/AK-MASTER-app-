/**
 * Geographically grounded isometric terrain miniatures for the Quest 5 atlas.
 * SVG is local, dependency-free, and does not load remote maps or mutate game data.
 */
const escapeAttr = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[char]));
function terrainBase(theme) {
  return `<defs>
    <linearGradient id="soil-${theme}" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#244d40"/><stop offset="1" stop-color="#17372f"/></linearGradient>
    <linearGradient id="water-${theme}" x1="0" x2="1" y1="0" y2=".7"><stop stop-color="#9de3e0"/><stop offset="1" stop-color="#2385ad"/></linearGradient>
  </defs>
  <path d="M35 108 198 25 370 113 206 203Z" fill="#193e39" stroke="#1b5754" stroke-width="2"/>
  <path d="M35 108 206 203 206 227 35 131Z" fill="#28564b"/>
  <path d="M206 203 370 113 370 138 206 227Z" fill="url(#soil-${theme})"/>
  <path d="M35 108 198 25 370 113 206 203Z" fill="#79bb83" stroke="#b5dfb0" stroke-width="1.5"/>`;
}
function polder() {
  return `<g>
    <path d="M42 108 198 30 352 110 207 189Z" fill="#b0ce7b"/>
    <path d="m59 107 71-36 150 80-70 36Z" fill="#8ec47d"/>
    <path d="m141 66 63-32 151 78-60 33Z" fill="#72bd85"/>
    <path d="m63 111 145 74M115 82 269 160M176 45 325 125" stroke="#d1da95" stroke-width="5" fill="none"/>
    <path d="M45 113Q107 110 151 130T270 148L350 117" stroke="#1a7e9f" stroke-width="21" fill="none"/>
    <path d="M45 112Q107 109 151 129T270 147L350 116" stroke="url(#water-nl)" stroke-width="13" fill="none"/>
    <path d="M45 135Q120 130 160 148T268 164L352 128" stroke="#d2bd8a" stroke-width="6" fill="none"/>
    <g fill="#f0f2da" stroke="#366c60" stroke-width="1.5">
      <path d="m98 80 16-9 17 9-17 10Z"/><path d="m105 71 9-18 10 18Z" fill="#9b664f"/>
      <path d="m238 76 12-7 12 7-12 7Z"/><path d="m239 65 11-16 10 16Z" fill="#ab705c"/>
    </g>
    <g stroke="#fff2cd" stroke-width="3" stroke-linecap="round"><path d="m113 72 1-32M99 52l29 14M100 68l28-18"/><path d="m249 68 1-30M237 48l27 14M238 63l25-21"/></g>
    <path d="m282 109 15-9 13 8-15 10Z" fill="#e9d3a4"/><path d="m281 109 16-20 13 19Z" fill="#d26654"/>
  </g>`;
}
function riverChina() {
  return `<g>
    <path d="M42 105 198 30 358 110 206 193Z" fill="#7ca8a0"/>
    <path d="m58 105 44-40 55 24 37-54 62 47 31-10 58 38-141 76Z" fill="#749187"/>
    <path d="m83 105 32-33 43 31 40-63 35 28-35 43-45-13-29 35Z" fill="#c1d8ca"/>
    <path d="m196 38 18-12 20 15-13 9-7-7-10 8Z" fill="#f6f8ee"/>
    <path d="m88 123 31-18 41 23 32-41 34 20 53-19 56 32" stroke="#225c78" stroke-width="28" fill="none" stroke-linecap="round"/>
    <path d="m88 123 31-18 41 23 32-41 34 20 53-19 56 32" stroke="url(#water-cn)" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="m185 85 19 9-8 19-19-9Z" fill="#d1d8cf" stroke="#546f78" stroke-width="3"/>
    <path d="m186 83 7 3-9 24-7-4Z" fill="#edf5e9"/>
    <g fill="#385951"><path d="m68 118 13-15 15 18Z"/><path d="m275 147 16-18 12 19Z"/><path d="m313 120 13-13 10 17Z"/></g>
  </g>`;
}
function middleEast() {
  return `<g>
    <path d="M42 107 196 33 358 109 207 192Z" fill="#edbd80"/>
    <path d="M42 107q43-35 95-9t91 6q45-23 130 5l-151 83Z" fill="#e5a96d"/>
    <path d="m64 114 78-35 59 39 53-30 73 33" fill="none" stroke="#f6d39a" stroke-width="12"/>
    <path d="m69 119 85-44 75 38 75-19 34 18" fill="none" stroke="#cd8a59" stroke-width="5"/>
    <path d="M91 131q20-26 54-19 38 8 47 28-25 21-65 13Z" fill="#6ec6b5" stroke="#2c8f97" stroke-width="4"/>
    <path d="m143 107 12-22 15 25Z" fill="#bd875c"/><path d="m157 99 16-21 12 32Z" fill="#d2a071"/>
    <path d="m228 118 12-13 10 11-11 16Z" fill="#fff4d9"/><path d="m247 109 11-12 13 12-11 13Z" fill="#fff1d1"/>
    <g stroke="#5e8657" stroke-width="4" stroke-linecap="round"><path d="m119 124-2-27m0 10-11-9m11 9 11-10m11 33-1-25m0 11-10-8m10 8 10-7"/></g>
    <path d="m264 126 39 20" stroke="#7b6653" stroke-dasharray="5 5" stroke-width="3"/>
  </g>`;
}
export function renderQuestTerrain(chapter, label = '') {
  const kind = chapter === 'H7' ? 'nl' : chapter === 'H8' ? 'cn' : 'me';
  const title = escapeAttr(label || ({nl:'Nederlands rivierenlandschap',cn:'Chinees rivierenlandschap',me:'Droog landschap met oase'}[kind]));
  const feature = kind === 'nl' ? polder() : kind === 'cn' ? riverChina() : middleEast();
  return `<svg class="q5-terrain-svg" viewBox="0 0 405 242" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" focusable="false">
    ${terrainBase(kind)}${feature}
  </svg>`;
}
