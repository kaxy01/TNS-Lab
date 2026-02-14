import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FlaskConical, Waves, GitBranch, BarChart3 } from "lucide-react";
import WaveBackground from "@/components/WaveBackground";
import Exercise1 from "@/components/tp1/Exercise1";
import Exercise2 from "@/components/tp1/Exercise2";
import Exercise3 from "@/components/tp1/Exercise3";
import Exercise4 from "@/components/tp1/Exercise4";

const exercises = [
  { id: "ex1", label: "Exercice 1", subtitle: "Signaux", icon: Waves },
  { id: "ex2", label: "Exercice 2", subtitle: "Convolution", icon: GitBranch },
  { id: "ex3", label: "Exercice 3", subtitle: "x₁₄(t)", icon: BarChart3 },
  { id: "ex4", label: "Exercice 4", subtitle: "Paire/Impaire", icon: FlaskConical },
];

const TP1 = () => {
  const [activeEx, setActiveEx] = useState("ex1");

  return (
    <div className="min-h-screen relative gradient-animated">
      <WaveBackground />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="glass-strong sticky top-0 z-20 px-6 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold text-foreground">
            TP1 — Généralités sur les Signaux
          </h1>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-60 glass-strong min-h-[calc(100vh-52px)] sticky top-[52px] p-4 gap-2 border-r border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Navigation
            </p>
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveEx(ex.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 text-left ${
                  activeEx === ex.id
                    ? "bg-primary/10 text-primary neon-glow-cyan border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <ex.icon className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-medium">{ex.label}</div>
                  <div className="text-xs opacity-70">{ex.subtitle}</div>
                </div>
              </button>
            ))}
          </aside>

          {/* Mobile tabs */}
          <div className="md:hidden w-full px-4 pt-4">
            <div className="glass rounded-lg p-1 flex gap-1 overflow-x-auto">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveEx(ex.id)}
                  className={`flex-1 min-w-fit px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeEx === ex.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 p-6 md:p-8 max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeEx === "ex1" && <Exercise1 />}
                {activeEx === "ex2" && <Exercise2 />}
                {activeEx === "ex3" && <Exercise3 />}
                {activeEx === "ex4" && <Exercise4 />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TP1;
