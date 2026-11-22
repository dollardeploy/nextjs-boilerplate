"use client";

import { useEffect, useRef } from "react";

// A night launch, rendered as a tone map and quantised with an 8x8 Bayer ordered dither
// to three ink levels: the DollarDeploy dither style, but alive.
const W = 160;
const H = 96;
const GROUND = 80;
const PAD_X = 108;
const CYCLE = 7500; // ms per launch loop
const IGNITE = 900; // engines light, rocket shakes
const LIFTOFF = 1900;

// Ink levels, weakest to strongest. Blurple only exists inside the dither; on paper it is
// plain ink, like the landing page.
const PALETTE_DARK = ["#242cc7", "#4a69e8", "#d4e4ff"];
const PALETTE_LIGHT = ["#b5b3b0", "#585755", "#090909"];

const BAYER = (() => {
  let m = [[0]];
  while (m.length < 8) {
    const n = m.length;
    const next = Array.from({ length: n * 2 }, () => new Array<number>(n * 2).fill(0));
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = m[y][x] * 4;
        next[y][x] = v;
        next[y][x + n] = v + 2;
        next[y + n][x] = v + 3;
        next[y + n][x + n] = v + 1;
      }
    m = next;
  }
  return Float32Array.from(m.flat(), (v) => (v + 0.5) / 64);
})();

const ROCKET = [
  "....#....",
  "...###...",
  "..#####..",
  "..#####..",
  "..##.##..",
  "..#...#..",
  "..##.##..",
  "..#####..",
  "..#####..",
  "..#####..",
  "..#####..",
  ".#######.",
  "##.###.##",
  "#..###..#",
];
const ROCKET_W = ROCKET[0].length;
const ROCKET_H = ROCKET.length;
const REST_Y = GROUND - 1 - ROCKET_H;
const RACKS = [16, 40];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number };

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

// Sky, ground and structures never change: compute their tones once.
function backdrop() {
  const tone = new Float32Array(W * H);
  const set = (x: number, y: number, v: number) => (tone[y * W + x] = v);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const v =
        y < GROUND
          ? 0.11 * (y / GROUND) ** 3
          : y === GROUND
            ? 0.5
            : 0.3 - ((y - GROUND) / (H - GROUND)) * 0.2;
      set(x, y, v);
    }
  for (let x = PAD_X - 8; x <= PAD_X + 8; x++) set(x, GROUND - 1, 0.7);
  for (let y = GROUND - 24; y < GROUND; y++) {
    set(PAD_X - 13, y, 0.55);
    set(PAD_X - 10, y, 0.55);
    if (y % 3 === 0) for (let x = PAD_X - 12; x < PAD_X - 10; x++) set(x, y, 0.4);
  }
  for (const rx of RACKS)
    for (let y = GROUND - 29; y < GROUND; y++)
      for (let x = rx; x < rx + 18; x++) {
        const edge = x === rx || x === rx + 17 || (y - (GROUND - 29)) % 7 === 0;
        set(x, y, edge ? 0.55 : 0);
      }
  return tone;
}

export function PixelLaunch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const base = backdrop();
    const tone = new Float32Array(W * H);
    const image = ctx.createImageData(W, H);
    const rand = rng(7);
    const stars = Array.from({ length: 34 }, () => ({
      x: Math.floor(rand() * W),
      y: Math.floor(rand() * (GROUND - 45)),
      p: rand() * 6,
    }));
    // Exhaust light falling on the ground around the pad, precomputed falloff.
    const glow = Float32Array.from({ length: W * H }, (_, i) => {
      const x = i % W;
      const y = (i / W) | 0;
      if (y < GROUND - 30) return 0;
      return Math.exp(-Math.hypot(x - PAD_X, (y - GROUND) * 1.8) / 20);
    });
    const particles: Particle[] = [];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    let palette = (dark.matches ? PALETTE_DARK : PALETTE_LIGHT).map(hexToRgb);
    const onTheme = () => (palette = (dark.matches ? PALETTE_DARK : PALETTE_LIGHT).map(hexToRgb));
    dark.addEventListener("change", onTheme);

    let start = performance.now();
    let last = start;

    const relaunch = () => {
      const tc = (performance.now() - start) % CYCLE;
      if (tc < IGNITE || tc > LIFTOFF + 3800) start = performance.now() - IGNITE;
    };
    canvas.addEventListener("pointerdown", relaunch);

    const step = (now: number, draw: boolean) => {
      const k = Math.min((now - last) / 16.67, 3);
      last = now;
      const tc = (now - start) % CYCLE;
      const s = Math.max(0, tc - LIFTOFF) / 1000;
      const ry = REST_Y - 9 * s * s;
      const shake = tc > IGNITE && tc < LIFTOFF + 500 ? Math.round(Math.sin(now / 22)) : 0;
      const rx = PAD_X - (ROCKET_W >> 1) + shake;
      const firing = tc > IGNITE && ry > -ROCKET_H;

      if (firing) {
        for (let i = 0; i < 5; i++) {
          const max = 20 + rand() * 40;
          particles.push({
            x: PAD_X + (rand() - 0.5) * 3,
            y: ry + ROCKET_H,
            vx: (rand() - 0.5) * 0.4,
            vy: 1.2 + rand() * 1.4,
            life: max,
            max,
          });
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * k;
        p.y += p.vy * k;
        if (p.y >= GROUND - 2 && p.vy > 0) {
          // exhaust hits the pad and billows sideways
          p.y = GROUND - 2 - rand() * 4;
          p.vy = -rand() * 0.12;
          p.vx = (p.x < PAD_X ? -1 : 1) * (0.5 + rand() * 1.6);
        }
        p.life -= k;
        if (p.life <= 0 || p.x < 0 || p.x >= W) particles.splice(i, 1);
      }
      if (!draw) return;

      tone.set(base);
      const max = (x: number, y: number, v: number) => {
        if (x < 0 || x >= W || y < 0 || y >= H) return;
        const i = y * W + x;
        if (v > tone[i]) tone[i] = v;
      };

      for (const st of stars) max(st.x, st.y, 0.45 + 0.35 * Math.sin(now / 700 + st.p));

      const near = Math.max(0, 1 - (REST_Y - ry) / 70);
      if (firing && near > 0) {
        const g = near * (0.55 + 0.15 * rand());
        for (let i = (GROUND - 30) * W; i < W * H; i++) if (glow[i]) tone[i] += glow[i] * g;
      }

      // blinking server lights
      RACKS.forEach((rx0, r) => {
        for (let u = 0; u < 4; u++) {
          const y = GROUND - 25 + u * 7;
          const on = (Math.floor(now / 180) + u * 3 + r * 5) % 7 !== 0;
          max(rx0 + 3, y, on ? 1 : 0.2);
          for (let x = rx0 + 7; x < rx0 + 15; x += 2) max(x, y, 0.35);
        }
      });

      for (const p of particles) {
        const v = p.life / p.max;
        const x = p.x | 0;
        const y = p.y | 0;
        max(x, y, v);
        max(x + 1, y, v * 0.75);
        max(x, y + 1, v * 0.75);
        max(x - 1, y, v * 0.5);
      }

      // rocket body, lit from the left
      ROCKET.forEach((row, y) => {
        for (let x = 0; x < ROCKET_W; x++)
          if (row[x] === "#") max(rx + x, Math.round(ry) + y, 1 - x * 0.045);
      });

      // quantise: tone -> one of 3 ink levels (or ground) via ordered dither
      const data = image.data;
      for (let i = 0; i < W * H; i++) {
        const t = Math.min(tone[i], 1) * palette.length;
        let level = t | 0;
        if (t - level > BAYER[((((i / W) | 0) & 7) << 3) | (i % W & 7)]) level++;
        const o = i * 4;
        if (level === 0) {
          data[o + 3] = 0;
          continue;
        }
        const [r, g, b] = palette[level - 1];
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
        data[o + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };

    let raf = 0;
    if (reduced) {
      // Simulate up to lift-off, then draw a single still frame.
      const still = start + LIFTOFF + 1200;
      for (let t = start; t < still; t += 16.67) step(t, false);
      step(still, true);
    } else {
      const loop = (now: number) => {
        step(now, true);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      dark.removeEventListener("change", onTheme);
      canvas.removeEventListener("pointerdown", relaunch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-label="Dithered pixel animation of a rocket launching next to two servers"
      title="Click to launch again"
      className="block aspect-[5/3] w-full cursor-pointer [image-rendering:pixelated] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_18%,black_85%,transparent),linear-gradient(to_bottom,transparent,black_15%,black_80%,transparent)]"
    />
  );
}
