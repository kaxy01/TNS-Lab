import { motion } from "framer-motion";
import { exercise4, x14Signal } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import CodeBlock from "@/components/CodeBlock";
import GlassCard from "@/components/GlassCard";

const Exercise4 = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Exercice 4 — Décomposition paire/impaire
        </h2>
        <p className="text-muted-foreground">
          Décomposition de x₁₄(t) en partie paire et partie impaire
        </p>
      </motion.div>

      {/* Three charts side by side */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { fn: x14Signal.fn, label: "x₁₄(t) — Original", color: "hsl(187, 100%, 55%)", glow: "cyan" as const },
          { fn: exercise4.evenPart, label: "Partie paire", color: "hsl(270, 80%, 60%)", glow: "purple" as const },
          { fn: exercise4.oddPart, label: "Partie impaire", color: "hsl(320, 80%, 55%)", glow: "magenta" as const },
        ].map((chart, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
          >
            <GlassCard glow={chart.glow} className="h-full">
              <h3 className="text-sm font-semibold text-foreground mb-3">{chart.label}</h3>
              <SignalChart
                fn={chart.fn}
                tRange={x14Signal.tRange}
                label={chart.label}
                color={chart.color}
                height={200}
              />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Formulas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard>
          <h3 className="text-lg font-semibold text-foreground mb-4">Formules</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="glass rounded-md p-4">
              <span className="text-xs text-muted-foreground block mb-1">Partie paire</span>
              <span className="font-mono text-secondary">x_p(t) = ½[x(t) + x(-t)]</span>
            </div>
            <div className="glass rounded-md p-4">
              <span className="text-xs text-muted-foreground block mb-1">Partie impaire</span>
              <span className="font-mono text-accent">x_i(t) = ½[x(t) - x(-t)]</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <CodeBlock code={exercise4.code} title="decomposition.py" />
      </motion.div>
    </div>
  );
};

export default Exercise4;
