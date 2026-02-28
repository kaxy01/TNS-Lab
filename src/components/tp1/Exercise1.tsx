import { useState, useMemo } from "react";
import { signals, computeEnergy, computePower } from "@/data/signals";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { getSignalTypeJS } from "@/utils/signalAnalysis";
import { parseExpression } from "@/utils/mathUtils";
import { SignalCard } from "./ex1/SignalCard";
import { SignalModal } from "./ex1/SignalModal";

const CUSTOM_COLOR = "hsl(160, 80%, 55%)";

const EnergyClassification = () => {
  const rows = useMemo(() => Object.entries(signals).map(([key, sig]) => {
    const isPeriodic = getSignalTypeJS(sig.expression || "") === "periodic";
    const E_val = computeEnergy(sig.fn, sig.tRange[0], sig.tRange[1]);
    const P_val = computePower(sig.fn, sig.tRange[0], sig.tRange[1]);

    return {
      key, label: sig.label, energyType: sig.energy,
      E: isPeriodic ? "∞" : E_val.toFixed(4),
      P: isPeriodic ? P_val.toFixed(4) : "0.0000"
    };
  }), []);

  return (
    <GlassCard className="p-5 mt-8">
      <h3 className="text-lg font-bold mb-4">Question 2 — Classification Énergétique</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b border-white/10">
            <tr><th className="text-left py-2 px-3">Signal</th><th className="text-left px-3">Type</th><th className="text-right px-3">Énergie (E)</th><th className="text-right px-3">Puissance (P)</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 font-mono">{r.key}</td>
                <td className="px-3"><Badge variant="outline" className="text-[10px]">{r.energyType}</Badge></td>
                <td className="text-right px-3 font-mono">{r.E}</td>
                <td className="text-right px-3 font-mono">{r.P}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

const PowerX11 = () => {
  const P = computePower(signals.x11.fn, 0, 0.5);
  return (
    <GlassCard className="p-5 mt-6 border-primary/20 bg-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
      <h3 className="text-lg font-bold mb-3">Question 3 — Analyse de x₁₁(t) = sin(4πt)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 glass rounded-lg text-center border-white/5">
          <p className="text-[10px] uppercase opacity-60">Fréquence (f₀)</p>
          <p className="font-bold text-lg">2 Hz</p>
          <p className="text-[9px] text-muted-foreground">ω = 2πf₀ = 4π</p>
        </div>
        <div className="p-3 glass rounded-lg text-center border-white/5">
          <p className="text-[10px] uppercase opacity-60">Période (T)</p>
          <p className="font-bold text-lg">0.5 s</p>
          <p className="text-[9px] text-muted-foreground">T = 1 / f₀</p>
        </div>
        <div className="p-3 glass rounded-lg text-center border-white/5">
          <p className="text-[10px] uppercase opacity-60">Puissance (Théo)</p>
          <p className="font-bold text-lg">0.5000</p>
          <p className="text-[9px] text-muted-foreground">P = A² / 2</p>
        </div>
        <div className="p-3 glass rounded-lg text-center border-primary/30 bg-primary/10">
          <p className="text-[10px] uppercase opacity-60 text-primary">Puissance (Num)</p>
          <p className="font-bold text-lg text-primary">{P.toFixed(4)}</p>
          <p className="text-[9px] text-primary/70">Intégrale SciPy</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default function Exercise1() {
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [allSignals, setAllSignals] = useState<any>({ ...signals });
  const [customSignals, setCustomSignals] = useState<any[]>([]);
  const [formLabel, setFormLabel] = useState("");
  const [formExpr, setFormExpr] = useState("");
  const [formError, setFormError] = useState("");

  const selectedSignal = useMemo(() => {
    if (!selectedSignalId) return null;
    return allSignals[selectedSignalId] || customSignals.find((s: any) => s.id === selectedSignalId);
  }, [selectedSignalId, allSignals, customSignals]);

  const handleAddSignal = () => {
    if (!formLabel || !formExpr) { setFormError("Champs vides"); return; }
    const fn = parseExpression(formExpr);
    if (!fn) { setFormError("Expression invalide"); return; }

    setCustomSignals([...customSignals, {
      id: `custom_${Date.now()}`, label: formLabel, expression: formExpr,
      fn, tRange: [-3, 3], color: CUSTOM_COLOR, energy: "Personnalisé", shortLabel: formExpr
    }]);
    setFormLabel(""); setFormExpr(""); setFormError("");
  };

  const handleUpdateSignal = (updatedSig: any) => {
    if (allSignals[updatedSig.id]) {
      setAllSignals({ ...allSignals, [updatedSig.id]: updatedSig });
    } else {
      setCustomSignals(customSignals.map(s => s.id === updatedSig.id ? updatedSig : s));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold">Exercice 1 — Visualisation & Énergie</h2>
        <p className="text-sm text-muted-foreground">TP Traitement du Signal — Analyse assistée par Python & IA Gemini</p>
      </header>

      <GlassCard className="p-4 border-dashed border-primary/30">
        <h3 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-2">
          <Plus className="w-3 h-3" /> Créer un signal
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <Input placeholder="Nom" value={formLabel} onChange={e => setFormLabel(e.target.value)} className="glass sm:w-40" />
          <div className="flex-1 w-full">
            <Input placeholder="Formule (ex: rect(t), tri(t)...)" value={formExpr} onChange={e => setFormExpr(e.target.value)} className="glass font-mono w-full" />
            {formError && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formError}</p>}
          </div>
          <button onClick={handleAddSignal} className="glass bg-primary/40 hover:bg-primary/60 text-white px-6 py-2 rounded-lg font-medium transition-all border-primary/20 shrink-0">Ajouter</button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(allSignals).map(([key, sig]: any) => (
          <SignalCard key={key} sig={{ ...sig, id: key }} color={sig.color} label={key} onClick={() => setSelectedSignalId(key)} />
        ))}
        {customSignals.map(cs => (
          <div key={cs.id} className="relative group">
            <button onClick={() => setCustomSignals(customSignals.filter(s => s.id !== cs.id))} className="absolute -top-2 -right-2 z-20 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-white" /></button>
            <SignalCard sig={cs} color={cs.color} label={cs.label} onClick={() => setSelectedSignalId(cs.id)} />
          </div>
        ))}
      </div>

      <EnergyClassification />
      <PowerX11 />

      {selectedSignal && (
        <SignalModal
          sig={{ ...selectedSignal, id: selectedSignalId }}
          color={selectedSignal.color || "#fff"}
          label={selectedSignal.label}
          open={!!selectedSignalId}
          onClose={() => setSelectedSignalId(null)}
          onUpdate={handleUpdateSignal}
        />
      )}
    </div>
  );
}