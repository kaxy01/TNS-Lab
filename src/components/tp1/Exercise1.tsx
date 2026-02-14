import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { signals, generateSignalData, computeEnergy, computePower } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const signalKeys = Object.keys(signals);

// Signal card colors for unique per-signal styling
const signalColors: Record<string, string> = {};
signalKeys.forEach((key) => {
  signalColors[key] = signals[key].color;
});

interface SignalCardProps {
  signalKey: string;
  onClick: () => void;
}

const SignalCard = ({ signalKey, onClick }: SignalCardProps) => {
  const sig = signals[signalKey];
  const color = sig.color;

  return (
    <GlassCard
      className="p-4 cursor-pointer group hover:scale-[1.02] transition-transform duration-300 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Expand icon */}
      <button
        className="absolute top-3 right-3 p-1.5 rounded-md glass opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Agrandir ${sig.label}`}
      >
        <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Label */}
      <h3 className="text-sm font-semibold mb-1" style={{ color }}>
        {sig.label}
      </h3>

      {/* Energy badge */}
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0 mb-3 border-current"
        style={{ color: color, borderColor: `${color}60` }}
      >
        {sig.energy}
      </Badge>

      {/* Mini chart */}
      <div className="h-[120px] -mx-2">
        <SignalChart
          fn={sig.fn}
          tRange={sig.tRange}
          label={signalKey}
          color={color}
          height={120}
        />
      </div>

      {/* Bottom label */}
      <p className="text-xs text-muted-foreground text-center mt-1 font-mono">
        {sig.shortLabel}
      </p>
    </GlassCard>
  );
};

interface SignalModalProps {
  signalKey: string;
  open: boolean;
  onClose: () => void;
}

const SignalModal = ({ signalKey, open, onClose }: SignalModalProps) => {
  const sig = signals[signalKey];
  const color = sig.color;

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
          <DialogTitle className="font-semibold text-lg" style={{ color }}>
            {sig.label}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {'Visualisation interactive du signal ' + sig.label}
          </DialogDescription>
        </DialogHeader>

        {/* Large chart */}
        <div className="h-[280px] -mx-2">
          <SignalChart
            fn={modifiedFn}
            tRange={sig.tRange}
            label={signalKey}
            color={color}
            height={280}
          />
        </div>

        {/* Sliders */}
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Amplitude</span>
              <span className="font-mono text-foreground">{amplitude.toFixed(1)}</span>
            </label>
            <Slider
              value={[amplitude]}
              onValueChange={(v) => setAmplitude(v[0])}
              min={0.1}
              max={3}
              step={0.1}
              className="[&_[role=slider]]:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>{'Fréquence/Taux'}</span>
              <span className="font-mono text-foreground">{frequency.toFixed(1)}</span>
            </label>
            <Slider
              value={[frequency]}
              onValueChange={(v) => setFrequency(v[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="[&_[role=slider]]:border-secondary [&_span:first-child>span]:bg-secondary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>{'Décalage'}</span>
              <span className="font-mono text-foreground">{offset.toFixed(1)}</span>
            </label>
            <Slider
              value={[offset]}
              onValueChange={(v) => setOffset(v[0])}
              min={-3}
              max={3}
              step={0.1}
              className="[&_[role=slider]]:border-accent [&_span:first-child>span]:bg-accent"
            />
          </div>
        </div>

        {/* Energy badge */}
        <div className="mt-2">
          <Badge
            variant="outline"
            className="text-xs px-3 py-1 border-current"
            style={{ color: color, borderColor: `${color}60` }}
          >
            {sig.energy}
          </Badge>
        </div>

        {/* Energy & Power numerical values */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <GlassCard className="p-3">
            <p className="text-xs text-muted-foreground mb-1">{'Énergie (numérique)'}</p>
            <p className="text-sm font-mono text-foreground font-semibold">
              E = {energy.toFixed(4)}
            </p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Puissance (numérique)</p>
            <p className="text-sm font-mono text-foreground font-semibold">
              P = {power.toFixed(4)}
            </p>
          </GlassCard>
        </div>

        {/* Formulas */}
        <GlassCard className="p-3 mt-1">
          <p className="text-xs text-muted-foreground mb-1">{"Formule d'énergie :"}</p>
          <p className="text-sm font-mono text-foreground">{sig.energyFormula}</p>
          <p className="text-xs text-muted-foreground mt-2 mb-1">Formule de puissance :</p>
          <p className="text-sm font-mono text-foreground">{sig.powerFormula}</p>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};

const Exercise1 = () => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Exercice 1 — Visualisation des signaux
        </h2>
        <p className="text-muted-foreground">
          {'Représentation graphique et classification des signaux x₁(t) à x₁₂(t)'}
        </p>
      </motion.div>

      {/* Signal grid - 4 columns on large, 2 on medium, 1 on small */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {signalKeys.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <SignalCard
              signalKey={key}
              onClick={() => setSelectedSignal(key)}
            />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {selectedSignal && (
        <SignalModal
          signalKey={selectedSignal}
          open={!!selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </div>
  );
};

export default Exercise1;
