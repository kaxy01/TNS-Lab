import { useState, useMemo, useCallback, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from "recharts";
import WaveBackground from "@/components/WaveBackground";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    ArrowLeft, Puzzle, Plus, Trash2, GripVertical, Zap,
    Calculator, BookOpen, Shuffle, Loader2, FlaskConical,
    ToggleLeft, ToggleRight, Sparkles, ChevronDown, GitCompare,
    Library, CheckCircle2, HelpCircle, Trophy,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SIGNAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const u = (t: number) => (t > 0 ? 1 : t === 0 ? 0.5 : 0);
const sgn = (t: number) => (t > 0 ? 1 : t < 0 ? -1 : 0);
const rect = (t: number) => (Math.abs(t) <= 0.5 ? 1 : 0);
const tri = (t: number) => (Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0);

// ═══════════════════════════════════════════════════════════════
// BLOCK PALETTE
// ═══════════════════════════════════════════════════════════════
interface SignalBlock {
    id: string;
    type: string;
    label: string;
    color: string;
    amplitude: number;
    shift: number;
    scale: number;
    squared: boolean;
    fn: (t: number, a: number, s: number, sc: number) => number;
}

interface Operator {
    id: string;
    symbol: string;
    apply: (a: number, b: number) => number;
}

const OPERATORS: Operator[] = [
    { id: "add", symbol: "+", apply: (a, b) => a + b },
    { id: "sub", symbol: "−", apply: (a, b) => a - b },
    { id: "mul", symbol: "×", apply: (a, b) => a * b },
];

const BLOCK_PALETTE = [
    {
        type: "u", label: "U(t)", color: "hsl(187,100%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => a * u(sc * t + s)
    },
    {
        type: "sgn", label: "sgn(t)", color: "hsl(280,80%,65%)",
        fn: (t: number, a: number, s: number, sc: number) => a * sgn(sc * t + s)
    },
    {
        type: "rect", label: "Rect(t)", color: "hsl(45,90%,55%)",
        fn: (t: number, a: number, s: number, sc: number) => a * rect(sc * t + s)
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

// ═══════════════════════════════════════════════════════════════
// SIGNAL PRESETS LIBRARY
// ═══════════════════════════════════════════════════════════════
const SIGNAL_PRESETS = [
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

let blockIdCounter = 0;

// ═══════════════════════════════════════════════════════════════
// DUAL CHART (x(t) + compare signal)
// ═══════════════════════════════════════════════════════════════
const DualMiniChart = ({
    fn, fn2 = null, tRange = [-5, 5],
    color = "#22d3ee", color2 = "hsl(25,90%,55%)",
    label = "x(t)", label2 = "x₂(t)", height = 220,
}: {
    fn: (t: number) => number;
    fn2?: ((t: number) => number) | null;
    tRange?: [number, number];
    color?: string; color2?: string;
    label?: string; label2?: string;
    height?: number;
}) => {
    const data = useMemo(() => {
        const pts: { t: number; y: number; y2?: number }[] = [];
        const [tMin, tMax] = tRange;
        const N = 600;
        for (let i = 0; i <= N; i++) {
            const t = tMin + (i / N) * (tMax - tMin);
            let y = fn(t);
            if (!isFinite(y)) y = 0;
            const pt: { t: number; y: number; y2?: number } = {
                t: Math.round(t * 100) / 100,
                y: Math.round(y * 10000) / 10000,
            };
            if (fn2) {
                let y2 = fn2(t);
                if (!isFinite(y2)) y2 = 0;
                pt.y2 = Math.round(y2 * 10000) / 10000;
            }
            pts.push(pt);
        }
        return pts;
    }, [fn, fn2, tRange]);

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#888" }} tickCount={11} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip
                        contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        labelFormatter={(v) => `t = ${v}`}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                    <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} name={label} />
                    {fn2 && <Line type="monotone" dataKey="y2" stroke={color2} strokeWidth={2} dot={false} name={label2} strokeDasharray="6 3" />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Legacy alias
const MiniChart = (props: Parameters<typeof DualMiniChart>[0]) => <DualMiniChart {...props} />;

// ═══════════════════════════════════════════════════════════════
// TEXT→FUNCTION PARSER
// ═══════════════════════════════════════════════════════════════
const parseExpression = (expr: string): ((t: number) => number) | null => {
    try {
        const body = `
            const u = (x) => x > 0 ? 1 : x === 0 ? 0.5 : 0;
            const sgn = (x) => x > 0 ? 1 : x < 0 ? -1 : 0;
            const rect = (x) => Math.abs(x) <= 0.5 ? 1 : 0;
            const tri = (x) => Math.abs(x) <= 1 ? 1 - Math.abs(x) : 0;
            const sin = Math.sin, cos = Math.cos, exp = Math.exp;
            const abs = Math.abs, sqrt = Math.sqrt, log = Math.log;
            const pi = Math.PI, PI = Math.PI;
            const pow = Math.pow;
            return ${expr};
        `;
        const fn = new Function("t", body) as (t: number) => number;
        fn(0); // test
        return fn;
    } catch {
        return null;
    }
};

// ═══════════════════════════════════════════════════════════════
// LOCAL ENERGY / POWER / FREQUENCY COMPUTATION
// ═══════════════════════════════════════════════════════════════
const computeLocalAnalysis = (fn: (t: number) => number) => {
    const N = 10000;
    const tMin = -10, tMax = 10;
    const dt = (tMax - tMin) / N;

    let energy = 0;
    for (let i = 0; i <= N; i++) {
        const t = tMin + i * dt;
        const y = fn(t);
        if (isFinite(y)) energy += y * y * dt;
    }

    const T = tMax - tMin;
    const power = energy / T;

    // Periodicity via autocorrelation
    const samples: number[] = [];
    const sN = 2000;
    const sDt = T / sN;
    let mean = 0;
    for (let i = 0; i <= sN; i++) {
        const t = tMin + i * sDt;
        const y = fn(t);
        samples.push(isFinite(y) ? y : 0);
        mean += samples[i];
    }
    mean /= (sN + 1);
    for (let i = 0; i <= sN; i++) samples[i] -= mean;

    let period: number | null = null;
    let frequency: number | null = null;
    let isPeriodic = false;

    // Normalized autocorrelation
    let r0 = 0;
    for (let i = 0; i <= sN; i++) r0 += samples[i] * samples[i];
    if (r0 > 1e-10) {
        const maxLag = Math.floor(sN / 2);
        for (let lag = 2; lag < maxLag; lag++) {
            let rLag = 0;
            for (let i = 0; i <= sN - lag; i++) rLag += samples[i] * samples[i + lag];
            const normalized = rLag / r0;
            // Check if it's a peak and above threshold
            if (normalized > 0.5) {
                let rPrev = 0;
                for (let i = 0; i <= sN - (lag - 1); i++) rPrev += samples[i] * samples[i + lag - 1];
                const nPrev = rPrev / r0;
                if (normalized > nPrev) {
                    period = lag * sDt;
                    frequency = 1.0 / period;
                    isPeriodic = true;
                    break;
                }
            }
        }
    }

    // ── Apply theoretical rules ──
    let finalEnergy: string | number;
    let finalPower: number;
    const sigType = isPeriodic ? "periodic" : "transient";

    if (isPeriodic && period) {
        // Periodic: E = ∞, P = average over one detected period
        let powerPeriod = 0;
        const pN = 2000;
        const pDt = period / pN;
        for (let i = 0; i <= pN; i++) {
            const t = i * pDt;
            const y = fn(t);
            if (isFinite(y)) powerPeriod += y * y * pDt;
        }
        finalPower = Math.round((powerPeriod / period) * 10000) / 10000;
        finalEnergy = "∞";
    } else {
        // Transient: E = finite, P = 0
        finalEnergy = Math.round(energy * 10000) / 10000;
        finalPower = 0;
    }

    return {
        energy: finalEnergy,
        power: finalPower,
        is_periodic: isPeriodic,
        sig_type: sigType,
        period: period ? Math.round(period * 10000) / 10000 : null,
        frequency: frequency ? Math.round(frequency * 10000) / 10000 : null,
    };
};

// ═══════════════════════════════════════════════════════════════
// MAIN SIGNAL LAB PAGE
// ═══════════════════════════════════════════════════════════════
const SignalLab = () => {
    // Builder state
    const [blocks, setBlocks] = useState<SignalBlock[]>([]);
    const [operators, setOperators] = useState<string[]>([]);
    const [useTextMode, setUseTextMode] = useState(false);
    const [textExpr, setTextExpr] = useState("rect(2*t)");

    // Compare signal (Feature 2)
    const [compareExpr, setCompareExpr] = useState<string | null>(null);
    const [showPresets, setShowPresets] = useState(false);

    // Verification overlays (Feature 1) — key: basis name, value: true = show overlay
    const [verifyOverlays, setVerifyOverlays] = useState<Record<string, boolean>>({});
    const toggleVerify = (basis: string) =>
        setVerifyOverlays((prev) => ({ ...prev, [basis]: !prev[basis] }));

    // Quiz state (Feature 3)
    const [activeTab, setActiveTab] = useState<"builder" | "quiz">("builder");
    const [quizSignal, setQuizSignal] = useState<any>(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState({ fn: "", amplitude: "1", frequency: "1" });
    const [quizResult, setQuizResult] = useState<any>(null);
    const [quizCheckLoading, setQuizCheckLoading] = useState(false);

    // Analysis state
    const [loading, setLoading] = useState(false);
    const [localCalc, setLocalCalc] = useState<any>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Collapsed sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        builder: true, calc: true, demo: false, reform: false,
    });
    const toggleSection = (key: string) =>
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

    // ─── Block management ────────────────────────────────────
    const addBlock = (palette: (typeof BLOCK_PALETTE)[0]) => {
        const newBlock: SignalBlock = {
            id: `blk-${++blockIdCounter}`, type: palette.type,
            label: palette.label, color: palette.color,
            amplitude: 1, shift: 0, scale: 1, squared: false, fn: palette.fn,
        };
        setBlocks((prev) => [...prev, newBlock]);
        if (blocks.length > 0) setOperators((prev) => [...prev, "add"]);
    };

    const removeBlock = (index: number) => {
        setBlocks((prev) => prev.filter((_, i) => i !== index));
        setOperators((prev) => {
            const n = [...prev];
            if (index === 0) n.splice(0, 1); else n.splice(index - 1, 1);
            return n;
        });
    };

    const updateBlock = (i: number, field: "amplitude" | "shift" | "scale", val: number) => {
        setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
    };

    const toggleSquared = (i: number) => {
        setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, squared: !b.squared } : b));
    };

    const updateOperator = (i: number, opId: string) => {
        setOperators((prev) => prev.map((o, idx) => idx === i ? opId : o));
    };

    // ─── Combined signal function ────────────────────────────
    const combinedFn = useCallback((t: number) => {
        if (useTextMode) {
            const fn = parseExpression(textExpr);
            return fn ? fn(t) : 0;
        }
        if (blocks.length === 0) return 0;
        let v0 = blocks[0].fn(t, blocks[0].amplitude, blocks[0].shift, blocks[0].scale);
        let result = blocks[0].squared ? v0 * v0 : v0;
        for (let i = 1; i < blocks.length; i++) {
            const op = OPERATORS.find((o) => o.id === (operators[i - 1] || "add"))!;
            let val = blocks[i].fn(t, blocks[i].amplitude, blocks[i].shift, blocks[i].scale);
            if (blocks[i].squared) val = val * val;
            result = op.apply(result, val);
        }
        return result;
    }, [blocks, operators, useTextMode, textExpr]);

    // ─── Formula string ──────────────────────────────────────
    const formulaStr = useMemo(() => {
        if (useTextMode) return textExpr || "(vide)";
        if (blocks.length === 0) return "(vide)";
        return blocks.map((b, i) => {
            const amp = b.amplitude !== 1 ? `${b.amplitude}·` : "";
            const sc = b.scale !== 1 ? `${b.scale}` : "";
            const sh = b.shift > 0 ? ` + ${b.shift}` : b.shift < 0 ? ` − ${Math.abs(b.shift)}` : "";
            const inner = `${sc}t${sh}`;
            let block = `${amp}${b.label.replace("(t)", `(${inner})`).replace("⁻|ᵗ|", `(-|${inner}|)`)}`;
            if (b.squared) block = `[${block}]²`;
            if (i === 0) return block;
            const opSym = OPERATORS.find((o) => o.id === (operators[i - 1] || "add"))?.symbol || "+";
            return ` ${opSym} ${block}`;
        }).join("");
    }, [blocks, operators, useTextMode, textExpr]);

    // ─── Expression for backend ──────────────────────────────
    const backendExpr = useMemo(() => {
        if (useTextMode) return textExpr;
        if (blocks.length === 0) return "";
        return blocks.map((b, i) => {
            const amp = b.amplitude;
            const sc = b.scale;
            const sh = b.shift;
            let inner = sc !== 1 ? `${sc}*t` : "t";
            if (sh > 0) inner += ` + ${sh}`;
            else if (sh < 0) inner += ` - ${Math.abs(sh)}`;

            let fnCall = "";
            if (b.type === "sin") fnCall = `sin(${inner})`;
            else if (b.type === "cos") fnCall = `cos(${inner})`;
            else if (b.type === "exp") fnCall = `exp(-abs(${inner}))`;
            else if (b.type === "ramp") fnCall = `(${inner})*u(${inner})`;
            else fnCall = `${b.type}(${inner})`;

            if (b.squared) fnCall = `(${fnCall})**2`;
            const block = amp !== 1 ? `${amp}*${fnCall}` : fnCall;
            if (i === 0) return block;
            const opId = operators[i - 1] || "add";
            const opSym = opId === "add" ? "+" : opId === "sub" ? "-" : "*";
            return ` ${opSym} ${block}`;
        }).join("");
    }, [blocks, operators, useTextMode, textExpr]);

    // ─── JS-readable expression for text mode sync ──────────
    const jsExpr = useMemo(() => {
        if (blocks.length === 0) return "";
        return blocks.map((b, i) => {
            const amp = b.amplitude;
            const sc = b.scale;
            const sh = b.shift;
            let inner = sc !== 1 ? `${sc}*t` : "t";
            if (sh > 0) inner += ` + ${sh}`;
            else if (sh < 0) inner += ` - ${Math.abs(sh)}`;

            let fnCall = "";
            if (b.type === "sin") fnCall = `sin(${inner})`;
            else if (b.type === "cos") fnCall = `cos(${inner})`;
            else if (b.type === "exp") fnCall = `exp(-abs(${inner}))`;
            else if (b.type === "ramp") fnCall = `(${inner})*u(${inner})`;
            else fnCall = `${b.type}(${inner})`;

            if (b.squared) fnCall = `Math.pow(${fnCall}, 2)`;
            const block = amp !== 1 ? `${amp}*${fnCall}` : fnCall;
            if (i === 0) return block;
            const opId = operators[i - 1] || "add";
            const opSym = opId === "add" ? " + " : opId === "sub" ? " - " : " * ";
            return `${opSym}${block}`;
        }).join("");
    }, [blocks, operators]);

    const hasSignal = useTextMode ? textExpr.trim().length > 0 : blocks.length > 0;

    // ─── Local energy/power auto-calculation ─────────────────
    useEffect(() => {
        if (!hasSignal) { setLocalCalc(null); return; }
        try {
            const result = computeLocalAnalysis(combinedFn);
            setLocalCalc(result);
        } catch {
            setLocalCalc(null);
        }
    }, [combinedFn, hasSignal]);

    // ─── Run analysis ────────────────────────────────────────
    const runAnalysis = async () => {
        if (!backendExpr) return;
        setLoading(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        try {
            const res = await fetch(`${API_BASE_URL}/ex-lab/demo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expression: backendExpr }),
            });
            const data = await res.json();
            if (data.error) setAnalysisError(data.error);
            else {
                setAnalysisResult(data);
                setExpandedSections((prev) => ({ ...prev, calc: true, demo: true, reform: true }));
            }
        } catch {
            setAnalysisError("Erreur de connexion au serveur. Vérifie que le backend est lancé.");
        }
        setLoading(false);
    };

    // ─── Compare signal function ──────────────────────────────
    const compareFn = useMemo<((t: number) => number) | null>(() => {
        if (!compareExpr) return null;
        return parseExpression(compareExpr);
    }, [compareExpr]);

    // ─── Quiz functions ───────────────────────────────────────
    const startQuiz = async () => {
        setQuizLoading(true);
        setQuizSignal(null);
        setQuizResult(null);
        setQuizAnswer({ fn: "", amplitude: "1", frequency: "1" });
        try {
            const res = await fetch(`${API_BASE_URL}/ex-lab/quiz`, { method: "POST" });
            const data = await res.json();
            setQuizSignal(data);
        } catch {
            setQuizSignal({ error: "Erreur de connexion au backend." });
        }
        setQuizLoading(false);
    };

    const checkQuiz = async () => {
        if (!quizSignal?.id) return;
        setQuizCheckLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/ex-lab/quiz/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: quizSignal.id,
                    answer_fn: quizAnswer.fn,
                    answer_amplitude: parseFloat(quizAnswer.amplitude) || 1,
                    answer_frequency: parseFloat(quizAnswer.frequency) || 1,
                }),
            });
            const data = await res.json();
            setQuizResult(data);
        } catch {
            setQuizResult({ error: "Erreur de connexion." });
        }
        setQuizCheckLoading(false);
    };

    // ─── Section header component ────────────────────────────
    const SectionHeader = ({ id, icon: Icon, title, badge, badgeColor, color }: {
        id: string; icon: any; title: string; badge?: string; badgeColor?: string; color: string;
    }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors rounded-t-xl"
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}20`, color }}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <span className="font-bold text-sm text-foreground">{title}</span>
                {badge && (
                    <Badge variant="outline" className="ml-2 text-[9px]"
                        style={{ color: badgeColor || color, borderColor: `${badgeColor || color}40` }}>
                        {badge}
                    </Badge>
                )}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[id] ? "rotate-180" : ""}`} />
        </button>
    );

    return (
        <div className="min-h-screen relative gradient-animated">
            <WaveBackground />

            <div className="relative z-10">
                {/* Header */}
                <header className="glass-strong sticky top-0 z-20 px-6 py-3 flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Accueil
                    </Link>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-emerald-400" />
                        <h1 className="text-sm font-semibold text-foreground">
                            Labo Signal — Construction & Analyse
                        </h1>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-6 pb-20">
                    {/* Tab switcher */}
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setActiveTab("builder")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "builder"
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                : "text-muted-foreground border border-white/10 hover:border-white/20"
                                }`}>
                            <FlaskConical className="w-4 h-4" /> Laboratoire
                        </button>
                        <button onClick={() => setActiveTab("quiz")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "quiz"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "text-muted-foreground border border-white/10 hover:border-white/20"
                                }`}>
                            <Trophy className="w-4 h-4" /> Mode Quizz
                        </button>
                    </div>

                    {/* Hero */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                {activeTab === "quiz" ? "🎯 Mode Quizz IA" : "🧪 Laboratoire de Signaux"}
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                {activeTab === "quiz"
                                    ? "L'IA génère un signal mystère — identifie la fonction, l'amplitude et la fréquence !"
                                    : "Construis un signal, analyse énergie/puissance, reformule, compare."}
                            </p>
                        </div>
                    </motion.div>

                    {/* ═══ ZONE E: QUIZ (always first in quiz tab) ═══ */}
                    {activeTab === "quiz" && (
                        <GlassCard className="overflow-hidden">
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Signal Mystère</p>
                                        <p className="text-xs text-muted-foreground">L'IA choisit un signal aléatoire — à toi de l'identifier !</p>
                                    </div>
                                    <motion.button onClick={startQuiz} disabled={quizLoading}
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-black disabled:opacity-50">
                                        {quizLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                                        {quizLoading ? "Génération…" : quizSignal ? "Nouveau signal" : "Générer un signal"}
                                    </motion.button>
                                </div>

                                {quizSignal?.error && (
                                    <p className="text-red-400 text-sm">{quizSignal.error}</p>
                                )}

                                {quizSignal && !quizSignal.error && (() => {
                                    const quizFn = parseExpression(quizSignal.display_expr);
                                    return (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-1">
                                                <p className="text-[10px] uppercase text-muted-foreground text-center mb-1 pt-2">Signal mystère — quelle est cette fonction ?</p>
                                                {quizFn
                                                    ? <DualMiniChart fn={quizFn} color="hsl(45,90%,55%)" label="x(t) = ?" height={200} />
                                                    : <p className="text-xs text-red-400 p-4">Erreur d'affichage</p>
                                                }
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-muted-foreground">Fonction</label>
                                                    <select value={quizAnswer.fn} onChange={(e) => setQuizAnswer((prev) => ({ ...prev, fn: e.target.value }))}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                                                        <option value="">-- choisir --</option>
                                                        {["rect", "tri", "sin", "cos", "u", "sgn", "exp"].map((f) => (
                                                            <option key={f} value={f}>{f}(t)</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-muted-foreground">Amplitude A</label>
                                                    <input type="number" value={quizAnswer.amplitude} step="0.5" min="-5" max="5"
                                                        onChange={(e) => setQuizAnswer((prev) => ({ ...prev, amplitude: e.target.value }))}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-muted-foreground">Fréquence / échelle</label>
                                                    <input type="number" value={quizAnswer.frequency} step="0.5" min="0.1" max="10"
                                                        onChange={(e) => setQuizAnswer((prev) => ({ ...prev, frequency: e.target.value }))}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50" />
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <motion.button onClick={checkQuiz} disabled={quizCheckLoading || !quizAnswer.fn}
                                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-purple-500 text-white disabled:opacity-40">
                                                    {quizCheckLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    {quizCheckLoading ? "Vérification…" : "Valider ma réponse"}
                                                </motion.button>
                                            </div>
                                            {quizResult && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    className={`rounded-xl border p-4 space-y-3 ${quizResult.error ? "border-red-500/30 bg-red-500/5"
                                                        : quizResult.correct ? "border-green-500/30 bg-green-500/5"
                                                            : "border-orange-500/30 bg-orange-500/5"
                                                        }`}>
                                                    {quizResult.error
                                                        ? <p className="text-red-400 text-sm">{quizResult.error}</p>
                                                        : (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl">{quizResult.correct ? "🎉" : "🤔"}</span>
                                                                    <p className="font-bold text-sm">{quizResult.correct ? "Correct ! Bravo !" : "Pas tout à fait…"}</p>
                                                                    <span className="ml-auto font-mono text-lg font-bold" style={{ color: quizResult.score >= 80 ? "hsl(140,70%,55%)" : "hsl(25,90%,55%)" }}>
                                                                        {quizResult.score}/100
                                                                    </span>
                                                                </div>
                                                                {!quizResult.correct && (
                                                                    <p className="text-xs font-mono text-cyan-400 bg-black/20 rounded-lg px-3 py-2">
                                                                        Réponse attendue : {quizResult.correct_answer}
                                                                    </p>
                                                                )}
                                                                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono bg-black/20 rounded-lg p-3 max-h-48 overflow-y-auto">{quizResult.explanation}</pre>
                                                            </>
                                                        )
                                                    }
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </GlassCard>
                    )}

                    {/* ═══ ZONE A: SIGNAL BUILDER ═══ */}
                    <GlassCard className="overflow-hidden">
                        <SectionHeader id="builder" icon={Puzzle} title="Construction du signal"
                            badge={useTextMode ? "Mode texte" : "Mode visuel"} badgeColor="hsl(140,70%,55%)"
                            color="hsl(187,100%,55%)" />

                        <AnimatePresence>
                            {expandedSections.builder && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                    <div className="p-4 pt-0 space-y-4">
                                        {/* Mode toggle */}
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setUseTextMode(false)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${!useTextMode ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-white/5 hover:border-white/20"}`}>
                                                <ToggleLeft className="w-3.5 h-3.5" /> Blocs visuels
                                            </button>
                                            <button onClick={() => { if (!useTextMode && jsExpr) setTextExpr(jsExpr); setUseTextMode(true); }}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${useTextMode ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-white/5 hover:border-white/20"}`}>
                                                <ToggleRight className="w-3.5 h-3.5" /> Formule texte
                                            </button>
                                        </div>

                                        {/* Visual blocks mode */}
                                        {!useTextMode && (
                                            <>
                                                {/* Palette */}
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                                                        <Puzzle className="w-3 h-3" /> Palette — cliquer pour ajouter
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {BLOCK_PALETTE.map((bp) => (
                                                            <motion.button key={bp.type} onClick={() => addBlock(bp)}
                                                                whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                                                                className="px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-colors"
                                                                style={{ color: bp.color, borderColor: `${bp.color}40`, background: `${bp.color}10` }}>
                                                                <Plus className="w-3 h-3 inline mr-1 opacity-50" />{bp.label}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Active blocks */}
                                                {blocks.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                                                            <GripVertical className="w-3 h-3" /> Blocs actifs ({blocks.length})
                                                        </p>
                                                        <AnimatePresence mode="popLayout">
                                                            {blocks.map((block, i) => (
                                                                <motion.div key={block.id} layout
                                                                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                                                    transition={{ duration: 0.2 }}>
                                                                    {i > 0 && (
                                                                        <div className="flex items-center justify-center gap-2 py-1">
                                                                            {OPERATORS.map((op) => (
                                                                                <button key={op.id} onClick={() => updateOperator(i - 1, op.id)}
                                                                                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all border ${operators[i - 1] === op.id ? "text-foreground bg-white/15 border-white/30" : "text-muted-foreground border-white/5 hover:border-white/20"}`}>
                                                                                    {op.symbol}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className="rounded-lg border p-3 space-y-2"
                                                                        style={{ borderColor: `${block.color}30`, background: `${block.color}08` }}>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-mono font-bold text-xs" style={{ color: block.color }}>{block.label}</span>
                                                                                <button onClick={() => toggleSquared(i)}
                                                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border transition-all ${block.squared ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "text-muted-foreground border-white/10 hover:border-white/20"}`}>
                                                                                    x²
                                                                                </button>
                                                                            </div>
                                                                            <button onClick={() => removeBlock(i)} className="text-muted-foreground hover:text-red-400 transition-colors p-1" aria-label="Supprimer">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-3">
                                                                            {(["amplitude", "shift", "scale"] as const).map((field) => (
                                                                                <div key={field}>
                                                                                    <label className="text-[9px] uppercase text-muted-foreground block mb-0.5">
                                                                                        {field === "amplitude" ? "Ampl" : field === "shift" ? "Décal" : "Échel"}:{" "}
                                                                                        <span className="text-foreground font-mono">{block[field].toFixed(1)}</span>
                                                                                    </label>
                                                                                    <Slider value={[block[field]]}
                                                                                        onValueChange={(v) => updateBlock(i, field, v[0])}
                                                                                        min={field === "scale" ? 0.1 : field === "shift" ? -5 : -3}
                                                                                        max={field === "scale" ? 5 : field === "shift" ? 5 : 3}
                                                                                        step={0.1} className="w-full" />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                                {blocks.length === 0 && (
                                                    <div className="py-8 text-center text-muted-foreground">
                                                        <Puzzle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                        <p className="text-xs">Clique sur un bloc ci-dessus pour commencer</p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Text mode */}
                                        {useTextMode && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                                    Fonctions disponibles: u(t), sgn(t), rect(t), tri(t), sin(t), cos(t), exp(t), abs(t), sqrt(t), pi
                                                </p>
                                                <input type="text" value={textExpr} onChange={(e) => setTextExpr(e.target.value)}
                                                    placeholder="ex: rect(2*t) + sin(3*t)"
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50" />
                                            </div>
                                        )}

                                        {/* Formula display */}
                                        {hasSignal && (
                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Formule</p>
                                                <p className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wide">
                                                    x(t) = {formulaStr}
                                                </p>
                                            </div>
                                        )}

                                        {/* Live preview chart + compare */}
                                        {hasSignal && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Aperçu en temps réel</p>
                                                    {/* Presets library dropdown */}
                                                    <div className="relative">
                                                        <button onClick={() => setShowPresets((v) => !v)}
                                                            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
                                                            <Library className="w-3 h-3" /> Bibliothèque
                                                        </button>
                                                        {showPresets && (
                                                            <div className="absolute right-0 top-8 z-50 bg-black/90 border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl">
                                                                <p className="text-[9px] uppercase text-muted-foreground mb-2 px-1">Signal de comparaison x₂(t)</p>
                                                                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                                                                    {compareExpr && (
                                                                        <button onClick={() => { setCompareExpr(null); setShowPresets(false); }}
                                                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                                                            ✕ Supprimer la comparaison
                                                                        </button>
                                                                    )}
                                                                    {SIGNAL_PRESETS.map((p) => (
                                                                        <button key={p.expr} onClick={() => { setCompareExpr(p.expr); setShowPresets(false); }}
                                                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-white/5 transition-colors flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                                                                            <span className="text-foreground">{p.label}</span>
                                                                            <span className="text-muted-foreground ml-auto">{p.expr}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {compareExpr && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-1.5">
                                                        <GitCompare className="w-3 h-3 text-orange-400 shrink-0" />
                                                        <p className="text-[10px] text-orange-400 font-mono flex-1">x₂(t) = {compareExpr}</p>
                                                        <button onClick={() => setCompareExpr(null)} className="text-muted-foreground hover:text-red-400 text-xs">✕</button>
                                                    </div>
                                                )}
                                                <DualMiniChart
                                                    fn={combinedFn}
                                                    fn2={compareFn}
                                                    color="hsl(187,100%,55%)"
                                                    color2="hsl(25,90%,55%)"
                                                    label="x(t)"
                                                    label2={compareExpr ? `x₂ = ${compareExpr}` : "x₂(t)"}
                                                    height={220}
                                                />
                                                {compareFn === null && compareExpr && (
                                                    <p className="text-xs text-red-400">⚠️ Formule de comparaison invalide</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    {/* ANALYZE BUTTON + calc + demo + reformulations — builder tab only */}
                    {activeTab === "builder" && (<>

                        {/* ZONE B: LOCAL CALCULATIONS */}
                        {localCalc && hasSignal && (
                            <GlassCard className="overflow-hidden">
                                <SectionHeader id="calc" icon={Calculator} title="Résultats numériques"
                                    badge="Calcul instantané" badgeColor="hsl(140,70%,50%)" color="hsl(45,90%,55%)" />
                                <AnimatePresence>
                                    {expandedSections.calc && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                            <div className="p-4 pt-0 space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {[
                                                        { label: "Énergie E", value: String(localCalc.energy), unit: "J", color: "hsl(45,90%,55%)" },
                                                        { label: "Puissance P", value: String(localCalc.power), unit: "W", color: "hsl(187,100%,55%)" },
                                                        { label: "Périodique", value: localCalc.is_periodic ? "Oui" : "Non", unit: "", color: localCalc.is_periodic ? "hsl(140,70%,55%)" : "hsl(0,70%,55%)" },
                                                        { label: localCalc.is_periodic ? "Fréquence f₀" : "Type", value: localCalc.is_periodic ? `${localCalc.frequency}` : "Transitoire", unit: localCalc.is_periodic ? "Hz" : "", color: "hsl(280,80%,65%)" },
                                                    ].map((item) => (
                                                        <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                                                            <p className="text-lg font-mono font-bold" style={{ color: item.color }}>
                                                                {item.value} <span className="text-xs text-muted-foreground">{item.unit}</span>
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {localCalc.is_periodic && localCalc.period && (
                                                    <div className="rounded-lg border border-white/5 bg-black/10 p-3 text-center">
                                                        <p className="text-xs text-muted-foreground">
                                                            Période T₀ ≈ <span className="font-mono text-foreground">{localCalc.period} s</span>
                                                            {" → "}f₀ ≈ <span className="font-mono text-foreground">{localCalc.frequency} Hz</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        )}

                        {/* ANALYZE BUTTON — AI demo */}
                        {hasSignal && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                <motion.button onClick={runAnalysis} disabled={loading}
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {loading ? "Démonstration en cours…" : "📐 Démonstration mathématique (IA)"}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Error */}
                        {analysisError && (
                            <GlassCard className="p-4 border-red-500/30">
                                <p className="text-red-400 text-sm">{analysisError}</p>
                            </GlassCard>
                        )}

                        {/* ═══ ZONE C: MATHEMATICAL DEMONSTRATION ═══ */}
                        {analysisResult?.ai_demo && (
                            <GlassCard className="overflow-hidden">
                                <SectionHeader id="demo" icon={BookOpen} title="Démonstration mathématique"
                                    badge="IA Gemini" badgeColor="hsl(280,80%,65%)" color="hsl(280,80%,65%)" />
                                <AnimatePresence>
                                    {expandedSections.demo && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                            <div className="p-4 pt-0">
                                                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 max-h-[500px] overflow-y-auto">
                                                    <pre className="text-sm text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed">
                                                        {analysisResult.ai_demo}
                                                    </pre>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        )}

                        {/* ═══ ZONE D: REFORMULATIONS ═══ */}
                        {analysisResult?.reformulations && Object.keys(analysisResult.reformulations).length > 0 && (
                            <GlassCard className="overflow-hidden">
                                <SectionHeader id="reform" icon={Shuffle} title="Test de reformulation"
                                    badge="Peut-on réécrire x(t) ?" badgeColor="hsl(25,90%,55%)" color="hsl(25,90%,55%)" />
                                <AnimatePresence>
                                    {expandedSections.reform && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                            <div className="p-4 pt-0 grid sm:grid-cols-2 gap-3">
                                                {Object.entries(analysisResult.reformulations).map(([basis, data]: [string, any]) => {
                                                    const isPossible = typeof data === "object" ? data.possible : false;
                                                    const formula = typeof data === "object" ? data.formula : null;
                                                    const explanation = typeof data === "object" ? data.explanation : String(data);
                                                    const c = isPossible ? "hsl(140,70%,55%)" : "hsl(0,60%,50%)";
                                                    const showOverlay = verifyOverlays[basis] && isPossible && formula;
                                                    const verifyFn = showOverlay ? parseExpression(formula) : null;
                                                    return (
                                                        <div key={basis} className="rounded-xl border p-3 space-y-2"
                                                            style={{ borderColor: `${c}25`, background: `${c}06` }}>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold font-mono" style={{ color: c }}>
                                                                    En termes de {basis}
                                                                </p>
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPossible ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                                        {isPossible ? "✅ OUI" : "❌ NON"}
                                                                    </span>
                                                                    {isPossible && formula && (
                                                                        <button onClick={() => toggleVerify(basis)}
                                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-all ${verifyOverlays[basis]
                                                                                ? "bg-cyan-500/30 text-cyan-300"
                                                                                : "bg-white/5 text-muted-foreground hover:text-cyan-400"
                                                                                }`}>
                                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                                            {verifyOverlays[basis] ? "Masquer" : "Vérifier"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isPossible && formula && (
                                                                <p className="text-sm font-mono font-bold text-cyan-400 bg-black/20 rounded-lg px-3 py-2">
                                                                    x(t) = {formula}
                                                                </p>
                                                            )}
                                                            <p className="text-[11px] text-foreground/70">{explanation}</p>
                                                            {showOverlay && analysisResult && (
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-muted-foreground">Comparaison graphique :</p>
                                                                    <DualMiniChart
                                                                        fn={combinedFn}
                                                                        fn2={verifyFn}
                                                                        color="hsl(187,100%,55%)"
                                                                        color2="hsl(25,90%,55%)"
                                                                        label="x(t) original"
                                                                        label2={`x(t) via ${basis}`}
                                                                        height={160}
                                                                    />
                                                                    {verifyFn === null && (
                                                                        <p className="text-[10px] text-red-400">⚠️ Formule non parsable localement</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        )}

                    </>) /* end builder-only */}

                </main>
            </div>
        </div>
    );
};

export default SignalLab;
