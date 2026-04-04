import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import SignalChart, { MultiSignalChart } from "@/components/SignalChart";

type SignalDef = {
  id: string;
  label: string;
  fn: (t: number) => number;
};

const signals: SignalDef[] = [
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
  const [activeSigId, setActiveSigId] = useState(signals[0].id);

  const activeSig = signals.find((s) => s.id === activeSigId)!;

  const fnEven = (t: number) => (activeSig.fn(t) + activeSig.fn(-t)) / 2;
  const fnOdd = (t: number) => (activeSig.fn(t) - activeSig.fn(-t)) / 2;

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold">Exercice 4 — Partie Paire et Impaire</h2>
        <p className="text-sm text-muted-foreground">
          Décomposition des signaux en leurs composantes paire et impaire
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        {signals.map((s) => (
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-4 border-l-4 border-l-cyan-500">
          <h3 className="text-sm font-bold mb-4 font-mono text-cyan-400">
            Signal Original: {activeSig.label}
          </h3>
          <SignalChart fn={activeSig.fn} tRange={[-5, 5]} label="x(t)" color="hsl(187, 100%, 55%)" />
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-4 border-l-4 border-l-purple-500">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-mono text-purple-400">Partie Paire x_e(t)</h3>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">x_e(t) = [x(t) + x(-t)] / 2</p>
            </div>
            <SignalChart fn={fnEven} tRange={[-5, 5]} label="x_e(t)" color="hsl(270, 100%, 65%)" />
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-emerald-500">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-mono text-emerald-400">Partie Impaire x_o(t)</h3>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">x_o(t) = [x(t) - x(-t)] / 2</p>
            </div>
            <SignalChart fn={fnOdd} tRange={[-5, 5]} label="x_o(t)" color="hsl(140, 100%, 55%)" />
          </GlassCard>
        </div>

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
