import { useState, useMemo, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Info,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Server,
} from "lucide-react";

// ─── Primitive signal functions ──────────────────────────────────────────────
const u = (t: number): number => (t >= 0 ? 1 : 0);
const sgn = (t: number): number => (t > 0 ? 1 : t < 0 ? -1 : 0);
const rect = (t: number): number => (Math.abs(t) <= 0.5 ? 1 : 0);

// ─── Shared chart colours ─────────────────────────────────────────────────────
const CHART_STYLE = {
    grid: "hsl(230,20%,18%)",
    axis: "hsl(215,20%,45%)",
    tooltip: {
        background: "hsl(230,25%,10%)",
        border: "1px solid hsl(230,20%,25%)",
        borderRadius: 8,
        fontSize: 12,
    },
};

// ─── Backend fetchers ─────────────────────────────────────────────────────────
const fetchEx2Q1 = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/ex2/q1`);
        if (!res.ok) throw new Error("err");
        return await res.json();
    } catch {
        return null;
    }
};

const fetchEx2Q2 = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/ex2/q2`);
        if (!res.ok) throw new Error("err");
        return await res.json();
    } catch {
        return null;
    }
};


// ─── Enhanced MiniChart ───────────────────────────────────────────────────────
interface MiniChartProps {
    fn: (t: number) => number;
    tRange: [number, number];
    color: string;
    label: string;
    height?: number;
    pts?: number;
    overlayFn?: (t: number) => number;
    overlayColor?: string;
    overlayLabel?: string;
}

const MiniChart = ({
    fn,
    tRange,
    color,
    label,
    height = 180,
    pts = 800,
    overlayFn,
    overlayColor,
    overlayLabel,
}: MiniChartProps) => {
    const [showOverlay, setShowOverlay] = useState(true);

    const data = useMemo(() => {
        const step = (tRange[1] - tRange[0]) / pts;
        return Array.from({ length: pts + 1 }, (_, i) => {
            const t = tRange[0] + i * step;
            const raw = fn(t);
            const value = Math.max(-15, Math.min(15, parseFloat(raw.toFixed(5))));
            const point: Record<string, number> = {
                t: parseFloat(t.toFixed(4)),
                value,
            };
            if (overlayFn) {
                const ov = overlayFn(t);
                point.overlay = Math.max(-15, Math.min(15, parseFloat(ov.toFixed(5))));
            }
            return point;
        });
    }, [fn, tRange, pts, overlayFn]);

    return (
        <div className="relative" aria-label={`Graphique: ${label}`}>
            {overlayFn && (
                <div className="absolute top-1 right-1 z-10">
                    <button
                        onClick={() => setShowOverlay(!showOverlay)}
                        className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${showOverlay
                            ? "bg-white/15 text-foreground"
                            : "bg-black/30 text-muted-foreground"
                            }`}
                        aria-label={
                            showOverlay ? "Masquer superposition" : "Afficher superposition"
                        }
                    >
                        {showOverlay ? "Overlay ✓" : "Overlay"}
                    </button>
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                    <XAxis
                        dataKey="t"
                        stroke={CHART_STYLE.axis}
                        tick={{ fontSize: 10 }}
                        label={{
                            value: "t",
                            position: "insideBottomRight",
                            offset: -4,
                            style: { fill: CHART_STYLE.axis },
                        }}
                    />
                    <YAxis stroke={CHART_STYLE.axis} tick={{ fontSize: 10 }} />
                    <ReferenceLine x={0} stroke="hsl(215,20%,30%)" strokeWidth={1} />
                    <ReferenceLine y={0} stroke="hsl(215,20%,30%)" strokeWidth={1} />
                    <Tooltip
                        contentStyle={CHART_STYLE.tooltip}
                        labelFormatter={(v) => `t = ${v}`}
                        formatter={(v: number, name: string) => [v.toFixed(4), name]}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        name={label}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                    {overlayFn && showOverlay && (
                        <Line
                            type="monotone"
                            dataKey="overlay"
                            stroke={overlayColor || "#ffffff"}
                            strokeWidth={2}
                            dot={false}
                            name={overlayLabel || "Overlay"}
                            strokeDasharray="5 5"
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({
    num,
    title,
    badge,
    badgeColor,
    children,
    pythonVerified,
    sectionId,
}: {
    num: string;
    title: string;
    badge?: string;
    badgeColor?: string;
    children: React.ReactNode;
    pythonVerified?: boolean;
    sectionId?: string;
}) => (
    <motion.div
        id={sectionId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <GlassCard className="p-5 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                        background: `${badgeColor || "#22d3ee"}22`,
                        color: badgeColor || "#22d3ee",
                    }}
                >
                    {num}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-foreground leading-tight">{title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {badge && (
                            <Badge
                                variant="outline"
                                className="text-[10px]"
                                style={{
                                    color: badgeColor,
                                    borderColor: `${badgeColor}50`,
                                }}
                            >
                                {badge}
                            </Badge>
                        )}
                        {pythonVerified && (
                            <Badge
                                variant="outline"
                                className="text-[10px] gap-1"
                                style={{
                                    color: "hsl(140,70%,50%)",
                                    borderColor: "hsl(140,70%,50%,0.3)",
                                }}
                            >
                                <Server className="w-2.5 h-2.5" />
                                Vérifié par Python ✓
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            {children}
        </GlassCard>
    </motion.div>
);

// ─── Info box ─────────────────────────────────────────────────────────────────
const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
);

// ─── Stepper (pas-à-pas) ──────────────────────────────────────────────────────
interface StepperProps {
    steps: { title: string; content: React.ReactNode }[];
    color: string;
}

const Stepper = ({ steps, color }: StepperProps) => {
    const [step, setStep] = useState(0);

    return (
        <div className="space-y-3">
            {/* Step indicators */}
            <div className="flex items-center gap-2 flex-wrap">
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${i === step
                            ? "text-white scale-110"
                            : i < step
                                ? "text-foreground/80"
                                : "text-muted-foreground"
                            }`}
                        style={
                            i === step
                                ? {
                                    background: color,
                                    boxShadow: `0 0 12px ${color}60`,
                                }
                                : i < step
                                    ? { background: `${color}30` }
                                    : { background: "hsl(230,20%,18%)" }
                        }
                        aria-label={`Étape ${i + 1}: ${s.title}`}
                        aria-current={i === step ? "step" : undefined}
                    >
                        {i < step ? "✓" : i + 1}
                    </button>
                ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="p-3 rounded-lg border border-white/10 bg-black/20">
                        <p
                            className="text-xs font-bold uppercase tracking-wider mb-2"
                            style={{ color }}
                        >
                            {steps[step].title}
                        </p>
                        <div className="text-sm text-foreground/80">
                            {steps[step].content}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-2">
                <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs font-medium disabled:opacity-30 transition-all hover:bg-white/10"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Précédent
                </button>
                <button
                    onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                    disabled={step === steps.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs font-medium disabled:opacity-30 transition-all hover:bg-white/10"
                >
                    Suivant
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

// ─── Flow diagram ─────────────────────────────────────────────────────────────
const FlowDiagram = () => (
    <div
        className="flex items-center justify-center gap-2 py-3 flex-wrap"
        role="img"
        aria-label="Chaîne de transformation : sgn(t) vers U(t) vers Rect(2t)"
    >
        <div className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-sm font-bold">
            sgn(t)
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 font-mono text-sm font-bold">
            U(t) = ½(1+sgn)
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-mono text-sm font-bold">
            Rect(2t)
        </div>
    </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// QUESTION 1 — U(t) = f(sgn(t))
// ═════════════════════════════════════════════════════════════════════════════
const Q1 = () => {
    const uFromSgn = useCallback((t: number) => (1 + sgn(t)) / 2, []);
    const [backendData, setBackendData] = useState<any>(null);

    useEffect(() => {
        fetchEx2Q1().then(setBackendData);
    }, []);

    const q1Steps = useMemo(
        () => [
            {
                title: "Étape 1 — Définir sgn(t)",
                content: (
                    <p>
                        La fonction signe est définie par :{" "}
                        <strong className="font-mono">
                            sgn(t) = +1 si t {">"} 0, −1 si t {"<"} 0, 0 si t = 0
                        </strong>
                    </p>
                ),
            },
            {
                title: "Étape 2 — Écrire la relation",
                content: (
                    <p>
                        On cherche U(t) en fonction de sgn(t) uniquement.
                        On remarque que :{" "}
                        <strong className="font-mono text-neon-cyan">
                            U(t) = ½ · (1 + sgn(t))
                        </strong>
                    </p>
                ),
            },
            {
                title: "Étape 3 — Vérifier",
                content: (
                    <ul className="space-y-1 text-sm">
                        <li>
                            • t {">"} 0 : sgn(t) = +1 → U(t) = (1+1)/2 ={" "}
                            <strong className="text-green-400">1</strong> ✓
                        </li>
                        <li>
                            • t {"<"} 0 : sgn(t) = −1 → U(t) = (1−1)/2 ={" "}
                            <strong className="text-green-400">0</strong> ✓
                        </li>
                        <li>
                            • t = 0 : sgn(t) = 0 → U(t) = (1+0)/2 ={" "}
                            <strong className="text-yellow-400">0.5</strong>{" "}
                            (convention Heaviside)
                        </li>
                    </ul>
                ),
            },
        ],
        []
    );

    return (
        <Section
            num="Q1"
            title="Exprimer U(t) en fonction de sgn(t) seulement"
            badge="Signaux fondamentaux"
            badgeColor="hsl(187,100%,55%)"
            pythonVerified={!!backendData}
            sectionId="section-q1"
        >
            <InfoBox>
                La fonction signe est définie par : sgn(t) = +1 si t {">"} 0, −1
                si t {"<"} 0, 0 si t = 0.{" "}
                On exprime l'échelon unité à partir de sgn(t) par la relation :{" "}
                <strong>U(t) = ½ · (1 + sgn(t))</strong>
            </InfoBox>

            {/* Step-by-step demo */}
            <Stepper steps={q1Steps} color="hsl(187,100%,55%)" />

            {/* Formula card */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-2xl font-mono font-bold text-neon-cyan tracking-wider">
                    U(t) = ½ · (1 + sgn(t))
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Démonstration : quand t {">"} 0 → (1+1)/2 = 1 ✓ · quand t{" "}
                    {"<"} 0 → (1−1)/2 = 0 ✓
                </p>
            </div>

            {/* Overlay chart — both signals on same axes */}
            <GlassCard className="p-3 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    sgn(t) et U(t) superposés
                </p>
                <MiniChart
                    fn={sgn}
                    tRange={[-3, 3]}
                    color="hsl(280,80%,65%)"
                    label="sgn(t)"
                    overlayFn={uFromSgn}
                    overlayColor="hsl(187,100%,55%)"
                    overlayLabel="U(t)"
                    height={200}
                />
            </GlassCard>

            {/* Side-by-side charts with mobile carousel */}
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-2 md:pb-0">
                <GlassCard className="p-3 snap-center min-w-[80vw] md:min-w-0 shrink-0 md:shrink">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        sgn(t)
                    </p>
                    <MiniChart
                        fn={sgn}
                        tRange={[-3, 3]}
                        color="hsl(280,80%,65%)"
                        label="sgn(t)"
                    />
                </GlassCard>
                <GlassCard className="p-3 snap-center min-w-[80vw] md:min-w-0 shrink-0 md:shrink">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        U(t) reconstruit via sgn(t)
                    </p>
                    <MiniChart
                        fn={uFromSgn}
                        tRange={[-3, 3]}
                        color="hsl(187,100%,55%)"
                        label="U(t)"
                    />
                </GlassCard>
            </div>

            {/* Backend verification */}
            {backendData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 space-y-1"
                >
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-3 h-3" />
                        Vérification Python (NumPy)
                    </p>
                    <p className="text-xs text-foreground/70 font-mono">
                        Formule : {backendData.formula}
                    </p>
                    <div className="text-xs text-foreground/60 font-mono space-y-0.5">
                        {backendData.verification &&
                            Object.entries(backendData.verification).map(
                                ([key, val]: [string, any]) => (
                                    <p key={key}>
                                        {key}: U_reconstruit = {val.u_reconstruit}{" "}
                                        (attendu: {val.attendu}){" "}
                                        {val.u_reconstruit === val.attendu ? "✓" : "✗"}
                                    </p>
                                )
                            )}
                    </div>
                </motion.div>
            )}
        </Section>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// QUESTION 2 — Rect(αt) = f(U(t)) — with parameterized slider
// ═════════════════════════════════════════════════════════════════════════════
const Q2 = () => {
    const [alpha, setAlpha] = useState(2);
    const [backendData, setBackendData] = useState<any>(null);

    useEffect(() => {
        fetchEx2Q2().then(setBackendData);
    }, []);

    const halfWidth = useMemo(() => 1 / (2 * alpha), [alpha]);

    const rectAlphaT = useCallback(
        (t: number) => rect(alpha * t),
        [alpha]
    );

    const rectFromU = useCallback(
        (t: number) => u(t + halfWidth) - u(t - halfWidth),
        [halfWidth]
    );

    const q2Steps = useMemo(
        () => [
            {
                title: "Étape 1 — Rappel : Rect(t)",
                content: (
                    <p>
                        Par définition :{" "}
                        <strong className="font-mono">
                            Rect(t) = U(t + ½) − U(t − ½)
                        </strong>
                        . C'est un signal valant 1 sur [−½, +½] et 0 ailleurs.
                    </p>
                ),
            },
            {
                title: "Étape 2 — Substituer t par αt",
                content: (
                    <p>
                        On remplace t par αt :{" "}
                        <strong className="font-mono">
                            Rect(αt) = U(αt + ½) − U(αt − ½)
                        </strong>
                    </p>
                ),
            },
            {
                title: "Étape 3 — Simplifier",
                content: (
                    <p>
                        En factorisant par α :{" "}
                        <strong className="font-mono text-yellow-400">
                            Rect(αt) = U(t + 1/(2α)) − U(t − 1/(2α))
                        </strong>
                    </p>
                ),
            },
            {
                title: "Étape 4 — Vérifier le support",
                content: (
                    <p>
                        Rect(αt) = 1 ⟺ |αt| ≤ ½ ⟺ |t| ≤ 1/(2α).
                        <br />
                        Pour α = 2 : support = [−0.25, +0.25] ✓
                    </p>
                ),
            },
        ],
        []
    );

    return (
        <Section
            num="Q2"
            title="Exprimer x₁(t) = Rect(αt) en fonction de U(t) seulement"
            badge="Décomposition en échelons"
            badgeColor="hsl(45,90%,55%)"
            pythonVerified={!!backendData}
            sectionId="section-q2"
        >
            <InfoBox>
                On sait que Rect(t) = U(t + ½) − U(t − ½). En remplaçant t par
                αt :{" "}
                <strong>
                    Rect(αt) = U(t + 1/(2α)) − U(t − 1/(2α))
                </strong>
                . En effet, Rect(αt) = 1 lorsque |αt| ≤ ½, soit |t| ≤ 1/(2α).
            </InfoBox>

            {/* Step-by-step demo */}
            <Stepper steps={q2Steps} color="hsl(45,90%,55%)" />

            {/* Parameterized slider */}
            <GlassCard className="p-4 space-y-3" aria-label="Contrôle du paramètre alpha">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                        Paramètre α (compression)
                    </p>
                    <span className="font-mono text-lg font-bold text-yellow-400">
                        α = {alpha.toFixed(1)}
                    </span>
                </div>
                <Slider
                    value={[alpha]}
                    onValueChange={(vals) => setAlpha(vals[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-full"
                    aria-label="Valeur de alpha"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>0.5</span>
                    <span>Largeur support : ±{halfWidth.toFixed(3)}</span>
                    <span>5.0</span>
                </div>
            </GlassCard>

            {/* Formula card — dynamic */}
            <motion.div
                key={alpha}
                initial={{ opacity: 0.5, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-white/10 bg-black/20 p-4 text-center"
            >
                <p className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
                    Rect({alpha.toFixed(1)}t) = U(t + {halfWidth.toFixed(3)}) − U(t −{" "}
                    {halfWidth.toFixed(3)})
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Support : t ∈ [−{halfWidth.toFixed(3)}, +{halfWidth.toFixed(3)}]
                </p>
            </motion.div>

            {/* Overlay chart — both signals on same axes */}
            <GlassCard className="p-3 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Rect({alpha.toFixed(1)}t) direct vs reconstruit via U(t)
                </p>
                <MiniChart
                    fn={rectAlphaT}
                    tRange={[-1.5, 1.5]}
                    color="hsl(45,90%,55%)"
                    label={`Rect(${alpha.toFixed(1)}t)`}
                    overlayFn={rectFromU}
                    overlayColor="hsl(140,70%,55%)"
                    overlayLabel="Reconstruit via U(t)"
                    height={200}
                />
            </GlassCard>

            {/* Side-by-side charts with mobile carousel */}
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-2 md:pb-0">
                <GlassCard className="p-3 snap-center min-w-[80vw] md:min-w-0 shrink-0 md:shrink">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        Rect({alpha.toFixed(1)}t) — direct
                    </p>
                    <MiniChart
                        fn={rectAlphaT}
                        tRange={[-1.5, 1.5]}
                        color="hsl(45,90%,55%)"
                        label={`Rect(${alpha.toFixed(1)}t)`}
                    />
                </GlassCard>
                <GlassCard className="p-3 snap-center min-w-[80vw] md:min-w-0 shrink-0 md:shrink">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        U(t+{halfWidth.toFixed(3)}) − U(t−{halfWidth.toFixed(3)}) — reconstruit
                    </p>
                    <MiniChart
                        fn={rectFromU}
                        tRange={[-1.5, 1.5]}
                        color="hsl(140,70%,55%)"
                        label={`U(t+${halfWidth.toFixed(3)})−U(t−${halfWidth.toFixed(3)})`}
                    />
                </GlassCard>
            </div>

            {/* Backend verification */}
            {backendData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 space-y-1"
                >
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-3 h-3" />
                        Vérification Python (NumPy) — α = 2
                    </p>
                    <p className="text-xs text-foreground/70 font-mono">
                        Formule : {backendData.formula}
                    </p>
                    <p className="text-xs text-foreground/60 font-mono">
                        Différence max entre les méthodes :{" "}
                        <strong className="text-green-400">
                            {backendData.max_difference?.toExponential(2)}
                        </strong>
                    </p>
                    <p className="text-xs text-foreground/60 font-mono">
                        Identiques :{" "}
                        {backendData.identical ? (
                            <span className="text-green-400">OUI ✓</span>
                        ) : (
                            <span className="text-red-400">NON ✗</span>
                        )}
                    </p>
                </motion.div>
            )}
        </Section>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// SECTION THEME COLORS (for ambient gradient)
// ═════════════════════════════════════════════════════════════════════════════

const SECTION_THEMES = [
    { id: "q1", hue: 187 },        // cyan
    { id: "q2", hue: 45 },         // yellow
];

// ═════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const Exercise2 = () => (
    <div className="space-y-6 pb-20">
        <header>
            <h2 className="text-2xl font-bold">
                Exercice 2 — Relations entre signaux & Dirac
            </h2>
            <p className="text-sm text-muted-foreground">
                TP Traitement du Signal — Décomposition en signaux primitifs &
                propriété de prélèvement
            </p>
        </header>

        {/* Signal flow diagram */}
        <FlowDiagram />

        <div className="grid gap-6">
            <Q1 />
            <Q2 />
        </div>
    </div>
);

export default Exercise2;