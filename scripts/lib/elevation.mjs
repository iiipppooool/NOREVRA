/**
 * Orthographic front elevation, drawn from the same part list as the scene
 * render. Dimension lines in millimetres, a title block, and nothing else.
 */

const INK = "#1b1a17";
const PAPER = "#f4f1ea";
const FAINT = "#b9b1a1";

const ROLE_TONE = {
  uph: 0.1,
  cushion: 0.1,
  plinth: 0.16,
  carcass: 0.14,
  seat: 0.14,
  base: 0.16,
  shelves: 0.12,
  stone: 0.08,
  top: 0.08,
  blades: 0.08,
  uprights: 0.26,
  frame: 0.26,
  feet: 0.26,
  metal: 0.22,
  lining: 0.2,
  writing: 0.18,
  glass: 0.3,
  dark: 0.42,
  reveal: 0.6,
};

export function elevationSvg(product, variant, parts, size = 1200) {
  const { w: W, d: D, h: H, sh: SH } = variant.dim;
  const pad = size * 0.14;
  const drawW = size - pad * 2;
  const drawH = size - pad * 2 - size * 0.08;
  const s = Math.min(drawW / W, drawH / H);
  const ox = pad + (drawW - W * s) / 2;
  const oy = pad + (drawH - H * s);
  const Y = (y) => oy + (H - y) * s;
  const X = (x) => ox + x * s;

  let body = "";
  for (const p of parts) {
    if (p.shape === "bolster") {
      const x = X(p.x);
      const y = Y(p.y + p.w);
      body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(p.h * s).toFixed(1)}" height="${(p.w * s).toFixed(1)}" rx="${(p.w * s * 0.5).toFixed(1)}" fill="${INK}" fill-opacity="0.1" stroke="${INK}" stroke-width="1.1"/>`;
      continue;
    }
    const x = X(p.x);
    const y = Y(p.y + p.h);
    const pw = Math.max(0.6, p.w * s);
    const ph = Math.max(0.6, p.h * s);
    const tone = ROLE_TONE[p.role] ?? 0.12;
    if (p.shape === "cyl" || p.shape === "disc") {
      const r = p.shape === "disc" ? ph * 0.5 : Math.min(pw, ph) * 0.06;
      body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}" rx="${r.toFixed(1)}" fill="${INK}" fill-opacity="${tone}" stroke="${INK}" stroke-width="1.1"/>`;
      // centre line, as a turned part is drawn
      body += `<line x1="${(x + pw / 2).toFixed(1)}" y1="${(y - 6).toFixed(1)}" x2="${(x + pw / 2).toFixed(1)}" y2="${(y + ph + 6).toFixed(1)}" stroke="${FAINT}" stroke-width="0.7" stroke-dasharray="14 5 3 5"/>`;
      continue;
    }
    const r = p.r ? Math.min(p.r * s, pw / 2.2, ph / 2.2) : 0;
    body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}"${r ? ` rx="${r.toFixed(1)}"` : ""} fill="${INK}" fill-opacity="${tone}" stroke="${INK}" stroke-width="${p.flat ? 0.8 : 1.2}"/>`;
  }

  /* --- dimensions ------------------------------------------------------ */
  const mm = (cm) => `${Math.round(cm * 10)}`;
  const tick = (x, y, vertical) =>
    vertical
      ? `<line x1="${(x - 5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="0.9"/>`
      : `<line x1="${x.toFixed(1)}" y1="${(y - 5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 5).toFixed(1)}" stroke="${INK}" stroke-width="0.9"/>`;

  const dimY = Y(0) + size * 0.055;
  const dimX = X(W) + size * 0.055;
  let dims = `
  <line x1="${X(0)}" y1="${dimY}" x2="${X(W)}" y2="${dimY}" stroke="${INK}" stroke-width="0.9"/>
  ${tick(X(0), dimY, false)}${tick(X(W), dimY, false)}
  <line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${dimY + 8}" stroke="${FAINT}" stroke-width="0.6"/>
  <line x1="${X(W)}" y1="${Y(0)}" x2="${X(W)}" y2="${dimY + 8}" stroke="${FAINT}" stroke-width="0.6"/>
  <text x="${((X(0) + X(W)) / 2).toFixed(1)}" y="${(dimY - 10).toFixed(1)}" class="dim" text-anchor="middle">${mm(W)}</text>

  <line x1="${dimX}" y1="${Y(0)}" x2="${dimX}" y2="${Y(H)}" stroke="${INK}" stroke-width="0.9"/>
  ${tick(dimX, Y(0), true)}${tick(dimX, Y(H), true)}
  <line x1="${X(W)}" y1="${Y(H)}" x2="${dimX + 8}" y2="${Y(H)}" stroke="${FAINT}" stroke-width="0.6"/>
  <text x="${(dimX + 14).toFixed(1)}" y="${((Y(0) + Y(H)) / 2).toFixed(1)}" class="dim" text-anchor="start" dominant-baseline="middle">${mm(H)}</text>`;

  if (SH) {
    const yS = Y(SH);
    dims += `
    <line x1="${(X(0) - size * 0.05).toFixed(1)}" y1="${yS.toFixed(1)}" x2="${(X(0) - size * 0.05).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="${INK}" stroke-width="0.9"/>
    ${tick(X(0) - size * 0.05, yS, true)}${tick(X(0) - size * 0.05, Y(0), true)}
    <line x1="${(X(0) - size * 0.05 - 8).toFixed(1)}" y1="${yS.toFixed(1)}" x2="${X(0).toFixed(1)}" y2="${yS.toFixed(1)}" stroke="${FAINT}" stroke-width="0.6" stroke-dasharray="6 4"/>
    <text x="${(X(0) - size * 0.05 - 14).toFixed(1)}" y="${((yS + Y(0)) / 2).toFixed(1)}" class="dim" text-anchor="end" dominant-baseline="middle">${mm(SH)}</text>`;
  }

  const ground = `<line x1="${(X(0) - size * 0.08).toFixed(1)}" y1="${Y(0).toFixed(1)}" x2="${(X(W) + size * 0.08).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="${INK}" stroke-width="1.6"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Scale elevation drawing of the ${product.name}">
  <style>
    .dim{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0168).toFixed(1)}px;letter-spacing:0.14em;fill:${INK}}
    .lbl{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0158).toFixed(1)}px;letter-spacing:0.22em;text-transform:uppercase;fill:${INK}}
    .lblq{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0145).toFixed(1)}px;letter-spacing:0.18em;text-transform:uppercase;fill:#7c766b}
  </style>
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  ${ground}
  ${body}
  ${dims}
  <g>
    <line x1="${pad.toFixed(1)}" y1="${(size - pad * 0.62).toFixed(1)}" x2="${(size - pad).toFixed(1)}" y2="${(size - pad * 0.62).toFixed(1)}" stroke="${FAINT}" stroke-width="0.8"/>
    <text x="${pad.toFixed(1)}" y="${(size - pad * 0.38).toFixed(1)}" class="lbl">${product.name}</text>
    <text x="${(size - pad).toFixed(1)}" y="${(size - pad * 0.38).toFixed(1)}" class="lblq" text-anchor="end">Front elevation · ${variant.label.replace(/·/g, "/")} · mm</text>
  </g>
</svg>`;
}

/** A plan-view footprint drawing, used on the dimensions panel. */
export function planSvg(product, variant, parts, size = 1200) {
  const { w: W, d: D } = variant.dim;
  const pad = size * 0.14;
  const drawW = size - pad * 2;
  const drawH = size - pad * 2 - size * 0.08;
  const s = Math.min(drawW / W, drawH / D);
  const ox = pad + (drawW - W * s) / 2;
  const oy = pad + (drawH - D * s) / 2;
  const X = (x) => ox + x * s;
  const Z = (z) => oy + (D - z) * s;

  let body = "";
  for (const p of parts) {
    const x = X(p.x);
    const y = Z(p.z + p.d);
    const pw = Math.max(0.6, p.w * s);
    const ph = Math.max(0.6, p.d * s);
    const tone = ROLE_TONE[p.role] ?? 0.1;
    const r = p.r ? Math.min(p.r * s, pw / 2.2, ph / 2.2) : 0;
    body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}"${r ? ` rx="${r.toFixed(1)}"` : ""} fill="${INK}" fill-opacity="${(tone * 0.7).toFixed(3)}" stroke="${INK}" stroke-width="0.9"/>`;
  }
  const mm = (cm) => `${Math.round(cm * 10)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Plan drawing of the ${product.name}">
  <style>.dim{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0168).toFixed(1)}px;letter-spacing:0.14em;fill:${INK}}
  .lbl{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0158).toFixed(1)}px;letter-spacing:0.22em;text-transform:uppercase;fill:${INK}}
  .lblq{font-family:Jost,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:${(size * 0.0145).toFixed(1)}px;letter-spacing:0.18em;text-transform:uppercase;fill:#7c766b}</style>
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  ${body}
  <line x1="${X(0)}" y1="${(Z(0) + size * 0.055).toFixed(1)}" x2="${X(W)}" y2="${(Z(0) + size * 0.055).toFixed(1)}" stroke="${INK}" stroke-width="0.9"/>
  <text x="${((X(0) + X(W)) / 2).toFixed(1)}" y="${(Z(0) + size * 0.055 - 10).toFixed(1)}" class="dim" text-anchor="middle">${mm(W)}</text>
  <line x1="${(X(W) + size * 0.055).toFixed(1)}" y1="${Z(0)}" x2="${(X(W) + size * 0.055).toFixed(1)}" y2="${Z(D)}" stroke="${INK}" stroke-width="0.9"/>
  <text x="${(X(W) + size * 0.055 + 14).toFixed(1)}" y="${((Z(0) + Z(D)) / 2).toFixed(1)}" class="dim" dominant-baseline="middle">${mm(D)}</text>
  <g>
    <line x1="${pad.toFixed(1)}" y1="${(size - pad * 0.62).toFixed(1)}" x2="${(size - pad).toFixed(1)}" y2="${(size - pad * 0.62).toFixed(1)}" stroke="${FAINT}" stroke-width="0.8"/>
    <text x="${pad.toFixed(1)}" y="${(size - pad * 0.38).toFixed(1)}" class="lbl">${product.name}</text>
    <text x="${(size - pad).toFixed(1)}" y="${(size - pad * 0.38).toFixed(1)}" class="lblq" text-anchor="end">Plan · ${variant.label.replace(/·/g, "/")} · mm</text>
  </g>
</svg>`;
}
