import React, { useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sigma, Activity, Zap, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function Exercise1() {
  const [harmonics, setHarmonics] = useState<number[]>([15]);
  const N = harmonics[0];

  // Génération dynamique des données spectrales mathématiquement exactes pour le signal dent de scie
  const spectralData = [];
  for (let n = -N; n <= N; n++) {
    let mag = 0;
    let phase = 0;
    if (n === 0) {
      mag = 0.5;
      phase = 0;
    } else {
      mag = 1 / (2 * Math.PI * Math.abs(n));
      phase = n > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    spectralData.push({
      n,
      mag: Number(mag.toFixed(4)),
      phase: Number(phase.toFixed(4)),
    });
  }

  // 1/3
  const P = (1 / 3).toFixed(4);

  return (
    <div className="space-y-6">
      {/* En-tête de l'exercice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sigma className="text-primary w-5 h-5" />
            Solution : Exercice 1 (Signal Dent de Scie)
          </CardTitle>
          <CardDescription>
            Analyse de Fourier exacte de la rampe périodique de période $T=2s$.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm mb-4">
            <p className="font-semibold text-foreground mb-2">Problème défini :</p>
            <p className="text-muted-foreground ml-2 border-l-2 border-primary pl-3">
              Soit le signal Dent de scie de période (T=2s) : <br />
              $x(t) = t/2$ pour $t \in [0, 2[$
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">

        {/* Question 1 */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
              Représentation Exponentielle Complexe ( $C_n$ )
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm text-muted-foreground">
            <p>Calcul de la composante continue ($n=0$) :</p>
            <div className="bg-background border border-border p-3 rounded font-mono text-center neon-text-cyan flex flex-col items-center">
              <span>C₀ = 1/T ∫ x(t) dt</span>
              <span>C₀ = 1/2 ∫ (t/2) dt = 1/2 [t²/4] = 1/2</span>
            </div>

            <p>Calcul des coefficients $n \neq 0$ avec $\omega_0 = 2\pi/T = \pi$ :</p>
            <div className="bg-background border border-border p-3 rounded font-mono text-center neon-text-cyan flex flex-col items-center">
              <span>Cₙ = 1/2 ∫(t/2) e^(-jnπt) dt</span>
              <span className="text-muted-foreground text-xs mt-1">(Intégration par parties u=t/2, dv=e^(-jnπt)dt)</span>
              <span className="mt-2 text-primary font-bold text-base">Cₙ = j / (2nπ)</span>
            </div>
          </CardContent>
        </Card>

        {/* Question 2 */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                Tracé des Spectres d'Amplitude et de Phase
              </CardTitle>
              <div className="flex items-center gap-3 bg-background px-3 py-1.5 rounded-full border border-border/50">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">N = {N} harmoniques</span>
                <div className="w-24 ml-2">
                  <Slider value={harmonics} onValueChange={setHarmonics} max={40} min={5} step={1} className="w-full" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-center text-muted-foreground">Spectre d'Amplitude |Cₙ| = 1/(2|n|π)</h4>
              <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spectralData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="n" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="mag" name="|Cₙ|">
                      {spectralData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.n === 0 ? "#ec4899" : "#a855f7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-center text-muted-foreground">Spectre de Phase Arg(Cₙ) [radians]</h4>
              <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spectralData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="n" tick={{ fontSize: 10 }} />
                    <YAxis domain={[-Math.PI, Math.PI]} ticks={[-3.14, -1.57, 0, 1.57, 3.14]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="phase" name="Phase (rad)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question 3 */}
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="py-4 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="bg-orange-500/20 text-orange-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                Forme Trigonométrique
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <p className="text-muted-foreground">On déduit $a_n$ et $b_n$ depuis $C_n$ :</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>$a_0 = C_0 = 1/2$</li>
                <li>$a_n = C_n + C_{"{-n}"} = 0$ (car partie réelle nulle)</li>
                <li>$b_n = j(C_n - C_{"{-n}"}) = -1 / (n\pi)$</li>
              </ul>
              <div className="bg-background border border-border p-3 rounded font-mono text-center neon-text-cyan mx-auto w-full">
                x(t) = 1/2 - Σ [ 1/(nπ) · sin(nπt) ]
              </div>
            </CardContent>
          </Card>

          {/* Question 4 */}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="py-4 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
                Forme Harmonique
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <p className="text-muted-foreground">On exprime le signal sous la forme $A_n \cos(n\omega_0 t + \Phi_n)$ :</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>$A_0 = a_0 = 1/2$</li>
                <li>$A_n = \sqrt{"{a_n^2 + b_n^2}"} = 1 / (n\pi)$</li>
                <li>$\Phi_n = \arctan(-b_n/a_n) = \pi/2$</li>
              </ul>
              <div className="bg-background border border-border p-3 rounded font-mono text-center neon-text-cyan mx-auto w-full">
                x(t) = 1/2 + Σ [ 1/(nπ) · cos(nπt + π/2) ]
              </div>
              <p className="text-xs text-muted-foreground/70 text-center">Note: $\cos(x + \pi/2) = -\sin(x)$, on retombe sur la forme trigonométrique.</p>
            </CardContent>
          </Card>
        </div>

        {/* Question 5 */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">5</span>
              Puissance Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Calcul de l'intégrale du signal au carré sur une période (domaine temporel) :
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-center neon-text-cyan flex-1 w-full flex flex-col justify-center items-center">
                <span className="mb-2">P = (1/T) ∫ x(t)² dt</span>
                <span className="text-muted-foreground text-xs mb-2">t de 0 à 2</span>
                <span className="mb-2">= 1/2 ∫ (t/2)² dt = 1/8 ∫ t² dt</span>
                <span>= 1/8 [ t³/3 ] = 1/8 × (8/3)</span>
                <div className="mt-4 flex items-center gap-2 font-bold text-xl text-foreground">
                  <Zap className="text-yellow-400 w-5 h-5 flex-shrink-0" />
                  <span className="text-rose-400">P = 1/3</span>
                  <span className="text-muted-foreground text-sm font-medium ml-2">(≈ {P} W)</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col gap-2 p-4 text-xs text-muted-foreground bg-primary/5 rounded-lg border border-primary/20 w-64">
                <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Théorème de Parseval
                </div>
                <p>On pourrait aussi calculer la puissance dans le domaine fréquentiel :</p>
                <p className="font-mono mt-1">P = C₀² + 2 Σ |Cₙ|²</p>
                <p>La somme infinie donnerait exactement 1/3 (théorème de la somme des inverses géométriques approchée).</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
