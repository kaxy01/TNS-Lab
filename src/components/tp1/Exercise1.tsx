import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { signals, type SignalDef, computeEnergy, computePower } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Maximize2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ── Custom signal builder ── */

const CUSTOM_COLOR = "hsl(160, 80%, 55%)";

interface CustomSignalDef {
  id: string;
  label: string;
  expression: string;
  fn: (t: number) => number;
  tRange: [number, number];
}

const parseExpression = (expr: string): ((t: number) => number) | null => {
  try {
    const sanitized = expr
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\blog\b/g, "Math.log")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\bPI\b/gi, "Math.PI")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\^/g, "**");
    const fn = new Function("t", `return (${sanitized});`) as (t: number) => number;
    fn(0); // test
    return fn;
  } catch {
    return null;
  }
};

/* ── Signal Card ── */

const SignalCard = ({ sig, color, label, onClick }: { sig: { fn: (t: number) => number; tRange: [number, number]; label: string; energy?: string; shortLabel?: string }; color: string; label: string; onClick: () => void }) => (
  <GlassCard
    className="p-4 cursor-pointer group hover:scale-[1.02] transition-transform duration-300 relative"
    onClick={onClick}
  >
    <button
      className="absolute top-3 right-3 p-1.5 rounded-md glass opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label={`Agrandir ${sig.label}`}
    >
      <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
    <h3 className="text-sm font-semibold mb-1" style={{ color }}>{sig.label}</h3>
    {sig.energy && (
      <Badge variant="outline" className="text-[10px] px-2 py-0 mb-3 border-current" style={{ color, borderColor: `${color}60` }}>
        {sig.energy}
      </Badge>
    )}
    <div className="h-[120px] -mx-2">
      <SignalChart fn={sig.fn} tRange={sig.tRange} label={label} color={color} height={120} />
    </div>
    {sig.shortLabel && (
      <p className="text-xs text-muted-foreground text-center mt-1 font-mono">{sig.shortLabel}</p>
    )}
  </GlassCard>
);

/* ── Signal Modal ── */

const SignalModal = ({ sig, color, label, open, onClose }: { sig: { fn: (t: number) => number; tRange: [number, number]; label: string; energy?: string; energyFormula?: string; powerFormula?: string }; color: string; label: string; open: boolean; onClose: () => void }) => {
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [offset, setOffset] = useState(0);

  const modifiedFn = useCallback(
    (t: number) => amplitude * sig.fn((t - offset) * frequency),
    [sig, amplitude, frequency, offset]
  );

  const energy = useMemo(
    () => computeEnergy(sig.fn, sig.tRange[0], sig.tRange[1], amplitude, frequency, offset),
    [sig, amplitude, frequency, offset]
  );
  const power = useMemo(
    () => computePower(sig.fn, sig.tRange[0], sig.tRange[1], amplitude, frequency, offset),
    [sig, amplitude, frequency, offset]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-strong border-border/40 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg" style={{ color }}>{sig.label}</DialogTitle>
          <DialogDescription className="sr-only">{"Visualisation interactive du signal " + sig.label}</DialogDescription>
        </DialogHeader>

        <div className="h-[280px] -mx-2">
          <SignalChart fn={modifiedFn} tRange={sig.tRange} label={label} color={color} height={280} />
        </div>

        <div className="space-y-4 mt-2">
          {[
            { label: "Amplitude", value: amplitude, set: setAmplitude, min: 0.1, max: 3, cls: "[&_[role=slider]]:border-primary" },
            { label: "Fréquence/Taux", value: frequency, set: setFrequency, min: 0.1, max: 5, cls: "[&_[role=slider]]:border-secondary [&_span:first-child>span]:bg-secondary" },
            { label: "Décalage", value: offset, set: setOffset, min: -3, max: 3, cls: "[&_[role=slider]]:border-accent [&_span:first-child>span]:bg-accent" },
          ].map((s) => (
            <div key={s.label}>
              <label className="text-sm text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>{s.label}</span>
                <span className="font-mono text-foreground">{s.value.toFixed(1)}</span>
              </label>
              <Slider value={[s.value]} onValueChange={(v) => s.set(v[0])} min={s.min} max={s.max} step={0.1} className={s.cls} />
            </div>
          ))}
        </div>

        {sig.energy && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs px-3 py-1 border-current" style={{ color, borderColor: `${color}60` }}>
              {sig.energy}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-2">
          <GlassCard className="p-3">
            <p className="text-xs text-muted-foreground mb-1">{"Énergie (numérique)"}</p>
            <p className="text-sm font-mono text-foreground font-semibold">E = {energy.toFixed(4)}</p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Puissance (numérique)</p>
            <p className="text-sm font-mono text-foreground font-semibold">P = {power.toFixed(4)}</p>
          </GlassCard>
        </div>

        {sig.energyFormula && sig.powerFormula && (
          <GlassCard className="p-3 mt-1">
            <p className="text-xs text-muted-foreground mb-1">{"Formule d'énergie :"}</p>
            <p className="text-sm font-mono text-foreground">{sig.energyFormula}</p>
            <p className="text-xs text-muted-foreground mt-2 mb-1">Formule de puissance :</p>
            <p className="text-sm font-mono text-foreground">{sig.powerFormula}</p>
          </GlassCard>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ── Add custom signal form ── */

const AddSignalForm = ({ onAdd }: { onAdd: (s: CustomSignalDef) => void }) => {
  const [label, setLabel] = useState("");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!label.trim() || !expression.trim()) { setError("Remplis les deux champs."); return; }
    const fn = parseExpression(expression);
    if (!fn) { setError("Expression invalide. Utilise t comme variable (ex: sin(2*pi*t))"); return; }
    onAdd({ id: `custom_${Date.now()}`, label: label.trim(), expression, fn, tRange: [-3, 3] });
    setLabel("");
    setExpression("");
    setError("");
  };

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" />
        Ajouter un signal personnalisé
      </h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Nom" value={label} onChange={(e) => setLabel(e.target.value)} className="glass border-border/40 text-sm sm:w-40 shrink-0" />
        <Input placeholder="f(t) = sin(2*pi*t) + cos(t)" value={expression} onChange={(e) => setExpression(e.target.value)} className="glass border-border/40 text-sm flex-1 font-mono" />
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
          Ajouter
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <p className="text-xs text-muted-foreground mt-2">{"Fonctions disponibles : sin, cos, tan, abs, exp, log, sqrt, pi, ^ (puissance)"}</p>
    </GlassCard>
  );
};

/* ── Main Exercise 1 ── */

const signalKeys = Object.keys(signals);

const Exercise1 = () => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [customSignals, setCustomSignals] = useState<CustomSignalDef[]>([]);

  const selectedBuiltin = selectedSignal && signals[selectedSignal] ? signals[selectedSignal] : null;
  const selectedCustom = selectedSignal ? customSignals.find((c) => c.id === selectedSignal) : null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-foreground mb-2">{"Exercice 1 — Visualisation des signaux"}</h2>
        <p className="text-muted-foreground">{"Représentation graphique et classification des signaux x₁(t) à x₁₂(t)"}</p>
      </motion.div>

      {/* Add custom signal */}
      <AddSignalForm onAdd={(s) => setCustomSignals((prev) => [...prev, s])} />

      {/* Signal grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {signalKeys.map((key, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <SignalCard sig={signals[key]} color={signals[key].color} label={key} onClick={() => setSelectedSignal(key)} />
          </motion.div>
        ))}

        {/* Custom signals */}
        {customSignals.map((cs, i) => (
          <motion.div key={cs.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setCustomSignals((prev) => prev.filter((s) => s.id !== cs.id)); }}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-md glass hover:bg-destructive/20 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
              <SignalCard
                sig={{ fn: cs.fn, tRange: cs.tRange, label: cs.label, shortLabel: cs.expression }}
                color={CUSTOM_COLOR}
                label={cs.id}
                onClick={() => setSelectedSignal(cs.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for builtin */}
      {selectedBuiltin && (
        <SignalModal sig={selectedBuiltin} color={selectedBuiltin.color} label={selectedSignal!} open onClose={() => setSelectedSignal(null)} />
      )}

      {/* Modal for custom */}
      {selectedCustom && (
        <SignalModal sig={{ fn: selectedCustom.fn, tRange: selectedCustom.tRange, label: selectedCustom.label }} color={CUSTOM_COLOR} label={selectedCustom.id} open onClose={() => setSelectedSignal(null)} />
      )}
    </div>
  );
};

export default Exercise1;
