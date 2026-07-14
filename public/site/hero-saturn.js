/* Procedural "Saturn of microchips" hero object.
   Canvas 2D, no dependencies: a dark circuit planet with glowing traces and a
   ring of SMD chips. Reacts to the cursor, invites a click, and every click
   spins the planet to present the next service. */

const TAU = Math.PI * 2;

function fibonacciSphere(count) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }
  return points;
}

function nearestPairs(points, maxLinks, maxDist) {
  const pairs = [];
  for (let i = 0; i < points.length; i += 1) {
    const candidates = [];
    for (let j = 0; j < points.length; j += 1) {
      if (i === j) continue;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dz = points[i].z - points[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < maxDist) candidates.push({ j, dist });
    }
    candidates.sort((a, b) => a.dist - b.dist);
    for (let k = 0; k < Math.min(maxLinks, candidates.length); k += 1) {
      const j = candidates[k].j;
      if (j > i) pairs.push([i, j]);
    }
  }
  return pairs;
}

function makeGlowSprite(color) {
  const size = 64;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.35, color.replace('1)', '0.42)'));
  gradient.addColorStop(1, color.replace('1)', '0)'));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

// Deterministic pseudo-random so every mount looks the same.
function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createHeroSaturn(options) {
  const { canvas, slideCount, initialAngle = 0, reducedMotion = false, coarsePointer = false, onSpinStart } = options;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;

  const rand = mulberry(20260711);
  const NODE_COUNT = coarsePointer ? 132 : 208;
  const nodes = fibonacciSphere(NODE_COUNT);
  const links = nearestPairs(nodes, 2, 0.34);
  const sphereChips = Array.from({ length: 13 }, () => nodes[Math.floor(rand() * NODE_COUNT)]);
  const pulseTracks = Array.from({ length: coarsePointer ? 4 : 7 }, () => ({
    link: links[Math.floor(rand() * links.length)],
    speed: 0.35 + rand() * 0.75,
    offset: rand()
  }));

  const RING_LANES = [1.42, 1.6, 1.78];
  const ringChips = Array.from({ length: coarsePointer ? 42 : 64 }, (_, i) => ({
    lane: RING_LANES[i % RING_LANES.length] + (rand() - 0.5) * 0.05,
    phi: rand() * TAU,
    length: 0.055 + rand() * 0.075,
    width: 0.028 + rand() * 0.03,
    tone: rand(),
    speed: 0.75 + rand() * 0.5
  }));
  const ringPulses = Array.from({ length: coarsePointer ? 3 : 5 }, () => ({
    lane: RING_LANES[Math.floor(rand() * RING_LANES.length)],
    phi: rand() * TAU,
    speed: 0.5 + rand() * 0.7
  }));

  const glowGreen = makeGlowSprite('rgba(88, 244, 109, 1)');
  const glowWhite = makeGlowSprite('rgba(235, 255, 238, 1)');

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    planetR: 120,
    angle: initialAngle,
    spinVel: reducedMotion ? 0 : 0.14,
    ringAngle: 0,
    pointer: { x: 0, y: 0 },
    pointerTarget: { x: 0, y: 0 },
    hover: false,
    flash: 0,
    hintPulse: true,
    running: false,
    lastTime: 0,
    frame: 0,
    destroyed: false,
    // When the service card overlays the canvas (desktop) the planet sits
    // lower-left so the card never covers it; on stacked layouts it is centred.
    overlayLayout: false
  };
  const BASE_SPIN = 0.14;
  const RING_TILT = -0.47;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.round(rect.width * state.dpr);
    canvas.height = Math.round(rect.height * state.dpr);
    state.overlayLayout = window.matchMedia('(min-width: 861px)').matches;
    state.planetR = Math.min(rect.width, rect.height) * (state.overlayLayout ? 0.27 : 0.3);
    if (!state.running) drawFrame(0);
  }

  function project(point, tiltX, tiltZ) {
    // rotX(tiltX) then rotZ(tiltZ), perspective along z.
    let { x, y, z } = point;
    let y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    let z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    let x1 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    let y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    const f = 4.6;
    const scale = f / (f - z1);
    return { sx: x1 * scale, sy: y2 * scale, z: z1, scale };
  }

  function spinPoint(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: point.x * cos + point.z * sin, y: point.y, z: -point.x * sin + point.z * cos };
  }

  function ringPoint(phi, lane) {
    return { x: Math.cos(phi) * lane, y: 0, z: Math.sin(phi) * lane };
  }

  function drawFrame(time) {
    const { width, height, dpr, planetR } = state;
    if (!width) return;
    const ctx = context;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const px = state.pointer.x;
    const py = state.pointer.y;
    const tiltX = RING_TILT + py * 0.3;
    const tiltZ = 0.16 + px * 0.24;
    const bob = reducedMotion ? 0 : Math.sin(time * 0.00052) * 4;
    const parallax = state.overlayLayout ? 8 : 14;
    const cx = width * (state.overlayLayout ? 0.44 : 0.5) + px * parallax;
    const cy = height * (state.overlayLayout ? 0.585 : 0.5) + py * (parallax * 0.8) + bob;
    const flash = state.flash;

    const toScreen = (p) => ({ x: cx + p.sx * planetR, y: cy + p.sy * planetR, z: p.z, scale: p.scale });

    // --- Ring geometry for this frame ---
    const chips = ringChips.map((chip) => {
      const phi = chip.phi + state.ringAngle * chip.speed;
      const center = ringPoint(phi, chip.lane);
      const tangent = { x: -Math.sin(phi), y: 0, z: Math.cos(phi) };
      const radial = { x: Math.cos(phi), y: 0, z: Math.sin(phi) };
      const corners = [
        { x: center.x + tangent.x * chip.length + radial.x * chip.width, y: 0, z: center.z + tangent.z * chip.length + radial.z * chip.width },
        { x: center.x - tangent.x * chip.length + radial.x * chip.width, y: 0, z: center.z - tangent.z * chip.length + radial.z * chip.width },
        { x: center.x - tangent.x * chip.length - radial.x * chip.width, y: 0, z: center.z - tangent.z * chip.length - radial.z * chip.width },
        { x: center.x + tangent.x * chip.length - radial.x * chip.width, y: 0, z: center.z + tangent.z * chip.length - radial.z * chip.width }
      ].map((corner) => toScreen(project(corner, tiltX, tiltZ)));
      const proj = toScreen(project(center, tiltX, tiltZ));
      return { corners, z: proj.z, tone: chip.tone, scale: proj.scale };
    });

    const drawChip = (chip) => {
      const depth = (chip.z + 1.8) / 3.6;
      ctx.beginPath();
      chip.corners.forEach((corner, index) => (index ? ctx.lineTo(corner.x, corner.y) : ctx.moveTo(corner.x, corner.y)));
      ctx.closePath();
      const dark = 16 + chip.tone * 22;
      ctx.fillStyle = `rgba(${dark}, ${dark + 6}, ${dark + 2}, ${0.5 + depth * 0.5})`;
      ctx.fill();
      if (chip.tone > 0.55) {
        ctx.strokeStyle = `rgba(88, 244, 109, ${0.25 + depth * 0.45 + flash * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawRingLine = (lane, alpha, backHalf, lineWidth = 1) => {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 120; i += 1) {
        const phi = (i / 120) * TAU;
        const p = toScreen(project(ringPoint(phi, lane), tiltX, tiltZ));
        const isBack = p.z < 0;
        if (isBack !== backHalf) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `rgba(27, 179, 63, ${alpha + flash * 0.2})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Back of ring first.
    drawRingLine(1.34, 0.2, true);
    drawRingLine(1.6, 0.13, true);
    drawRingLine(1.86, 0.2, true);
    chips.filter((chip) => chip.z < 0).sort((a, b) => a.z - b.z).forEach(drawChip);

    // --- Planet body ---
    const bodyR = planetR * 1.0;
    const body = ctx.createRadialGradient(cx - bodyR * 0.42, cy - bodyR * 0.5, bodyR * 0.12, cx, cy, bodyR);
    body.addColorStop(0, '#232c25');
    body.addColorStop(0.55, '#101511');
    body.addColorStop(1, '#080c09');
    ctx.beginPath();
    ctx.arc(cx, cy, bodyR, 0, TAU);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = `rgba(88, 244, 109, ${0.16 + flash * 0.35 + (state.hover ? 0.1 : 0)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- Circuit traces on the sphere ---
    const spun = nodes.map((node) => project(spinPoint(node, state.angle), tiltX + 0.12, tiltZ * 0.6));
    ctx.lineWidth = 1;
    for (const [a, b] of links) {
      const pa = spun[a];
      const pb = spun[b];
      if (pa.z < 0.08 && pb.z < 0.08) continue;
      const depth = Math.min(1, Math.max(0, (pa.z + pb.z) / 2));
      const alpha = depth * (0.34 + flash * 0.5);
      ctx.strokeStyle = `rgba(88, 244, 109, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx + pa.sx * bodyR * 0.985, cy + pa.sy * bodyR * 0.985);
      ctx.lineTo(cx + pb.sx * bodyR * 0.985, cy + pb.sy * bodyR * 0.985);
      ctx.stroke();
    }

    // Nodes: solder points.
    for (let i = 0; i < spun.length; i += 1) {
      const p = spun[i];
      if (p.z < 0.05) continue;
      const size = (i % 9 === 0 ? 2.5 : 1.4) * p.scale * (bodyR / 120);
      const alpha = p.z * (0.6 + flash * 0.4);
      ctx.fillStyle = i % 13 === 0 ? `rgba(235, 255, 238, ${alpha})` : `rgba(88, 244, 109, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cx + p.sx * bodyR * 0.985, cy + p.sy * bodyR * 0.985, size, 0, TAU);
      ctx.fill();
    }

    // Micro-chips soldered on the sphere.
    for (const chipNode of sphereChips) {
      const p = project(spinPoint(chipNode, state.angle), tiltX + 0.12, tiltZ * 0.6);
      if (p.z < 0.24) continue;
      const size = 7 * p.scale * p.z * (bodyR / 120);
      const x = cx + p.sx * bodyR * 0.96;
      const y = cy + p.sy * bodyR * 0.96;
      ctx.fillStyle = `rgba(20, 26, 21, ${p.z})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.strokeStyle = `rgba(88, 244, 109, ${p.z * (0.5 + flash * 0.5)})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    }

    // Travelling pulses along traces.
    if (!reducedMotion) {
      for (const track of pulseTracks) {
        const [a, b] = track.link;
        const pa = spun[a];
        const pb = spun[b];
        if (pa.z < 0.1 || pb.z < 0.1) continue;
        const t = ((time * 0.001 * track.speed + track.offset) % 1);
        const x = cx + (pa.sx + (pb.sx - pa.sx) * t) * bodyR * 0.985;
        const y = cy + (pa.sy + (pb.sy - pa.sy) * t) * bodyR * 0.985;
        const glowSize = 14 + flash * 10;
        ctx.drawImage(glowWhite, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
      }
    }

    // Front of ring.
    drawRingLine(1.34, 0.42, false, 1.4);
    drawRingLine(1.6, 0.2, false);
    drawRingLine(1.86, 0.42, false, 1.4);
    chips.filter((chip) => chip.z >= 0).sort((a, b) => a.z - b.z).forEach(drawChip);

    // Data packets running along the ring.
    if (!reducedMotion) {
      for (const pulse of ringPulses) {
        const phi = pulse.phi + state.ringAngle * pulse.speed * 2.4;
        const p = toScreen(project(ringPoint(phi, pulse.lane), tiltX, tiltZ));
        const glowSize = (p.z >= 0 ? 20 : 12) + flash * 12;
        ctx.globalAlpha = p.z >= 0 ? 1 : 0.45;
        ctx.drawImage(glowGreen, p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize);
        ctx.globalAlpha = 1;
      }
    }

    // "Tap here" ripple pinned to one spot on the planet face until the
    // first click — a wordless cue instead of a sentence to read.
    if (state.hintPulse) {
      const tapX = cx + bodyR * 0.02;
      const tapY = cy - bodyR * 0.06;
      const cycle = 1500;
      const phase = (time % cycle) / cycle;
      for (let ring = 0; ring < 2; ring += 1) {
        const ringPhase = (phase + ring * 0.5) % 1;
        ctx.beginPath();
        ctx.arc(tapX, tapY, bodyR * (0.08 + ringPhase * 0.3), 0, TAU);
        ctx.strokeStyle = `rgba(235, 255, 238, ${0.6 * (1 - ringPhase)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(tapX, tapY, bodyR * 0.045, 0, TAU);
      ctx.fillStyle = 'rgba(235, 255, 238, 0.92)';
      ctx.fill();
    }
  }

  function tick(now) {
    if (state.destroyed) return;
    state.frame = 0;
    const dt = Math.min(0.05, (now - (state.lastTime || now)) / 1000);
    state.lastTime = now;

    state.pointer.x += (state.pointerTarget.x - state.pointer.x) * Math.min(1, dt * 7);
    state.pointer.y += (state.pointerTarget.y - state.pointer.y) * Math.min(1, dt * 7);
    state.spinVel += (BASE_SPIN - state.spinVel) * Math.min(1, dt * 1.7);
    state.angle += state.spinVel * dt * (state.hover ? 1.5 : 1);
    state.ringAngle -= dt * (0.1 + Math.max(0, state.spinVel - BASE_SPIN) * 0.16);
    state.flash = Math.max(0, state.flash - dt * 1.4);

    drawFrame(now);
    if (state.running) state.frame = requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion || state.running || state.destroyed) return;
    state.running = true;
    state.lastTime = 0;
    state.frame = requestAnimationFrame(tick);
  }

  function stop() {
    state.running = false;
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
  }

  function spin() {
    state.hintPulse = false;
    if (typeof onSpinStart === 'function') onSpinStart();
    if (reducedMotion) {
      state.angle += TAU / Math.max(2, slideCount);
      drawFrame(performance.now());
      return;
    }
    state.spinVel = 3.4;
    state.flash = 1;
  }

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => resize()) : null;
  resizeObserver?.observe(canvas);
  window.addEventListener('resize', resize);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      }, { rootMargin: '80px 0px' })
    : null;
  io?.observe(canvas);

  resize();
  if (reducedMotion) drawFrame(0);
  else if (!io) start();

  return {
    spin,
    setPointer(x, y) {
      state.pointerTarget.x = x;
      state.pointerTarget.y = y;
    },
    setHover(hover) {
      state.hover = Boolean(hover);
    },
    getAngle() {
      return state.angle;
    },
    hintSeen() {
      state.hintPulse = false;
    },
    destroy() {
      state.destroyed = true;
      stop();
      resizeObserver?.disconnect();
      io?.disconnect();
      window.removeEventListener('resize', resize);
    }
  };
}
