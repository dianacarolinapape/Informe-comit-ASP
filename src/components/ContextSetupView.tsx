import React, { useState } from "react";
import { ContextoInforme } from "../types";
import { ShieldCheck, HelpCircle, X, Check } from "lucide-react";

interface ContextSetupViewProps {
  initialContext: ContextoInforme | null;
  onConfirm: (context: ContextoInforme) => void;
  onClose?: () => void;
  isMandatory: boolean;
}

export default function ContextSetupView({
  initialContext,
  onConfirm,
  onClose,
  isMandatory,
}: ContextSetupViewProps) {
  const [gerencia, setGerencia] = useState<"GOR" | "GPA">(
    initialContext?.gerencia || "GOR"
  );
  const [mes, setMes] = useState<string>(initialContext?.mes || "Junio");
  const [ano, setAno] = useState<string>(initialContext?.ano || "2026");

  const [validationError, setValidationError] = useState<string | null>(null);

  const monthsWithRanges = [
    { name: "Enero", range: "01 Ene - 31 Ene" },
    { name: "Febrero", range: "01 Feb - 28 Feb (29 en bisiesto)" },
    { name: "Marzo", range: "01 Mar - 31 Mar" },
    { name: "Abril", range: "01 Abr - 30 Abr" },
    { name: "Mayo", range: "01 May - 31 May" },
    { name: "Junio", range: "01 Jun - 30 Jun" },
    { name: "Julio", range: "01 Jul - 31 Jul" },
    { name: "Agosto", range: "01 Ago - 31 Ago" },
    { name: "Septiembre", range: "01 Sep - 30 Sep" },
    { name: "Octubre", range: "01 Oct - 31 Oct" },
    { name: "Noviembre", range: "01 Nov - 30 Nov" },
    { name: "Diciembre", range: "01 Dic - 31 Dic" },
  ];

  const getDaysInMonth = (monthName: string, yearStr: string) => {
    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const yearNum = parseInt(yearStr) || 2026;
    switch (monthName) {
      case "Enero": return 31;
      case "Febrero": return isLeapYear(yearNum) ? 29 : 28;
      case "Marzo": return 31;
      case "Abril": return 30;
      case "Mayo": return 31;
      case "Junio": return 30;
      case "Julio": return 31;
      case "Agosto": return 31;
      case "Septiembre": return 30;
      case "Octubre": return 31;
      case "Noviembre": return 30;
      case "Diciembre": return 31;
      default: return 30;
    }
  };

  const years = ["2025", "2026", "2027", "2028"];

  const handleConfirm = () => {
    if (!gerencia || !mes || !ano) {
      setValidationError("Todos los campos son requeridos.");
      return;
    }
    onConfirm({ gerencia, mes, ano });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 relative">
        {/* Close Button only if not mandatory */}
        {!isMandatory && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            id="close-context-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="bg-[#1b0a45] text-white p-6 relative overflow-hidden">
          {/* Wave background decor */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase block leading-none">
                Ecopetrol S.A.
              </span>
              <h2 className="text-xl font-extrabold font-headline tracking-tight mt-1">
                Contexto Global del Informe
              </h2>
            </div>
          </div>
        </div>

        {/* Selection Form */}
        <div className="p-8 space-y-6">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Configure el contexto activo antes de acceder a los módulos de la aplicación.
            Todos los indicadores, planes de trabajo, gráficos y reportes mediante IA se sincronizarán
            automáticamente para la gerencia y periodo seleccionados.
          </p>

          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {validationError}
            </div>
          )}

          <div className="space-y-4">
            {/* Gerencia Selector */}
            <div className="space-y-1.5" id="gerencia-selector-group">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Gerencia
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGerencia("GOR")}
                  className={`py-3.5 px-4 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer flex items-center justify-between ${
                    gerencia === "GOR"
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                  id="select-gor-btn"
                >
                  <div className="text-left">
                    <span className="block text-base">GOR</span>
                    <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                      Rubiales / Caño Sur
                    </span>
                  </div>
                  {gerencia === "GOR" && <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</div>}
                </button>

                <button
                  type="button"
                  onClick={() => setGerencia("GPA")}
                  className={`py-3.5 px-4 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer flex items-center justify-between ${
                    gerencia === "GPA"
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                  id="select-gpa-btn"
                >
                  <div className="text-left">
                    <span className="block text-base">GPA</span>
                    <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                      Huila / Putumayo
                    </span>
                  </div>
                  {gerencia === "GPA" && <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</div>}
                </button>
              </div>
            </div>

            {/* Period selector grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Month Selector */}
              <div className="space-y-1.5" id="month-selector-group">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mes del Informe
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  id="mes-select-input"
                >
                  {monthsWithRanges.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.name === "Febrero" ? "01 Feb - 28/29 Feb" : `01 ${m.name.slice(0, 3)} - ${getDaysInMonth(m.name, ano)} ${m.name.slice(0, 3)}`})
                    </option>
                  ))}
                </select>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-medium space-y-1 mt-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>📅 Periodo de Cobertura:</span>
                  </div>
                  <div className="text-slate-600">
                    Del <strong className="text-emerald-900">01 de {mes}</strong> al <strong className="text-emerald-900">{getDaysInMonth(mes, ano)} de {mes}</strong> del {ano}
                  </div>
                </div>
              </div>

              {/* Year Selector */}
              <div className="space-y-1.5" id="year-selector-group">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Año del Informe
                </label>
                <select
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  id="ano-select-input"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Accept and Continue button */}
          <div className="pt-4 flex gap-3">
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-sm transition-all cursor-pointer"
                id="cancel-setup-btn"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              id="confirm-setup-btn"
            >
              <span>Aceptar y continuar</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
