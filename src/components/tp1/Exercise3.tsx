import { motion } from "framer-motion";
import { x14Signal } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import CodeBlock from "@/components/CodeBlock";
import GlassCard from "@/components/GlassCard";

const Exercise3 = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Exercice 3 — Signal graphique x₁₄(t)
        </h2>
        <p className="text-muted-foreground">
          Reproduction et analyse du signal x₁₄(t) défini par morceaux
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard glow="cyan">
          <h3 className="text-lg font-semibold text-foreground mb-4">{x14Signal.label}</h3>
          <SignalChart
            fn={x14Signal.fn}
            tRange={x14Signal.tRange}
            label="x₁₄(t)"
            height={300}
          />
        </GlassCard>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Définition par morceaux</h3>
            <div className="space-y-2 font-mono text-sm">
              {[
                { range: "-2 ≤ t < -1", expr: "t + 2", color: "text-primary" },
                { range: "-1 ≤ t < 0", expr: "1", color: "text-secondary" },
                { range: "0 ≤ t < 1", expr: "-t + 1", color: "text-accent" },
                { range: "1 ≤ t < 2", expr: "0", color: "text-muted-foreground" },
              ].map((piece, idx) => (
                <div key={idx} className="glass rounded-md p-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    idx === 0 ? "bg-primary" : idx === 1 ? "bg-secondary" : idx === 2 ? "bg-accent" : "bg-muted-foreground"
                  }`} />
                  <span className="text-muted-foreground">{piece.range} :</span>
                  <span className={piece.color}>{piece.expr}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CodeBlock code={x14Signal.code} title="x14.py" />
        </motion.div>
      </div>
    </div>
  );
};

export default Exercise3;
