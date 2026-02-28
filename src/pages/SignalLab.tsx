import { useState, useMemo, useCallback, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import WaveBackground from "@/components/WaveBackground";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FlaskConical, ChevronDown, Puzzle, Trophy } from "lucide-react";
import { BLOCK_PALETTE, OPERATORS, SIGNAL_PRESETS } from "@/utils/signalConstants";
import { parseExpression } from "@/utils/mathUtils";
import { computeLocalAnalysis } from "@/utils/signalAnalysis";
import { QuizTab } from "@/components/signallab/QuizTab";
import { BuilderTab } from "@/components/signallab/BuilderTab";
import { AnalysisResults } from "@/components/signallab/AnalysisResults";

let blockIdCounter = 0;

export default function SignalLab() {
    // Builder state
    const [blocks, setBlocks] = useState<any[]>([]);
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
    const addBlock = (palette: any) => {
        const newBlock = {
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
    const SectionHeader = ({ id, icon: Icon, title, badge, badgeColor, color }: any) => (
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
                        <QuizTab
                            startQuiz={startQuiz}
                            quizLoading={quizLoading}
                            quizSignal={quizSignal}
                            quizAnswer={quizAnswer}
                            setQuizAnswer={setQuizAnswer}
                            checkQuiz={checkQuiz}
                            quizCheckLoading={quizCheckLoading}
                            quizResult={quizResult}
                            parseExpression={parseExpression}
                        />
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
                                    <BuilderTab
                                        useTextMode={useTextMode}
                                        setUseTextMode={setUseTextMode}
                                        jsExpr={jsExpr}
                                        setTextExpr={setTextExpr}
                                        BLOCK_PALETTE={BLOCK_PALETTE}
                                        addBlock={addBlock}
                                        blocks={blocks}
                                        OPERATORS={OPERATORS}
                                        updateOperator={updateOperator}
                                        operators={operators}
                                        toggleSquared={toggleSquared}
                                        removeBlock={removeBlock}
                                        updateBlock={updateBlock}
                                        textExpr={textExpr}
                                        hasSignal={hasSignal}
                                        formulaStr={formulaStr}
                                        showPresets={showPresets}
                                        setShowPresets={setShowPresets}
                                        compareExpr={compareExpr}
                                        setCompareExpr={setCompareExpr}
                                        SIGNAL_PRESETS={SIGNAL_PRESETS}
                                        combinedFn={combinedFn}
                                        compareFn={compareFn}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    {/* ANALYZE BUTTON + calc + demo + reformulations — builder tab only */}
                    {activeTab === "builder" && (
                        <AnalysisResults
                            localCalc={localCalc}
                            hasSignal={hasSignal}
                            expandedSections={expandedSections}
                            toggleSection={toggleSection}
                            SectionHeader={SectionHeader}
                            runAnalysis={runAnalysis}
                            loading={loading}
                            analysisError={analysisError}
                            analysisResult={analysisResult}
                            verifyOverlays={verifyOverlays}
                            toggleVerify={toggleVerify}
                            combinedFn={combinedFn}
                            parseExpression={parseExpression}
                        />
                    )}

                </main>
            </div>
        </div>
    );
};
