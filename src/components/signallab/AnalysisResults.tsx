import { motion, AnimatePresence } from "framer-motion";
import { Calculator, BookOpen, Shuffle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { MiniChart } from "@/components/MiniChart";

interface AnalysisResultsProps {
    localCalc: any;
    hasSignal: boolean;
    expandedSections: Record<string, boolean>;
    toggleSection: (key: string) => void;
    SectionHeader: any;
    runAnalysis: () => Promise<void>;
    loading: boolean;
    analysisError: string | null;
    analysisResult: any;
    verifyOverlays: Record<string, boolean>;
    toggleVerify: (basis: string) => void;
    combinedFn: (t: number) => number;
    parseExpression: (expr: string) => ((t: number) => number) | null;
}

export const AnalysisResults = ({
    localCalc,
    hasSignal,
    expandedSections,
    SectionHeader,
    runAnalysis,
    loading,
    analysisError,
    analysisResult,
    verifyOverlays,
    toggleVerify,
    combinedFn,
    parseExpression,
}: AnalysisResultsProps) => {
    return (
        <>
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
                                                        <MiniChart
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
                            </motion.div >
                        )}
                    </AnimatePresence >
                </GlassCard >
            )}
        </>
    );
};
