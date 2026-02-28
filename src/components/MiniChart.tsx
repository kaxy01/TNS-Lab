import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from "recharts";

export interface MiniChartProps {
    fn: (t: number) => number;
    tRange?: [number, number];
    color?: string;
    label?: string;
    height?: number;
    pts?: number;

    // Optional comparison/overlay signals
    fn2?: ((t: number) => number) | null;
    color2?: string;
    label2?: string;

    overlayFn?: (t: number) => number;
    overlayColor?: string;
    overlayLabel?: string;
}

export const MiniChart = ({
    fn,
    fn2 = null,
    tRange = [-5, 5],
    color = "#22d3ee",
    color2 = "hsl(25,90%,55%)",
    label = "x(t)",
    label2 = "x₂(t)",
    height = 220,
    pts = 600,
    overlayFn,
    overlayColor = "hsl(320,70%,60%)",
    overlayLabel = "y(t)"
}: MiniChartProps) => {
    const data = useMemo(() => {
        const ptsArray: { t: number; y: number; y2?: number; overlay?: number }[] = [];
        const [tMin, tMax] = tRange;
        for (let i = 0; i <= pts; i++) {
            const t = tMin + (i / pts) * (tMax - tMin);
            let y = fn(t);
            if (!isFinite(y)) y = 0;
            const pt: { t: number; y: number; y2?: number; overlay?: number } = {
                t: Math.round(t * 100) / 100,
                y: Math.round(y * 10000) / 10000,
            };

            if (fn2) {
                let y2 = fn2(t);
                if (!isFinite(y2)) y2 = 0;
                pt.y2 = Math.round(y2 * 10000) / 10000;
            }

            if (overlayFn) {
                let yOver = overlayFn(t);
                if (!isFinite(yOver)) yOver = 0;
                pt.overlay = Math.round(yOver * 10000) / 10000;
            }

            ptsArray.push(pt);
        }
        return ptsArray;
    }, [fn, fn2, tRange, pts, overlayFn]);

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#888" }} tickCount={11} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip
                        contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        labelFormatter={(v) => `t = ${v}`}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                    <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} name={label} isAnimationActive={false} />
                    {fn2 && <Line type="monotone" dataKey="y2" stroke={color2} strokeWidth={2} dot={false} name={label2} strokeDasharray="6 3" isAnimationActive={false} />}
                    {overlayFn && <Line type="stepAfter" dataKey="overlay" stroke={overlayColor} strokeWidth={2} dot={false} name={overlayLabel} strokeDasharray="4 4" isAnimationActive={false} />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
