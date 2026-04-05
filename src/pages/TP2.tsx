import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Sigma } from "lucide-react";
import WaveBackground from "@/components/WaveBackground";
import GlassCard from "@/components/GlassCard";
import Exercise1 from "@/components/tp2/Exercise1";

const exercises = [
  { id: "ex1", label: "Exercice 1", subtitle: "Série de Fourier", icon: Sigma, ready: true },
  { id: "ex2", label: "Exercice 2", subtitle: "Transformée de Fourier", icon: Activity, ready: false },
];

const ComingSoon = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <GlassCard className="p-10 text-center max-w-md">
      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-bold text-foreground mb-2">{label}</h2>
      <p className="text-muted-foreground">{"Contenu à venir — cet exercice n'a pas encore été réalisé."}</p>
    </GlassCard>
  </div>
);

const TP2 = () => {
  const [activeEx, setActiveEx] = useState("ex1");

  const renderContent = () => {
    const ex = exercises.find((e) => e.id === activeEx);
    if (!ex?.ready) return <ComingSoon label={ex?.label ?? ""} />;
    if (activeEx === "ex1") return <Exercise1 />;
    return null;
  };

  return (
    <div className="min-h-screen relative gradient-animated">
      <WaveBackground />

      <div className="relative z-10">
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
            {"TP2 — Séries et Transformées de Fourier"}
          </h1>
        </header>

        <div className="flex">
          <aside className="hidden md:flex flex-col w-60 glass-strong min-h-[calc(100vh-52px)] sticky top-[52px] p-4 gap-2 border-r border-border/30 overflow-hidden">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Navigation
            </p>
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveEx(ex.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 text-left ${activeEx === ex.id
                  ? "bg-primary/10 text-primary neon-glow-cyan border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
              >
                <ex.icon className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-medium">{ex.label}</div>
                  <div className="text-xs opacity-70">
                    {ex.ready ? ex.subtitle : "À venir"}
                  </div>
                </div>
              </button>
            ))}
          </aside>

          <div className="md:hidden w-full px-4 pt-4">
            <div className="glass rounded-lg p-1 flex gap-1 overflow-x-auto">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveEx(ex.id)}
                  className={`flex-1 min-w-fit px-3 py-2 rounded-md text-xs font-medium transition-all ${activeEx === ex.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 p-6 md:p-8 max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TP2;
