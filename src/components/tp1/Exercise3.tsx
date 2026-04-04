import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface SignalPoint {
  t: number;
  y: number;
  dy: number;
  d2y: number;
  y_even: number;
  y_odd: number;
}

const Exercise3 = () => {
  const [expression, setExpression] = useState("where(abs(t) <= 1, 1 - abs(t), 0)");
  const [data, setData] = useState<SignalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignalData = useCallback(async (expr: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/ex3/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: expr }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le serveur (vérifiez que le backend Python est lancé)');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.points || []);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Vérifiez que le backend python est démarré.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchSignalData(expression);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSignalData(expression);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Exercice 3 : Analyse d'un Signal (Dérivées et Parité)
          </CardTitle>
          <CardDescription>
            Entrez une expression mathématique en fonction de <code>t</code> (ex: <code>tri(t)</code>, <code>rect(t)*cos(2*pi*t)</code>, <code>where(abs(t)&lt;=1, 1-abs(t), 0)</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
            <Input 
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Ex: where(abs(t) <= 1, 1 - abs(t), 0)"
              className="flex-1 font-mono"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Calcul en cours..." : "Calculer"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm">Signal x(t) et Dérivées</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickCount={11} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toFixed(4)} />
                      <Legend />
                      <Line type="monotone" dataKey="y" name="x(t)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="dy" name="x'(t)" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="d2y" name="x''(t)" stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm">Décomposition en Parité</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickCount={11} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toFixed(4)} />
                      <Legend />
                      <Line type="monotone" dataKey="y" name="Signal Original" stroke="#3b82f6" strokeWidth={1} dot={false} opacity={0.5} />
                      <Line type="monotone" dataKey="y_even" name="Partie Paire" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="y_odd" name="Partie Impaire" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Exercise3;
