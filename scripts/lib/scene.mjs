/**
 * Scene composer.
 *
 * A room, a window, one key light and a piece of furniture, rendered through
 * the pinhole camera in camera.mjs. Everything here is world geometry in
 * centimetres: the floor joints converge on a real vanishing point, the sun
 * patch is the window pushed along the light vector onto the floor, and the
 * shadows are the pieces' own silhouettes projected the same way.
 *
 * The previous version used parallel projection. It was legible but it read as
 * a CAD isometric, because that is what it was.
 */
import { shade as tone, rgba } from "./color.mjs";
import { rng, hashSeed, mk } from "./rng.mjs";
import {
  fitCamera,
  corners,
  faces,
  prismFaces,
  centroid,
  visible,
  shade,
  toFloor,
  hullXZ,
  roundedPath,
} from "./camera.mjs";

/** Room, in centimetres. Wide enough that the back wall always fills the frame. */
const ROOM = { wallZ: 760, halfW: 2600, height: 420 };
const JOINT = 92; // stone slab module

/**
 * Composition presets. `yaw` is the camera's rotation off square — a furniture
 * photographer almost never shoots dead-on, and the small differences between
 * these are most of what stops twenty frames looking like one frame.
 */
/**
 * Composition presets.
 *
 * `anchorY` is where the piece's foot sits in the frame, and it is the single
 * most consequential number here. Set high, the whole frame above the piece
 * is bare wall — which is what eighty per cent of a portrait catalogue frame
 * became. Set lower, the receding floor fills the foreground and the room
 * reads as a room.
 */
export const PRESETS = {
  setting: { frac: 0.86, fracH: 0.6, anchorX: 0.5, anchorY: 0.68, yaw: -0.3, eye: 118, fov: 0.6 },
  context: { frac: 0.5, fracH: 0.46, anchorX: 0.62, anchorY: 0.68, yaw: -0.2, eye: 142, fov: 0.74 },
  hero: { frac: 0.62, fracH: 0.58, anchorX: 0.6, anchorY: 0.79, yaw: -0.26, eye: 130, fov: 0.72 },
  plate: { frac: 0.8, fracH: 0.58, anchorX: 0.5, anchorY: 0.7, yaw: -0.34, eye: 112, fov: 0.58 },
  wide: { frac: 0.64, fracH: 0.52, anchorX: 0.52, anchorY: 0.7, yaw: -0.24, eye: 136, fov: 0.68 },
};

const LIGHTS = {
  north: { key: "#f7f2e7", k: 0.5, fill: 0.56, warm: 0.1, vign: 0.34, haze: 0.1 },
  west: { key: "#ffeccd", k: 0.95, fill: 0.4, warm: 0.26, vign: 0.42, haze: 0.14 },
  low: { key: "#ffdcа7", k: 0.8, fill: 0.3, warm: 0.4, vign: 0.54, haze: 0.2 },
  overcast: { key: "#f1efe9", k: 0.3, fill: 0.66, warm: 0.04, vign: 0.3, haze: 0.08 },
};
LIGHTS.low.key = "#ffdca7";

const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const polyOf = (pts) => pts.filter(Boolean).map(pt).join(" ");

/* --------------------------------------------------------------- bounds -- */

/** The faces of a part, whatever shape it is. */
function partFaces(p) {
  if (p.shape === "cyl" || p.shape === "disc") return prismFaces(p, "y", p.shape === "disc" ? 26 : 22);
  if (p.shape === "bolster") return prismFaces(p, "x", 20);
  return faces(p);
}

/** A leaning part is sheared about its foot, which is how a mirror stands. */
function leanOf(p) {
  if (!p.lean) return (v) => v;
  const k = Math.tan((p.lean * Math.PI) / 180);
  return ([X, Y, Z]) => [X, Y, Z + (Y - p.y) * k];
}

function sceneBox(parts) {
  const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, z0: Infinity, z1: -Infinity };
  for (const p of parts) {
    b.x0 = Math.min(b.x0, p.x);
    b.x1 = Math.max(b.x1, p.x + p.w);
    b.y0 = Math.min(b.y0, p.y);
    b.y1 = Math.max(b.y1, p.y + p.h);
    b.z0 = Math.min(b.z0, p.z);
    b.z1 = Math.max(b.z1, p.z + p.d);
  }
  return b;
}

/** Centre the piece in the room and stand it a little off the back wall. */
function place(parts, box, hang) {
  const dx = -(box.x0 + box.x1) / 2;
  const dz = ROOM.wallZ - 78 - box.z1;
  // A pendant hangs; its cable runs up out of frame rather than resting on
  // the floor like everything else.
  const dy = hang ? 168 - box.y0 : 0;
  return parts.map((p) => ({ ...p, x: p.x + dx, z: p.z + dz, y: p.y + dy }));
}

function cameraFor(opts) {
  const hang = opts.piece?.mount === "hang";
  const pr = {
    ...PRESETS[opts.preset ?? "setting"],
    ...(opts.frac !== undefined ? { frac: opts.frac } : {}),
    ...(opts.anchor !== undefined ? { anchorX: opts.anchor } : {}),
    ...(hang ? { anchorY: 0.6 } : {}),
    ...(opts.camera ?? {}),
  };
  const raw = sceneBox(opts.parts);
  const parts = place(opts.parts, raw, hang);
  const box = sceneBox(parts);
  const yaw = opts.mirror ? -pr.yaw : pr.yaw;
  // Eye height follows the piece. A photographer drops the tripod for a low
  // table and raises it for a cabinet; a fixed height makes everything either
  // a plan view or a worm's-eye view.
  const pieceH = box.y1 - box.y0;
  const eye = Math.round(
    Math.max(62, Math.min(166, pieceH * 0.62 + 46)) * (pr.eye / 132),
  );
  const cam = fitCamera({
    w: opts.w,
    h: opts.h,
    box,
    frac: pr.frac,
    fracH: pr.fracH,
    anchorX: pr.anchorX,
    anchorY: pr.anchorY,
    yaw,
    eye,
    fov: pr.fov,
  });
  return { cam, parts, box, pr, yaw };
}

/** Projected extent of the piece, 0..1, for the framing assertion. */
export function frameBounds(opts) {
  const { cam, box } = cameraFor(opts);
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const X of [box.x0, box.x1])
    for (const Y of [box.y0, box.y1])
      for (const Z of [box.z0, box.z1]) {
        const p = cam.project(X, Y, Z);
        if (!p) continue;
        x0 = Math.min(x0, p[0]);
        x1 = Math.max(x1, p[0]);
        y0 = Math.min(y0, p[1]);
        y1 = Math.max(y1, p[1]);
      }
  return { x0: x0 / opts.w, x1: x1 / opts.w, y0: y0 / opts.h, y1: y1 / opts.h };
}

/* ---------------------------------------------------------------- scene -- */

export function sceneHtml(opts) {
  const {
    w,
    h,
    light = "north",
    wall = "#e7e1d4",
    floorSrc,
    wallSrc,
    grainSrc,
    tiles,
    roleMaterial,
    mirror = false,
    seed = 1,
  } = opts;

  const { cam, parts, box } = cameraFor(opts);
  const L = LIGHTS[light];
  const R = rng(seed);
  const { f } = mk(R);

  // Key light travels away from the lens, down, and across — so the faces
  // turned to the camera are lit and the shadow falls to one side.
  const side = mirror ? -1 : 1;
  const key = [side * f(0.5, 0.72), -f(0.62, 0.74), f(0.26, 0.42)];
  const keyLen = Math.hypot(...key);
  const lightVec = key.map((v) => v / keyLen);

  const P = (X, Y, Z) => cam.project(X, Y, Z);

  /* --- the room ---------------------------------------------------------- */

  // The wall/floor junction is a real edge, so it slopes. Everything above it
  // is wall, everything below is floor, and they share the same line.
  //
  // Sampled near the centre and extrapolated: a point far enough along a wall
  // this wide can fall behind the lens, and the junction is a straight line
  // either way.
  const a = P(-320, 0, ROOM.wallZ);
  const b = P(320, 0, ROOM.wallZ);
  if (!a || !b) throw new Error("junction behind the lens — camera is inside the wall");
  const slope = (b[1] - a[1]) / (b[0] - a[0] || 1);
  const yAt = (x) => a[1] + (x - a[0]) * slope;
  const LX = -w * 0.2;
  const RX = w * 1.2;
  const jl = [LX, yAt(LX)];
  const jr = [RX, yAt(RX)];

  const wallPoly = polyOf([jl, jr, [RX, -h * 0.3], [LX, -h * 0.3]]);
  const floorPoly = polyOf([jl, jr, [RX, h * 1.3], [LX, h * 1.3]]);

  // Slab joints. Those running away from the lens converge; those parallel to
  // the wall slope with it. This is the single clearest cue that the room is
  // a room.
  let joints = "";
  const nearZ = cam.pos[2] + 70;
  for (let z = Math.ceil(nearZ / JOINT) * JOINT; z < ROOM.wallZ; z += JOINT) {
    // Joints parallel to the wall share the junction's slope, so they are
    // drawn from a safe sample and extended across the frame.
    const p0 = P(0, 0, z);
    if (!p0) continue;
    const p1 = [LX, p0[1] + (LX - p0[0]) * slope];
    const p2 = [RX, p0[1] + (RX - p0[0]) * slope];
    if (p1 && p2)
      joints += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="#2b2419" stroke-opacity="0.1" stroke-width="1.2"/>`;
  }
  for (let x = -1400; x <= 1400; x += JOINT) {
    const p1 = P(x, 0, nearZ);
    const p2 = P(x, 0, ROOM.wallZ);
    if (p1 && p2 && Math.max(p1[0], p2[0]) > -50 && Math.min(p1[0], p2[0]) < w + 50)
      joints += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="#2b2419" stroke-opacity="0.085" stroke-width="1.2"/>`;
  }

  /* --- the window -------------------------------------------------------- */

  // On the far side from the key, so the room reads as lit from two sources:
  // a window in shot and a key over the photographer's shoulder.
  const winSide = -side;
  const winW = f(190, 250);
  const winCx = winSide * f(300, 460);
  const win = {
    x0: winCx - winW / 2,
    x1: winCx + winW / 2,
    y0: f(82, 98),
    y1: f(262, 300),
  };
  const wc = [
    P(win.x0, win.y1, ROOM.wallZ),
    P(win.x1, win.y1, ROOM.wallZ),
    P(win.x1, win.y0, ROOM.wallZ),
    P(win.x0, win.y0, ROOM.wallZ),
  ];
  const hasWindow = wc.every(Boolean);
  const mullX = win.x0 + (win.x1 - win.x0) * 0.52;
  const mull = [P(mullX, win.y1, ROOM.wallZ), P(mullX, win.y0, ROOM.wallZ)];
  const transY = win.y0 + (win.y1 - win.y0) * 0.68;
  const trans = [P(win.x0, transY, ROOM.wallZ), P(win.x1, transY, ROOM.wallZ)];

  // Daylight from the window, cast onto the floor along its own direction.
  const dayVec = [winSide * -0.34, -0.8, -0.5];
  const sun = polyOf(
    [
      [win.x0, win.y0, ROOM.wallZ],
      [win.x1, win.y0, ROOM.wallZ],
      [win.x1, win.y1, ROOM.wallZ],
      [win.x0, win.y1, ROOM.wallZ],
    ]
      .map((c) => toFloor(c, dayVec))
      .map((c) => P(c[0], 0, c[2])),
  );

  /* --- shadows ----------------------------------------------------------- */

  let shadows = "";
  for (const p of parts) {
    if (p.h < 2) continue;
    const hull = hullXZ(corners(p).map((c) => toFloor(c, lightVec)));
    const poly = polyOf(hull.map((c) => P(c[0], 0.4, c[2])));
    if (poly) shadows += `<polygon points="${poly}" fill="#1c1710" opacity="${(0.1 + L.k * 0.19).toFixed(3)}"/>`;
  }
  // Occlusion directly beneath the piece, where no light of any kind reaches.
  for (const p of parts) {
    if (!p.ao) continue;
    const base = polyOf(
      [
        [p.x - 2, 0.2, p.z - 2],
        [p.x + p.w + 2, 0.2, p.z - 2],
        [p.x + p.w + 2, 0.2, p.z + p.d + 2],
        [p.x - 2, 0.2, p.z + p.d + 2],
      ].map((c) => P(...c)),
    );
    if (base) shadows += `<polygon points="${base}" fill="#17130d" opacity="0.5" filter="url(#ao)"/>`;
  }

  /* --- the piece --------------------------------------------------------- */

  // Painter's algorithm on real distance, so no hand-maintained draw order can
  // go stale when a form changes.
  const ordered = [...parts]
    .map((p, i) => ({
      p,
      i,
      d: cam.depth(p.x + p.w / 2, p.y + p.h / 2, p.z + p.d / 2),
    }))
    .sort((m, n) => n.d - m.d || m.i - n.i);

  let defs = "";
  const patternFor = {};
  const pxPerCm = (() => {
    const p1 = P(box.x0, box.y0, box.z0);
    const p2 = P(box.x1, box.y0, box.z0);
    return Math.abs(p2[0] - p1[0]) / Math.max(1, box.x1 - box.x0);
  })();

  for (const [id, t] of Object.entries(tiles)) {
    const pid = `m${id.replace(/[^a-z0-9]/gi, "")}`;
    const size = Math.max(130, Math.min(620, pxPerCm * 58));
    defs += `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${size.toFixed(0)}" height="${size.toFixed(0)}" patternTransform="rotate(${f(-3, 3).toFixed(2)})"><image href="${t.src}" width="${size.toFixed(0)}" height="${size.toFixed(0)}" preserveAspectRatio="xMidYMid slice"/></pattern>`;
    patternFor[id] = `url(#${pid})`;
  }
  const fillOf = (role) => {
    const m = roleMaterial[role];
    if (m === "__glass") return "url(#glass)";
    if (m === "__dark") return "#1b1812";
    if (m === "__reveal") return "#13100c";
    return patternFor[m] ?? "#b7aa95";
  };

  let body = "";
  for (const { p } of ordered) {
    const fill = fillOf(p.role);
    const tint = p.tint ?? 1;
    const r = (p.r ?? 0) * pxPerCm * 0.9;
    const vis = partFaces(p)
      .filter((fc) => visible(fc, cam.pos))
      .map((fc) => ({
        fc,
        d: cam.depth(...centroid(fc.v)),
      }))
      .sort((m, n) => n.d - m.d);

    const warp = leanOf(p);
    for (const { fc } of vis) {
      const pts = fc.v.map((v) => P(...warp(v)));
      if (pts.some((q) => !q)) continue;
      const lum = shade(fc.n, lightVec, 0.3 + L.fill * 0.42) * tint;
      let edge = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const q = pts[(i + 1) % pts.length];
        edge = Math.min(edge, Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
      }
      const rr = Math.min(r, edge * 0.28);
      const d = rr > 1 ? roundedPath(pts, rr) : `M ${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L ")} Z`;
      body += `<path d="${d}" fill="${fill}"/>`;
      body +=
        lum < 1
          ? `<path d="${d}" fill="#0f0c07" opacity="${Math.min(0.72, 1 - lum).toFixed(3)}"/>`
          : `<path d="${d}" fill="${L.key}" opacity="${Math.min(0.5, (lum - 1) * 0.9).toFixed(3)}"/>`;
      // A hairline where two faces meet: the arris every real object has.
      body += `<path d="${d}" fill="none" stroke="#0b0905" stroke-opacity="0.13" stroke-width="1"/>`;
    }
  }

  // Emissive fittings.
  let glow = "";
  for (const p of parts) {
    if (!p.emit) continue;
    const c = P(p.x + p.w / 2, p.y + p.h, p.z + p.d / 2);
    if (!c) continue;
    const rad = Math.max(p.w * pxPerCm * 2.4, 200);
    const up = p.emit === "up";
    glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${(c[1] + (up ? -rad * 0.55 : rad * 0.4)).toFixed(0)}" rx="${(rad * 1.4).toFixed(0)}" ry="${(rad * 0.9).toFixed(0)}" fill="url(#glow)" style="mix-blend-mode:screen"/>`;
    glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${c[1].toFixed(0)}" rx="${(p.w * pxPerCm * 0.52).toFixed(0)}" ry="${(p.w * pxPerCm * 0.17).toFixed(0)}" fill="none" stroke="#ffeacb" stroke-width="${Math.max(2, p.w * pxPerCm * 0.05).toFixed(1)}" opacity="0.7" style="mix-blend-mode:screen"/>`;
  }

  defs += `<linearGradient id="glass" x1="0" y1="0" x2="0.55" y2="1">
      <stop offset="0" stop-color="#6b6459"/><stop offset="0.4" stop-color="#453f38"/>
      <stop offset="0.54" stop-color="#8a8276"/><stop offset="1" stop-color="#312c27"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#ffdca8" stop-opacity="0.8"/>
      <stop offset="0.5" stop-color="#ffd9a2" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffd9a2" stop-opacity="0"/></radialGradient>
    <filter id="ao" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${Math.max(7, pxPerCm * 5).toFixed(1)}"/></filter>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${Math.max(3, pxPerCm * 1.5).toFixed(1)}"/></filter>
    <filter id="sunblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${(6 + (1 - L.k) * 34).toFixed(1)}"/></filter>`;

  const horizonPct = ((cam.horizon / h) * 100).toFixed(2);

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;background:#0d0b08;overflow:hidden}
  .frame{position:relative;width:${w}px;height:${h}px;overflow:hidden;filter:contrast(1.08) saturate(1.05) brightness(0.96)}
  .plane{position:absolute;inset:0}
  .plane img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .wallImg{filter:brightness(1) saturate(0.95)}
  .floorImg{filter:brightness(${(0.68 + L.fill * 0.2).toFixed(2)}) saturate(1.12);transform:scale(1.18)}
  .tint{position:absolute;inset:0;background:${wall};mix-blend-mode:color;opacity:.85}
  .falloff{position:absolute;inset:0;background:linear-gradient(${mirror ? 255 : 105}deg, ${rgba(L.key, 0.18 + L.warm * 0.22)} 0%, rgba(0,0,0,0) 40%, rgba(16,13,9,${(0.2 + L.vign * 0.26).toFixed(2)}) 100%)}
  .wallfall{position:absolute;inset:0;background:linear-gradient(${mirror ? 190 : 170}deg, rgba(0,0,0,0) 24%, rgba(18,15,10,${(0.12 + L.vign * 0.18).toFixed(2)}) 100%)}
  .wallLight{position:absolute;inset:0;background:linear-gradient(180deg, rgba(20,16,11,${(0.2 * L.haze * 6).toFixed(2)}) 0%, rgba(0,0,0,0) 44%, ${rgba(L.key, L.haze * 0.8)} 100%)}
  .grade{position:absolute;inset:0;background:radial-gradient(130% 110% at 50% ${horizonPct}%, rgba(0,0,0,0) 40%, rgba(11,9,6,${L.vign}) 100%)}
  .grain{position:absolute;inset:0;background-image:url('${grainSrc}');background-size:170px 170px;opacity:.16;mix-blend-mode:overlay}
  svg{position:absolute;inset:0}
  </style></head><body><div class="frame">

    <!-- wall and floor, split on the real junction -->
    <div class="plane" style="clip-path:polygon(${wallPoly.split(" ").map((s) => s.replace(",", "px ") + "px").join(",")})">
      <img class="wallImg" src="${wallSrc}" alt=""><div class="tint"></div>
      <div class="wallLight"></div><div class="wallfall"></div>
    </div>
    <div class="plane" style="clip-path:polygon(${floorPoly.split(" ").map((s) => s.replace(",", "px ") + "px").join(",")})">
      <img class="floorImg" src="${floorSrc}" alt=""><div class="tint" style="opacity:.5"></div>
    </div>

    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>${defs}</defs>

      <!-- floor joints -->
      <g>${joints}</g>

      <!-- daylight on the floor, cast from the window -->
      <polygon points="${sun}" fill="${L.key}" opacity="${(0.1 + L.k * 0.2).toFixed(3)}" filter="url(#sunblur)" style="mix-blend-mode:screen"/>

      <!-- the junction itself -->
      <line x1="${jl[0]}" y1="${jl[1].toFixed(1)}" x2="${jr[0]}" y2="${jr[1].toFixed(1)}" stroke="#241e15" stroke-opacity="0.42" stroke-width="2"/>

      <!-- window -->
      ${hasWindow ? `<polygon points="${polyOf(wc)}" fill="${L.key}" opacity="0.95"/>` : ""}
      ${hasWindow ? `<polygon points="${polyOf(wc)}" fill="none" stroke="#2a241b" stroke-opacity="0.72" stroke-width="${Math.max(3, pxPerCm * 1.1).toFixed(1)}"/>` : ""}
      ${mull[0] && mull[1] ? `<line x1="${mull[0][0].toFixed(1)}" y1="${mull[0][1].toFixed(1)}" x2="${mull[1][0].toFixed(1)}" y2="${mull[1][1].toFixed(1)}" stroke="#2a241b" stroke-opacity="0.66" stroke-width="${Math.max(2, pxPerCm * 0.7).toFixed(1)}"/>` : ""}
      ${trans[0] && trans[1] ? `<line x1="${trans[0][0].toFixed(1)}" y1="${trans[0][1].toFixed(1)}" x2="${trans[1][0].toFixed(1)}" y2="${trans[1][1].toFixed(1)}" stroke="#2a241b" stroke-opacity="0.66" stroke-width="${Math.max(2, pxPerCm * 0.7).toFixed(1)}"/>` : ""}
      ${hasWindow ? `<polygon points="${polyOf(wc)}" fill="${L.key}" opacity="0.26" filter="url(#sunblur)" style="mix-blend-mode:screen"/>` : ""}

      <!-- shadows, then the piece -->
      <g filter="url(#soft)">${shadows}</g>
      ${body}
      ${glow}
    </svg>

    <div class="depth"></div>
    <div class="falloff"></div>
    <div class="grade"></div>
    <div class="grain"></div>
  </div></body></html>`;
}

/* ------------------------------------------------- material macro frame -- */

export function detailHtml(opts) {
  const { w, h, tiles, order, grainSrc, seed = 3, light = "west" } = opts;
  const L = LIGHTS[light];
  const R = rng(seed);
  const { f } = mk(R);
  const rot = f(-7, 7);
  const bands = order.slice(0, 3);
  const cuts = bands.length === 3 ? [f(0.3, 0.42), f(0.62, 0.74)] : [f(0.42, 0.58)];
  const stops = [0, ...cuts, 1];

  let layers = "";
  bands.forEach((id, i) => {
    const t0 = stops[i];
    const t1 = stops[i + 1];
    layers += `<div class="band" style="top:${(t0 * 100).toFixed(2)}%;height:${((t1 - t0) * 100).toFixed(2)}%">
      <img src="${tiles[id].src}" alt="">
      <div class="bl" style="background:linear-gradient(${(100 + f(-14, 14)).toFixed(0)}deg, rgba(255,248,235,${(0.1 + i * 0.03).toFixed(2)}), rgba(0,0,0,0) 40%, rgba(16,13,9,${(0.16 + i * 0.07).toFixed(2)}))"></div>
      ${i > 0 ? `<div class="seam"></div>` : ""}
    </div>`;
  });

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:#17140f}
  .frame{position:relative;width:${w}px;height:${h}px;overflow:hidden;filter:contrast(1.07) saturate(1.03) brightness(0.96)}
  .inner{position:absolute;left:-18%;top:-18%;width:136%;height:136%;transform:rotate(${rot.toFixed(2)}deg)}
  .band{position:absolute;left:0;right:0;overflow:hidden}
  .band img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;transform:scale(1.9)}
  .bl{position:absolute;inset:0}
  .seam{position:absolute;left:0;right:0;top:0;height:26px;background:linear-gradient(180deg, rgba(10,8,5,.62), rgba(10,8,5,0));filter:blur(4px)}
  .rake{position:absolute;inset:0;background:linear-gradient(${(96 + f(-10, 10)).toFixed(0)}deg, ${rgba(L.key, 0.3)} 0%, rgba(0,0,0,0) 34%, rgba(14,11,8,.3) 100%);mix-blend-mode:soft-light}
  .vignette{position:absolute;inset:0;background:radial-gradient(102% 104% at 42% 40%, rgba(0,0,0,0) 40%, rgba(10,8,5,.46) 100%)}
  .grain{position:absolute;inset:0;background-image:url('${grainSrc}');background-size:170px 170px;opacity:.2;mix-blend-mode:overlay}
  </style></head><body><div class="frame"><div class="inner">${layers}</div>
  <div class="rake"></div><div class="vignette"></div><div class="grain"></div></div></body></html>`;
}
