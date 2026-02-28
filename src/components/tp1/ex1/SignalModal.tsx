import { useState, useMemo, useEffect } from "react";
import { AlertCircle, Calculator, Loader2, Pencil, Save, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import SignalChart from "@/components/SignalChart";
import { computeEnergy, computePower } from "@/data/signals";
import { API_BASE_URL } from "@/config";
import { getSignalTypeJS } from "@/utils/signalAnalysis";
import { parseExpression } from "@/utils/mathUtils";

const fetchSignalMetrics = async (expression: string, tRange: [number, number]) => {
    try {
        const response = await fetch(`${API_BASE_URL}/compute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression, t_start: tRange[0], t_end: tRange[1] }),
        });
        return await response.json();
    } catch (err) {
        return { energy: 0, power: 0, ai_analysis: "Erreur : Serveur Python non connecté." };
    }
};

export const SignalModal = ({ sig, color, label, open, onClose, onUpdate }: any) => {
    const [apiMetrics, setApiMetrics] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editExpression, setEditExpression] = useState(sig?.expression || sig?.shortLabel || "");
    const [editLabel, setEditLabel] = useState(sig?.label || "");
    const [saveError, setSaveError] = useState<string | null>(null);

    // Aperçu temps réel
    const previewFn = useMemo(() => {
        if (!isEditing || !sig) return sig?.fn || (() => 0);
        return parseExpression(editExpression) || (() => 0);
    }, [isEditing, editExpression, sig]);

    // Calcul instantané JS (Avec logique théorique simple)
    const instantMetrics = useMemo(() => {
        if (!sig) return { energy: "0", power: "0" };
        const typeInfo = getSignalTypeJS(isEditing ? editExpression : (sig.expression || ""));
        const E = computeEnergy(previewFn, sig.tRange[0], sig.tRange[1]);
        const P = computePower(previewFn, sig.tRange[0], sig.tRange[1]);

        return {
            energy: typeInfo.type === "periodic" ? "∞" : E.toFixed(4),
            power: typeInfo.type === "periodic" ? P.toFixed(4) : "0.0000"
        };
    }, [previewFn, sig, isEditing, editExpression]);

    useEffect(() => {
        if (open && sig) {
            if (!isEditing) {
                setEditExpression(sig.expression || sig.shortLabel || "");
                setEditLabel(sig.label);
                setApiMetrics(null); // Reset metrics while loading
                fetchSignalMetrics(sig.expression || sig.label, sig.tRange).then(data => setApiMetrics(data));
            }
        }
    }, [open, sig?.expression, sig?.label, isEditing]); // Dépendances précises

    if (!sig) return null;

    const handleSave = () => {
        setSaveError(null);
        if (!editExpression.trim()) { setSaveError("Formule vide."); return; }

        const newFn = parseExpression(editExpression);
        if (!newFn) { setSaveError("Erreur de syntaxe."); return; }

        onUpdate({
            ...sig,
            label: editLabel,
            expression: editExpression,
            shortLabel: editExpression,
            fn: newFn
        });

        setIsEditing(false);
    };

    // Affichage final : On prend l'API si dispo, sinon le calcul JS instantané
    const displayEnergy = (apiMetrics && !isEditing) ? apiMetrics.energy : instantMetrics.energy;
    const displayPower = (apiMetrics && !isEditing) ? apiMetrics.power : instantMetrics.power;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsEditing(false); setSaveError(null); onClose(); } }}>
            <DialogContent className="glass-strong max-w-2xl border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between pr-8 border-b border-white/5 pb-4">
                    <div className="flex flex-col gap-1 w-full">
                        {isEditing ? (
                            <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="glass font-bold text-lg h-8 w-1/2" placeholder="Nom" />
                        ) : (
                            <DialogTitle style={{ color: color }} className="text-xl">{sig.label}</DialogTitle>
                        )}

                        {!isEditing && (
                            <p className="text-xs font-mono text-primary/80 flex items-center gap-2">
                                <span className="opacity-50 uppercase tracking-widest text-[9px]">Formule :</span>
                                {sig.expression || sig.shortLabel}
                            </p>
                        )}
                    </div>

                    <div className="absolute right-8 top-6">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="p-2 bg-primary/20 hover:bg-primary/40 rounded-full text-primary"><Save className="w-4 h-4" /></button>
                                <button onClick={() => { setIsEditing(false); setSaveError(null); setEditExpression(sig.expression || ""); }} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* Zone d'édition */}
                    {isEditing && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <label className="text-[10px] uppercase font-bold text-primary block">Modifier la Formule</label>
                            <Input
                                value={editExpression}
                                onChange={e => { setEditExpression(e.target.value); setSaveError(null); }}
                                className="glass font-mono text-sm border-primary/50 bg-black/20"
                            />
                            {saveError && <p className="text-xs text-destructive flex items-center gap-1 font-bold"><AlertCircle className="w-3 h-3" /> {saveError}</p>}
                        </div>
                    )}

                    <div className="h-[200px] w-full relative">
                        <SignalChart fn={previewFn} tRange={sig.tRange} label={isEditing ? editLabel : label} color={color} height={200} />
                        {isEditing && <div className="absolute top-2 right-2 text-[10px] text-primary bg-black/50 px-2 py-1 rounded border border-primary/20">Aperçu</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <GlassCard className="p-4 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[100px]">
                            <p className="text-[10px] uppercase opacity-60 mb-1">Énergie {(apiMetrics && !isEditing) ? "(Théorique)" : "(Instant)"}</p>
                            <p className="text-xl font-mono font-bold">{displayEnergy}</p>
                        </GlassCard>
                        <GlassCard className="p-4 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[100px]">
                            <p className="text-[10px] uppercase opacity-60 mb-1">Puissance {(apiMetrics && !isEditing) ? "(Théorique)" : "(Instant)"}</p>
                            <p className="text-xl font-mono font-bold">{displayPower}</p>
                        </GlassCard>
                    </div>

                    <div className="p-4 bg-black/40 rounded-xl border border-primary/20 shadow-inner min-h-[250px] relative">
                        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                            <Calculator className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold text-primary tracking-widest uppercase">Démonstration Mathématique</p>
                        </div>

                        {isEditing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pt-10 bg-black/60 backdrop-blur-[2px] z-10">
                                <Pencil className="w-8 h-8 opacity-50" />
                                <p className="text-xs text-center px-4">Sauvegardez pour relancer l'analyse.</p>
                            </div>
                        ) : apiMetrics ? (
                            <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono font-normal h-[250px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in">
                                {apiMetrics.ai_analysis}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pt-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-xs animate-pulse">Classification théorique en cours...</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
