import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, Library, GitCompare, Puzzle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { MiniChart } from "@/components/MiniChart";

interface BuilderTabProps {
    useTextMode: boolean;
    setUseTextMode: (val: boolean) => void;
    jsExpr: string;
    setTextExpr: (val: string) => void;
    BLOCK_PALETTE: any[];
    addBlock: (palette: any) => void;
    blocks: any[];
    OPERATORS: any[];
    updateOperator: (i: number, opId: string) => void;
    operators: string[];
    toggleSquared: (i: number) => void;
    removeBlock: (i: number) => void;
    updateBlock: (i: number, field: "amplitude" | "shift" | "scale", val: number) => void;
    textExpr: string;
    hasSignal: boolean;
    formulaStr: string;
    showPresets: boolean;
    setShowPresets: React.Dispatch<React.SetStateAction<boolean>>;
    compareExpr: string | null;
    setCompareExpr: (val: string | null) => void;
    SIGNAL_PRESETS: any[];
    combinedFn: (t: number) => number;
    compareFn: ((t: number) => number) | null;
}

export const BuilderTab = ({
    useTextMode,
    setUseTextMode,
    jsExpr,
    setTextExpr,
    BLOCK_PALETTE,
    addBlock,
    blocks,
    OPERATORS,
    updateOperator,
    operators,
    toggleSquared,
    removeBlock,
    updateBlock,
    textExpr,
    hasSignal,
    formulaStr,
    showPresets,
    setShowPresets,
    compareExpr,
    setCompareExpr,
    SIGNAL_PRESETS,
    combinedFn,
    compareFn
}: BuilderTabProps) => {
    return (
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
                                        </div >
                                    </motion.div >
                                ))
                                }
                            </AnimatePresence >
                        </div >
                    )
                    }
                    {
                        blocks.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                <Puzzle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">Clique sur un bloc ci-dessus pour commencer</p>
                            </div>
                        )
                    }
                </>
            )}

            {/* Text mode */}
            {
                useTextMode && (
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                            Fonctions disponibles: u(t), sgn(t), rect(t), tri(t), sin(t), cos(t), exp(t), abs(t), sqrt(t), pi
                        </p>
                        <input type="text" value={textExpr} onChange={(e) => setTextExpr(e.target.value)}
                            placeholder="ex: rect(2*t) + sin(3*t)"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50" />
                    </div>
                )
            }

            {/* Formula display */}
            {
                hasSignal && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Formule</p>
                        <p className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wide">
                            x(t) = {formulaStr}
                        </p>
                    </div>
                )
            }

            {/* Live preview chart + compare */}
            {
                hasSignal && (
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
                        <MiniChart
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
                )
            }
        </div >
    );
};
