"use client";

import { useEffect, useRef } from "react";

// Low-res scene, scaled up with `image-rendering: pixelated`.
const W = 192;
const H = 108;
const GROUND = 92;
const PAD_X = 96;
const CYCLE = 7000; // ms per launch loop
const IGNITE = 1000; // rumble starts
const LIFTOFF = 1800;

// 4x4 ordered-dither matrix: fades are drawn as patterns, not alpha.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dither = (x: number, y: number, v: number) =>
  v > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

const ROCKET = [
  ".....#.....",
  "....###....",
  "...#####...",
  "...#####...",
  "..###.###..",
  "..##...##..",
  "..###.###..",
  "..#######..",
  "..#######..",
  "..#######..",
  "..#######..",
  ".##.###.##.",
  "###.###.###",
  "##..###..##",
  "#....#....#",
];
const ROCKET_H = ROCKET.length;
const REST_Y = GROUND - 2 - ROCKET_H;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number };

// Deterministic pseudo-random, so server-rack and star layout never shift.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function staticPixels(): [number, number][] {
  const rand = rng(42);
  const px: [number, number][] = [];
  for (let y = GROUND + 1; y < H; y++) {
    const density = 0.15 + ((y - GROUND) / (H - GROUND)) * 0.6;
    for (let x = 0; x < W; x++) if (dither(x, y, density)) px.push([x, y]);
  }
  for (let x = 0; x < W; x++) px.push([x, GROUND]);
  // launch pad
  for (let x = PAD_X - 9; x <= PAD_X + 9; x++) px.push([x, GROUND - 1]);
  // two server racks
  for (const rx of [22, 150]) {
    for (let y = GROUND - 28; y < GROUND; y++) {
      px.push([rx, y], [rx + 19, y]);
      if ((y - (GROUND - 28)) % 7 === 0) for (let x = rx; x <= rx + 19; x++) px.push([x, y]);
    }
  }
  // tower next to the pad
  for (let y = GROUND - 22; y < GROUND; y++) {
    px.push([PAD_X - 14, y], [PAD_X - 11, y]);
    if (y % 3 === 0) px.push([PAD_X - 13, y], [PAD_X - 12, y]);
  }
  for (let i = 0; i < 40; i++) px.push([Math.floor(rand() * W), Math.floor(rand() * (GROUND - 40))]);
  return px;
}

export function PixelLaunch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const scene = staticPixels();
    const stars = scene.slice(-40);
    const ground = scene.slice(0, -40);
    const rand = rng(7);
    const particles: Particle[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    let color = getComputedStyle(canvas).color;
    const onTheme = () => (color = getComputedStyle(canvas).color);
    dark.addEventListener("change", onTheme);

    let start = performance.now();
    let last = start;
    let frame = 0;

    const relaunch = () => {
      const tc = (performance.now() - start) % CYCLE;
      if (tc > LIFTOFF + 3500 || tc < IGNITE) start = performance.now() - IGNITE;
    };
    canvas.addEventListener("pointerdown", relaunch);

    const step = (now: number, draw: boolean) => {
      const k = Math.min((now - last) / 16.67, 3);
      last = now;
      const tc = (now - start) % CYCLE;
      const s = Math.max(0, tc - LIFTOFF) / 1000;
      const ry = REST_Y - 10 * s * s;
      const shake = tc > IGNITE && tc < LIFTOFF + 600 ? Math.round(Math.sin(now / 25)) : 0;
      const rx = PAD_X - 5 + shake;
      const firing = tc > IGNITE && ry > -ROCKET_H;

      if (firing) {
        for (let i = 0; i < 4; i++) {
          const max = 25 + rand() * 35;
          particles.push({
            x: PAD_X + (rand() - 0.5) * 4,
            y: ry + ROCKET_H,
            vx: (rand() - 0.5) * 0.5,
            vy: 1 + rand() * 1.2,
            life: max,
            max,
          });
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * k;
        p.y += p.vy * k;
        if (p.y >= GROUND - 3 && p.vy > 0) {
          // exhaust hits the ground and billows sideways
          p.y = GROUND - 3 - rand() * 3;
          p.vy = -rand() * 0.15;
          p.vx = (p.x < PAD_X ? -1 : 1) * (0.6 + rand() * 1.4);
        }
        p.life -= k;
        if (p.life <= 0) particles.splice(i, 1);
      }

      if (!draw) return;
      frame++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      const px = (x: number, y: number) => ctx.fillRect(x | 0, y | 0, 1, 1);

      for (const [x, y] of ground) px(x, y);
      stars.forEach(([x, y], i) => {
        if (dither(x, y, 0.55 + 0.45 * Math.sin(now / 500 + i))) px(x, y);
      });
      // blinking server LEDs
      for (const rx0 of [22, 150])
        for (let u = 0; u < 4; u++) {
          const on = ((frame >> 3) + u * 3 + rx0) % 5 !== 0;
          if (on) px(rx0 + 3, GROUND - 25 + u * 7);
          for (let x = rx0 + 7; x < rx0 + 16; x += 2) px(x, GROUND - 25 + u * 7);
        }
      // smoke & flame
      for (const p of particles) {
        const v = p.life / p.max;
        const x = p.x | 0;
        const y = p.y | 0;
        if (dither(x, y, v)) px(x, y);
        if (dither(x + 1, y, v * 0.8)) px(x + 1, y);
        if (dither(x, y + 1, v * 0.8)) px(x, y + 1);
      }
      ROCKET.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) if (row[x] === "#") px(rx + x, ry + y);
      });
    };

    let raf = 0;
    if (reduced) {
      // Simulate up to mid-flight, then draw a single still frame.
      for (let t = start; t < start + LIFTOFF + 1400; t += 16.67) step(t, false);
      step(start + LIFTOFF + 1400, true);
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
      aria-label="Pixel-art rocket launching from a pad between two servers"
      title="Click to launch again"
      className="block aspect-[16/9] w-full cursor-pointer text-foreground [image-rendering:pixelated]"
    />
  );
}
