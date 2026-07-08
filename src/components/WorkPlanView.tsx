import React, { useState, useRef } from "react";
import { Task, ContextoInforme } from "../types";
import { parseCSVPlan, cleanRawString } from "../data";
import {
  Upload,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Info,
  TrendingUp,
  Award
} from "lucide-react";

interface WorkPlanViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onReplaceTasks?: (newTasks: Task[]) => void;
  contexto: ContextoInforme | null;
}

export default function WorkPlanView({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReplaceTasks,
  contexto,
}: WorkPlanViewProps) {
  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Sin iniciar" | "Completado">("ALL");
  const [areaFilter, setAreaFilter] = useState<string>("ALL");
  const [gerenciaFilter, setGerenciaFilter] = useState<"ALL" | "GOR" | "GPA">("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // denser table for 100+ items

  // File Uploading States
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form Fields
  const [formCampo, setFormCampo] = useState(() => contexto?.gerencia === "GPA" ? "Putumayo" : "Cao Sur");
  const [formArea, setFormArea] = useState("Proyecto EDP");
  const [formProyecto, setFormProyecto] = useState("");
  const [formPaquete, setFormPaquete] = useState("");
  const [formEstado, setFormEstado] = useState<"Sin iniciar" | "Completado">("Sin iniciar");
  const [formMes, setFormMes] = useState(() => contexto?.mes || "Julio");
  const [formPeso, setFormPeso] = useState(0.51);

  // Calculate Overall Progress
  const totalWeight = tasks.reduce((acc, t) => acc + (t.peso || 0), 0);
  const totalAdvance = tasks.reduce((acc, t) => acc + (t.avance || 0), 0);
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.estado === "Completado").length;
  const overallProgressPct = totalWeight > 0 ? (totalAdvance / totalWeight) * 100 : 0;

  // Handle Excel/CSV download (exports actual current list to CSV with exact original structure)
  const downloadExcelTemplate = () => {
    const headers = ["Campo", "Área", "Proyecto", "Paquete", "Estado Actual Global", "Mes Programado", "% peso", "% de avance"];
    const rows = tasks.map((t) => [
      t.campo,
      t.area,
      t.proyecto,
      t.paquete,
      t.estado === "Completado" ? "COMPLETADO" : "SIN INICIAR",
      t.mes,
      `${t.peso.toString().replace(".", ",")}%`,
      t.estado === "Completado" ? `${t.avance.toString().replace(".", ",")}%` : ""
    ]);
    
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Plan_de_Trabajo_ITP_${contexto?.gerencia || 'GOR'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file drop/selection
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const parsed = parseCSVPlan(text);
          if (parsed.length > 0) {
            if (onReplaceTasks) {
              onReplaceTasks(parsed);
              setUploadSuccessMessage(`¡Se han cargado ${parsed.length} proyectos del archivo Excel/CSV exitosamente!`);
            } else {
              // Fallback if no replace function
              parsed.forEach((t) => onAddTask(t));
              setUploadSuccessMessage(`¡Se han añadido ${parsed.length} proyectos!`);
            }
          } else {
            alert("No se pudieron extraer proyectos válidos. Verifique el formato de las columnas.");
          }
        } catch (err) {
          alert("Error al procesar el archivo. Asegúrese de que es un archivo CSV delimitado por punto y coma.");
        }
      }
      setIsProcessingFile(false);
      setTimeout(() => setUploadSuccessMessage(null), 5000);
    };
    reader.readAsText(file);
  };

  // Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Add Task submit
  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProyecto.trim() || !formPaquete.trim()) return;
    
    const weightVal = parseFloat(formPeso.toString()) || 0.51;
    const advanceVal = formEstado === "Completado" ? weightVal : 0;

    onAddTask({
      campo: formCampo.trim(),
      area: formArea.trim(),
      proyecto: formProyecto.trim(),
      paquete: formPaquete.trim(),
      estado: formEstado,
      mes: formMes.trim(),
      peso: weightVal,
      avance: advanceVal,
    });

    // Reset
    setFormProyecto("");
    setFormPaquete("");
    setFormEstado("Sin iniciar");
    setFormMes(contexto?.mes || "Julio");
    setFormPeso(0.51);
    setShowAddModal(false);
  };

  // Edit Task click
  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setFormCampo(task.campo);
    setFormArea(task.area);
    setFormProyecto(task.proyecto);
    setFormPaquete(task.paquete);
    setFormEstado(task.estado);
    setFormMes(task.mes);
    setFormPeso(task.peso);
    setShowEditModal(true);
  };

  // Edit Task submit
  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !formProyecto.trim() || !formPaquete.trim()) return;

    const weightVal = parseFloat(formPeso.toString()) || 0.51;
    const advanceVal = formEstado === "Completado" ? weightVal : 0;

    onUpdateTask(selectedTask.id, {
      campo: formCampo.trim(),
      area: formArea.trim(),
      proyecto: formProyecto.trim(),
      paquete: formPaquete.trim(),
      estado: formEstado,
      mes: formMes.trim(),
      peso: weightVal,
      avance: advanceVal,
    });
    setShowEditModal(false);
    setSelectedTask(null);
  };

  // Unique areas for filter dropdown
  const uniqueAreas = Array.from(new Set(tasks.map((t) => t.area))).filter(Boolean);

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    if (!t) return false;
    const matchesSearch =
      (t.proyecto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.paquete || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.campo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.mes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.estado === statusFilter;
    const matchesArea = areaFilter === "ALL" || t.area === areaFilter;
    
    // Determine gerencia based on campo
    const isGPA = t.campo === "Putumayo" || t.campo === "Huila";
    const taskGerencia = isGPA ? "GPA" : "GOR";
    const matchesGerencia = gerenciaFilter === "ALL" || taskGerencia === gerenciaFilter;

    return matchesSearch && matchesStatus && matchesArea && matchesGerencia;
  });

  // Pagination Logic
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const getBadgeStyle = (estado: "Sin iniciar" | "Completado") => {
    if (estado === "Completado") {
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* View Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b-2 border-ecogreen-primary gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-ecogreen-primary tracking-tight flex items-center gap-2">
            <span>Plan de Trabajo y Gestión</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión automática del plan de aseguramiento ITP y avance ponderado por peso de actividades.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-ecogreen-primary hover:bg-[#004e28] text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Cargar Plan (Excel/CSV)</span>
          </button>

          <button
            onClick={() => {
              setFormCampo(contexto?.gerencia === "GPA" ? "Putumayo" : "Cao Sur");
              setFormArea("Proyecto EDP");
              setFormProyecto("");
              setFormPaquete("");
              setFormEstado("Sin iniciar");
              setFormMes(contexto?.mes || "Julio");
              setFormPeso(0.51);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Añadir Proyecto</span>
          </button>

          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-ecogreen-primary border border-ecogreen-primary hover:bg-ecogreen-primary/5 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Plan (CSV)</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        accept=".xlsx,.xls,.csv,.txt"
        className="hidden"
      />

      {/* Upload Status Banner */}
      {(isProcessingFile || uploadSuccessMessage) && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in shadow-sm bg-emerald-50 border-emerald-100 text-emerald-800">
          <div className="flex items-center gap-2">
            {isProcessingFile ? (
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            )}
            <span className="text-xs font-semibold">
              {isProcessingFile ? "Procesando archivo..." : uploadSuccessMessage}
            </span>
          </div>
          {!isProcessingFile && (
            <button
              type="button"
              onClick={() => setUploadSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-100/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* KPI Dashboard Cards - Real status */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-ecogreen-primary/10 text-ecogreen-primary rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avance Ponderado General</span>
            <span className="text-2xl font-black text-slate-800 font-mono">{overallProgressPct.toFixed(2)}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proyectos Completados</span>
            <span className="text-2xl font-black text-slate-800 font-mono">{completedCount} / {totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proyectos Sin Iniciar</span>
            <span className="text-2xl font-black text-slate-800 font-mono">{totalCount - completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Peso Total Plan</span>
            <span className="text-2xl font-black text-slate-800 font-mono">{totalWeight.toFixed(1)}%</span>
          </div>
        </div>
      </section>

      {/* Table Viewer Section */}
      <section className="glass-card rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-150 bg-white/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold font-headline text-slate-800">
            Pestaña: Plan de Trabajo
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar proyecto, paquete, mes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ecogreen-primary focus:border-ecogreen-primary w-full sm:w-64"
              />
            </div>

            {/* Filter Area */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => {
                  setAreaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ecogreen-primary text-slate-600 font-medium cursor-pointer"
              >
                <option value="ALL">Todas las Áreas</option>
                {uniqueAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Gerencia Filter */}
            <div className="relative" id="gerencia-filter-container">
              <select
                id="gerencia-filter-select"
                value={gerenciaFilter}
                onChange={(e) => {
                  setGerenciaFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ecogreen-primary text-slate-600 font-medium cursor-pointer"
              >
                <option value="ALL">Todas las Gerencias</option>
                <option value="GOR">GOR</option>
                <option value="GPA">GPA</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ecogreen-primary text-slate-600 font-medium cursor-pointer"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="Sin iniciar">Sin iniciar</option>
                <option value="Completado">Completado</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Live Interactive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold font-headline text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Campo</th>
                <th className="px-4 py-3.5">Área</th>
                <th className="px-4 py-3.5 w-[35%]">Proyecto</th>
                <th className="px-4 py-3.5">Paquete</th>
                <th className="px-4 py-3.5 text-center">Estado Actual Global</th>
                <th className="px-4 py-3.5">Mes Programado</th>
                <th className="px-4 py-3.5 text-right">% peso</th>
                <th className="px-4 py-3.5 text-right">% de avance</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-emerald-50/10 transition-colors text-xs font-medium text-slate-700">
                    <td className="px-4 py-3 whitespace-nowrap">{task.campo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{task.area}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 leading-relaxed max-w-sm" title={task.proyecto}>
                      {task.proyecto}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{task.paquete}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(task.estado)}`}>
                        {task.estado === "Completado" ? "COMPLETADO" : "SIN INICIAR"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{task.mes}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{task.peso.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">
                      {task.estado === "Completado" ? `${task.avance.toFixed(2)}%` : "0,00%"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(task)}
                          className="p-1 text-slate-400 hover:text-ecogreen-primary transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No se encontraron proyectos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl">
          <span className="text-slate-500 text-xs font-semibold">
            Mostrando {Math.min(startIndex + 1, totalItems)} a {Math.min(startIndex + itemsPerPage, totalItems)} de {totalItems} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-bold text-slate-700 font-mono px-2">
              Pág {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </section>

      {/* ADD DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold font-headline text-ecogreen-primary mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Añadir Proyecto al Plan</span>
            </h2>

            <form onSubmit={submitAddTask} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Campo
                  </label>
                  <input
                    type="text"
                    required
                    value={formCampo}
                    onChange={(e) => setFormCampo(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Área
                  </label>
                  <input
                    type="text"
                    required
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre del Proyecto
                </label>
                <textarea
                  required
                  rows={2}
                  value={formProyecto}
                  onChange={(e) => setFormProyecto(e.target.value)}
                  placeholder="Ej: ECU17049_CSE MÓDULO 3"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Paquete
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CASE0020"
                    value={formPaquete}
                    onChange={(e) => setFormPaquete(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Mes Programado
                  </label>
                  <select
                    value={formMes}
                    onChange={(e) => setFormMes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  >
                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    % Peso Asignado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPeso}
                    onChange={(e) => setFormPeso(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  >
                    <option value="Sin iniciar">Sin iniciar</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ecogreen-primary text-white rounded-lg text-xs font-semibold hover:bg-[#004e28] cursor-pointer"
                >
                  Añadir Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DIALOG MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-100 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold font-headline text-ecogreen-primary mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              <span>Editar Proyecto</span>
            </h2>

            <form onSubmit={submitEditTask} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Campo
                  </label>
                  <input
                    type="text"
                    required
                    value={formCampo}
                    onChange={(e) => setFormCampo(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Área
                  </label>
                  <input
                    type="text"
                    required
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre del Proyecto
                </label>
                <textarea
                  required
                  rows={2}
                  value={formProyecto}
                  onChange={(e) => setFormProyecto(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Paquete
                  </label>
                  <input
                    type="text"
                    required
                    value={formPaquete}
                    onChange={(e) => setFormPaquete(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Mes Programado
                  </label>
                  <select
                    value={formMes}
                    onChange={(e) => setFormMes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  >
                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    % Peso Asignado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPeso}
                    onChange={(e) => setFormPeso(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-ecogreen-primary"
                  >
                    <option value="Sin iniciar">Sin iniciar</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ecogreen-primary text-white rounded-lg text-xs font-semibold hover:bg-[#004e28] cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
