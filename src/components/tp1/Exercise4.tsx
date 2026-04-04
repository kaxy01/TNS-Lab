import { useState, useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import SignalChart, { MultiSignalChart } from "@/components/SignalChart";
import { Input } from "@/components/ui/input";
import { parseExpression } from "@/utils/mathUtils";
import { computeLocalAnalysis } from "@/utils/signalAnalysis";
import { Plus, Calculator } from "lucide-react";

type SignalDef = {
  id: string;
  label: string;
  fn: (t: number) => number;
};

const predefinedSignals: SignalDef[] = [
  {
    id: "sig1",
    label: "x(t) = e^{-2t} cos(t)",
    fn: (t: number) => Math.exp(-2 * t) * Math.cos(t),
  },
  {
    id: "sig2",
    label: "x(t) = cos(t) + sin(t) + sin(t)cos(t)",
    fn: (t: number) => Math.cos(t) + Math.sin(t) + Math.sin(t) * Math.cos(t),
  },
];

export default function Exercise4() {
  const [activeSigId, setActiveSigId] = useState(predefinedSignals[0].id);
  const [customExpr, setCustomExpr] = useState("");
  const [customSignal, setCustomSignal] = useState<SignalDef | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCalculateCustom = () => {
    if (!customExpr.trim()) {
      setErrorMsg("Veuillez entrer une équation valide.");
      return;
    }
    const parsedFn = parseExpression(customExpr);
    if (!parsedFn) {
      setErrorMsg("Erreur de format. N'utilisez que t et des maths valides.");
      return;
    }
    setErrorMsg("");
    setCustomSignal({
      id: "custom",
      label: `x(t) = ${customExpr}`,
      fn: parsedFn,
    });
    setActiveSigId("custom");
  };

  const activeSig =
    activeSigId === "custom" && customSignal
      ? customSignal
      : predefinedSignals.find((s) => s.id === activeSigId) || predefinedSignals[0];

  const fnEven = (t: number) => (activeSig.fn(t) + activeSig.fn(-t)) / 2;
  const fnOdd = (t: number) => (activeSig.fn(t) - activeSig.fn(-t)) / 2;

  // Calcul Numerique des énergies (Théorème E = E_even + E_odd)
  const analysisOriginal = useMemo(() => computeLocalAnalysis(activeSig.fn), [activeSig.fn]);
  const analysisEven = useMemo(() => computeLocalAnalysis(fnEven), [activeSig.fn]);
  const analysisOdd = useMemo(() => computeLocalAnalysis(fnOdd), [activeSig.fn]);

  const E_total = typeof analysisOriginal.energy === "number" ? analysisOriginal.energy.toFixed(4) : "∞";
  const E_even = typeof analysisEven.energy === "number" ? analysisEven.energy.toFixed(4) : "∞";
  const E_odd = typeof analysisOdd.energy === "number" ? analysisOdd.energy.toFixed(4) : "∞";
  // The sum of even + odd energies:
  const E_sum =
    typeof analysisEven.energy === "number" && typeof analysisOdd.energy === "number"
      ? (analysisEven.energy + analysisOdd.energy).toFixed(4)
      : "∞";

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" /> Exercice 4 — Partie Paire et Impaire
        </h2>
        <p className="text-sm text-muted-foreground">
          Décomposition universelle d'un signal et validation du théorème d'énergie.
        </p>
      </header>

      {/* Saisie de Signal Dynamique */}
      <GlassCard className="p-4 border-dashed border-primary/30">
        <h3 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-2">
          <Plus className="w-3 h-3" /> Entrer un signal personnalisé
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full relative">
            <Input
              placeholder="ex: sin(2*t) * exp(-abs(t)) ou rect(t-1)"
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              className="glass font-mono w-full text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateCustom()}
            />
            {errorMsg && (
              <p className="text-xs text-destructive mt-1 font-medium">{errorMsg}</p>
            )}
          </div>
          <button
            onClick={handleCalculateCustom}
            className="glass bg-primary/40 hover:bg-primary/60 text-white px-6 py-2 rounded-lg font-medium transition-all shrink-0"
          >
            Tester l'équation
          </button>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2 mb-2">
        {predefinedSignals.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSigId(s.id)}
            className={`px-4 py-2 rounded-md font-mono text-sm font-medium transition-all ${
              activeSigId === s.id
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(187_100%_55%/0.5)]"
                : "glass bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
        {customSignal && (
          <button
            onClick={() => setActiveSigId("custom")}
            className={`px-4 py-2 rounded-md font-mono text-sm font-medium transition-all ${
              activeSigId === "custom"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(187_100%_55%/0.5)]"
                : "glass bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {customSignal.label}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-4 border-l-4 border-l-cyan-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-cyan-500/10 rounded-bl-xl font-mono text-xs text-cyan-300 pointer-events-none">
            E = {E_total}
          </div>
          <h3 className="text-sm font-bold mb-4 font-mono text-cyan-400">
            Signal Original: {activeSig.label}
          </h3>
          <SignalChart fn={activeSig.fn} tRange={[-5, 5]} label="x(t)" color="hsl(187, 100%, 55%)" />
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-4 border-l-4 border-l-purple-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-purple-500/10 rounded-bl-xl font-mono text-xs text-purple-300 pointer-events-none">
              E_paire = {E_even}
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-bold font-mono text-purple-400">Partie Paire x_e(t)</h3>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">x_e(t) = [x(t) + x(-t)] / 2</p>
            </div>
            <SignalChart fn={fnEven} tRange={[-5, 5]} label="x_e(t)" color="hsl(270, 100%, 65%)" />
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-emerald-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 rounded-bl-xl font-mono text-xs text-emerald-300 pointer-events-none">
              E_impaire = {E_odd}
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-bold font-mono text-emerald-400">Partie Impaire x_o(t)</h3>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">x_o(t) = [x(t) - x(-t)] / 2</p>
            </div>
            <SignalChart fn={fnOdd} tRange={[-5, 5]} label="x_o(t)" color="hsl(140, 100%, 55%)" />
          </GlassCard>
        </div>

        {/* Verification Théorème */}
        <GlassCard className="p-5 border border-primary/30 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Théorème de l'Énergie</h3>
            <p className="text-xs text-muted-foreground">L'énergie d'un signal est égale à la somme des énergies de ses parties paire et impaire.</p>
          </div>
          <div className="flex gap-4 font-mono text-sm">
            <div className="text-center px-4 py-2 bg-black/30 rounded border border-white/5">
              <div className="text-xs text-muted-foreground mb-1">E_total</div>
              <div className="text-cyan-400 font-bold">{E_total}</div>
            </div>
            <div className="flex items-center text-muted-foreground">=</div>
            <div className="text-center px-4 py-2 bg-black/30 rounded border border-white/5">
              <div className="text-xs text-muted-foreground mb-1">E_paire + E_impaire</div>
              <div className="font-bold text-primary">
                {E_even} + {E_odd} = <span className="text-white">{E_sum}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-bold mb-4 font-mono text-white">
            Superposition : x_e(t) + x_o(t) = x(t)
          </h3>
          <MultiSignalChart
            signals={[
              { fn: activeSig.fn, label: "x(t)", color: "hsl(187, 100%, 55%)" },
              { fn: fnEven, label: "x_e(t)", color: "hsl(270, 100%, 65%)" },
              { fn: fnOdd, label: "x_o(t)", color: "hsl(140, 100%, 55%)" },
            ]}
            tRange={[-3, 3]}
            height={300}
          />
        </GlassCard>
      </div>
    </div>
  );
}
