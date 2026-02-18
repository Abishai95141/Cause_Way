import { useEffect, useRef, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────────────────
 *  AnimatedLiquidBackground  (perf-optimised build)
 *
 *  WebGL warp shader producing animated liquid-gradient
 *  backgrounds with sharp diagonal streaks.
 *
 *  Pipeline:  Pattern → Swirl-warp → 3-colour gradient
 *
 *  Perf notes:
 *  – Renders at native DPR (capped at 2) for crisp output
 *  – Throttled to ~30 fps (background doesn't need 60)
 *  – Swirl iterations reduced to 7
 *  – Noise overlay removed (was expensive compositing)
 *  – Off-screen rendering paused via IntersectionObserver
 *  – Uniform locations cached once at init
 *  – precision mediump (sufficient for BG gradients)
 * ───────────────────────────────────────────────────────── */

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec3  u_color1;
  uniform vec3  u_color2;
  uniform vec3  u_color3;
  uniform float u_speed;
  uniform float u_scale;
  uniform float u_distortion;
  uniform float u_swirl;
  uniform float u_swirlIterations;
  uniform float u_softness;
  uniform float u_proportion;
  uniform float u_rotation;
  uniform float u_seed;
  uniform float u_shapeScale;
  uniform float u_shape;

  /* ---- Simplex 2-D noise (compact) ---- */
  vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                             dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  mat2 rotate2d(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    p = rotate2d(u_rotation) * p;
    p *= 1.0 + u_scale * 5.0;
    p += u_seed * 0.001;
    float t = u_time * u_speed;

    /* ── Swirl warp ── */
    for (float i = 0.0; i < 10.0; i += 1.0) {
      if (i >= u_swirlIterations) break;
      float n = snoise(p * (0.35 + i * 0.065) + t * 0.04 + i * 0.3);
      p = rotate2d(u_swirl * n * 0.08) * p;
      if (u_distortion > 0.001) {
        p += u_distortion * 0.05 * vec2(
          snoise(p.yx * 0.5 + i * 0.7 + t * 0.02),
          snoise(p.xy * 0.5 + i * 1.1 - t * 0.025));
      }
    }

    /* ── Pattern ── */
    float ps = max(u_shapeScale, 0.01);
    float raw;
    if      (u_shape < 0.5) raw = sin(p.x * 3.14159 / ps) * sin(p.y * 3.14159 / ps);
    else if (u_shape < 1.5) raw = sin(p.x * 3.14159 / ps);
    else                    raw = sin(length(p) * 6.28318 / ps);

    float pattern = raw * 0.5 + 0.5;

    /* ── Softness ── */
    float edge = mix(0.005, 0.5, u_softness);
    pattern = smoothstep(0.5 - edge, 0.5 + edge, pattern);

    /* ── 3-colour gradient ── */
    float mid = 0.3 + u_proportion * 0.4;
    float t1  = smoothstep(0.0, mid, pattern);
    vec3  c12 = mix(u_color1, u_color2, t1);
    float t2  = smoothstep(mid, 1.0, pattern);
    vec3  color = mix(c12, u_color3, t2);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Types ─────────────────────────────────────────────────

type ShapeName = "Checks" | "Stripes" | "Edge";
const SHAPE_MAP: Record<ShapeName, number> = { Checks: 0, Stripes: 1, Edge: 2 };

interface Preset {
  color1: string; color2: string; color3: string;
  rotation: number; proportion: number; scale: number; speed: number;
  distortion: number; swirl: number; swirlIterations: number; softness: number;
  offset: number; shape: ShapeName; shapeScale: number;
}

/* Only presets actually used by the landing page — stripped unused ones */
/* Only preset actually used by the landing page */
const presets: Record<string, Preset> = {
  Dark: {
    color1: "#030308", color2: "#FF8C42", color3: "#030308",
    rotation: -10, proportion: 50, scale: 0.01, speed: 22,
    distortion: 0, swirl: 50, swirlIterations: 7, softness: 12,
    offset: -200, shape: "Checks", shapeScale: 45,
  },
};

// ── Helpers ───────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [0, 0, 0];
  return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
}

const UNIFORM_NAMES = [
  "u_time", "u_resolution",
  "u_color1", "u_color2", "u_color3",
  "u_speed", "u_scale", "u_distortion",
  "u_swirl", "u_swirlIterations",
  "u_softness", "u_proportion", "u_rotation", "u_seed",
  "u_shapeScale", "u_shape",
] as const;

// ── Props ─────────────────────────────────────────────────

export interface AnimatedLiquidBackgroundProps {
  preset?: keyof typeof presets;
  color1?: string; color2?: string; color3?: string;
  speed?: number; scale?: number; distortion?: number;
  swirl?: number; swirlIterations?: number; softness?: number;
  rotation?: number; proportion?: number; offset?: number;
  shape?: ShapeName; shapeScale?: number;
  /** Max device-pixel-ratio. Default: native DPR capped at 2 */
  pixelRatio?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ── Component ─────────────────────────────────────────────

export default function AnimatedLiquidBackground({
  preset = "Dark",
  color1, color2, color3,
  speed, scale, distortion, swirl, swirlIterations,
  softness, rotation, proportion, offset,
  shape, shapeScale,
  pixelRatio,
  className,
  style,
}: AnimatedLiquidBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const startRef     = useRef<number>(0);
  const glRef        = useRef<WebGLRenderingContext | null>(null);
  const progRef      = useRef<WebGLProgram | null>(null);
  const uniRef       = useRef<Record<string, WebGLUniformLocation | null>>({});
  const inViewRef    = useRef(true);

  const maxDpr = pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);

  const vals = useMemo(() => {
    const pr = presets[preset] ?? presets.Dark;
    return {
      c1:       hexToRgb(color1 ?? pr.color1),
      c2:       hexToRgb(color2 ?? pr.color2),
      c3:       hexToRgb(color3 ?? pr.color3),
      spd:      (speed ?? pr.speed) / 100 * 5,
      scl:      scale ?? pr.scale,
      dist:     (distortion ?? pr.distortion) / 50,
      swl:      (swirl ?? pr.swirl) / 100,
      swlIter:  (swirl ?? pr.swirl) === 0 ? 0 : (swirlIterations ?? pr.swirlIterations),
      soft:     (softness ?? pr.softness) / 100,
      rot:      (rotation ?? pr.rotation) * Math.PI / 180,
      prop:     (proportion ?? pr.proportion) / 100,
      seed:     (offset ?? pr.offset) * 10,
      shapeN:   SHAPE_MAP[shape ?? pr.shape] ?? 0,
      shapeScl: (shapeScale ?? pr.shapeScale) / 100,
    };
  }, [
    preset, color1, color2, color3, speed, scale, distortion, swirl,
    swirlIterations, softness, rotation, proportion, offset, shape, shapeScale,
  ]);

  // ── Initialise WebGL ────────────────────────────────────
  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false,
      premultipliedAlpha: false, powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return;

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locs: Record<string, WebGLUniformLocation | null> = {};
    UNIFORM_NAMES.forEach((n) => { locs[n] = gl.getUniformLocation(prog, n); });
    uniRef.current = locs;
    glRef.current  = gl;
    progRef.current = prog;
    startRef.current = performance.now();
  }, []);

  // ── Init + resize + visibility ──────────────────────────
  useEffect(() => {
    initGL();

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr  = Math.min(window.devicePixelRatio, maxDpr);
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width  * dpr);
      const h = Math.round(rect.height * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width  = w;
      canvas.height = h;
      glRef.current?.viewport(0, 0, w, h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);

    const io = new IntersectionObserver(
      ([e]) => { inViewRef.current = e.isIntersecting; },
      { threshold: 0 },
    );
    if (containerRef.current) io.observe(containerRef.current);

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [initGL, maxDpr]);

  // ── Render loop — throttled to 30 fps ──────────────────
  useEffect(() => {
    const {
      c1, c2, c3, spd, scl, dist, swl, swlIter,
      soft, rot, prop, seed, shapeN, shapeScl,
    } = vals;

    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;

    const render = (now: number) => {
      animRef.current = requestAnimationFrame(render);
      if (!inViewRef.current) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      const gl     = glRef.current;
      const prog   = progRef.current;
      const canvas = canvasRef.current;
      const u      = uniRef.current;
      if (!gl || !prog || !canvas) return;

      const elapsed = (now - startRef.current) / 1000;
      gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(u.u_time, elapsed);
      gl.uniform3f(u.u_color1, c1[0], c1[1], c1[2]);
      gl.uniform3f(u.u_color2, c2[0], c2[1], c2[2]);
      gl.uniform3f(u.u_color3, c3[0], c3[1], c3[2]);
      gl.uniform1f(u.u_speed, spd);
      gl.uniform1f(u.u_scale, scl);
      gl.uniform1f(u.u_distortion, dist);
      gl.uniform1f(u.u_swirl, swl);
      gl.uniform1f(u.u_swirlIterations, swlIter);
      gl.uniform1f(u.u_softness, soft);
      gl.uniform1f(u.u_proportion, prop);
      gl.uniform1f(u.u_rotation, rot);
      gl.uniform1f(u.u_seed, seed);
      gl.uniform1f(u.u_shapeScale, shapeScl);
      gl.uniform1f(u.u_shape, shapeN);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [vals]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden", ...style }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export { presets };
