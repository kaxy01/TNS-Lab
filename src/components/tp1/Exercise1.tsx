import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { signals, computeEnergy, computePower } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Maximize2, Plus, Trash2, AlertCircle, Calculator, Loader2, Pencil, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ── CONFIG ── */
// [EXPLANATION] Standard green color for our custom signals
const CUSTOM_COLOR = "hsl(160, 80%, 55%)";

/* ── 1. LIEN PYTHON ── */
// [EXPLANATION] This function connects to our Python Backend (main.py).
// It sends the math formula and time range, then waits for the calculated Energy, Power, and AI Explanation.
const fetchSignalMetrics = async (expression: string, tRange: [number, number]) => {
  try {
    const response = await fetch("http://localhost:8000/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression, t_start: tRange[0], t_end: tRange[1] }),
    });
    return await response.json();
  } catch (err) {
    // [EXPLANATION] Fallback if the Python server is not running (e.g., user forgot to start it).
    return { energy: 0, power: 0, ai_analysis: "Erreur : Serveur Python non connecté." };
  }
};

/* ── 2. PARSEUR JS ── */
// [EXPLANATION] This is a "Lightweight" version of the Python parser, running directly in the Browser.
// It allows us to draw the chart INSTANTLY without waiting for the server.
const parseExpression = (expr: string): ((t: number) => number) | null => {
  try {
    // 1. Translate simple math terms into JavaScript equivalents (e.g., sin -> Math.sin)
    let sanitized = expr
      .replace(/\bsin\b/g, "Math.sin").replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan").replace(/\babs\b/g, "Math.abs")
      .replace(/\bexp\b/g, "Math.exp").replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\bpi\b/gi, "Math.PI").replace(/\^/g, "**");

    // 2. Define special signal functions (Rect, Tri, Step, etc.) inside the function scope
    const functionBody = `
      const rect = (t) => Math.abs(t) <= 0.5 ? 1 : 0;
      const tri = (t) => Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0;
      const u = (t) => t >= 0 ? 1 : 0;
      const ramp = (t) => t >= 0 ? t : 0;
      const sinc = (t) => t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
      // 3. Return the result of the user's expression
      return (${sanitized});
    `;

    // 4. Create a new executable function from this string
    const fn = new Function("t", functionBody) as (t: number) => number;
    fn(0); // Test run to check for errors
    return fn;
  } catch { return null; }
};

/* ── CLASSIFICATION SIMPLE CÔTÉ JS (Pour l'instantanné) ── */
// [EXPLANATION] Quick guess of signal type in the browser.
// This gives immediate feedback while waiting for the detailed Python analysis.
const getSignalTypeJS = (expr: string) => {
  const e = expr.toLowerCase();
  // If it looks like a sine wave and doesn't decay, we assume it's Periodic.
  if ((e.includes('sin') || e.includes('cos')) && !e.includes('exp') && !e.includes('rect') && !e.includes('tri')) {
    return "periodic";
  }
  return "transient";
}

/* ── 3. COMPOSANT CARTE ── */
// [EXPLANATION] Displays a single signal as a clickable card with a chart preview.
const SignalCard = ({ sig, color, label, onClick }: any) => (
  <motion.div whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${color}40` }} className="relative">
    <GlassCard
      className="p-4 cursor-pointer group transition-all duration-300 border border-white/5 hover:border-current relative"
      style={{ color }}
      onClick={onClick}
    >
      <button className="absolute top-3 right-3 p-1.5 rounded-md glass opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <h3 className="text-sm font-semibold mb-1">{sig.label}</h3>

      {sig.energy && (
        <Badge variant="outline" className="text-[10px] px-2 py-0 mb-3 border-current" style={{ color, borderColor: `${color}60` }}>
          {sig.energy}
        </Badge>
      )}

      {/* Chart Preview */}
      <div className="h-[120px] -mx-2 pointer-events-none">
        <SignalChart fn={sig.fn} tRange={sig.tRange} label={label} color={color} height={120} />
      </div>

      {(sig.shortLabel || sig.expression) && (
        <p className="text-xs text-muted-foreground text-center mt-2 font-mono opacity-60 group-hover:opacity-100 transition-opacity truncate px-2">
          {sig.shortLabel || sig.expression}
        </p>
      )}
    </GlassCard>
  </motion.div>
);

/* ── 4. TABLEAU Q2 ── */
const EnergyClassification = () => {
  const rows = useMemo(() => Object.entries(signals).map(([key, sig]) => {
    // Logique simple pour l'affichage statique
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

/* ── 5. BLOC Q3 ── */
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

/* ── 6. MODAL INTERACTIVE ── */
const SignalModal = ({ sig, color, label, open, onClose, onUpdate }: any) => {
  const [apiMetrics, setApiMetrics] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editExpression, setEditExpression] = useState(sig.expression || sig.shortLabel || "");
  const [editLabel, setEditLabel] = useState(sig.label);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Aperçu temps réel
  const previewFn = useMemo(() => {
    if (!isEditing) return sig.fn;
    return parseExpression(editExpression) || (() => 0);
  }, [isEditing, editExpression, sig.fn]);

  // Calcul instantané JS (Avec logique théorique simple)
  const instantMetrics = useMemo(() => {
    const type = getSignalTypeJS(isEditing ? editExpression : (sig.expression || ""));
    const E = computeEnergy(previewFn, sig.tRange[0], sig.tRange[1]);
    const P = computePower(previewFn, sig.tRange[0], sig.tRange[1]);

    return {
      energy: type === "periodic" ? "∞" : E.toFixed(4),
      power: type === "periodic" ? P.toFixed(4) : "0.0000"
    };
  }, [previewFn, sig, isEditing, editExpression]);

  // Chargement des données Python
  // [EXPLANATION] When opening the modal, we automatically ask Python to analyze the signal.
  useEffect(() => {
    if (open && sig) {
      if (!isEditing) {
        setEditExpression(sig.expression || sig.shortLabel || "");
        setEditLabel(sig.label);
        setApiMetrics(null); // Reset metrics while loading
        fetchSignalMetrics(sig.expression || sig.label, sig.tRange).then(data => setApiMetrics(data));
      }
    }
  }, [open, sig.expression, sig.label]); // Dépendances précises

  const handleSave = () => {
    setSaveError(null);
    if (!editExpression.trim()) { setSaveError("Formule vide."); return; }

    const newFn = parseExpression(editExpression);
    if (!newFn) { setSaveError("Erreur de syntaxe."); return; }

    onUpdate({
      ...sig,
      label: editLabel,
      expression: editExpression,
      shortLabel: editExpression,
      fn: newFn
    });

    setIsEditing(false);
  };

  // Affichage final : On prend l'API si dispo, sinon le calcul JS instantané
  const displayEnergy = (apiMetrics && !isEditing) ? apiMetrics.energy : instantMetrics.energy;
  const displayPower = (apiMetrics && !isEditing) ? apiMetrics.power : instantMetrics.power;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsEditing(false); setSaveError(null); onClose(); } }}>
      <DialogContent className="glass-strong max-w-2xl border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8 border-b border-white/5 pb-4">
          <div className="flex flex-col gap-1 w-full">
            {isEditing ? (
              <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="glass font-bold text-lg h-8 w-1/2" placeholder="Nom" />
            ) : (
              <DialogTitle style={{ color: color }} className="text-xl">{sig.label}</DialogTitle>
            )}

            {!isEditing && (
              <p className="text-xs font-mono text-primary/80 flex items-center gap-2">
                <span className="opacity-50 uppercase tracking-widest text-[9px]">Formule :</span>
                {sig.expression || sig.shortLabel}
              </p>
            )}
          </div>

          <div className="absolute right-8 top-6">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="p-2 bg-primary/20 hover:bg-primary/40 rounded-full text-primary"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setIsEditing(false); setSaveError(null); setEditExpression(sig.expression || ""); }} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Zone d'édition */}
          {isEditing && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <label className="text-[10px] uppercase font-bold text-primary block">Modifier la Formule</label>
              <Input
                value={editExpression}
                onChange={e => { setEditExpression(e.target.value); setSaveError(null); }}
                className="glass font-mono text-sm border-primary/50 bg-black/20"
              />
              {saveError && <p className="text-xs text-destructive flex items-center gap-1 font-bold"><AlertCircle className="w-3 h-3" /> {saveError}</p>}
            </div>
          )}

          <div className="h-[200px] w-full relative">
            <SignalChart fn={previewFn} tRange={sig.tRange} label={isEditing ? editLabel : label} color={color} height={200} />
            {isEditing && <div className="absolute top-2 right-2 text-[10px] text-primary bg-black/50 px-2 py-1 rounded border border-primary/20">Aperçu</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[100px]">
              <p className="text-[10px] uppercase opacity-60 mb-1">Énergie {(apiMetrics && !isEditing) ? "(Théorique)" : "(Instant)"}</p>
              <p className="text-xl font-mono font-bold">{displayEnergy}</p>
            </GlassCard>
            <GlassCard className="p-4 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[100px]">
              <p className="text-[10px] uppercase opacity-60 mb-1">Puissance {(apiMetrics && !isEditing) ? "(Théorique)" : "(Instant)"}</p>
              <p className="text-xl font-mono font-bold">{displayPower}</p>
            </GlassCard>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-primary/20 shadow-inner min-h-[250px] relative">
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <Calculator className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-primary tracking-widest uppercase">Démonstration Mathématique</p>
            </div>

            {isEditing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pt-10 bg-black/60 backdrop-blur-[2px] z-10">
                <Pencil className="w-8 h-8 opacity-50" />
                <p className="text-xs text-center px-4">Sauvegardez pour relancer l'analyse.</p>
              </div>
            ) : apiMetrics ? (
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono font-normal h-[250px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in">
                {apiMetrics.ai_analysis}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pt-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs animate-pulse">Classification théorique en cours...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── 7. PRINCIPAL ── */
export default function Exercise1() {
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [allSignals, setAllSignals] = useState<any>({ ...signals });
  const [customSignals, setCustomSignals] = useState<any[]>([]);
  const [formLabel, setFormLabel] = useState("");
  const [formExpr, setFormExpr] = useState("");
  const [formError, setFormError] = useState("");

  const selectedSignal = useMemo(() => {
    if (!selectedSignalId) return null;
    return allSignals[selectedSignalId] || customSignals.find(s => s.id === selectedSignalId);
  }, [selectedSignalId, allSignals, customSignals]);

  // [EXPLANATION] Handler to create new custom signals from the UI.
  const handleAddSignal = () => {
    if (!formLabel || !formExpr) { setFormError("Champs vides"); return; }
    // Verify the math expression is valid before adding
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