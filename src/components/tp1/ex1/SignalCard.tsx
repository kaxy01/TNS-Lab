import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import SignalChart from "@/components/SignalChart";
import { Badge } from "@/components/ui/badge";

export const SignalCard = ({ sig, color, label, onClick }: any) => (
    <motion.div whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${color}40` }} className="relative">
        <GlassCard
            className="p-4 cursor-pointer group transition-all duration-300 border border-white/5 hover:border-current relative"
            style={{ color }}
            onClick={onClick}
        >
            <button className="absolute top-3 right-3 p-1.5 rounded-md glass opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <h3 className="text-sm font-semibold mb-1">{sig.label}</h3>

            {sig.energy && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 mb-3 border-current" style={{ color, borderColor: `${color}60` }}>
                    {sig.energy}
                </Badge>
            )}

            {/* Chart Preview */}
            <div className="h-[120px] -mx-2 pointer-events-none">
                <SignalChart fn={sig.fn} tRange={sig.tRange} label={label} color={color} height={120} />
            </div>

            {(sig.shortLabel || sig.expression) && (
                <p className="text-xs text-muted-foreground text-center mt-2 font-mono opacity-60 group-hover:opacity-100 transition-opacity truncate px-2">
                    {sig.shortLabel || sig.expression}
                </p>
            )}
        </GlassCard>
    </motion.div>
);
