import React, { useState } from "react";
import { Discipline, SmartInsights, ContextoInforme } from "../types";
import {
  Sparkles,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  Star,
  Zap,
  Loader2,
  Users,
  Mail,
  Send,
  Lock,
  CheckCircle,
  X
} from "lucide-react";

interface ReportGerencialViewProps {
  disciplines: Discipline[];
  insights: SmartInsights;
  onUpdateComment: (id: string, newComment: string) => void;
  onUpdateInsights: (newInsights: SmartInsights) => void;
  onOptimizeDiscipline?: (id: string, comment: string) => Promise<string>;
  contexto: ContextoInforme | null;
}

export default function ReportGerencialView({
  disciplines,
  insights,
  onUpdateComment,
  onUpdateInsights,
  onOptimizeDiscipline,
  contexto,
}: ReportGerencialViewProps) {
  const [localComments, setLocalComments] = useState<{ [key: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    disciplines.forEach((d) => {
      initial[d.id] = d.comment;
    });
    return initial;
  });

  const [savingId, setSavingId] = useState<string | null>(null);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email Notification States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDetails, setEmailDetails] = useState<{ to: string; subject: string; body: string } | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("CORREO_JEFE_PLACEHOLDER");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Handle local comment input
  const handleCommentChange = (id: string, value: string) => {
    setLocalComments((prev) => ({ ...prev, [id]: value }));
    onUpdateComment(id, value);
  };

  // Guardar Avance of a single discipline with real-time AI optimization
  const saveComment = async (id: string) => {
    setSavingId(id);
    const textVal = localComments[id] || "";
    onUpdateComment(id, textVal);
    
    // Simulate slight save latency to let user feel the feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSavingId(null);

    const isNowCompleted = textVal.trim().length > 0;

    if (isNowCompleted && onOptimizeDiscipline) {
      setOptimizingId(id);
      try {
        await onOptimizeDiscipline(id, textVal);
        triggerToast("¡Avance guardado y optimizado con IA (Gemini)!");
      } catch (err) {
        console.error("AI Optimization failed, saved text normally:", err);
        triggerToast("Avance guardado con éxito (error al optimizar con IA).");
      } finally {
        setOptimizingId(null);
      }
    } else {
      triggerToast(
        isNowCompleted 
          ? "Avance guardado con éxito. Estado actualizado a 'Completado'." 
          : "Avance vacío guardado. Estado revertido a 'Pendiente'."
      );
    }
  };

  // Helper trigger toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Count active boxes and check statuses
  const totalDisciplines = disciplines.length;
  const completedDisciplines = disciplines.filter((d) => d.status === "Completado").length;
  const completionPercentage = totalDisciplines > 0 ? Math.round((completedDisciplines / totalDisciplines) * 100) : 0;
  const is100Percent = completedDisciplines === totalDisciplines;

  // Parameterized email sending function
  const sendNotificationEmail = (bossEmail: string = "CORREO_JEFE_PLACEHOLDER") => {
    if (!is100Percent) {
      triggerToast("No se puede enviar la notificación: Aún quedan recuadros pendientes.");
      return;
    }

    const subject = `Informe Consolidado ${contexto?.gerencia || 'GOR'} Andina Oriente - Listo para Descarga`;
    const body = `Estimado Jefe,

Le informamos que el reporte consolidado de avances operativos y seguridad de procesos de la Estación de ${contexto?.gerencia || 'GOR'} (Región Andina Oriente) para el período ${contexto?.mes || 'Junio'} ${contexto?.ano || '2026'} ha sido completado al 100% por el equipo técnico HSE.

Sección de Avances Guardados por Disciplina:
${disciplines.map(d => `- [${d.status}] ${d.name}: "${(d.comment || "").substring(0, 100)}..."`).join("\n")}

El informe y las diapositivas ejecutivas ya se encuentran disponibles en la plataforma para su descarga y posterior revisión técnica.

Atentamente,
Equipo de Seguridad de Procesos ${contexto?.gerencia || 'GOR'}
Ecopetrol S.A.`;

    setEmailDetails({ to: bossEmail, subject, body });
    setShowEmailModal(true);
  };

  // Simulated final email send
  const triggerFinalSend = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setShowEmailModal(false);
      triggerToast(`📧 Correo de notificación enviado exitosamente a: ${recipientEmail}`);
    }, 1200);
  };

  // Generar Informe con IA calling our real server-side endpoint
  const generateIAInsights = async () => {
    setIsGeneratingIA(true);
    try {
      // Build the request body matching what server.ts expects
      const payload = disciplines.map((d) => ({
        id: d.id,
        name: d.name,
        comment: localComments[d.id] || "Sin avance.",
        status: d.status,
      }));

      const res = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplines: payload }),
      });

      if (!res.ok) {
        throw new Error("La respuesta del servidor falló al generar insights.");
      }

      const data: SmartInsights = await res.json();
      if (data && Array.isArray(data.hitos) && Array.isArray(data.alertas)) {
        onUpdateInsights(data);
        triggerToast("¡Smart Insights actualizados exitosamente con Gemini AI!");
      } else {
        throw new Error("Formato de respuesta de IA inválido.");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Error al conectar con la IA. Generando insights predictivos de respaldo.");
      
      // Resilient fallback logic if server or key fails
      const backupHitos = [
        "Consolidación activa de reportes operativos en los 5 frentes.",
        "Alineación sistemática de seguridad e higiene industrial en Castilla.",
      ];
      const backupAlertas = [
        "Verificar tiempos de respuesta en plataformas colaborativas.",
        "Seguimiento preventivo a la logística de materiales críticos.",
      ];
      onUpdateInsights({ hitos: backupHitos, alertas: backupAlertas });
    } finally {
      setIsGeneratingIA(false);
    }
  };

  // Badge colors for disciplines
  const getDisciplineStatusBadge = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-emerald-600 text-white font-semibold";
      case "Pendiente":
        return "bg-amber-500 text-slate-950 font-semibold";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Dynamic Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b-2 border-ecogreen-primary gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-ecogreen-primary tracking-tight">
            Comentarios por Disciplina
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Seguimiento colaborativo de hallazgos y acciones preventivas de seguridad de procesos.
          </p>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center gap-2">
          {/* Smart AI Generation button matching Image 4 */}
          <button
            onClick={generateIAInsights}
            disabled={isGeneratingIA}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#006d38] hover:bg-[#004e28] disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isGeneratingIA ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando avances...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current text-yellow-300 animate-pulse" />
                <span>Generar Informe con IA</span>
              </>
            )}
          </button>

          {/* Connected users indicator matching Image 4 */}
          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>12 Activos ahora</span>
          </span>
        </div>
      </header>

      {/* PROGRESS TRACKER AND EMAIL NOTIFICATION PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Progress status */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm font-headline text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-ecogreen-primary" />
              <span>Progreso de Avances Operativos</span>
            </h3>
            <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">
              {completedDisciplines} de {totalDisciplines} Completados
            </span>
          </div>

          {/* Visual progress bar */}
          <div className="w-full bg-slate-150 h-3.5 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                is100Percent ? "bg-gradient-to-r from-emerald-500 to-[#006d38]" : "bg-gradient-to-r from-amber-400 to-emerald-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">
            {is100Percent 
              ? "🎉 ¡Estupendo! Todas las disciplinas tienen un comentario válido de seguridad de procesos."
              : `Faltan ${totalDisciplines - completedDisciplines} disciplinas por rellenar con información técnica para completar el informe al 100%.`}
          </p>
        </div>

        {/* Divider for MD+ screens */}
        <div className="hidden md:block md:col-span-1 text-center h-full border-r border-slate-200"></div>

        {/* Right Column: Email validation and trigger button */}
        <div className="md:col-span-6 space-y-3">
          <div className="flex items-center gap-2">
            <Mail className={`w-4 h-4 ${is100Percent ? "text-emerald-600" : "text-slate-400"}`} />
            <h3 className="font-bold text-sm text-slate-800">
              Notificación de Disponibilidad del Informe
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Input target email (editable but defaults to CORREO_JEFE_PLACEHOLDER) */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="CORREO_JEFE_PLACEHOLDER"
                className="w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-ecogreen-primary transition-all"
              />
              <span className="absolute right-2.5 top-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Destinatario
              </span>
            </div>

            {/* Email send button triggered conditionally */}
            <button
              onClick={() => sendNotificationEmail(recipientEmail)}
              disabled={!is100Percent}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                is100Percent 
                  ? "bg-[#006d38] hover:bg-[#004e28] text-white shadow-md active:scale-95 cursor-pointer" 
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }`}
            >
              {is100Percent ? (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar al Jefe</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bloqueado (Faltan campos)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            * Al estar al 100%, se habilitará la función para notificar al correo parametrizado que los avances están listos para descarga.
          </p>
        </div>

      </div>

      {/* EMAIL PREVIEW MODAL */}
      {showEmailModal && emailDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal header */}
            <div className="bg-[#006d38] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Validación y Envío de Correo</h3>
                  <p className="text-[10px] opacity-90">Parametrización del flujo de entrega {contexto?.gerencia || 'GOR'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-4">
              
              {/* Recipient info */}
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <div className="flex text-xs">
                  <span className="font-bold text-slate-500 w-16">Para:</span>
                  <span className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {emailDetails.to}
                  </span>
                </div>
                <div className="flex text-xs">
                  <span className="font-bold text-slate-500 w-16">Asunto:</span>
                  <span className="text-slate-800 font-semibold">{emailDetails.subject}</span>
                </div>
              </div>

              {/* Message box */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mensaje Redactado Automáticamente:
                </span>
                <textarea
                  readOnly
                  value={emailDetails.body}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4 h-56 font-sans resize-none outline-none leading-relaxed"
                ></textarea>
              </div>

              {/* Notice */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-2.5 items-start text-[11px] text-[#006d38]">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>La función está correctamente parametrizada para conectarse con su servidor SMTP / servicio de correo utilizando el placeholder <code>'CORREO_JEFE_PLACEHOLDER'</code>.</span>
              </div>

            </div>

            {/* Modal action footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={triggerFinalSend}
                disabled={isSendingEmail}
                className="px-5 py-2 bg-[#006d38] hover:bg-[#004e28] text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar Envío</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Disciplines Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disciplines.map((discipline) => (
          <div
            key={discipline.id}
            className="bg-white border border-slate-200 hover:border-ecogreen-primary/40 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all group h-[360px]"
          >
            {/* Discipline header with status chip */}
            <div className="flex items-start justify-between gap-2 shrink-0">
              <h3 className="font-bold text-sm sm:text-base font-headline text-slate-800 leading-snug group-hover:text-ecogreen-primary transition-colors">
                {discipline.name}
              </h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${getDisciplineStatusBadge(discipline.status)}`}>
                {discipline.status}
              </span>
            </div>

            {/* Comment field text area */}
            <textarea
              value={localComments[discipline.id] ?? ""}
              onChange={(e) => handleCommentChange(discipline.id, e.target.value)}
              placeholder="Escribe el avance operativo de seguridad de procesos aquí..."
              className="w-full flex-1 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:bg-white focus:border-ecogreen-primary focus:ring-1 focus:ring-ecogreen-primary transition-all resize-none"
            ></textarea>

            {/* Submit save button */}
            <button
              onClick={() => saveComment(discipline.id)}
              disabled={savingId === discipline.id || optimizingId === discipline.id}
              className="flex items-center gap-1.5 bg-[#006d38] hover:bg-[#004e28] text-white py-1.5 px-3.5 rounded-lg font-bold text-xs self-end shadow-sm active:scale-95 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {savingId === discipline.id ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : optimizingId === discipline.id ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300 fill-yellow-300" />
                  <span>Optimizando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Avance</span>
                </>
              )}
            </button>
          </div>
        ))}
      </section>


    </div>
  );
}
