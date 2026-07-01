import React, { useState, useEffect } from "react";
import { Task, Discipline, TeamMember, SmartInsights, HSEStatus, ContextoInforme } from "./types";
import {
  initialTasks,
  initialDisciplines,
  initialTeam,
  initialInsights,
  getInitialDisciplinesForContext,
  getInitialTeamForContext,
  getInitialInsightsForContext,
} from "./data";
import CoverView from "./components/CoverView";
import TeamView from "./components/TeamView";
import WorkPlanView from "./components/WorkPlanView";
import ReportGerencialView from "./components/ReportGerencialView";
import SlidesView from "./components/SlidesView";
import ContextSetupView from "./components/ContextSetupView";
import {
  testConnection,
  saveReportToFirestore,
  loadReportFromFirestore,
} from "./lib/firebase";
import {
  Bell,
  User,
  Activity,
  Plus,
  Compass,
  AlertTriangle,
  FileText,
  Settings,
  HelpCircle,
  Home,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X
} from "lucide-react";

export default function App() {
  // Contexto Global del Informe State
  const [reportContext, setReportContext] = useState<ContextoInforme | null>(() => {
    const saved = localStorage.getItem("report_context");
    return saved ? JSON.parse(saved) : null;
  });

  const [showContextSetup, setShowContextSetup] = useState(() => {
    const saved = localStorage.getItem("report_context");
    return !saved;
  });

  // Navigation State: "portada" is the initial screen.
  const [activeTab, setActiveTab] = useState<"portada" | "plan" | "reporte" | "tecnologia" | "diapositivas">("portada");

  // Core Persisted States with local storage fallbacks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const dbVersion = localStorage.getItem("gor_db_version");
    const isNewDb = dbVersion === "v3";
    
    if (!isNewDb) {
      localStorage.removeItem("gor_tasks");
      localStorage.removeItem("gor_disciplines");
      localStorage.removeItem("gor_insights");
      localStorage.setItem("gor_db_version", "v3");
    }

    const saved = isNewDb ? localStorage.getItem("gor_tasks") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if tasks conform to the new schema by checking for 'mes' property
          const isValidSchema = parsed.every((t: any) => t && typeof t === "object" && "mes" in t && "proyecto" in t);
          if (isValidSchema) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Error loading tasks from localStorage:", e);
      }
    }
    // Context-based fallback
    const contextSaved = localStorage.getItem("report_context");
    const context = contextSaved ? JSON.parse(contextSaved) : null;
    if (context) {
      if (context.gerencia === "GPA") {
        return initialTasks.filter(t => t.campo === "Putumayo" || t.campo === "Huila");
      } else {
        return initialTasks.filter(t => t.campo === "Rubiales" || t.campo === "Cao Sur" || t.campo === "Caño Sur");
      }
    }
    return initialTasks;
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>(() => {
    const saved = localStorage.getItem("gor_disciplines");
    const contextSaved = localStorage.getItem("report_context");
    const context = contextSaved ? JSON.parse(contextSaved) : null;
    let loaded = saved ? JSON.parse(saved) : (context ? getInitialDisciplinesForContext(context.gerencia, context.mes, context.ano) : initialDisciplines);
    
    // Ensure "ia_itp" is included in loaded if it isn't already there (e.g., if loaded from previous localStorage)
    const hasIaItp = loaded.some((d: any) => d.id === "ia_itp");
    if (!hasIaItp) {
      const revisionIndex = loaded.findIndex((d: any) => d.id === "revision");
      const newElem = {
        id: "ia_itp",
        name: "Implementación de recursos tecnológicos potenciados con IA para ITP",
        status: "Pendiente",
        comment: "",
        optimizedComment: ""
      };
      if (revisionIndex !== -1) {
        loaded = [
          ...loaded.slice(0, revisionIndex + 1),
          newElem,
          ...loaded.slice(revisionIndex + 1)
        ];
      } else {
        loaded.push(newElem);
      }
    }

    return loaded.map((d: any) => {
      let name = d.name;
      if (d.id === "revision") {
        name = "Datos técnicos relevantes - Revisión de ITP";
      }
      if (d.id === "sharepoint") {
        name = "Gestión Plan de Trabajo ITP";
      }
      if (d.id === "ia_itp") {
        name = "Implementación de recursos tecnológicos potenciados con IA para ITP";
      }
      const hasComment = d.comment && d.comment.trim().length > 0;
      return {
        ...d,
        name,
        status: hasComment ? "Completado" : "Pendiente"
      };
    });
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("gor_team");
    const contextSaved = localStorage.getItem("report_context");
    const context = contextSaved ? JSON.parse(contextSaved) : null;
    return saved ? JSON.parse(saved) : (context ? getInitialTeamForContext(context.gerencia) : initialTeam);
  });

  const [insights, setInsights] = useState<SmartInsights>(() => {
    const saved = localStorage.getItem("gor_insights");
    const contextSaved = localStorage.getItem("report_context");
    const context = contextSaved ? JSON.parse(contextSaved) : null;
    return saved ? JSON.parse(saved) : (context ? getInitialInsightsForContext(context.gerencia, context.mes, context.ano) : initialInsights);
  });

  // Secondary interactive UI states
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<{ title: string; content: string } | null>(null);

  // Firebase Integration States
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Test connection on app mount
  useEffect(() => {
    testConnection()
      .then(() => setIsFirebaseConnected(true))
      .catch((err) => {
        console.error("Firebase connection test failed:", err);
        setIsFirebaseConnected(false);
      });
  }, []);

  // Fetch report from Firebase when context changes
  useEffect(() => {
    if (!reportContext) return;

    const fetchContextReport = async () => {
      setIsLoadingReport(true);
      try {
        const cloudReport = await loadReportFromFirestore(reportContext);
        if (cloudReport) {
          setTasks(cloudReport.tasks);
          setDisciplines(cloudReport.disciplines);
          setTeamMembers(cloudReport.teamMembers);
          setInsights(cloudReport.insights);
          setLastSynced(cloudReport.updatedAt);
        } else {
          // If no cloud report exists, save the current local/default state as the initial cloud report
          await saveReportToFirestore(reportContext, {
            tasks,
            disciplines,
            teamMembers,
            insights,
          });
          setLastSynced(new Date().toISOString());
        }
      } catch (err) {
        console.error("Error syncing report from Firebase:", err);
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchContextReport();
  }, [reportContext]);

  // Debounced auto-save to Firestore on any core state changes
  useEffect(() => {
    if (!reportContext || isLoadingReport) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await saveReportToFirestore(reportContext, {
          tasks,
          disciplines,
          teamMembers,
          insights,
        });
        setLastSynced(new Date().toISOString());
      } catch (err) {
        console.error("Error auto-saving report to Firebase:", err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [tasks, disciplines, teamMembers, insights, reportContext, isLoadingReport]);

  // Synchronize state with local storage
  useEffect(() => {
    localStorage.setItem("gor_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("gor_disciplines", JSON.stringify(disciplines));
  }, [disciplines]);

  useEffect(() => {
    localStorage.setItem("gor_team", JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem("gor_insights", JSON.stringify(insights));
  }, [insights]);

  // Task Mutators
  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    };
    setTasks((prev) => [task, ...prev]);
    setNotificationCount((c) => c + 1);
  };

  const handleUpdateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar esta actividad de su plan de trabajo?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleReplaceTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    setNotificationCount((c) => c + 1);
  };

  // Automatic synchronization from "Reporte General" (disciplines) comments to "Plan de Trabajo" (tasks)
  useEffect(() => {
    setTasks((prevTasks) => {
      let changed = false;
      const updated = prevTasks.map((task) => {
        if (!task || !task.proyecto || !task.paquete) return task;
        // Check if the project code or package is mentioned in any of the disciplines' comments
        const isMentioned = disciplines.some((d) => {
          const comment = (d.comment || "").toLowerCase();
          const projClean = (task.proyecto || "").toLowerCase().trim();
          const paqClean = (task.paquete || "").toLowerCase().trim();
          
          const matchesProj = projClean.length > 4 && comment.includes(projClean);
          const matchesPaq = paqClean.length > 2 && comment.includes(paqClean);
          
          return matchesProj || matchesPaq;
        });

        if (isMentioned && task.estado !== "Completado") {
          changed = true;
          return {
            ...task,
            estado: "Completado" as const,
            avance: task.peso,
          };
        }
        return task;
      });

      return changed ? updated : prevTasks;
    });
  }, [disciplines]);

  // Team Mutator
  const handleUpdateMember = (id: string, newName: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
  };

  // Discipline Mutator
  const handleUpdateComment = (id: string, newComment: string, optimizedVal?: string) => {
    setDisciplines((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const hasComment = newComment && newComment.trim().length > 0;
          return {
            ...d,
            comment: newComment,
            optimizedComment: typeof optimizedVal === "string" ? optimizedVal : newComment,
            status: hasComment ? "Completado" : "Pendiente"
          };
        }
        return d;
      })
    );
  };

  // Helper to generate local high-quality bullet fallbacks in case of network failures
  const generateLocalFallbackBullets = (id: string, comment: string): string => {
    const replaceMap: { [key: string]: string } = {
      "retraso": "desviación temporal en cronograma",
      "atraso": "desviación en cronograma operacional",
      "demora": "retraso logístico de componentes",
      "malo": "desfavorable en métricas de confiabilidad",
      "problemas": "intermitencias operativas registradas",
      "falla": "anomalía técnica identificada",
      "daño": "compromiso estructural detectado",
      "falta": "requerimiento pendiente de",
      "jefe": "comité gerencial",
      "ayuda": "soporte de gestión ejecutiva",
      "atrasado": "desfasado frente a línea base",
      "retrasado": "desfasado frente a línea base",
      "excelente": "altamente de confianza bajo estándares corporativos",
    };

    const sentences = comment
      .split(/(?:[.\n]|\s{2,})/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    const fallbackBullets = sentences.map((s) => {
      let text = s;
      Object.keys(replaceMap).forEach((key) => {
        const regex = new RegExp(`\\b${key}\\b`, "gi");
        text = text.replace(regex, replaceMap[key]);
      });
      let formatted = text.charAt(0).toUpperCase() + text.slice(1);
      if (!formatted.endsWith(".")) formatted += ".";
      return `• ${formatted}`;
    });

    if (fallbackBullets.length === 0) {
      fallbackBullets.push(`• Avance operativo registrado para la disciplina ${id.toUpperCase()}: ${comment}.`);
    }

    let result = fallbackBullets.slice(0, 3).join("\n");
    if ((id === "continuidad" || id === "mocs" || id === "edp" || id === "revision" || id === "ia_itp") && result.length > 280) {
      const lines = result.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      let resultLines: string[] = [];
      let currentLen = 0;

      for (const line of lines) {
        const lineLenWithSeparator = currentLen === 0 ? line.length : line.length + 1;
        if (currentLen + lineLenWithSeparator <= 280) {
          resultLines.push(line);
          currentLen += lineLenWithSeparator;
        } else {
          if (resultLines.length === 0) {
            resultLines.push(line.slice(0, 277) + "...");
          }
          break;
        }
      }
      result = resultLines.join("\n");
    }

    return result;
  };

  // Discipline Comment AI Optimizer
  const handleOptimizeDiscipline = async (id: string, comment: string) => {
    if (!comment.trim()) {
      setDisciplines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, optimizedComment: "" } : d))
      );
      return "";
    }

    try {
      const response = await fetch("/api/optimize-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, comment, tasks }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta de optimización del servidor.");
      }

      const data = await response.json();
      const optimizedText = data.optimized || "";

      setDisciplines((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, optimizedComment: optimizedText } : d
        )
      );

      if (id === "sharepoint") {
        return {
          optimized: optimizedText,
          matches: data.matches || [],
          unmatched: data.unmatched || []
        };
      }

      return optimizedText;
    } catch (error) {
      console.warn("Error al optimizar comentario con IA (activando fallback local):", error);
      
      // Graceful client-side fallback to ensure 100% uptime and seamless slides synchronization
      const localOptimized = generateLocalFallbackBullets(id, comment);
      setDisciplines((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, optimizedComment: localOptimized } : d
        )
      );

      if (id === "sharepoint") {
        // Run simple local regex matches client-side in case of API failure
        const matches: any[] = [];
        tasks.forEach((t) => {
          if (t.estado !== "Completado") {
            const projId = t.proyecto.toLowerCase().split("_")[0];
            const paqId = t.paquete.toLowerCase();
            const commentLower = comment.toLowerCase();
            if (commentLower.includes(projId) && commentLower.includes(paqId)) {
              matches.push({
                matchedTaskId: t.id,
                proyectoIdentified: t.proyecto,
                paqueteIdentified: t.paquete,
                explanation: "Coincidencia local (enlace de contingencia fuera de línea)"
              });
            }
          }
        });
        return {
          optimized: localOptimized,
          matches,
          unmatched: []
        };
      }

      return localOptimized;
    }
  };

  const handleApplySharepointMatches = (matchedIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (matchedIds.includes(t.id)) {
          return {
            ...t,
            estado: "Completado" as const,
            avance: t.peso,
          };
        }
        return t;
      })
    );
  };

  // Insights Mutator
  const handleUpdateInsights = (newInsights: SmartInsights) => {
    setInsights(newInsights);
  };

  // Handle sidebar direct action to trigger new report context setup
  const handleSidebarNewReport = () => {
    setShowContextSetup(true);
  };

  // Handle global report context confirmation and cascade data updates
  const handleConfirmContext = (newContext: ContextoInforme) => {
    setReportContext(newContext);
    localStorage.setItem("report_context", JSON.stringify(newContext));

    // Load fresh data for that context
    const freshTasks = newContext.gerencia === "GPA"
      ? initialTasks.filter((t) => t.campo === "Putumayo" || t.campo === "Huila")
      : initialTasks.filter((t) => t.campo === "Rubiales" || t.campo === "Cao Sur" || t.campo === "Caño Sur");
    setTasks(freshTasks);
    localStorage.setItem("gor_tasks", JSON.stringify(freshTasks));

    const freshDisciplines = getInitialDisciplinesForContext(newContext.gerencia, newContext.mes, newContext.ano);
    setDisciplines(freshDisciplines);
    localStorage.setItem("gor_disciplines", JSON.stringify(freshDisciplines));

    const freshTeam = getInitialTeamForContext(newContext.gerencia);
    setTeamMembers(freshTeam);
    localStorage.setItem("gor_team", JSON.stringify(freshTeam));

    const freshInsights = getInitialInsightsForContext(newContext.gerencia, newContext.mes, newContext.ano);
    setInsights(freshInsights);
    localStorage.setItem("gor_insights", JSON.stringify(freshInsights));

    setShowContextSetup(false);

    // If on cover page, transition to slides view automatically
    if (activeTab === "portada") {
      setActiveTab("diapositivas");
    }
  };

  // Filter tasks that are critical to count in sidebar alerts
  const criticalCount = tasks.filter((t) => t.estado === "Sin iniciar").length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans select-none antialiased">
      {/* 1. Immersive Portada View */}
      {activeTab === "portada" ? (
        <CoverView
          reportContext={reportContext}
          onConfirmContext={handleConfirmContext}
        />
      ) : (
        /* 2. Full-Stack Layout containing TopBar, SideBar and interactive content area */
        <div className="flex flex-col min-h-screen">
          
          {/* TopNavBar matching Images 3 & 4 */}
          <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center w-full px-8 h-16 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-8">
              {/* Main Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-6 h-16">
                <button
                  onClick={() => setActiveTab("plan")}
                  className={`font-semibold text-sm transition-all h-full px-2 border-b-2 flex items-center ${
                    activeTab === "plan"
                      ? "border-ecogreen-primary text-[#006d38]"
                      : "border-transparent text-slate-500 hover:text-ecogreen-primary"
                  }`}
                >
                  Plan de Trabajo y Gestión
                </button>
                <button
                  onClick={() => setActiveTab("reporte")}
                  className={`font-semibold text-sm transition-all h-full px-2 border-b-2 flex items-center ${
                    activeTab === "reporte"
                      ? "border-ecogreen-primary text-[#006d38]"
                      : "border-transparent text-slate-500 hover:text-ecogreen-primary"
                  }`}
                >
                  Reporte Gerencial
                </button>
                <button
                  onClick={() => setActiveTab("diapositivas")}
                  className={`font-semibold text-sm transition-all h-full px-2 border-b-2 flex items-center ${
                    activeTab === "diapositivas"
                      ? "border-ecogreen-primary text-[#006d38]"
                      : "border-transparent text-slate-500 hover:text-ecogreen-primary"
                  }`}
                >
                  Informe Comité ASP
                </button>
              </nav>
            </div>

            {/* Active Context Indicator always visible in Topbar */}
            {reportContext && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-xs font-bold text-emerald-800 font-headline uppercase tracking-wide">
                  Contexto Activo: {reportContext.gerencia} — {reportContext.mes} {reportContext.ano}
                </span>
                <button 
                  onClick={() => setShowContextSetup(true)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-800 hover:underline font-bold ml-2 border-l border-emerald-200 pl-2 cursor-pointer transition-colors"
                  title="Configurar nuevo contexto de informe"
                >
                  Cambiar Período
                </button>
              </div>
            )}

            {/* Topbar Right Slogans and Actions */}
            <div className="flex items-center gap-4">
              
              {/* User Account Button */}
              <button
                onClick={() => setShowInfoModal({
                  title: "Perfil de Usuario - GOR",
                  content: "Sesión activa para: Ing. Diana Carolina Pape (HSE Regional GOR). Región Andina Oriente, Ecopetrol S.A.",
                })}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 cursor-pointer"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Sidebar Navigation matching mockup */}
          <aside className="fixed left-0 top-16 bottom-0 flex flex-col p-4 z-30 bg-[#f3f4f5] border-r border-slate-200 w-64 shadow-sm overflow-y-auto select-none">
            <div className="mb-6 px-2 mt-2">
              <h2 className="text-lg font-black font-headline text-ecogreen-primary tracking-tight">
                Gestión {reportContext?.gerencia || 'GOR'}
              </h2>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                INDICADORES DE GESTIÓN DE LA TECNOLOGÍA DEL PROCESO
              </p>

              {/* Firebase Cloud Connection Status */}
              <div className="mt-3 p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[9px] font-semibold text-slate-600 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>Nube: {isFirebaseConnected ? 'Firebase' : 'Local'}</span>
                </div>
                {isSyncing ? (
                  <span className="text-amber-600 animate-pulse font-bold">Guardando...</span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    {lastSynced ? `Sinc. ${new Date(lastSynced).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Sincronizado'}
                  </span>
                )}
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-col gap-1.5 flex-1">
              {/* Informe Comité ASP */}
              <button
                onClick={() => setActiveTab("diapositivas")}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all ${
                  activeTab === "diapositivas"
                    ? "bg-ecogreen-primary/10 text-ecogreen-primary font-bold border-l-4 border-ecogreen-primary"
                    : "text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-ecogreen-primary shrink-0" />
                  <span className="text-xs font-semibold tracking-wide">Informe Comité ASP</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>

              {/* Reporte General (Switches to Reporte Gerencial view) */}
              <button
                onClick={() => setActiveTab("reporte")}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all ${
                  activeTab === "reporte"
                    ? "bg-ecogreen-primary/10 text-ecogreen-primary font-bold border-l-4 border-ecogreen-primary"
                    : "text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold tracking-wide">Reporte General</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>

              {/* Plan de Trabajo / Plan de Trabajo */}
              <button
                onClick={() => setActiveTab("plan")}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all ${
                  activeTab === "plan"
                    ? "bg-ecogreen-primary/10 text-ecogreen-primary font-bold border-l-4 border-ecogreen-primary"
                    : "text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold tracking-wide">Plan de Trabajo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </nav>

            {/* Sidebar bottom configs */}
            <div className="mt-auto border-t border-slate-200 pt-4 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("portada")}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold">Salir de la App</span>
              </button>
            </div>
          </aside>

          {/* Main Content Canvas with wave-bg matching mockup images */}
          <main className="ml-64 pt-16 min-h-screen wave-bg p-8 flex flex-col justify-between">
            <div className="max-w-6xl mx-auto w-full flex-1 pb-16">
              
              {/* Dynamic sub-view injection based on active tab */}
              {activeTab === "plan" && (
                <WorkPlanView
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onReplaceTasks={handleReplaceTasks}
                  contexto={reportContext}
                />
              )}

              {activeTab === "reporte" && (
                <ReportGerencialView
                  disciplines={disciplines}
                  insights={insights}
                  onUpdateComment={handleUpdateComment}
                  onUpdateInsights={handleUpdateInsights}
                  onOptimizeDiscipline={handleOptimizeDiscipline}
                  contexto={reportContext}
                  tasks={tasks}
                  onApplySharepointMatches={handleApplySharepointMatches}
                />
              )}

              {activeTab === "tecnologia" && (
                <TeamView
                  members={teamMembers}
                  onUpdateMember={handleUpdateMember}
                />
              )}

              {activeTab === "diapositivas" && (
                <SlidesView
                  tasks={tasks}
                  team={teamMembers}
                  disciplines={disciplines}
                  contexto={reportContext}
                />
              )}
            </div>

            {/* Sticky/Fixed Footer matching mockup */}
            <footer className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4 w-full max-w-6xl mx-auto">
              <span className="font-semibold">
                © {reportContext?.ano || '2026'} Gestión {reportContext?.gerencia || 'GOR'} — {reportContext?.gerencia === "GPA" ? "Región Putumayo" : "Andina Oriente"}. Todos los derechos reservados.
              </span>
              <div className="flex gap-6">
                <button
                  onClick={() => setShowInfoModal({
                    title: "Soporte Técnico - GOR",
                    content: "Centro de Soporte Técnico GOR. Correo: soporte.gor@ecopetrol.com.co. Línea de atención: Ext 84321.",
                  })}
                  className="hover:underline transition-all text-slate-500 cursor-pointer"
                >
                  Soporte Técnico
                </button>
                <button
                  onClick={() => setShowInfoModal({
                    title: "Manual de Usuario - Seguridad de Procesos",
                    content: "Cargue un archivo CSV/Excel para poblar la lista del plan. Edite o elimine las tareas con los controles interactivos. En 'Reporte Gerencial', escriba sus comentarios y guarde el avance para que la IA (Gemini) aprenda y proponga alertas y hitos en tiempo real.",
                  })}
                  className="hover:underline transition-all text-slate-500 cursor-pointer"
                >
                  Manual de Usuario
                </button>
                <button
                  onClick={() => setShowInfoModal({
                    title: "Políticas HSE de Ecopetrol S.A.",
                    content: "La seguridad es un valor intransigente. Cero incidentes es nuestra meta perpetua. Identifique, reporte y corrija cualquier desviación antes de iniciar la actividad. ¡Primero la Vida!",
                  })}
                  className="hover:underline transition-all text-slate-500 cursor-pointer"
                >
                  Políticas HSE
                </button>
              </div>
            </footer>
          </main>
        </div>
      )}

      {/* GLOBAL CONTEXT SETUP DIALOG */}
      {showContextSetup && (
        <ContextSetupView
          initialContext={reportContext}
          onConfirm={handleConfirmContext}
          onClose={reportContext ? () => setShowContextSetup(false) : undefined}
          isMandatory={!reportContext}
        />
      )}

      {/* GLOBAL POPUP DIALOG FOR INSTRUCTIONS AND INFORMATION */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-100 relative">
            <button
              onClick={() => setShowInfoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-headline text-ecogreen-primary mb-3">
              {showInfoModal.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {showInfoModal.content}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(null)}
                className="px-4 py-2 bg-ecogreen-primary hover:bg-[#004e28] text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
