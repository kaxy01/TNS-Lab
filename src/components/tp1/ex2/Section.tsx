import React from "react";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";

export const Section = ({
    num,
    title,
    badge,
    badgeColor,
    children,
    pythonVerified,
    sectionId,
}: {
    num: string;
    title: string;
    badge?: string;
    badgeColor?: string;
    children: React.ReactNode;
    pythonVerified?: boolean;
    sectionId?: string;
}) => (
    <div id={sectionId} className="relative z-10 glass-strong border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-lg text-primary shrink-0 font-mono">
                {num}
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 mt-1">
                    {badge && (
                        <Badge variant="outline" className="text-[10px] font-mono leading-none tracking-wider"
                            style={{ color: badgeColor, borderColor: `${badgeColor}40` }}>
                            {badge}
                        </Badge>
                    )}
                    {pythonVerified && (
                        <Badge variant="outline" className="text-[10px] font-mono leading-none tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1 pr-2">
                            <Server className="w-3 h-3" />
                            Vérifié par Python
                        </Badge>
                    )}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 bg-black/20">
            {children}
        </div>
    </div >
);
