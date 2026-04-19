import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import WaveBackground from "@/components/WaveBackground";
import { TD_DATA, COURSE_DATA } from "@/data/educationData";
import InteractiveTD from "@/components/education/InteractiveTD";
import CourseReader from "@/components/education/CourseReader";
import GlassCard from "@/components/GlassCard";

export default function Education() {
  const [activeMode, setActiveMode] = useState<"cours" | "td">("td");
  const [activeTd, setActiveTd] = useState(TD_DATA[0]);
  const [activeExercise, setActiveExercise] = useState(activeTd.exerciseGroups[0].exercises[0]);
  const [expandedTdId, setExpandedTdId] = useState<string | null>(TD_DATA[0].id);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(TD_DATA[0].exerciseGroups[0].id);
  
  const [activeCourse, setActiveCourse] = useState(COURSE_DATA[0]);
  const [activeChapter, setActiveChapter] = useState(activeCourse.chapters[0]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(COURSE_DATA[0].id);

  return (
    <div className="min-h-screen relative gradient-animated">
      <WaveBackground />

      <div className="relative z-10">
        <header className="glass-strong sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Accueil
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              TNS Education Hub
            </h1>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-72 glass-strong h-[calc(100vh-52px)] sticky top-[52px] p-4 gap-4 border-r border-border/30 overflow-y-auto custom-scrollbar">
            
            {/* Toggle Mode */}
            <div className="flex bg-background/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveMode("cours")}
                className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-md transition-all ${
                  activeMode === "cours" ? "bg-purple-500/20 text-purple-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Cours
              </button>
              <button
                onClick={() => setActiveMode("td")}
                className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-md transition-all ${
                  activeMode === "td" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Fiches TD
              </button>
            </div>

            <div className="mb-4 flex-1">
              {activeMode === "td" ? (
                <>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    Travaux Dirigés (TD)
                  </h2>
                  <div className="space-y-2">
                    {TD_DATA.map((td) => (
                      <div key={td.id} className="space-y-1">
                        <button
                          onClick={() => {
                            if (expandedTdId === td.id) {
                              setExpandedTdId(null);
                            } else {
                              setExpandedTdId(td.id);
                              setActiveTd(td);
                              setExpandedGroupId(null);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-between ${
                            expandedTdId === td.id ? "bg-primary/20 text-primary border border-primary/30" : "text-foreground hover:bg-white/5"
                          }`}
                        >
                          <span>{td.title}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedTdId === td.id ? "rotate-90" : ""}`} />
                        </button>
                        {expandedTdId === td.id && (
                          <div className="pl-3 space-y-1 mt-1 border-l-2 border-border ml-2">
                            {td.exerciseGroups.map((group) => (
                              <div key={group.id} className="space-y-1">
                                <button
                                  onClick={() => {
                                    if (expandedGroupId === group.id) {
                                      setExpandedGroupId(null);
                                    } else {
                                      setExpandedGroupId(group.id);
                                      setActiveExercise(group.exercises[0]);
                                    }
                                  }}
                                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-between ${
                                    expandedGroupId === group.id ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                  }`}
                                >
                                  <span className="truncate pr-1">{group.title}</span>
                                  <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${expandedGroupId === group.id ? "rotate-90" : ""}`} />
                                </button>
                                {expandedGroupId === group.id && (
                                  <div className="pl-3 space-y-0.5 mt-0.5 border-l border-cyan-500/20 ml-2">
                                    {group.exercises.map((ex) => (
                                      <button
                                        key={ex.id}
                                        onClick={() => setActiveExercise(ex)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition-all ${
                                          activeExercise.id === ex.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                      >
                                        {ex.title.replace("Exo 1 : ", "")}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    Modules de Cours
                  </h2>
                  <div className="space-y-2">
                    {COURSE_DATA.map((course) => (
                      <div key={course.id} className="space-y-1">
                        <button
                          onClick={() => {
                            if (expandedCourseId === course.id) {
                              setExpandedCourseId(null);
                            } else {
                              setExpandedCourseId(course.id);
                              setActiveCourse(course);
                              setActiveChapter(course.chapters[0]);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-between ${
                            expandedCourseId === course.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-foreground hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate pr-2">{course.title}</span>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${expandedCourseId === course.id ? "rotate-90" : ""}`} />
                        </button>
                        {expandedCourseId === course.id && (
                          <div className="pl-4 space-y-1 mt-1 border-l-2 border-border ml-2">
                            {course.chapters.map((chapter) => (
                              <button
                                key={chapter.id}
                                onClick={() => setActiveChapter(chapter)}
                                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all ${
                                  activeChapter.id === chapter.id ? "bg-purple-500/10 text-purple-400" : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {chapter.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <GlassCard className={`p-4 mt-auto border-dashed ${activeMode === "cours" ? "border-purple-500/30 bg-purple-500/5" : "border-primary/30 bg-primary/5"}`}>
              <h3 className={`text-xs font-bold uppercase mb-2 ${activeMode === "cours" ? "text-purple-400" : "text-primary"}`}>Comment ça marche ?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeMode === "cours" 
                  ? "Lisez le cours étape par étape. Cliquez sur 'J'ai compris' pour avancer, ou demandez à l'IA d'expliquer différemment le concept."
                  : "Résolvez l'exercice sur votre brouillon. Validez chaque étape pour vérifier votre réponse. Si vous bloquez, demandez à l'IA d'expliquer le 'Pourquoi' !"}
              </p>
            </GlassCard>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${activeMode === "cours" ? "text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "glow-text"}`}>
                {activeMode === "cours" ? activeCourse.title : activeTd.title}
              </h1>
              <p className="text-muted-foreground">
                {activeMode === "cours" ? "Lecture guidée interactive" : activeTd.description}
              </p>
            </div>

            {/* Force React to unmount and remount when exercise changes so steps reset to 0 */}
            {activeMode === "cours" ? (
              <CourseReader key={activeChapter.id} chapter={activeChapter} />
            ) : (
              <InteractiveTD key={activeExercise.id} exercise={activeExercise} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
