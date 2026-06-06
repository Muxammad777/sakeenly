// Letter tracing scoring.
//
// We render the target letter onto a hidden canvas as a thick black stroke
// (the "ink mask"). When the kid drags their finger, we sample each pointer
// move into a separate "kid ink" canvas. After they lift, we compare the two:
//
//   coverage = pixels of letter-mask that the kid drew over
//   stray    = pixels the kid drew that fall outside the letter-mask
//
//   score = clamp01( coverage_ratio - 0.5 * stray_ratio ) * 100
//
// This is intentionally lenient — a 4-year-old's "alif" looks nothing like
// the real glyph, and we want them to feel successful. ≥40 passes.

export const TRACING_PASS_SCORE = 40;

interface Mask {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  inkPixels: number; // number of "on" pixels in the letter mask
}

export function buildLetterMask(canvas: HTMLCanvasElement, glyph: string): Mask {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.floor(height * 0.78)}px "Amiri Quran", "Scheherazade New", serif`;
  ctx.fillText(glyph, width / 2, height / 2);
  const img = ctx.getImageData(0, 0, width, height);
  let inkPixels = 0;
  for (let i = 3; i < img.data.length; i += 4) {
    if (img.data[i] > 32) inkPixels++;
  }
  return { data: img.data, width, height, inkPixels };
}

/**
 * Compare a kid's drawing (read from `kidCanvas` alpha channel) against the
 * letter mask and return a 0–100 score plus the underlying ratios for UX.
 */
export function scoreTracing(mask: Mask, kidCanvas: HTMLCanvasElement) {
  const ctx = kidCanvas.getContext("2d", { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, kidCanvas.width, kidCanvas.height);

  let inkOverlap = 0;
  let kidPixels = 0;
  let stray = 0;
  const len = img.data.length;
  for (let i = 3; i < len; i += 4) {
    const kid = img.data[i];
    if (kid <= 24) continue;
    kidPixels++;
    if (mask.data[i] > 32) inkOverlap++;
    else stray++;
  }

  const coverageRatio = mask.inkPixels > 0 ? inkOverlap / mask.inkPixels : 0;
  const strayRatio = kidPixels > 0 ? stray / kidPixels : 0;
  const rawScore = coverageRatio - 0.5 * strayRatio;
  const score = Math.max(0, Math.min(1, rawScore));

  return {
    score: Math.round(score * 100),
    coverageRatio,
    strayRatio,
    kidPixels,
  };
}
