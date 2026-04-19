import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Check, ChevronRight, MessageSquare, X } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Exercise } from "@/data/educationData";
import { API_BASE_URL } from "@/config";
import SignalChart from "@/components/SignalChart";

export default function InteractiveTD({ exercise }: { exercise: Exercise }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (currentStep < exercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowChat(false);
      setChatHistory([]); // Reset chat when moving to next step
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;

    const userMessage = question;
    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/education/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: exercise.steps[currentStep].aiPromptContext || exercise.steps[currentStep].content,
          question: userMessage,
        }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.response }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Désolé, l'IA est indisponible pour le moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Énoncé */}
      <GlassCard className="p-6 border-l-4 border-l-primary bg-primary/5">
        <h2 className="text-xl font-bold mb-4">{exercise.title}</h2>
        <div className="text-foreground/90 whitespace-pre-wrap">{exercise.statement}</div>
      </GlassCard>

      {/* Étapes résolues */}
      <div className="space-y-4">
        {exercise.steps.slice(0, currentStep + 1).map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className={`p-5 ${index === currentStep ? "ring-2 ring-primary/50 glow" : "opacity-80"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < currentStep ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
              </div>
              <div className="text-muted-foreground whitespace-pre-wrap ml-9 font-mono text-sm">
                {step.content}
              </div>
              {step.graph && (
                <div className="ml-9 mt-4 mb-2 pointer-events-none">
                  <SignalChart fn={step.graph.fn} tRange={step.graph.tRange} label={step.graph.label} height={200} color="hsl(187, 100%, 55%)" />
                </div>
              )}

              {/* Boutons d'action pour l'étape courante */}
              {index === currentStep && (
                <div className="mt-6 ml-9 flex gap-3">
                  {currentStep < exercise.steps.length - 1 && (
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md transition-colors text-sm font-medium"
                    >
                      J'ai compris, étape suivante
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary border border-border rounded-md transition-colors text-sm font-medium"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    Je n'ai pas compris (Aide IA)
                  </button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Panneau de Chat IA */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-5 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <BrainCircuit className="w-5 h-5" />
                  <h4 className="font-bold">Professeur IA (Gemini)</h4>
                </div>
                <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Posez-moi une question sur l'étape actuelle. Je suis là pour vous aider à comprendre, pas pour faire le travail à votre place !
                  </p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground whitespace-pre-wrap"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm animate-pulse">
                      Gemini réfléchit...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  placeholder="Demandez 'Pourquoi on intègre de -T/2 à T/2 ?'"
                  className="flex-1 bg-background/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={askAI}
                  disabled={isLoading || !question.trim()}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      {currentStep === exercise.steps.length - 1 && !showChat && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
             <Check className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold">Exercice Terminé !</h2>
           <p className="text-muted-foreground mt-2">Vous avez compris toutes les étapes avec succès.</p>
        </motion.div>
      )}
    </div>
  );
}
