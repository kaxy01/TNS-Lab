import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Loader2, HelpCircle, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { MiniChart } from "@/components/MiniChart";

interface QuizTabProps {
    startQuiz: () => Promise<void>;
    quizLoading: boolean;
    quizSignal: any;
    quizAnswer: { fn: string; amplitude: string; frequency: string };
    setQuizAnswer: React.Dispatch<React.SetStateAction<{ fn: string; amplitude: string; frequency: string }>>;
    checkQuiz: () => Promise<void>;
    quizCheckLoading: boolean;
    quizResult: any;
    parseExpression: (expr: string) => ((t: number) => number) | null;
}

export const QuizTab = ({
    startQuiz,
    quizLoading,
    quizSignal,
    quizAnswer,
    setQuizAnswer,
    checkQuiz,
    quizCheckLoading,
    quizResult,
    parseExpression,
}: QuizTabProps) => {
    return (
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
                                    ? <MiniChart fn={quizFn} color="hsl(45,90%,55%)" label="x(t) = ?" height={200} />
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
                            )
                            }
                        </div>
                    );
                })()}
            </div>
        </GlassCard >
    );
};
