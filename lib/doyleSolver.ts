/**
 * Numerical solver for Doyle spirals.
 *
 * Adapted from Robin Houston's doyle-spirals project (MIT License).
 * https://github.com/robinhouston/doyle-spirals
 */

export interface DoyleRoot {
  a: { real: number; imag: number };
  b: { real: number; imag: number };
  r: number;
}

function _d(z: number, t: number, p: number, q: number): number {
  const w = Math.pow(z, p / q);
  const s = (p * t + 2 * Math.PI) / q;
  const dx = z * Math.cos(t) - w * Math.cos(s);
  const dy = z * Math.sin(t) - w * Math.sin(s);
  return dx * dx + dy * dy;
}

function ddz_d(z: number, t: number, p: number, q: number): number {
  const w = Math.pow(z, p / q);
  const s = (p * t + 2 * Math.PI) / q;
  const ddz_w = (p / q) * Math.pow(z, (p - q) / q);
  const term1 = w * Math.cos(s) - z * Math.cos(t);
  const term2 = ddz_w * Math.cos(s) - Math.cos(t);
  const term3 = w * Math.sin(s) - z * Math.sin(t);
  const term4 = ddz_w * Math.sin(s) - Math.sin(t);
  return 2 * term1 * term2 + 2 * term3 * term4;
}

function ddt_d(z: number, t: number, p: number, q: number): number {
  const w = Math.pow(z, p / q);
  const s = (p * t + 2 * Math.PI) / q;
  const dds_t = p / q;
  const term1 = z * Math.cos(t) - w * Math.cos(s);
  const term2 = -z * Math.sin(t) + w * Math.sin(s) * dds_t;
  const term3 = z * Math.sin(t) - w * Math.sin(s);
  const term4 = z * Math.cos(t) - w * Math.cos(s) * dds_t;
  return 2 * term1 * term2 + 2 * term3 * term4;
}

function _s(z: number, t: number, p: number, q: number): number {
  const sum = z + Math.pow(z, p / q);
  return sum * sum;
}

function ddz_s(z: number, t: number, p: number, q: number): number {
  const w = Math.pow(z, p / q);
  const ddz_w = (p / q) * Math.pow(z, (p - q) / q);
  return 2 * (w + z) * (ddz_w + 1);
}

function _r(z: number, t: number, p: number, q: number): number {
  return _d(z, t, p, q) / _s(z, t, p, q);
}

function ddz_r(z: number, t: number, p: number, q: number): number {
  const numerator = ddz_d(z, t, p, q) * _s(z, t, p, q) - _d(z, t, p, q) * ddz_s(z, t, p, q);
  const denominator = Math.pow(_s(z, t, p, q), 2);
  return numerator / denominator;
}

function ddt_r(z: number, t: number, p: number, q: number): number {
  const numerator = ddt_d(z, t, p, q) * _s(z, t, p, q);
  const denominator = Math.pow(_s(z, t, p, q), 2);
  return numerator / denominator;
}

export function spiralRoot(p: number, q: number, epsilon: number = 1e-10): DoyleRoot {
  function _f(z: number, t: number): number {
    return _r(z, t, 0, 1) - _r(z, t, p, q);
  }

  function ddz_f(z: number, t: number): number {
    return ddz_r(z, t, 0, 1) - ddz_r(z, t, p, q);
  }

  function ddt_f(z: number, t: number): number {
    return ddt_r(z, t, 0, 1) - ddt_r(z, t, p, q);
  }

  function _g(z: number, t: number): number {
    return _r(z, t, 0, 1) - _r(Math.pow(z, p / q), (p * t + 2 * Math.PI) / q, 0, 1);
  }

  function ddz_g(z: number, t: number): number {
    return ddz_r(z, t, 0, 1) - ddz_r(Math.pow(z, p / q), (p * t + 2 * Math.PI) / q, 0, 1) * (p / q) * Math.pow(z, (p - q) / q);
  }

  function ddt_g(z: number, t: number): number {
    return ddt_r(z, t, 0, 1) - ddt_r(Math.pow(z, p / q), (p * t + 2 * Math.PI) / q, 0, 1) * (p / q);
  }

  function findRoot(z: number, t: number): { ok: boolean; z: number; t: number } {
    let currentZ = z;
    let currentT = t;
    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
      const v_f = _f(currentZ, currentT);
      const v_g = _g(currentZ, currentT);

      if (Math.abs(v_f) < epsilon && Math.abs(v_g) < epsilon) {
        return { ok: true, z: currentZ, t: currentT };
      }

      const a = ddz_f(currentZ, currentT);
      const b = ddt_f(currentZ, currentT);
      const c = ddz_g(currentZ, currentT);
      const d = ddt_g(currentZ, currentT);
      const det = a * d - b * c;

      if (Math.abs(det) < epsilon) {
        return { ok: false, z: currentZ, t: currentT };
      }

      const delta_z = (d * v_f - b * v_g) / det;
      const delta_t = (a * v_g - c * v_f) / det;
      currentZ -= delta_z;
      currentT -= delta_t;

      if (currentZ < epsilon) {
        return { ok: false, z: currentZ, t: currentT };
      }

      iterations++;
    }

    return { ok: false, z: currentZ, t: currentT };
  }

  const result = findRoot(2.0, 0.0);
  if (!result.ok) {
    throw new Error(`Failed to find Doyle root for p=${p}, q=${q}`);
  }

  const z = result.z;
  const t = result.t;
  const w = Math.pow(z, p / q);
  const s = (p * t + 2 * Math.PI) / q;

  const a = {
    real: z * Math.cos(t),
    imag: z * Math.sin(t)
  };

  const b = {
    real: w * Math.cos(s),
    imag: w * Math.sin(s)
  };

  const r = Math.sqrt(_r(z, t, 0, 1));

  return { a, b, r };
}
