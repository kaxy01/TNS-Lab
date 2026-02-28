import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Server } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { API_BASE_URL } from "@/config";
import GlassCard from "@/components/GlassCard";
import { MiniChart } from "@/components/MiniChart";
import { u, rect } from "@/utils/mathUtils";
import { Section } from "./Section";
import { InfoBox } from "./InfoBox";
import { Stepper } from "./Stepper";

const fetchEx2Q2 = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/ex2/q2`);
        if (!res.ok) throw new Error("err");
        return await res.json();
    } catch {
        return null;
    }
};

export const Q2 = () => {
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
