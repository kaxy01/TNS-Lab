import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Check, ChevronRight, MessageSquare, X, BookOpen } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Chapter } from "@/data/educationData";
import { API_BASE_URL } from "@/config";
import SignalChart from "@/components/SignalChart";

export default function CourseReader({ chapter }: { chapter: Chapter }) {
  const [currentConcept, setCurrentConcept] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextConcept = () => {
    if (currentConcept < chapter.concepts.length - 1) {
      setCurrentConcept(currentConcept + 1);
      setShowChat(false);
      setChatHistory([]);
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
          context: chapter.concepts[currentConcept].aiPromptContext || chapter.concepts[currentConcept].content,
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
      {/* Intro */}
      <GlassCard className="p-6 border-l-4 border-l-purple-500 bg-purple-500/5">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          {chapter.title}
        </h2>
        <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{chapter.description}</div>
      </GlassCard>

      {/* Concepts lus */}
      <div className="space-y-6">
        {chapter.concepts.slice(0, currentConcept + 1).map((concept, index) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className={`p-6 border-l-2 ${index === currentConcept ? "border-l-purple-400 ring-1 ring-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] bg-white/5" : "border-l-transparent opacity-60"}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < currentConcept ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"}`}>
                  {index < currentConcept ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <h3 className="font-bold text-xl text-purple-200 tracking-tight">{concept.title}</h3>
              </div>
              
              <div className="text-muted-foreground whitespace-pre-wrap text-[15px] leading-[1.6] ml-11 mb-6 font-medium">
                {concept.content}
              </div>

              {concept.graph && (
                <div className="ml-11 mt-6 mb-8 p-4 rounded-xl bg-black/20 border border-white/5 shadow-inner">
                  <p className="text-xs font-bold uppercase text-purple-400/70 mb-3 flex items-center gap-2 tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    Représentation Graphique
                  </p>
                  <SignalChart 
                    fn={concept.graph.fn} 
                    tRange={concept.graph.tRange} 
                    label={concept.graph.label} 
                    height={220} 
                    color="hsl(270, 80%, 70%)" 
                  />
                </div>
              )}

              {/* Boutons d'action pour le concept courant */}
              {index === currentConcept && (
                <div className="mt-8 ml-11 flex flex-wrap gap-4">
                  {currentConcept < chapter.concepts.length - 1 && (
                    <button
                      onClick={handleNextConcept}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-all text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      J'ai compris, concept suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-secondary/40 hover:bg-secondary border border-border/50 rounded-lg transition-all text-sm font-bold hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    Explique-moi différemment (IA)
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
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden mt-4"
          >
            <GlassCard className="p-6 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-purple-950/10 ring-1 ring-purple-500/20">
              <div className="flex items-center justify-between mb-6 border-b border-purple-500/10 pb-4">
                <div className="flex items-center gap-3 text-purple-300">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Tuteur IA Spécialiste TNS</h4>
                    <p className="text-[10px] text-purple-400/70 uppercase tracking-tighter">Propulsé par Gemini 1.5 Pro</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-sm text-muted-foreground/80 leading-relaxed italic">
                    "Bonjour ! Je suis là pour clarifier ce concept. Voulez-vous une analogie, un exemple mathématique supplémentaire ou une explication plus visuelle ?"
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === "user" ? "bg-purple-600/30 text-foreground border border-purple-500/20 rounded-tr-none" : "bg-muted/80 text-foreground/90 whitespace-pre-wrap rounded-tl-none border border-border/30"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 text-muted-foreground rounded-2xl rounded-tl-none p-4 text-sm animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                      Le tuteur analyse votre question...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  placeholder="Posez votre question sur ce concept..."
                  className="flex-1 bg-black/30 border border-purple-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={askAI}
                  disabled={isLoading || !question.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      {currentConcept === chapter.concepts.length - 1 && !showChat && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
             <Check className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Section Terminée !</h2>
           <p className="text-muted-foreground mt-3 max-w-sm mx-auto">Vous avez parcouru tous les concepts de cette partie. Bravo pour votre assiduité.</p>
        </motion.div>
      )}
    </div>
  );
}

