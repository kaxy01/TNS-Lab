// Fonctions de base
const rect = (t: number): number => (Math.abs(t) <= 0.5 ? 1 : 0);
const tri = (t: number): number => (Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0);
const u = (t: number): number => (t >= 0 ? 1 : 0);
const ramp = (t: number): number => (t >= 0 ? t : 0);
const sinc = (t: number): number => (Math.abs(t) < 1e-10 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t));
const delta = (t: number, t0: number, w = 0.03): number => (Math.abs(t - t0) < w ? 1 / (2 * w) : 0);

export const generateSignalData = (
  fn: (t: number) => number,
  tMin: number,
  tMax: number,
  points: number = 500
) => {
  const data = [];
  const step = (tMax - tMin) / points;
  for (let i = 0; i <= points; i++) {
    const t = tMin + i * step;
    data.push({ t: parseFloat(t.toFixed(4)), value: parseFloat(fn(t).toFixed(6)) });
  }
  return data;
};

// Simpson numerical integration
const simpson = (fn: (t: number) => number, a: number, b: number, n = 2000): number => {
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    sum += fn(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (sum * h) / 3;
};

export const computeEnergy = (
  fn: (t: number) => number,
  tMin: number,
  tMax: number,
  amplitude = 1,
  frequency = 1,
  offset = 0,
): number => {
  return simpson((t) => {
    const v = amplitude * fn((t - offset) * frequency);
    return v * v;
  }, tMin, tMax);
};

export const computePower = (
  fn: (t: number) => number,
  tMin: number,
  tMax: number,
  amplitude = 1,
  frequency = 1,
  offset = 0,
): number => {
  return computeEnergy(fn, tMin, tMax, amplitude, frequency, offset) / (tMax - tMin);
};

export interface SignalDef {
  fn: (t: number) => number;
  label: string;
  shortLabel: string;
  formula: string;
  tRange: [number, number];
  energy: string;
  energyFormula: string;
  powerFormula: string;
  color: string;
}

export const signals: Record<string, SignalDef> = {
  x1: {
    fn: (t) => 2 * rect(2 * t - 1),
    label: "x\u2081(t) = 2Rect(2t\u22121)",
    shortLabel: "2Rect(2t-1)",
    formula: "x\u2081(t) = 2\u00B7Rect(2t - 1)",
    tRange: [-1, 2],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|2Rect(2t-1)|\u00B2dt = 2",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(220, 90%, 60%)",
  },
  x2: {
    fn: (t) => Math.sin(Math.PI * t) * rect(t / 2),
    label: "x\u2082(t) = sin(\u03C0t)\u00B7Rect(t/2)",
    shortLabel: "sin(\u03C0t)\u00B7Rect(t/2)",
    formula: "x\u2082(t) = sin(\u03C0t)\u00B7Rect(t/2)",
    tRange: [-2, 2],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|sin(\u03C0t)\u00B7Rect(t/2)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(280, 80%, 65%)",
  },
  x3: {
    fn: (t) => tri(2 * t),
    label: "x\u2083(t) = Tri(2t)",
    shortLabel: "Tri(2t)",
    formula: "x\u2083(t) = Tri(2t)",
    tRange: [-1.5, 1.5],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|Tri(2t)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(140, 70%, 50%)",
  },
  x4: {
    fn: (t) => u(t - 2),
    label: "x\u2084(t) = U(t\u22122)",
    shortLabel: "U(t-2)",
    formula: "x\u2084(t) = U(t - 2)",
    tRange: [-1, 5],
    energy: "Puissance finie",
    energyFormula: "E = \u221E",
    powerFormula: "P = 1/2",
    color: "hsl(45, 90%, 55%)",
  },
  x5: {
    fn: (t) => u(3 - t),
    label: "x\u2085(t) = U(3\u2212t)",
    shortLabel: "U(3-t)",
    formula: "x\u2085(t) = U(3 - t)",
    tRange: [-1, 6],
    energy: "Puissance finie",
    energyFormula: "E = \u221E",
    powerFormula: "P = 1/2",
    color: "hsl(200, 90%, 55%)",
  },
  x6: {
    fn: (t) => 2 * delta(t, -1) - delta(t, 2) + delta(t, 0) - 2 * delta(t, 1),
    label: "x\u2086(t) = 2\u03B4(t+1)\u2212\u03B4(t\u22122)+\u03B4(t)\u22122\u03B4(t\u22121)",
    shortLabel: "Impulsions \u03B4",
    formula: "x\u2086(t) = 2\u03B4(t+1) - \u03B4(t-2) + \u03B4(t) - 2\u03B4(t-1)",
    tRange: [-3, 4],
    energy: "\u00C9nergie \u221E (distributions)",
    energyFormula: "E = \u221E (impulsions de Dirac)",
    powerFormula: "P = \u221E",
    color: "hsl(0, 85%, 60%)",
  },
  x7: {
    fn: (t) => rect((t - 1) / 2) - rect((t + 1) / 2),
    label: "x\u2087(t) = Rect((t\u22121)/2)\u2212Rect((t+1)/2)",
    shortLabel: "Rect diff",
    formula: "x\u2087(t) = Rect((t-1)/2) - Rect((t+1)/2)",
    tRange: [-3, 3],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|x\u2087(t)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(270, 80%, 65%)",
  },
  x8: {
    fn: (t) => tri(t - 1) - tri(t + 1),
    label: "x\u2088(t) = Tri(t\u22121)\u2212Tri(t+1)",
    shortLabel: "Tri diff",
    formula: "x\u2088(t) = Tri(t-1) - Tri(t+1)",
    tRange: [-3, 3],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|x\u2088(t)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(340, 80%, 60%)",
  },
  x9: {
    fn: (t) => rect(t / 2) - tri(t),
    label: "x\u2089(t) = Rect(t/2)\u2212Tri(t)",
    shortLabel: "Rect-Tri",
    formula: "x\u2089(t) = Rect(t/2) - Tri(t)",
    tRange: [-2, 2],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|x\u2089(t)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(30, 90%, 55%)",
  },
  x10: {
    fn: (t) => Math.exp(-t) * u(t - 2),
    label: "x\u2081\u2080(t) = exp(\u2212t)\u00B7u(t\u22122)",
    shortLabel: "exp(-t)\u00B7u(t-2)",
    formula: "x\u2081\u2080(t) = exp(-t)\u00B7u(t - 2)",
    tRange: [-1, 6],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222Be\u207B\u00B2\u1D57dt (t\u22652) = e\u207B\u2074/2",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(15, 90%, 55%)",
  },
  x11: {
    fn: (t) => Math.sin(4 * Math.PI * t),
    label: "x\u2081\u2081(t) = sin(4\u03C0t)",
    shortLabel: "sin(4\u03C0t)",
    formula: "x\u2081\u2081(t) = sin(4\u03C0t), f\u2080=2Hz, T=0.5s",
    tRange: [-1, 1],
    energy: "Puissance finie",
    energyFormula: "E = \u221E (signal p\u00E9riodique)",
    powerFormula: "P = 1/2 (A\u00B2/2 = 1/2)",
    color: "hsl(170, 80%, 50%)",
  },
  x12: {
    fn: (t) => sinc(t),
    label: "H(f) = sinc(f)",
    shortLabel: "sinc(f)",
    formula: "H(f) = sinc(f) = sin(\u03C0f)/(\u03C0f)",
    tRange: [-5, 5],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|sinc(f)|\u00B2df = 1",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(50, 90%, 55%)",
  },
  x13: {
    fn: (t) => ramp(t + 1) - 2 * ramp(t) + ramp(t - 1),
    label: "x\u2081\u2083(t) = R(t+1)\u22122R(t)+R(t\u22121)",
    shortLabel: "Rampe combin\u00E9e",
    formula: "x\u2081\u2083(t) = R(t+1) - 2R(t) + R(t-1)",
    tRange: [-3, 3],
    energy: "\u00C9nergie finie",
    energyFormula: "E = \u222B|x\u2081\u2083(t)|\u00B2dt",
    powerFormula: "P = 0 (\u00E9nergie finie)",
    color: "hsl(100, 70%, 50%)",
  },
};

// Exercise 2 signals
export const exercise2Signals = {
  x: {
    fn: (t: number) => (t >= 0 && t <= 2) ? 1 : 0,
    label: "x(t)",
    tRange: [-1, 4] as [number, number],
    code: `x = np.where((t >= 0) & (t <= 2), 1, 0)\nplt.plot(t, x)\nplt.title("x(t)")`,
  },
  y: {
    fn: (t: number) => (t >= 0) ? Math.exp(-t) : 0,
    label: "y(t)",
    tRange: [-1, 5] as [number, number],
    code: `y = np.exp(-t) * (t >= 0)\nplt.plot(t, y)\nplt.title("y(t)")`,
  },
  z: {
    fn: (t: number) => {
      if (t < 0) return 0;
      if (t <= 2) return 1 - Math.exp(-t);
      return (Math.exp(2) - 1) * Math.exp(-t);
    },
    label: "z(t) = x * y (convolution)",
    tRange: [-1, 6] as [number, number],
    code: `z = np.convolve(x, y, mode='full') * dt\nplt.plot(t_conv, z)\nplt.title("z(t) = x(t) * y(t)")`,
  },
};
