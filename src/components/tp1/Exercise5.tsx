import GlassCard from "@/components/GlassCard";
import SignalChart from "@/components/SignalChart";
import { ArrowDown, Presentation } from "lucide-react";

export default function Exercise5() {
  const rect = (t: number) => (Math.abs(t) <= 0.5 ? 1 : 0);
  const y = (t: number) => (-t - 1) * rect(t + 0.5) + (-t + 1) * rect(t - 0.5);

  const deltaApprox = (t: number, t0: number, w: number = 0.05) =>
    Math.abs(t - t0) < w ? 1 / (2 * w) : 0;

  // y'(t) = -Rect(t/2) + 2*delta(t)
  const dy = (t: number) => -rect(t / 2) + 2 * deltaApprox(t, 0, 0.02);

  // y''(t) = -delta(t+1) + delta(t-1) + 2*delta'(t)
  const deltaPrimeApprox = (t: number, w: number = 0.05) => {
    if (t > -w && t <= 0) return 1 / (w * w);
    if (t > 0 && t < w) return -1 / (w * w);
    return 0;
  };
  const d2y = (t: number) =>
    -deltaApprox(t, -1, 0.02) + deltaApprox(t, 1, 0.02) + 2 * deltaPrimeApprox(t, 0.04);


  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Presentation className="w-6 h-6 text-primary" /> Exercice 5 — Spectre & Transformée de Fourier
        </h2>
        <p className="text-sm text-muted-foreground">
          Calcul de la Transformée de Fourier via le théorème de la dérivée et tracé des Spectres d'Amplitude et de Phase.
        </p>
      </header>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">1. Signal Original y(t)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Nous pouvons exprimer le signal graphique fourni dans le TD en fonction de la porte{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-primary">Rect(t)</code>.
          <br />
          À gauche (de -1 à 0) : équation de droite <code className="text-emerald-400">y(t) = -t - 1</code>
          <br />À droite (de 0 à 1) : équation de droite <code className="text-emerald-400">y(t) = -t + 1</code>
          <br />
          <div className="p-3 bg-muted/30 rounded-lg mt-2 font-mono text-center text-sm border border-primary/20">
            y(t) = (-t - 1)·Rect(t + 0.5)  +  (-t + 1)·Rect(t - 0.5)
          </div>
        </p>
        <SignalChart fn={y} tRange={[-2.5, 2.5]} label="y(t)" color="#06b6d4" />
      </GlassCard>

      <div className="flex justify-center -my-2 z-10 relative">
        <div className="p-2 bg-background rounded-full border border-border">
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-purple-400">2. Dérivée Première y'(t)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          La dérivée analytique nous donne :<br />
          - Les portes deviennent 0 ou des impulsions de Dirac.
          <br />
          - La ligne brisée crée une discontinuité globale de +2 à t=0.
          <br />
          <div className="p-3 bg-purple-500/10 rounded-lg mt-2 font-mono text-center text-sm border border-purple-500/20 text-purple-300">
            y'(t) = -Rect(t / 2) + 2δ(t)
          </div>
        </p>
        <SignalChart
          fn={dy}
          tRange={[-2.5, 2.5]}
          label="y'(t) approx"
          color="#a855f7"
        />
      </GlassCard>

      <div className="flex justify-center -my-2 z-10 relative">
        <div className="p-2 bg-background rounded-full border border-border">
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-rose-400">3. Dérivée Seconde y''(t)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          On dérive à nouveau pour simplifier au maximum et n'avoir plus que des impulsions (et un 
          doublet de Dirac δ'(t)).
          <br />
          La dérivée de <code className="text-rose-300">Rect(t/2)</code> qui vaut <code className="text-rose-300">U(t+1) - U(t-1)</code> nous donne des diracs en -1 et 1.
          <br />
          <div className="p-3 bg-rose-500/10 rounded-lg mt-2 font-mono text-center text-sm border border-rose-500/20 text-rose-300">
            y''(t) = -δ(t + 1) + δ(t - 1) + 2δ'(t)
          </div>
        </p>
        <SignalChart
          fn={d2y}
          tRange={[-2.5, 2.5]}
          label="y''(t) approx"
          color="#fb7185"
        />
      </GlassCard>

      <GlassCard className="p-6 mt-6 border-l-4 border-l-emerald-500">
        <h3 className="text-lg font-semibold mb-3 text-emerald-400">
          4. Équation Analytique (Théorème de la Dérivée)
        </h3>
        <div className="text-sm text-foreground/80 space-y-3 font-mono">
          <p>La propriété nous dit : F{'{'} y''(t) {'}'} = (j2πf)² · Y(f) = -4π²f² · Y(f)</p>
          <hr className="border-white/10" />
          <p>
            On calcule F{"{"}y''(t){"}"} :<br />
            = -e^&#123;+j2πf&#125; + e^&#123;-j2πf&#125; + 2(j2πf)
          </p>
          <p>
            Sachant que (e^&#123;-jθ&#125; - e^&#123;+jθ&#125;) = -2j·sin(θ), l'expression devient :<br />
            = -2j·sin(2πf) + j4πf = j(4πf - 2sin(2πf))
          </p>
          <p className="text-emerald-300 bg-emerald-500/10 p-4 rounded text-center border border-emerald-500/20 text-lg shadow-[0_0_20px_hsl(140_100%_55%/0.2)]">
            Y(f) = -j · [ 2πf - sin(2πf) ] / [ 2π²f² ]
          </p>
        </div>
      </GlassCard>

    </div>
  );
}
