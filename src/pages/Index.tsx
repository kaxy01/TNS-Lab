import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Waves, BookOpen, FlaskConical } from "lucide-react";
import WaveBackground from "@/components/WaveBackground";
import GlassCard from "@/components/GlassCard";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden gradient-animated">
      <WaveBackground />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-purple/10 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-cyan/10 blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-neon-magenta/5 blur-[80px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="glass rounded-full px-6 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-cyan" />
            Université d'Oran · 3ème Année Ingénieur · Sécurité Informatique
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-center mb-4 tracking-tight"
        >
          <span className="text-gradient neon-text-cyan">TNS</span>{" "}
          <span className="text-foreground">Lab</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl mb-4"
        >
          Traitement Numérique du Signal
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm text-muted-foreground/70 text-center mb-12"
        >
          Portail interactif des travaux pratiques
        </motion.p>

        {/* TP Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full max-w-4xl"
        >
          <h2 className="text-lg font-medium text-muted-foreground mb-6 text-center">
            Travaux Pratiques
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TP1 Card */}
            <Link to="/tp1" className="group">
              <GlassCard
                glow="cyan"
                className="h-full transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_30px_hsl(187_100%_55%/0.4)]"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Waves className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-primary font-mono">TP 01</span>
                    <h3 className="text-lg font-semibold text-foreground">Généralités sur les Signaux</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Signaux déterministes, énergie, classification, convolution et décomposition paire/impaire.
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  Explorer <ArrowRight className="w-4 h-4" />
                </div>
              </GlassCard>
            </Link>

            {/* Signal Lab Card */}
            <Link to="/lab" className="group">
              <GlassCard
                glow="cyan"
                className="h-full transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_30px_hsl(140_70%_55%/0.4)]"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-400 font-mono">LABO</span>
                    <h3 className="text-lg font-semibold text-foreground">Labo Signal</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Construis, analyse et décompose des signaux. Énergie, puissance, fréquence et démonstrations mathématiques.
                </p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Expérimenter <ArrowRight className="w-4 h-4" />
                </div>
              </GlassCard>
            </Link>

            {/* Future TP placeholders */}
            {[2, 3].map((num) => (
              <GlassCard
                key={num}
                className="h-full opacity-40 cursor-not-allowed"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-mono">TP 0{num}</span>
                    <h3 className="text-lg font-semibold text-muted-foreground/50">Bientôt disponible</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Ce TP sera ajouté prochainement.
                </p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 pb-8 text-center text-xs text-muted-foreground/50"
        >
          TNS Lab Hub · 2024/2025
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
