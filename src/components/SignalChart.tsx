import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { generateSignalData } from "@/data/signals";
import GlassCard from "./GlassCard";

interface SignalChartProps {
  fn: (t: number) => number;
  tRange: [number, number];
  label: string;
  color?: string;
  height?: number;
  className?: string;
}

const SignalChart = ({ fn, tRange, label, color = "hsl(187, 100%, 55%)", height = 250, className }: SignalChartProps) => {
  const data = useMemo(() => generateSignalData(fn, tRange[0], tRange[1], 600), [fn, tRange]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
          <XAxis
            dataKey="t"
            stroke="hsl(215, 20%, 45%)"
            tick={{ fontSize: 11 }}
            label={{ value: "t", position: "insideBottomRight", offset: -5, style: { fill: "hsl(215, 20%, 55%)" } }}
          />
          <YAxis
            stroke="hsl(215, 20%, 45%)"
            tick={{ fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="hsl(215, 20%, 30%)" strokeWidth={1} />
          <ReferenceLine y={0} stroke="hsl(215, 20%, 30%)" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              background: "hsl(230, 25%, 12%)",
              border: "1px solid hsl(230, 20%, 25%)",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
              fontSize: 12,
            }}
            labelFormatter={(val) => `t = ${val}`}
            formatter={(val: number) => [val.toFixed(4), label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Multi-signal chart for Exercise 4
interface MultiSignalChartProps {
  signals: Array<{ fn: (t: number) => number; label: string; color: string }>;
  tRange: [number, number];
  height?: number;
  className?: string;
}

export const MultiSignalChart = ({ signals: sigs, tRange, height = 250, className }: MultiSignalChartProps) => {
  const data = useMemo(() => {
    const points = 600;
    const step = (tRange[1] - tRange[0]) / points;
    const result = [];
    for (let i = 0; i <= points; i++) {
      const t = tRange[0] + i * step;
      const point: Record<string, number> = { t: parseFloat(t.toFixed(4)) };
      sigs.forEach((s, idx) => {
        point[`s${idx}`] = parseFloat(s.fn(t).toFixed(6));
      });
      result.push(point);
    }
    return result;
  }, [sigs, tRange]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
          <XAxis dataKey="t" stroke="hsl(215, 20%, 45%)" tick={{ fontSize: 11 }} />
          <YAxis stroke="hsl(215, 20%, 45%)" tick={{ fontSize: 11 }} />
          <ReferenceLine x={0} stroke="hsl(215, 20%, 30%)" strokeWidth={1} />
          <ReferenceLine y={0} stroke="hsl(215, 20%, 30%)" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              background: "hsl(230, 25%, 12%)",
              border: "1px solid hsl(230, 20%, 25%)",
              borderRadius: "8px",
              fontSize: 12,
            }}
            labelFormatter={(val) => `t = ${val}`}
          />
          {sigs.map((s, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={`s${idx}`}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              name={s.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SignalChart;
