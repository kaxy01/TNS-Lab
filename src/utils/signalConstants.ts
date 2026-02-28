export interface Operator {
    id: string;
    symbol: string;
    apply: (a: number, b: number) => number;
}

export const OPERATORS: Operator[] = [
    { id: "add", symbol: "+", apply: (a, b) => a + b },
    { id: "sub", symbol: "−", apply: (a, b) => a - b },
    { id: "mul", symbol: "×", apply: (a, b) => a * b },
];

export const BLOCK_PALETTE = [
    {
        type: "u", label: "U(t)", color: "hsl(187,100%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => { const u = (x: number) => (x > 0 ? 1 : x === 0 ? 0.5 : 0); return a * u(sc * t + s); }
    },
    {
        type: "sgn", label: "sgn(t)", color: "hsl(280,80%,65%)",
        fn: (t: number, a: number, s: number, sc: number) => { const sgn = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0); return a * sgn(sc * t + s); }
    },
    {
        type: "rect", label: "Rect(t)", color: "hsl(45,90%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => { const rect = (x: number) => (Math.abs(x) <= 0.5 ? 1 : 0); return a * rect(sc * t + s); }
    },
    {
        type: "sin", label: "sin(t)", color: "hsl(140,70%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => a * Math.sin(sc * t + s)
    },
    {
        type: "cos", label: "cos(t)", color: "hsl(200,80%,60%)",
        fn: (t: number, a: number, s: number, sc: number) => a * Math.cos(sc * t + s)
    },
    {
        type: "ramp", label: "r(t)", color: "hsl(25,90%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => { const v = sc * t + s; return a * (v >= 0 ? v : 0); }
    },
    {
        type: "tri", label: "Tri(t)", color: "hsl(320,70%,60%)",
        fn: (t: number, a: number, s: number, sc: number) => { const v = Math.abs(sc * t + s); return a * (v <= 1 ? 1 - v : 0); }
    },
    {
        type: "exp", label: "e⁻|ᵗ|", color: "hsl(60,80%,50%)",
        fn: (t: number, a: number, s: number, sc: number) => a * Math.exp(-Math.abs(sc * t + s))
    },
];

export const SIGNAL_PRESETS = [
    { label: "Porte", expr: "rect(t)", color: "hsl(45,90%,55%)", category: "Base" },
    { label: "Porte ×2", expr: "rect(2*t)", color: "hsl(45,90%,55%)", category: "Base" },
    { label: "Triangle", expr: "tri(t)", color: "hsl(320,70%,60%)", category: "Base" },
    { label: "Triangle ×2", expr: "tri(2*t)", color: "hsl(320,70%,60%)", category: "Base" },
    { label: "Sinusoïde", expr: "sin(2*pi*t)", color: "hsl(140,70%,55%)", category: "Peri" },
    { label: "Cosinus", expr: "cos(2*pi*t)", color: "hsl(200,80%,60%)", category: "Peri" },
    { label: "Echelon", expr: "u(t)", color: "hsl(187,100%,55%)", category: "Base" },
    { label: "Signe", expr: "sgn(t)", color: "hsl(280,80%,65%)", category: "Base" },
    { label: "Exp. décr.", expr: "exp(-abs(t))", color: "hsl(60,80%,50%)", category: "Trans" },
    { label: "Rampe", expr: "t*u(t)", color: "hsl(25,90%,55%)", category: "Trans" },
    { label: "Sin carré", expr: "pow(sin(pi*t),2)", color: "hsl(140,70%,55%)", category: "Peri" },
    { label: "Rect²", expr: "pow(rect(t),2)", color: "hsl(45,90%,55%)", category: "Base" },
];

export const CHART_STYLE = {
    grid: "hsl(230,20%,18%)",
    axis: "hsl(215,20%,45%)",
    tooltip: {
        background: "hsl(230,25%,10%)",
        border: "1px solid hsl(230,20%,25%)",
        borderRadius: 8,
        fontSize: 12,
    },
};
