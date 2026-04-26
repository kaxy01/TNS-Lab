import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Sigma } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper functions for mathematical operations
const sinc = (x: number) => x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
const tri = (t: number) => Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0;
const rect = (t: number) => Math.abs(t) <= 0.5 ? 1 : 0;

const signals = [
  {
    id: "x",
    label: "x(t) = cos(6πt)",
    desc: "Propriété de modulation : Transformée de Fourier donne deux impulsions de Dirac.",
    formula: "X(f) = 1/2 [δ(f - 3) + δ(f + 3)]",
    time: (t: number) => Math.cos(6 * Math.PI * t),
    amp: (f: number) => Math.abs(f) >= 2.95 && Math.abs(f) <= 3.05 ? 0.5 : 0,
    phase: (f: number) => 0,
  },
  {
    id: "x1",
    label: "x₁(t) = Tri(2t)",
    desc: "Propriété de changement d'échelle : a=2.",
    formula: "X₁(f) = (1/2) sinc²(f/2)",
    time: (t: number) => tri(2 * t),
    amp: (f: number) => 0.5 * Math.pow(sinc(f / 2), 2),
    phase: (f: number) => 0
  },
  {
    id: "x2",
    label: "x₂(t) = Rect((t-1)/2) - Rect((t+1)/2)",
    desc: "Linéarité, changement d'échelle et décalage temporel. Le signal est impair.",
    formula: "X₂(f) = -4j · sin(2πf) · sinc(2f)",
    time: (t: number) => rect((t - 1) / 2) - rect((t + 1) / 2),
    amp: (f: number) => Math.abs(-4 * Math.sin(2 * Math.PI * f) * sinc(2 * f)),
    phase: (f: number) => {
      const im = -4 * Math.sin(2 * Math.PI * f) * sinc(2 * f);
      if (Math.abs(im) < 1e-3) return 0;
      return im > 0 ? Math.PI/2 : -Math.PI/2;
    }
  },
  {
    id: "x3",
    label: "x₃(t) = Tri(t-1) - Tri(t+1)",
    desc: "Linéarité et décalage temporel. Signal impair.",
    formula: "X₃(f) = -2j · sin(2πf) · sinc²(f)",
    time: (t: number) => tri(t - 1) - tri(t + 1),
    amp: (f: number) => Math.abs(-2 * Math.sin(2 * Math.PI * f) * Math.pow(sinc(f), 2)),
    phase: (f: number) => {
      const im = -2 * Math.sin(2 * Math.PI * f) * Math.pow(sinc(f), 2);
      if (Math.abs(im) < 1e-3) return 0;
      return im > 0 ? Math.PI/2 : -Math.PI/2;
    }
  },
  {
    id: "x4",
    label: "x₄(t) = Rect(t/2) - Tri(t)",
    desc: "Linéarité et changement d'échelle. Signal pair.",
    formula: "X₄(f) = 2 sinc(2f) - sinc²(f)",
    time: (t: number) => rect(t / 2) - tri(t),
    amp: (f: number) => Math.abs(2 * sinc(2 * f) - Math.pow(sinc(f), 2)),
    phase: (f: number) => {
      const real = 2 * sinc(2 * f) - Math.pow(sinc(f), 2);
      return real < -1e-3 ? Math.PI : 0;
    }
  }
];

export default function Exercise2() {
  const [selectedSignalId, setSelectedSignalId] = useState(signals[0].id);

  const activeSignal = useMemo(() => signals.find(s => s.id === selectedSignalId) || signals[0], [selectedSignalId]);

  // Generate data points
  const timeData = useMemo(() => {
    const points = [];
    for (let t = -4; t <= 4; t += 0.02) {
      points.push({ t: Number(t.toFixed(2)), y: activeSignal.time(t) });
    }
    return points;
  }, [activeSignal]);

  const freqData = useMemo(() => {
    const points = [];
    for (let f = -5; f <= 5; f += 0.05) {
      points.push({ 
        f: Number(f.toFixed(2)), 
        amp: activeSignal.amp(f),
        phase: activeSignal.phase(f)
      });
    }
    return points;
  }, [activeSignal]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="text-primary w-5 h-5" />
                Solution : Exercice 2 (Transformée de Fourier)
              </CardTitle>
              <CardDescription>
                Calcul et visualisation par les propriétés de la Transformée de Fourier.
              </CardDescription>
            </div>
            
            <Select value={selectedSignalId} onValueChange={setSelectedSignalId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Sélectionner un signal" />
              </SelectTrigger>
              <SelectContent>
                {signals.map((sig) => (
                  <SelectItem key={sig.id} value={sig.id}>
                    {sig.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm mb-4">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4 text-cyan-500" />
              Dérivation analytique :
            </p>
            <div className="text-muted-foreground ml-2 border-l-2 border-cyan-500 pl-3 space-y-2">
              <p>{activeSignal.desc}</p>
              <p className="text-cyan-400 font-mono text-base font-bold bg-background/50 p-2 rounded w-fit border border-cyan-500/20">
                {activeSignal.formula}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Time Domain */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardHeader className="py-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <span className="bg-rose-500/20 text-rose-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
              Représentation Temporelle x(t)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[-2, 2]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                  <Line type="stepAfter" dataKey="y" name="x(t)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amplitude Spectrum */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="py-4 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <span className="bg-blue-500/20 text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                Spectre d'Amplitude |X(f)|
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={freqData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="f" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <Line type="monotone" dataKey="amp" name="|X(f)|" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Phase Spectrum */}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="py-4 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                Spectre de Phase Arg(X(f))
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full bg-background/50 rounded-lg p-2 border border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={freqData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="f" tick={{ fontSize: 10 }} />
                    <YAxis 
                      domain={[-Math.PI - 0.5, Math.PI + 0.5]} 
                      ticks={[-3.14, -1.57, 0, 1.57, 3.14]} 
                      tick={{ fontSize: 10 }} 
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <ReferenceLine x={0} stroke="#475569" strokeWidth={1} opacity={0.5} />
                    <Line type="stepAfter" dataKey="phase" name="Phase (rad)" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
