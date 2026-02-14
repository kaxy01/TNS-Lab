import { motion } from "framer-motion";
import { exercise2Signals } from "@/data/signals";
import SignalChart from "@/components/SignalChart";
import CodeBlock from "@/components/CodeBlock";
import GlassCard from "@/components/GlassCard";

const Exercise2 = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Exercice 2 — Fonctions et convolution
        </h2>
        <p className="text-muted-foreground">
          Calcul de la convolution z(t) = x(t) * y(t) et relations U(t) ↔ sgn(t)
        </p>
      </motion.div>

      {/* Signals grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(exercise2Signals).map(([key, sig], idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
          >
            <GlassCard glow={idx === 2 ? "purple" : "none"} className="h-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">{sig.label}</h3>
              <SignalChart
                fn={sig.fn}
                tRange={sig.tRange}
                label={sig.label}
                color={idx === 0 ? "hsl(187, 100%, 55%)" : idx === 1 ? "hsl(270, 80%, 60%)" : "hsl(320, 80%, 55%)"}
                height={200}
              />
              <CodeBlock code={sig.code} className="mt-4" />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Relations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard glow="cyan">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Relations U(t) ↔ sgn(t)
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="glass rounded-md p-3">
              <span className="font-mono text-primary">U(t) = ½[1 + sgn(t)]</span>
              <p className="mt-1 text-xs">L'échelon unitaire s'exprime à partir de la fonction signe</p>
            </div>
            <div className="glass rounded-md p-3">
              <span className="font-mono text-secondary">sgn(t) = 2·U(t) - 1</span>
              <p className="mt-1 text-xs">Réciproquement, sgn(t) s'obtient à partir de U(t)</p>
            </div>
          </div>
          <CodeBlock
            className="mt-4"
            code={`# Vérification des relations
U = np.heaviside(t, 0.5)
sgn = np.sign(t)

# U(t) = 0.5 * (1 + sgn(t))
U_from_sgn = 0.5 * (1 + sgn)

# sgn(t) = 2*U(t) - 1
sgn_from_U = 2 * U - 1

print("U(t) ≡ ½(1+sgn(t)):", np.allclose(U, U_from_sgn))
print("sgn(t) ≡ 2U(t)-1:", np.allclose(sgn, sgn_from_U))`}
            title="relations.py"
          />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Exercise2;
