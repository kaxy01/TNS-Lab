import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Server } from "lucide-react";
import { API_BASE_URL } from "@/config";
import GlassCard from "@/components/GlassCard";
import { MiniChart } from "@/components/MiniChart";
import { sgn } from "@/utils/mathUtils";
import { Section } from "./Section";
import { InfoBox } from "./InfoBox";
import { Stepper } from "./Stepper";

const fetchEx2Q1 = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/ex2/q1`);
        if (!res.ok) throw new Error("err");
        return await res.json();
    } catch {
        return null;
    }
};

export const Q1 = () => {
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
