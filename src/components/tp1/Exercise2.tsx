import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
import {
    ChevronRight,
    Code2,
    BarChart3,
    FlaskConical,
    Info,
} from "lucide-react";

// ─── Primitive signal functions ──────────────────────────────────────────────
const u = (t: number): number => (t >= 0 ? 1 : 0);
const sgn = (t: number): number => (t > 0 ? 1 : t < 0 ? -1 : 0);
const rect = (t: number): number => (Math.abs(t) <= 0.5 ? 1 : 0);
const delta = (t: number, t0: number, w = 0.04): number =>
    Math.abs(t - t0) < w ? 1 / (2 * w) : 0;



// ─── Signal generators ────────────────────────────────────────────────────────
function generateData(
    fn: (t: number) => number,
    tMin: number,
    tMax: number,
    pts = 800
) {
    const step = (tMax - tMin) / pts;
    return Array.from({ length: pts + 1 }, (_, i) => {
        const t = tMin + i * step;
        const raw = fn(t);
        // clamp extreme spike values for display clarity
        const value = Math.max(-15, Math.min(15, parseFloat(raw.toFixed(5))));
        return { t: parseFloat(t.toFixed(4)), value };
    });
}

// ─── Shared chart colours ─────────────────────────────────────────────────────
const CHART_STYLE = {
    grid: "hsl(230,20%,18%)",
    axis: "hsl(215,20%,45%)",
    tooltip: { background: "hsl(230,25%,10%)", border: "1px solid hsl(230,20%,25%)", borderRadius: 8, fontSize: 12 },
};

// ─── Reusable mini chart ──────────────────────────────────────────────────────
interface MiniChartProps {
    fn: (t: number) => number;
    tRange: [number, number];
    color: string;
    label: string;
    height?: number;
    pts?: number;
}
const MiniChart = ({ fn, tRange, color, label, height = 180, pts = 800 }: MiniChartProps) => {
    const data = useMemo(() => generateData(fn, tRange[0], tRange[1], pts), [fn, tRange, pts]);
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                <XAxis dataKey="t" stroke={CHART_STYLE.axis} tick={{ fontSize: 10 }}
                    label={{ value: "t", position: "insideBottomRight", offset: -4, style: { fill: CHART_STYLE.axis } }} />
                <YAxis stroke={CHART_STYLE.axis} tick={{ fontSize: 10 }} />
                <ReferenceLine x={0} stroke="hsl(215,20%,30%)" strokeWidth={1} />
                <ReferenceLine y={0} stroke="hsl(215,20%,30%)" strokeWidth={1} />
                <Tooltip contentStyle={CHART_STYLE.tooltip}
                    labelFormatter={(v) => `t = ${v}`}
                    formatter={(v: number) => [v.toFixed(4), label]} />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} name={label} />
            </LineChart>
        </ResponsiveContainer>
    );
};

// ─── Python code block ────────────────────────────────────────────────────────
const PyCode = ({ code }: { code: string }) => (
    <div className="rounded-xl overflow-hidden border border-white/10 mt-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-white/10">
            <Code2 className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">Python</span>
        </div>
        <pre className="p-4 text-[13px] font-mono text-foreground/90 leading-relaxed overflow-x-auto bg-black/30">
            {code}
        </pre>
    </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({
    num, title, badge, badgeColor, children,
}: {
    num: string; title: string; badge?: string; badgeColor?: string; children: React.ReactNode;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <GlassCard className="p-5 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: `${badgeColor || "#22d3ee"}22`, color: badgeColor || "#22d3ee" }}
                >
                    {num}
                </div>
                <div>
                    <h3 className="font-bold text-foreground leading-tight">{title}</h3>
                    {badge && (
                        <Badge variant="outline" className="mt-1 text-[10px]" style={{ color: badgeColor, borderColor: `${badgeColor}50` }}>
                            {badge}
                        </Badge>
                    )}
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

// ═════════════════════════════════════════════════════════════════════════════
// QUESTION 1 — U(t) = f(sgn(t))
// ═════════════════════════════════════════════════════════════════════════════
const Q1 = () => {
    // U(t) = (1 + sgn(t)) / 2
    const uFromSgn = (t: number) => (1 + sgn(t)) / 2;

    return (
        <Section
            num="Q1"
            title="Exprimer U(t) en fonction de sgn(t) seulement"
            badge="Signaux fondamentaux"
            badgeColor="hsl(187,100%,55%)"
        >
            <InfoBox>
                La fonction signe est définie par : sgn(t) = +1 si t {">"} 0, −1 si t {"<"} 0, 0 si t = 0.{" "}
                On exprime l'échelon unité à partir de sgn(t) par la relation :{" "}
                <strong>U(t) = ½ · (1 + sgn(t))</strong>
            </InfoBox>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-2xl font-mono font-bold text-neon-cyan tracking-wider">
                    U(t) = ½ · (1 + sgn(t))
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Démonstration : quand t {">"} 0 → (1+1)/2 = 1 ✓ · quand t {"<"} 0 → (1−1)/2 = 0 ✓
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <GlassCard className="p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">sgn(t)</p>
                    <MiniChart fn={sgn} tRange={[-3, 3]} color="hsl(280,80%,65%)" label="sgn(t)" />
                </GlassCard>
                <GlassCard className="p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">U(t) reconstruit via sgn(t)</p>
                    <MiniChart fn={uFromSgn} tRange={[-3, 3]} color="hsl(187,100%,55%)" label="U(t)" />
                </GlassCard>
            </div>

            <PyCode
                code={`import numpy as np

def sgn(t):
    """Fonction signe : sgn(t) = t / |t| pour t != 0"""
    return np.sign(t)

def u_from_sgn(t):
    """Echelon unité exprimé via sgn(t)
    
    Formule : U(t) = (1 + sgn(t)) / 2
    
    Vérification :
      t > 0  →  (1 + 1) / 2 = 1  ✓
      t < 0  →  (1 - 1) / 2 = 0  ✓
      t = 0  →  (1 + 0) / 2 = 0.5  (convention Heaviside)
    """
    return (1 + sgn(t)) / 2

# Test
t = np.linspace(-3, 3, 1000)
u = u_from_sgn(t)
print(u_from_sgn(-1))  # → 0.0
print(u_from_sgn(0))   # → 0.5
print(u_from_sgn(1))   # → 1.0`}
            />
        </Section>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// QUESTION 2 — Rect(2t) = f(U(t))
// ═════════════════════════════════════════════════════════════════════════════
const Q2 = () => {
    // Rect(2t) = 1 pour |2t| ≤ 0.5  ⟺  |t| ≤ 0.25
    // → Rect(2t) = U(t + 0.25) − U(t − 0.25)
    const rectFromU = (t: number) => u(t + 0.25) - u(t - 0.25);
    const rectDirect = (t: number) => rect(2 * t);

    return (
        <Section
            num="Q2"
            title="Exprimer x₁(t) = Rect(2t) en fonction de U(t) seulement"
            badge="Décomposition en échelons"
            badgeColor="hsl(45,90%,55%)"
        >
            <InfoBox>
                On sait que Rect(t) = U(t + ½) − U(t − ½). En remplaçant t par 2t :{" "}
                <strong>Rect(2t) = U(t + ¼) − U(t − ¼)</strong>. En effet, Rect(2t) = 1 lorsque |2t| ≤ ½,
                soit |t| ≤ ¼.
            </InfoBox>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
                    Rect(2t) = U(t + ¼) − U(t − ¼)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Support : t ∈ [−0.25, +0.25]
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <GlassCard className="p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Rect(2t) — direct</p>
                    <MiniChart fn={rectDirect} tRange={[-1, 1]} color="hsl(45,90%,55%)" label="Rect(2t)" />
                </GlassCard>
                <GlassCard className="p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">U(t+¼) − U(t−¼) — reconstruit</p>
                    <MiniChart fn={rectFromU} tRange={[-1, 1]} color="hsl(140,70%,55%)" label="U(t+¼)−U(t−¼)" />
                </GlassCard>
            </div>

            <PyCode
                code={`import numpy as np

def u(t):
    """Echelon unité (Heaviside)"""
    return np.where(t >= 0, 1.0, 0.0)

def rect_from_u(t):
    """Rect(2t) exprimé via U(t) seulement.
    
    Démonstration :
      Rect(t)  = U(t + 1/2) - U(t - 1/2)
      
      Substitution t → 2t :
      Rect(2t) = U(2t + 1/2) - U(2t - 1/2)
               = U(t + 1/4) - U(t - 1/4)   ← en factorisant par 2
      
    Vérification du support :
      Rect(2t) = 1  ⟺  |2t| ≤ 1/2  ⟺  |t| ≤ 1/4
    """
    return u(t + 0.25) - u(t - 0.25)

# Vérification numérique
t_test = np.array([-0.5, -0.25, 0.0, 0.25, 0.5])
print("Rect(2t)     :", np.where(np.abs(2*t_test) <= 0.5, 1, 0))
print("Reconstruit  :", rect_from_u(t_test).astype(int))`}
            />
        </Section>
    );
};



// ═════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const Exercise2 = () => (
    <div className="space-y-6 pb-20">
        <header>
            <h2 className="text-2xl font-bold">Exercice 2 — Relations entre signaux & Dirac</h2>
            <p className="text-sm text-muted-foreground">
                TP Traitement du Signal — Décomposition en signaux primitifs & propriété de prélèvement
            </p>
        </header>

        <div className="grid gap-6">
            <Q1 />
            <Q2 />

        </div>
    </div>
);

export default Exercise2;