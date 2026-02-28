import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StepperProps {
    steps: { title: string; content: React.ReactNode }[];
    color: string;
}

export const Stepper = ({ steps, color }: StepperProps) => {
    const [step, setStep] = useState(0);

    return (
        <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden shadow-inner flex flex-col h-full">
            {/* Steps Header */}
            <div className="flex border-b border-white/5 overflow-x-auto hide-scrollbar">
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`flex-1 py-3 px-4 text-xs font-bold transition-all whitespace-nowrap ${i === step ? "bg-white/5" : "text-muted-foreground hover:bg-white/[0.02]"
                            }`}
                        style={{ color: i === step ? color : undefined }}
                    >
                        Étape {i + 1}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 flex-1 relative min-h-[160px]">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        <h4 className="font-bold text-lg" style={{ color }}>{steps[step].title}</h4>
                        <div className="text-foreground/80 leading-relaxed text-sm space-y-3">
                            {steps[step].content}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Stepper Footer Controls */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === step ? "scale-125" : "opacity-30"}`}
                            style={{ backgroundColor: i === step ? color : "white" }}
                        />
                    ))}
                </div>
                <button
                    onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                    disabled={step === steps.length - 1}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div >
    );
};
