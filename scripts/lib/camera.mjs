/**
 * A pinhole camera with an architectural lens.
 *
 * World: x right, y up, z away from the viewer. Centimetres throughout, so the
 * part lists in forms.mjs are world geometry without conversion.
 *
 * The camera yaws but never pitches, and composes with a lens shift instead —
 * which is what a tilt-shift lens does and why verticals in a good interior
 * photograph are vertical. The result is two-point perspective: horizontals
 * converge, verticals do not.
 */

export function makeCamera({ w, h, pos, yaw, fov = 0.62, horizon = 0.5, shiftX = 0 }) {
  const [cx, cy, cz] = pos;
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const f = w / 2 / Math.tan(fov / 2);
  const ox = w / 2 + shiftX;
  const oy = h * horizon;

  /** World point → screen point. Returns null behind the lens. */
  const project = (X, Y, Z) => {
    const dx = X - cx;
    const dy = Y - cy;
    const dz = Z - cz;
    const xc = dx * cos - dz * sin;
    const zc = dx * sin + dz * cos;
    if (zc <= 1) return null;
    const s = f / zc;
    return [ox + xc * s, oy - dy * s, zc];
  };

  /** Distance from the lens, used for painter ordering and haze. */
  const depth = (X, Y, Z) => {
    const dx = X - cx;
    const dz = Z - cz;
    return dx * sin + dz * cos;
  };

  return { project, depth, pos, yaw, f, ox, oy, horizon: oy, w, h };
}

/**
 * Places the camera so the piece lands exactly where the composition wants it.
 *
 * Distance is solved for the target width (bisection — a closed form exists but
 * the lens shift makes it fiddly and this runs in microseconds), then the shift
 * and the horizon are set so the piece's centre and base fall on their marks.
 */
export function fitCamera({
  w,
  h,
  box,
  frac,
  fracH = 0.66,
  anchorX,
  anchorY,
  yaw,
  eye,
  fov = 0.62,
  minDist = 255,
}) {
  const corners = [];
  for (const X of [box.x0, box.x1])
    for (const Y of [box.y0, box.y1])
      for (const Z of [box.z0, box.z1]) corners.push([X, Y, Z]);

  const mid = [(box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2, (box.z0 + box.z1) / 2];

  const extentAt = (dist) => {
    const cam = makeCamera({
      w,
      h,
      pos: [mid[0] - Math.sin(yaw) * dist, eye, mid[2] - Math.cos(yaw) * dist],
      yaw,
      fov,
      horizon: 0.5,
    });
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [X, Y, Z] of corners) {
      const p = cam.project(X, Y, Z);
      if (!p) return { w: Infinity, h: Infinity };
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
    }
    return { w: x1 - x0, h: y1 - y0 };
  };

  /** Smallest distance at which the piece is no larger than `target`. */
  const solve = (pick, target) => {
    let lo = 40;
    let hi = 9000;
    for (let i = 0; i < 48; i++) {
      const m = (lo + hi) / 2;
      if (pick(extentAt(m)) > target) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };

  // Whichever edge of the frame the piece reaches first decides the distance,
  // and a floor is applied besides: you cannot photograph a room from 50cm,
  // and a small object shot to fill the frame stops being in a room at all.
  const dist = Math.max(
    solve((e) => e.w, frac * w),
    solve((e) => e.h, fracH * h),
    minDist,
  );

  const pos = [mid[0] - Math.sin(yaw) * dist, eye, mid[2] - Math.cos(yaw) * dist];

  // Measure once at the solved distance, then shift the lens and move the
  // horizon so the piece sits on its marks.
  const probe = makeCamera({ w, h, pos, yaw, fov, horizon: 0.5 });
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [X, Y, Z] of corners) {
    const p = probe.project(X, Y, Z);
    x0 = Math.min(x0, p[0]);
    x1 = Math.max(x1, p[0]);
    y0 = Math.min(y0, p[1]);
    y1 = Math.max(y1, p[1]);
  }
  const shiftX = anchorX * w - (x0 + x1) / 2;
  const horizon = (h * 0.5 + (anchorY * h - y1)) / h;

  return makeCamera({ w, h, pos, yaw, fov, horizon, shiftX });
}


/* ------------------------------------------------------------- geometry -- */

/** The eight corners of a part, as world points. */
export function corners(p) {
  const out = [];
  for (const X of [p.x, p.x + p.w])
    for (const Y of [p.y, p.y + p.h])
      for (const Z of [p.z, p.z + p.d]) out.push([X, Y, Z]);
  return out;
}

/** The six faces of a box: four world corners and an outward normal. */
export function faces(p) {
  const x0 = p.x;
  const x1 = p.x + p.w;
  const y0 = p.y;
  const y1 = p.y + p.h;
  const z0 = p.z;
  const z1 = p.z + p.d;
  return [
    { id: "front", n: [0, 0, -1], v: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] },
    { id: "back", n: [0, 0, 1], v: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]] },
    { id: "left", n: [-1, 0, 0], v: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]] },
    { id: "right", n: [1, 0, 0], v: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] },
    { id: "top", n: [0, 1, 0], v: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { id: "bottom", n: [0, -1, 0], v: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] },
  ];
}

export function centroid(v) {
  const n = v.length;
  return v.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]);
}

export function visible(face, camPos) {
  const c = centroid(face.v);
  const d = [c[0] - camPos[0], c[1] - camPos[1], c[2] - camPos[2]];
  return face.n[0] * d[0] + face.n[1] * d[1] + face.n[2] * d[2] < 0;
}

/**
 * A turned part as an n-sided prism. Each facet gets its own normal, so a
 * stone cylinder shades round rather than flat — which is most of what makes
 * a turned object look turned.
 */
export function prismFaces(p, axis = "y", sides = 22) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const cz = p.z + p.d / 2;
  const out = [];
  const ring = (fn) =>
    Array.from({ length: sides }, (_, i) => fn(((i + 0.5) / sides) * Math.PI * 2));

  if (axis === "x") {
    // A bolster: the axis runs across the piece.
    const ry = p.h / 2;
    const rz = p.d / 2;
    const lo = ring((t) => [p.x, cy + Math.sin(t) * ry, cz + Math.cos(t) * rz]);
    const hi = ring((t) => [p.x + p.w, cy + Math.sin(t) * ry, cz + Math.cos(t) * rz]);
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      const t = ((i + 1) / sides) * Math.PI * 2;
      out.push({ id: "side", n: [0, Math.sin(t), Math.cos(t)], v: [lo[i], lo[j], hi[j], hi[i]] });
    }
    out.push({ id: "cap", n: [-1, 0, 0], v: [...lo].reverse() });
    out.push({ id: "cap", n: [1, 0, 0], v: hi });
    return out;
  }

  const rx = p.w / 2;
  const rz = p.d / 2;
  const bot = ring((t) => [cx + Math.cos(t) * rx, p.y, cz + Math.sin(t) * rz]);
  const top = ring((t) => [cx + Math.cos(t) * rx, p.y + p.h, cz + Math.sin(t) * rz]);
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    const t = ((i + 1) / sides) * Math.PI * 2;
    out.push({ id: "side", n: [Math.cos(t), 0, Math.sin(t)], v: [bot[i], bot[j], top[j], top[i]] });
  }
  out.push({ id: "top", n: [0, 1, 0], v: top });
  out.push({ id: "bottom", n: [0, -1, 0], v: [...bot].reverse() });
  return out;
}

/** Lambert plus a sky term, so an upward face is never as dark as a side one. */
export function shade(normal, light, ambient = 0.46) {
  const l = norm([-light[0], -light[1], -light[2]]);
  const lambert = Math.max(0, normal[0] * l[0] + normal[1] * l[1] + normal[2] * l[2]);
  const sky = Math.max(0, normal[1]) * 0.16;
  return ambient + (1 - ambient) * lambert + sky;
}

function norm(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}

/** Where a world point lands on the floor when pushed along the light. */
export function toFloor([X, Y, Z], light) {
  if (light[1] >= -0.02) return [X, 0, Z];
  const t = Y / -light[1];
  return [X + light[0] * t, 0, Z + light[2] * t];
}

/** Monotone chain, on the XZ plane. */
export function hullXZ(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[2] - b[2]);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[2] - o[2]) - (a[2] - o[2]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** A rounded polygon through projected screen points. Used for upholstery. */
export function roundedPath(pts, r) {
  if (pts.length < 3) return "";
  if (r <= 0.5) return `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")} Z`;
  let d = "";
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = trim(cur, prev, r);
    const b = trim(cur, next, r);
    d += i === 0 ? `M ${a[0].toFixed(1)} ${a[1].toFixed(1)}` : ` L ${a[0].toFixed(1)} ${a[1].toFixed(1)}`;
    d += ` Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

function trim(from, toward, r) {
  const dx = toward[0] - from[0];
  const dy = toward[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const t = Math.min(r, len / 2) / len;
  return [from[0] + dx * t, from[1] + dy * t];
}
