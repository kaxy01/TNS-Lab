import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Sigma } from "lucide-react";

export default function Exercise3() {
  // Generate data points
  const timeData = useMemo(() => {
    const points = [];
    for (let t = -3; t <= 3.01; t += 0.01) {
      const x = Number(t.toFixed(2));
      let y = 0;
      if (x < -1) y = 0;
      else if (x < 0) y = -x - 1;
      else if (x === 0) {
        // Points for vertical jump
        points.push({ t: 0, y: -1 });
        y = 1;
      }
      else if (x < 1) y = -x + 1;
      else y = 0;
      
      points.push({ t: x, y });
    }
    return points;
  }, []);

  const d1Data = useMemo(() => {
    const points = [];
    for (let t = -3; t <= 3.01; t += 0.01) {
      const x = Number(t.toFixed(2));
      let y = 0;
      if (x > -1 && x < 1) y = -1;
      points.push({ t: x, y });
    }
    return points;
  }, []);

  const freqData = useMemo(() => {
    const points = [];
    for (let f = -5; f <= 5; f += 0.05) {
      const x = Number(f.toFixed(2));
      let amp = 0;
      if (x === 0) {
        amp = 0;
      } else {
        const val = (Math.sin(2 * Math.PI * x) - 2 * Math.PI * x) / (2 * Math.pow(Math.PI, 2) * Math.pow(x, 2));
        amp = Math.abs(val);
      }
      points.push({ f: x, amp });
    }
    return points;
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="text-primary w-5 h-5" />
                Solution : Exercice 3
              </CardTitle>
              <CardDescription>
                Analyse d'un signal analytique, dérivées et Transformée de Fourier.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Signal Definition */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <span className="bg-blue-500/20 text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
              Le signal en fonction de ramp/échelon unité
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                En analysant les pentes du signal y(t) :
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>En t=-1, la pente passe de 0 à -1. On ajoute une rampe inversée: -r(t+1).</li>
                <li>En t=0, il y a un saut brutal de -1 à +1 (amplitude +2). On ajoute un échelon: +2u(t). La pente reste à -1.</li>
                <li>En t=1, la pente passe de -1 à 0. On annule la pente avec: +r(t-1).</li>
              </ul>
              <div className="p-3 bg-background border border-blue-500/30 rounded-lg font-mono text-center text-blue-400 font-bold">
                y(t) = -r(t+1) + 2u(t) + r(t-1)
              </div>
            </div>
            
            <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[-1.5, 1.5]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  <Line type="linear" dataKey="y" name="y(t)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* First Derivative */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <span className="bg-rose-500/20 text-rose-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
              Visualiser sa première dérivée y'(t)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid md:grid-cols-2 gap-6 items-center">
             <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                En dérivant formellement y(t), on obtient : r'(t) = u(t) et u'(t) = \\delta(t).
              </p>
              <div className="p-3 bg-background border border-rose-500/30 rounded-lg font-mono text-center text-rose-400 font-bold">
                y'(t) = -u(t+1) + 2δ(t) + u(t-1)
              </div>
              <p className="text-sm text-muted-foreground">
                Ce qui se simplifie en une porte rectangulaire négative et une impulsion de Dirac au centre :
              </p>
              <div className="p-3 bg-background border border-rose-500/30 rounded-lg font-mono text-center text-rose-400 font-bold">
                y'(t) = -Rect(t/2) + 2δ(t)
              </div>
            </div>
            
            <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d1Data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[-1.5, 2.5]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  
                  {/* Dirac impulse visualization */}
                  <ReferenceLine x={0} stroke="#f43f5e" strokeWidth={3} segment={[{x: 0, y: 0}, {x: 0, y: 2}]} label={{ position: 'top', value: '2δ(t)', fill: '#f43f5e', fontSize: 12 }} />
                  
                  <Line type="stepAfter" dataKey="y" name="y'(t) [hors dirac]" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Second Derivative */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <span className="bg-orange-500/20 text-orange-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
              Visualiser sa seconde dérivée y''(t)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid md:grid-cols-2 gap-6 items-center">
             <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                On dérive une nouvelle fois :
              </p>
              <div className="p-3 bg-background border border-orange-500/30 rounded-lg font-mono text-center text-orange-400 font-bold">
                y''(t) = -δ(t+1) + 2δ'(t) + δ(t-1)
              </div>
              <p className="text-sm text-muted-foreground">
                Ceci correspond à une impulsion négative en t=-1, une impulsion positive en t=1, et un doublet de Dirac 2\\delta'(t) en t=0.
              </p>
            </div>
            
            <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border relative flex items-center justify-center overflow-hidden">
               {/* Custom visualization for Dirac and Doublet */}
               <div className="absolute inset-0 bg-grid-white/5 opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
               <div className="relative w-full h-full flex items-center justify-center">
                 <div className="w-[80%] h-px bg-slate-500 absolute top-1/2 -translate-y-1/2"></div>
                 <div className="h-[80%] w-px bg-slate-500 absolute left-1/2 -translate-x-1/2"></div>
                 
                 {/* -δ(t+1) */}
                 <div className="absolute left-[10%] top-1/2 w-0.5 h-16 bg-orange-500 translate-x-[0px] flex flex-col items-center justify-end">
                    <div className="w-3 h-3 border-l-2 border-b-2 border-orange-500 -rotate-45 translate-y-1"></div>
                    <span className="absolute top-full mt-2 text-xs text-orange-500 whitespace-nowrap">-δ(t+1)</span>
                 </div>
                 
                 {/* 2δ'(t) (Doublet) */}
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-6 h-24 border-x-2 border-t-2 border-b-2 border-orange-500/0 relative">
                       <div className="absolute right-0 top-0 w-0.5 h-12 bg-orange-500 -translate-y-full">
                         <div className="w-3 h-3 border-t-2 border-r-2 border-orange-500 -rotate-45 -translate-y-1 -translate-x-1.5"></div>
                       </div>
                       <div className="absolute left-0 bottom-0 w-0.5 h-12 bg-orange-500 translate-y-full">
                         <div className="w-3 h-3 border-l-2 border-b-2 border-orange-500 -rotate-45 translate-y-1 -translate-x-[5px]"></div>
                       </div>
                    </div>
                    <span className="absolute left-full ml-4 text-xs font-bold text-orange-500 whitespace-nowrap">2δ'(t)</span>
                 </div>

                 {/* δ(t-1) */}
                 <div className="absolute right-[10%] bottom-1/2 w-0.5 h-16 bg-orange-500 flex flex-col items-center justify-start">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-orange-500 rotate-45 -translate-y-1"></div>
                    <span className="absolute bottom-full mb-2 text-xs text-orange-500 whitespace-nowrap">δ(t-1)</span>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Fourier Transform */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
              Transformée de Fourier Y(f)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid md:grid-cols-2 gap-6 items-center">
             <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                En utilisant le théorème de la dérivée seconde: ℱ{'{y\'\'(t)}'} = -4π²f² Y(f).
              </p>
              <div className="p-3 bg-background border border-emerald-500/30 rounded-lg font-mono text-center text-emerald-400 font-bold">
                -4π²f² Y(f) = -e^j2πf + j4πf + e^-j2πf
              </div>
              <p className="text-sm text-muted-foreground">
                En regroupant les exponentielles, on obtient -2j \\sin(2\\pi f) + 4j\\pi f. Finalement :
              </p>
              <div className="p-3 bg-background border border-emerald-500/30 rounded-lg font-mono text-center text-emerald-400 font-bold">
                Y(f) = j · [sin(2πf) - 2πf] / (2π²f²)
              </div>
              <p className="text-xs text-muted-foreground text-center">Le signal est purement imaginaire et impair (car y(t) est impair).</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-center text-muted-foreground">Spectre d'Amplitude |Y(f)|</h4>
              <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={freqData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="f" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <Line type="monotone" dataKey="amp" name="|Y(f)|" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
