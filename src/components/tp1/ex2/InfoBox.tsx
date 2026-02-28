import React from "react";
import { Info } from "lucide-react";

export const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-50 text-opacity-90 leading-relaxed shadow-inner">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
    </div>
);
