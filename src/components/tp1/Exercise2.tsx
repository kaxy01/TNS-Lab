import { ArrowRight } from "lucide-react";
import { Q1 } from "@/components/tp1/ex2/Q1";
import { Q2 } from "@/components/tp1/ex2/Q2";

const FlowDiagram = () => (
    <div
        className="flex items-center justify-center gap-2 py-3 flex-wrap"
        role="img"
        aria-label="Chaîne de transformation : sgn(t) vers U(t) vers Rect(2t)"
    >
        <div className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-sm font-bold">
            sgn(t)
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 font-mono text-sm font-bold">
            U(t) = ½(1+sgn)
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-mono text-sm font-bold">
            Rect(2t)
        </div>
    </div>
);

const Exercise2 = () => (
    <div className="space-y-6 pb-20">
        <header>
            <h2 className="text-2xl font-bold">
                Exercice 2 — Relations entre signaux & Dirac
            </h2>
            <p className="text-sm text-muted-foreground">
                TP Traitement du Signal — Décomposition en signaux primitifs &
                propriété de prélèvement
            </p>
        </header>

        {/* Signal flow diagram */}
        <FlowDiagram />

        <div className="grid gap-6">
            <Q1 />
            <Q2 />
        </div>
    </div>
);

export default Exercise2;