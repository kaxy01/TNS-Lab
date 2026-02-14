// Signal data generators for TP1 exercises

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

// Exercise 1 signals
const A = 1, f0 = 5, phi = Math.PI / 4, a = 2, T = 1;

// Numerical energy computation: E = integral of |x(t)|^2 dt
export const computeEnergy = (
  fn: (t: number) => number,
  tMin: number,
  tMax: number,
  amplitude: number = 1,
  frequency: number = 1,
  offset: number = 0,
  points: number = 2000
): number => {
  const step = (tMax - tMin) / points;
  let energy = 0;
  for (let i = 0; i <= points; i++) {
    const t = tMin + i * step;
    const val = amplitude * fn((t - offset) * frequency);
    energy += val * val * step;
  }
  return energy;
};

// Numerical power computation: P = (1/T) * integral of |x(t)|^2 dt
export const computePower = (
  fn: (t: number) => number,
  tMin: number,
  tMax: number,
  amplitude: number = 1,
  frequency: number = 1,
  offset: number = 0,
  points: number = 2000
): number => {
  const duration = tMax - tMin;
  const energy = computeEnergy(fn, tMin, tMax, amplitude, frequency, offset, points);
  return energy / duration;
};

export interface SignalDef {
  fn: (t: number) => number;
  label: string;
  shortLabel: string;
  formula: string;
  tRange: [number, number];
  code: string;
  energy: string;
  energyFormula: string;
  powerFormula: string;
  color: string;
}

export const signals: Record<string, SignalDef> = {
  x1: {
    fn: (t) => A * Math.cos(2 * Math.PI * f0 * t),
    label: "x₁(t)=cos(t)",
    shortLabel: "cos(t)",
    formula: "x₁(t) = A·cos(2πf₀t)",
    tRange: [-1, 1],
    code: `import numpy as np\nimport matplotlib.pyplot as plt\n\nA, f0 = 1, 5\nt = np.linspace(-1, 1, 1000)\nx1 = A * np.cos(2 * np.pi * f0 * t)\n\nplt.plot(t, x1)\nplt.title("x1(t) = A·cos(2πf₀t)")\nplt.xlabel("t"); plt.ylabel("x1(t)")\nplt.grid(True); plt.show()`,
    energy: "Puissance finie",
    energyFormula: "E = ∞ (signal périodique)",
    powerFormula: "P = A²/2",
    color: "hsl(220, 90%, 60%)",
  },
  x2: {
    fn: (t) => A * Math.cos(2 * Math.PI * f0 * t + phi),
    label: "x₂(t)=cos(t+φ)",
    shortLabel: "cos(t+φ)",
    formula: "x₂(t) = A·cos(2πf₀t + φ)",
    tRange: [-1, 1],
    code: `phi = np.pi / 4\nx2 = A * np.cos(2 * np.pi * f0 * t + phi)\nplt.plot(t, x2)\nplt.title("x2(t) = A·cos(2πf₀t + φ)")`,
    energy: "Puissance finie",
    energyFormula: "E = ∞ (signal périodique)",
    powerFormula: "P = A²/2",
    color: "hsl(280, 80%, 65%)",
  },
  x3: {
    fn: (t) => t >= 0 ? Math.exp(-a * t) : 0,
    label: "x₃(t)=e⁻ᵃᵗu(t)",
    shortLabel: "e⁻ᵃᵗ·u(t)",
    formula: "x₃(t) = e^(-at)·u(t)",
    tRange: [-1, 3],
    code: `a = 2\nx3 = np.exp(-a * t) * (t >= 0)\nplt.plot(t, x3)\nplt.title("x3(t) = e^{-at}·u(t)")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|e^(-at)·u(t)|²dt = 1/(2a)",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(140, 70%, 50%)",
  },
  x4: {
    fn: (t) => Math.exp(-a * Math.abs(t)),
    label: "x₄(t)=e⁻ᵃ|ᵗ|",
    shortLabel: "e⁻ᵃ|ᵗ|",
    formula: "x₄(t) = e^(-a|t|)",
    tRange: [-3, 3],
    code: `x4 = np.exp(-a * np.abs(t))\nplt.plot(t, x4)\nplt.title("x4(t) = e^{-a|t|}")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|e^(-a|t|)|²dt = 1/a",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(45, 90%, 55%)",
  },
  x5: {
    fn: (t) => Math.abs(t) <= T / 2 ? 1 : 0,
    label: "x₅(t)=Rect(t)",
    shortLabel: "Rect(t)",
    formula: "x₅(t) = rect(t/T)",
    tRange: [-2, 2],
    code: `x5 = np.where(np.abs(t) <= T/2, 1, 0)\nplt.plot(t, x5)\nplt.title("x5(t) = rect(t/T)")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|Rect(t)|²dt = T",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(200, 90%, 55%)",
  },
  x6: {
    fn: (t) => Math.abs(t) <= T ? 1 - Math.abs(t) / T : 0,
    label: "x₆(t)=Tri(t)",
    shortLabel: "Tri(t)",
    formula: "x₆(t) = tri(t/T)",
    tRange: [-2, 2],
    code: `x6 = np.where(np.abs(t) <= T, 1 - np.abs(t)/T, 0)\nplt.plot(t, x6)\nplt.title("x6(t) = tri(t/T)")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|tri(t/T)|²dt = 2T/3",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(270, 80%, 65%)",
  },
  x7: {
    fn: (t) => t === 0 ? 1 : Math.sin(Math.PI * t / T) / (Math.PI * t / T),
    label: "x₇(t)=sinc(t)",
    shortLabel: "sinc(t)",
    formula: "x₇(t) = sinc(t/T)",
    tRange: [-5, 5],
    code: `x7 = np.sinc(t / T)\nplt.plot(t, x7)\nplt.title("x7(t) = sinc(t/T)")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|sinc(t/T)|²dt = T",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(340, 80%, 60%)",
  },
  x8: {
    fn: (t) => A * Math.cos(2 * Math.PI * 3 * t) + 0.5 * Math.cos(2 * Math.PI * 7 * t),
    label: "x₈(t)=Σcos",
    shortLabel: "Σcos(t)",
    formula: "x₈(t) = A·cos(2πf₁t) + B·cos(2πf₂t)",
    tRange: [-1, 1],
    code: `f1, f2 = 3, 7\nx8 = A*np.cos(2*np.pi*f1*t) + 0.5*np.cos(2*np.pi*f2*t)\nplt.plot(t, x8)\nplt.title("x8(t) = A·cos(2πf₁t) + B·cos(2πf₂t)")`,
    energy: "Puissance finie",
    energyFormula: "E = ∞ (signal périodique)",
    powerFormula: "P = A²/2 + B²/2",
    color: "hsl(30, 90%, 55%)",
  },
  x9: {
    fn: (t) => Math.abs(t) <= T / 2 ? A * Math.cos(2 * Math.PI * f0 * t) : 0,
    label: "x₉(t)=Rect·cos",
    shortLabel: "Rect·cos(t)",
    formula: "x₉(t) = A·cos(2πf₀t)·rect(t/T)",
    tRange: [-2, 2],
    code: `x9 = A * np.cos(2*np.pi*f0*t) * (np.abs(t) <= T/2)\nplt.plot(t, x9)\nplt.title("x9(t) = A·cos(2πf₀t)·rect(t/T)")`,
    energy: "Énergie finie",
    energyFormula: "E = ∫|cos(t)·rect(t)|²dt",
    powerFormula: "P = 0 (énergie finie)",
    color: "hsl(15, 90%, 55%)",
  },
  x10: {
    fn: (t) => {
      const rounded = Math.round(t / T);
      return Math.abs(t - rounded * T) < 0.02 ? 15 : 0;
    },
    label: "x₁₀(t)=δ(t)",
    shortLabel: "δ(t)",
    formula: "x₁₀(t) = Σδ(t - nT)",
    tRange: [-3, 3],
    code: `# Peigne de Dirac (approximation)\nx10 = np.zeros_like(t)\nfor n in range(-3, 4):\n    x10 += np.exp(-(t - n*T)**2 / 0.001)\nplt.stem(np.arange(-3, 4)*T, np.ones(7))\nplt.title("x10(t) = Σδ(t - nT)")`,
    energy: "Énergie ∞",
    energyFormula: "E = ∞",
    powerFormula: "P = ∞",
    color: "hsl(0, 85%, 60%)",
  },
  x11: {
    fn: (t) => t >= 0 ? 1 : 0,
    label: "x₁₁(t)=U(t)",
    shortLabel: "U(t)",
    formula: "x₁₁(t) = u(t)",
    tRange: [-2, 2],
    code: `x11 = np.heaviside(t, 0.5)\nplt.plot(t, x11)\nplt.title("x11(t) = u(t)")`,
    energy: "Puissance finie",
    energyFormula: "E = ∞",
    powerFormula: "P = 1/2",
    color: "hsl(170, 80%, 50%)",
  },
  x12: {
    fn: (t) => t > 0 ? 1 : t < 0 ? -1 : 0,
    label: "x₁₂(t)=sgn(t)",
    shortLabel: "sgn(t)",
    formula: "x₁₂(t) = sgn(t)",
    tRange: [-2, 2],
    code: `x12 = np.sign(t)\nplt.plot(t, x12)\nplt.title("x12(t) = sgn(t)")`,
    energy: "Puissance finie",
    energyFormula: "E = ∞",
    powerFormula: "P = 1",
    color: "hsl(50, 90%, 55%)",
  },
};

// Exercise 2 signals
export const exercise2Signals = {
  x: {
    fn: (t: number) => (t >= 0 && t <= 2) ? 1 : 0,
    label: "x(t)",
    tRange: [-1, 4] as [number, number],
    code: `x = np.where((t >= 0) & (t <= 2), 1, 0)
plt.plot(t, x)
plt.title("x(t)")`,
  },
  y: {
    fn: (t: number) => (t >= 0) ? Math.exp(-t) : 0,
    label: "y(t)",
    tRange: [-1, 5] as [number, number],
    code: `y = np.exp(-t) * (t >= 0)
plt.plot(t, y)
plt.title("y(t)")`,
  },
  z: {
    fn: (t: number) => {
      // Convolution of x and y (analytical result)
      if (t < 0) return 0;
      if (t <= 2) return 1 - Math.exp(-t);
      return (Math.exp(2) - 1) * Math.exp(-t);
    },
    label: "z(t) = x * y (convolution)",
    tRange: [-1, 6] as [number, number],
    code: `# Convolution z(t) = x(t) * y(t)
z = np.convolve(x, y, mode='full') * dt
plt.plot(t_conv, z)
plt.title("z(t) = x(t) * y(t)")`,
  },
};

// Exercise 3 - x14(t) piecewise signal
const x14Fn = (t: number): number => {
  if (t >= -2 && t < -1) return t + 2;
  if (t >= -1 && t < 0) return 1;
  if (t >= 0 && t < 1) return -t + 1;
  if (t >= 1 && t < 2) return 0;
  return 0;
};

export const x14Signal = {
  fn: x14Fn,
  label: "x₁₄(t) — Signal par morceaux",
  formula: "x₁₄(t) défini par morceaux",
  tRange: [-3, 3] as [number, number],
  code: `import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(-3, 3, 1000)

def x14(t):
    y = np.zeros_like(t)
    y[(-2 <= t) & (t < -1)] = t[(-2 <= t) & (t < -1)] + 2
    y[(-1 <= t) & (t < 0)] = 1
    y[(0 <= t) & (t < 1)] = -t[(0 <= t) & (t < 1)] + 1
    y[(1 <= t) & (t < 2)] = 0
    return y

plt.plot(t, x14(t))
plt.title("x₁₄(t)")
plt.xlabel("t"); plt.ylabel("x₁₄(t)")
plt.grid(True); plt.show()`,
};

// Exercise 4 - Even/odd decomposition
export const exercise4 = {
  evenPart: (t: number): number => {
    return 0.5 * (x14Fn(t) + x14Fn(-t));
  },
  oddPart: (t: number): number => {
    return 0.5 * (x14Fn(t) - x14Fn(-t));
  },
  code: `# Décomposition paire/impaire de x14(t)
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(-3, 3, 1000)

def x14(t):
    y = np.zeros_like(t)
    y[(-2 <= t) & (t < -1)] = t[(-2 <= t) & (t < -1)] + 2
    y[(-1 <= t) & (t < 0)] = 1
    y[(0 <= t) & (t < 1)] = -t[(0 <= t) & (t < 1)] + 1
    y[(1 <= t) & (t < 2)] = 0
    return y

x = x14(t)
x_neg = x14(-t)

# Partie paire: x_p(t) = 0.5 * [x(t) + x(-t)]
x_pair = 0.5 * (x + x_neg)

# Partie impaire: x_i(t) = 0.5 * [x(t) - x(-t)]
x_impair = 0.5 * (x - x_neg)

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
axes[0].plot(t, x); axes[0].set_title("x₁₄(t)")
axes[1].plot(t, x_pair); axes[1].set_title("Partie paire")
axes[2].plot(t, x_impair); axes[2].set_title("Partie impaire")
plt.tight_layout(); plt.show()`,
};
