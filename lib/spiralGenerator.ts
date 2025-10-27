import { spiralRoot, DoyleRoot } from './doyleSolver';

export interface Circle {
  cx: number;
  cy: number;
  radius: number;
}

export interface SpiralResult {
  root: DoyleRoot;
  circles: Circle[];
}

interface Complex {
  real: number;
  imag: number;
}

function complexMultiply(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  };
}

function complexDivide(a: Complex, b: Complex): Complex {
  const denominator = b.real * b.real + b.imag * b.imag;
  return {
    real: (a.real * b.real + a.imag * b.imag) / denominator,
    imag: (a.imag * b.real - a.real * b.imag) / denominator
  };
}

function complexAbs(z: Complex): number {
  return Math.sqrt(z.real * z.real + z.imag * z.imag);
}

function complexToCircle(z: Complex, radiusRatio: number): Circle {
  const radius = complexAbs(z) * radiusRatio;
  return {
    cx: z.real,
    cy: z.imag,
    radius
  };
}

function circlesForArm(
  start: Complex,
  delta: Complex,
  radiusRatio: number,
  inwardSteps: number,
  outwardSteps: number
): { outward: Circle[]; inward: Circle[] } {
  const outward: Circle[] = [];
  let q = { ...start };

  for (let i = 0; i < outwardSteps; i++) {
    outward.push(complexToCircle(q, radiusRatio));
    q = complexMultiply(q, delta);
  }

  const inward: Circle[] = [];
  q = complexDivide(start, delta);

  for (let i = 0; i < inwardSteps; i++) {
    inward.push(complexToCircle(q, radiusRatio));
    q = complexDivide(q, delta);
  }

  return { outward, inward };
}

function deduplicateCircles(circles: Circle[], precision: number = 9): Circle[] {
  const seen = new Set<string>();
  const result: Circle[] = [];

  for (const circle of circles) {
    const key = `${circle.cx.toFixed(precision)},${circle.cy.toFixed(precision)},${circle.radius.toFixed(precision)}`;
    if (seen.has(key) || circle.radius === 0) {
      continue;
    }
    seen.add(key);
    result.push(circle);
  }

  return result;
}

function pruneByDistancePercentile(circles: Circle[], percentile: number = 0.7): Circle[] {
  if (circles.length === 0) return [];

  // Calculate distance from center for each circle
  const distances = circles.map(circle => ({
    circle,
    distance: Math.sqrt(circle.cx * circle.cx + circle.cy * circle.cy)
  }));

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // Keep only circles within the percentile
  const keepCount = Math.max(1, Math.floor(distances.length * percentile));

  return distances.slice(0, keepCount).map(d => d.circle);
}

export function generateDoyleCircles(
  p: number,
  q: number,
  rows: number,
  inwardSteps?: number,
  outwardSteps?: number,
  prunePercentile: number = 0.7
): SpiralResult {
  if (rows < 1) {
    throw new Error('rows must be positive');
  }

  const actualInwardSteps = inwardSteps ?? rows;
  const actualOutwardSteps = outwardSteps ?? rows;

  const root = spiralRoot(p, q);
  const delta = root.a;
  const armRotation = root.b;

  let start = { ...root.a };
  const outwardRows: Circle[][] = Array.from({ length: actualOutwardSteps }, () => []);
  const inwardCircles: Circle[] = [];

  for (let i = 0; i < q; i++) {
    const { outward, inward } = circlesForArm(
      start,
      delta,
      root.r,
      actualInwardSteps,
      actualOutwardSteps
    );

    outward.forEach((circle, idx) => {
      outwardRows[idx].push(circle);
    });

    inwardCircles.push(...inward);
    start = complexMultiply(start, armRotation);
  }

  // Flatten all circles
  const allCircles = [...outwardRows.flat(), ...inwardCircles];

  // Deduplicate
  const deduped = deduplicateCircles(allCircles);

  // Prune by distance
  const pruned = pruneByDistancePercentile(deduped, prunePercentile);

  return { root, circles: pruned };
}
