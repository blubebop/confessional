/* Original vector artwork rasterized with the template's existing Sharp dependency. */
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const target = path.resolve(__dirname, '../../public/my-game');
fs.mkdirSync(target, { recursive: true });
function artwork(width, height) {
  const cx = width / 2;
  const panels = Array.from({ length: 16 }, (_, id) => {
    const x = cx - 132 + (id % 4) * 68;
    const y = 186 + Math.floor(id / 4) * 49;
    return `<g transform="translate(${x},${y})"><rect width="60" height="43" fill="url(#wood)" stroke="#795738"/><rect x="5" y="5" width="50" height="33" fill="none" stroke="#a5803b" stroke-opacity=".25"/><path d="M30 11l4 8 9 3-9 3-4 8-4-8-9-3 9-3z" fill="none" stroke="#ae8c53" opacity=".5"/></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} 512">
  <defs><linearGradient id="wood" x2=".9" y2="1"><stop stop-color="#4e3422"/><stop offset=".6" stop-color="#271a12"/><stop offset="1" stop-color="#39261a"/></linearGradient><radialGradient id="glow"><stop stop-color="#b18a46" stop-opacity=".25"/><stop offset="1" stop-color="#090807"/></radialGradient><pattern id="lattice" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0l16 16M16 0L0 16" stroke="#795c37" stroke-width="2"/></pattern></defs>
  <rect width="100%" height="100%" fill="#100d09"/><rect width="100%" height="100%" fill="url(#glow)"/>
  <path d="M${cx-154} 400V145Q${cx} -14 ${cx+154} 145V400" fill="#160f0a" stroke="#5e4024" stroke-width="12"/>
  <path d="M${cx-132} 167V139Q${cx} 1 ${cx+132} 139V167Z" fill="#0b0907" stroke="#8f6937" stroke-width="2"/>
  <path d="M${cx-131} 167V139Q${cx} 3 ${cx+131} 139V167Z" fill="url(#lattice)" opacity=".65"/>
  ${panels}<path d="M${cx-175} 389h350" stroke="#69472a" stroke-width="10"/>
  <text x="${cx}" y="438" text-anchor="middle" fill="#dec89c" font-family="Georgia,serif" font-size="32" letter-spacing="6">CONFESSIONAL</text>
  <text x="${cx}" y="466" text-anchor="middle" fill="#ad9874" font-family="Georgia,serif" font-size="11" letter-spacing="3">SIXTEEN DOORS. ONE BURDEN.</text>
  <text x="${cx}" y="492" text-anchor="middle" fill="#9b8d75" font-family="Arial,sans-serif" font-size="8" letter-spacing="3">APEGROUNDZ · APE CHURCH</text></svg>`;
}
Promise.all([[512, 512, 'card.png'], [1024, 512, 'banner.png']].map(([w, h, name]) =>
  sharp(Buffer.from(artwork(w, h))).png({ compressionLevel: 9 }).toFile(path.join(target, name))))
  .then(() => console.info('Original card and banner generated.'));
