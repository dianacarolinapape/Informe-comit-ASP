import React, { useState } from "react";
import pptxgen from "pptxgenjs";
import { Task, TeamMember, Discipline, ContextoInforme } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  Zap,
  Star,
  Activity,
  Heart,
  Smartphone,
  BarChart2,
  TrendingUp,
  Download
} from "lucide-react";

interface SlidesViewProps {
  tasks: Task[];
  team: TeamMember[];
  disciplines: Discipline[];
  contexto: ContextoInforme | null;
}

export default function SlidesView({ tasks, team, disciplines, contexto }: SlidesViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to get Spanish dynamic month and year based on current system time
  const getDynamicDateString = (capitalize = true) => {
    if (contexto) {
      const str = `${contexto.mes.toLowerCase()} ${contexto.ano}`;
      return capitalize ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const currentDate = new Date();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const str = `${month} ${year}`;
    return capitalize ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  };

  // Total slides count (4 slides matching the provided images)
  const totalSlides = 4;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Helper to render AI-optimized or fallback bullet list for any discipline
  const renderOptimizedBullets = (disciplineId: string, defaultBullets: React.ReactNode) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    if (discipline && discipline.comment && discipline.comment.trim().length > 0) {
      const text = discipline.optimizedComment || "";
      if (text.trim()) {
        const lines = text
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.replace(/^[-*•\s\d.]+\s*/, "")); // Strip any prepended bullet symbols or numbers cleanly

        return (
          <ul className="text-[6.5px] font-medium text-slate-700 space-y-0.5 mt-1 list-disc pl-3 leading-snug flex-1">
            {lines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        );
      } else {
        // Fallback: split raw comment into neat, concise bullet points
        const sentences = discipline.comment
          .split(/(?:[.\n]|\s{2,})/)
          .map(s => s.trim())
          .filter(s => s.length > 5);

        if (sentences.length > 0) {
          return (
            <ul className="text-[6.5px] font-medium text-slate-700 space-y-0.5 mt-1 list-disc pl-3 leading-snug flex-1">
              {sentences.slice(0, 3).map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          );
        }
      }
    }
    return defaultBullets;
  };

  // Monthly data for the line chart (Aseguramiento ITP) - Dynamic calculation based on tasks!
  const monthsInOrder = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  let cumulativeWeight = 0;
  let cumulativeAdvance = 0;

  const assuranceData = monthsInOrder.map((m) => {
    const monthTasks = tasks.filter((t) => t && (t.mes || "").toLowerCase() === m.toLowerCase());
    const monthWeight = monthTasks.reduce((acc, t) => acc + (t.peso || 0), 0);
    const monthAdvance = monthTasks.reduce((acc, t) => acc + (t.avance || 0), 0);

    cumulativeWeight += monthWeight;
    cumulativeAdvance += monthAdvance;

    return {
      month: m,
      proyectado: Math.min(100, cumulativeWeight),
      ejecutado: Math.min(100, cumulativeAdvance),
    };
  });

  // Helper to generate coordinates string for SVG path
  const getSvgPath = (dataValues: number[], totalPoints: number) => {
    if (dataValues.length === 0) return "";
    const leftPadding = 20;
    const rightPadding = 20;
    const chartWidth = 480 - leftPadding - rightPadding;
    const step = totalPoints > 1 ? chartWidth / (totalPoints - 1) : chartWidth;

    return dataValues
      .map((val, index) => {
        const x = leftPadding + index * step;
        const y = 50 - (val / 100) * 45;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const visibleAssuranceData = assuranceData.slice(3); // Start from April (index 3)
  const totalVisiblePoints = visibleAssuranceData.length;

  const projectedPath = getSvgPath(visibleAssuranceData.map((d) => d.proyectado), totalVisiblePoints);

  // Determine last month with any completed tasks to plot the execution line correctly
  let lastActiveMonthIndex = 0;
  if (contexto) {
    const selectedMonthIdx = monthsInOrder.findIndex(m => m.toLowerCase() === contexto.mes.toLowerCase());
    if (selectedMonthIdx !== -1) {
      lastActiveMonthIndex = selectedMonthIdx;
    }
  } else {
    monthsInOrder.forEach((m, idx) => {
      const hasCompletedInMonth = tasks.some(
        (t) => t && (t.mes || "").toLowerCase() === m.toLowerCase() && t.estado === "Completado"
      );
      if (hasCompletedInMonth) {
        lastActiveMonthIndex = idx;
      }
    });
  }

  const visibleExecutedData = lastActiveMonthIndex >= 3
    ? visibleAssuranceData.slice(0, lastActiveMonthIndex - 3 + 1)
    : [];
  const ejecutadoPath = getSvgPath(visibleExecutedData.map((d) => d.ejecutado), totalVisiblePoints);

  // Access data for the bar chart based on context month
  const activeMonthIdx = contexto 
    ? monthsInOrder.findIndex(m => m.toLowerCase() === contexto.mes.toLowerCase()) 
    : 5; // Default to June

  const baseAccessVals = [310, 368, 302, 319, 361, 342, 355, 380, 321, 335, 340, 360];
  const accessData = monthsInOrder.map((m, idx) => {
    return {
      month: m.slice(0, 3),
      val: idx <= activeMonthIdx ? baseAccessVals[idx] : 0,
    };
  });

  const getDaysSinceJan1_2026 = () => {
    const startDate = new Date("2026-01-01T00:00:00");
    const today = new Date();
    const timeDiff = today.getTime() - startDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    return dayDiff > 0 ? dayDiff : 150;
  };

  const getBulletsText = (disciplineId: string, defaults: string[]): string[] => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    if (discipline && discipline.comment && discipline.comment.trim().length > 0) {
      const text = discipline.optimizedComment || "";
      if (text.trim()) {
        return text
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.replace(/^[-*•\s\d.]+\s*/, ""));
      } else {
        const sentences = discipline.comment
          .split(/(?:[.\n]|\s{2,})/)
          .map(s => s.trim())
          .filter(s => s.length > 5);
        if (sentences.length > 0) {
          return sentences.slice(0, 3);
        }
      }
    }
    return defaults;
  };

  const downloadPowerPoint = () => {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";

    // ----------------------------------------------------
    // SLIDE 1: Title Slide
    // ----------------------------------------------------
    const slide1 = pptx.addSlide();
    slide1.background = { fill: "003419" };

    // Subheader badge-like text
    slide1.addText("ECOPETROL S.A.", {
      x: 0.5,
      y: 0.5,
      w: 9.0,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: "8AD932",
      fontFace: "Arial"
    });

    // Main Title
    slide1.addText("SEGURIDAD DE PROCESOS", {
      x: 0.5,
      y: 1.8,
      w: 9.0,
      h: 1.2,
      fontSize: 38,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });

    // Gerencia Subtitle
    slide1.addText(contexto?.gerencia || "GOR", {
      x: 0.5,
      y: 3.0,
      w: 9.0,
      h: 0.8,
      fontSize: 32,
      bold: true,
      color: "F2C94C",
      align: "center",
      fontFace: "Arial"
    });

    // Date
    slide1.addText(getDynamicDateString(), {
      x: 0.5,
      y: 4.0,
      w: 9.0,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });

    // Footer
    slide1.addText("REGIONAL ANDINA ORIENTE | Orgullosamente ECOPETROL", {
      x: 0.5,
      y: 5.0,
      w: 9.0,
      h: 0.3,
      fontSize: 10,
      color: "8AD932",
      align: "center",
      fontFace: "Arial"
    });

    // ----------------------------------------------------
    // SLIDE 2: Team Members Slide
    // ----------------------------------------------------
    const slide2 = pptx.addSlide();
    slide2.background = { fill: "F3F4F5" };

    slide2.addText("Subelemento Tecnología del Proceso", {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: "004E28",
      fontFace: "Arial"
    });

    // Create table rows from `team` using any[] to bypass strict typescript cell/row type variations
    const teamRows: any[] = [
      [
        { text: "Rol / Responsabilidad", options: { bold: true, color: "FFFFFF", fill: { color: "004E28" }, fontSize: 11, fontFace: "Arial" } },
        { text: "Nombre Asignado", options: { bold: true, color: "FFFFFF", fill: { color: "004E28" }, fontSize: 11, fontFace: "Arial" } }
      ]
    ];

    team.forEach((member) => {
      teamRows.push([
        { text: member.role, options: { bold: false, fontSize: 10, color: "333333", fontFace: "Arial", fill: { color: "FFFFFF" } } },
        { text: member.name, options: { bold: false, fontSize: 10, color: "333333", fontFace: "Arial", fill: { color: "FFFFFF" } } }
      ]);
    });

    slide2.addTable(teamRows, {
      x: 0.8,
      y: 1.3,
      w: 8.4,
      rowH: 0.35,
      border: { type: "solid", color: "DDDDDD", pt: 1 }
    } as any);

    slide2.addText("Módulo Integrado de Reportes - Gestión " + (contexto?.gerencia || "GOR"), {
      x: 0.8,
      y: 5.1,
      w: 8.4,
      h: 0.3,
      fontSize: 9,
      color: "999999",
      fontFace: "Arial"
    });

    // ----------------------------------------------------
    // SLIDE 3: Dashboard Analytics
    // ----------------------------------------------------
    const slide3 = pptx.addSlide();
    slide3.background = { fill: "E7F0EB" };

    // Top purple header
    slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.3, w: 9.0, h: 0.6, fill: { color: "1B0A45" } });
    slide3.addText("Análisis del subelemento de Tecnología del Proceso", {
      x: 0.5,
      y: 0.35,
      w: 9.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });
    slide3.addText(`Indicadores ${contexto?.gerencia || "GOR"} - ${getDynamicDateString()}`, {
      x: 0.5,
      y: 0.6,
      w: 9.0,
      h: 0.25,
      fontSize: 10,
      color: "FFFF00",
      align: "center",
      fontFace: "Arial"
    });

    // Left Column
    const leftX = 0.5;
    const leftW = 4.8;

    // Card 1: Monthly Line Chart
    slide3.addShape(pptx.ShapeType.rect, { x: leftX, y: 1.0, w: leftW, h: 1.5, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: leftX + 0.1, y: 1.05, w: leftW - 0.2, h: 0.25, fill: { color: "1B0A45" } });
    slide3.addText("Tendencia mensual Aseguramiento ITP (Desde Abril)", {
      x: leftX + 0.1,
      y: 1.05,
      w: leftW - 0.2,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });

    const chartHeaders: any[] = [{ text: "Mes", options: { bold: true, fontSize: 8, fill: { color: "F1F5F9" } } }];
    const chartProj: any[] = [{ text: "Proy %", options: { bold: true, fontSize: 8, fill: { color: "FFFFFF" } } }];
    const chartExec: any[] = [{ text: "Ejec %", options: { bold: true, fontSize: 8, fill: { color: "FFFFFF" } } }];

    visibleAssuranceData.forEach((d) => {
      chartHeaders.push({ text: d.month.slice(0, 3), options: { bold: true, fontSize: 8, fill: { color: "F1F5F9" } } });
      chartProj.push({ text: `${Math.round(d.proyectado)}%`, options: { bold: false, fontSize: 8, fill: { color: "FFFFFF" } } });
      const isExecuted = visibleExecutedData.some((e) => e.month === d.month);
      const execVal = isExecuted ? `${Math.round(d.ejecutado)}%` : "-";
      chartExec.push({ text: execVal, options: { bold: false, fontSize: 8, fill: { color: "FFFFFF" } } });
    });

    slide3.addTable([chartHeaders, chartProj, chartExec], {
      x: leftX + 0.15,
      y: 1.35,
      w: leftW - 0.3,
      rowH: 0.22,
      border: { type: "solid", color: "E2E8F0", pt: 1 }
    } as any);

    // Card 2: Technical Analyses
    slide3.addShape(pptx.ShapeType.rect, { x: leftX, y: 2.6, w: leftW, h: 1.0, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: leftX + 0.1, y: 2.65, w: leftW - 0.2, h: 0.22, fill: { color: "1B0A45" } });
    slide3.addText("Análisis Técnicos Equipo de Aseguramiento", {
      x: leftX + 0.1,
      y: 2.65,
      w: leftW - 0.2,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });
    slide3.addText(
      "Verificación sistemática de diagramas de tuberías e instrumentación (P&IDs) y fichas de seguridad de procesos para mitigar riesgos en campo, junto al análisis riguroso de impacto operacional y aseguramiento normativo en la actualización de la base técnica documental del GOR.",
      {
        x: leftX + 0.15,
        y: 2.9,
        w: leftW - 0.3,
        h: 0.65,
        fontSize: 7.5,
        color: "4F4F4F",
        fontFace: "Arial"
      }
    );

    // Card 3: Incorporation Box
    slide3.addShape(pptx.ShapeType.rect, { x: leftX, y: 3.7, w: leftW, h: 1.7, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: leftX + 0.1, y: 3.75, w: leftW - 0.2, h: 0.22, fill: { color: "1B0A45" } });
    slide3.addText("Incorporación - Paquetes Tecnológicos", {
      x: leftX + 0.1,
      y: 3.75,
      w: leftW - 0.2,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });

    const edpBullets = getBulletsText("edp", [
      "ECU17049: CSE Mód. 3 — Clúster CASE-0021",
      "ECU17114: Infill B4 — Clúster RB-139",
      "ECU18023: Alivios — Estación CPF-2"
    ]);
    const contBullets = getBulletsText("continuidad", [
      "ECU18092: Castilla 2 — Repuestos Críticos",
      "ECU17088: Inyección — Estación S. Fernando",
      "ECU19011: Rediseño Línea — Fac. Rubiales"
    ]);
    const mocsBullets = getBulletsText("mocs", [
      "MOC-447: Inputs cargados exitosamente",
      "MOC-52: Firma As-Built completada",
      "MOC-PCU-7: Revisión técnica aprobada"
    ]);

    slide3.addText("PROYECTOS EDP", { x: leftX + 0.1, y: 4.0, w: 1.45, h: 0.2, fontSize: 7, bold: true, color: "FFFFFF", fill: { color: "1B0A45" }, align: "center", fontFace: "Arial" });
    slide3.addText(edpBullets.map(b => `• ${b}`).join("\n"), { x: leftX + 0.1, y: 4.25, w: 1.45, h: 1.1, fontSize: 6.5, color: "333333", fontFace: "Arial" });

    slide3.addText("CONTINUIDAD OPERATIVA", { x: leftX + 1.65, y: 4.0, w: 1.5, h: 0.2, fontSize: 7, bold: true, color: "FFFFFF", fill: { color: "047857" }, align: "center", fontFace: "Arial" });
    slide3.addText(contBullets.map(b => `• ${b}`).join("\n"), { x: leftX + 1.65, y: 4.25, w: 1.5, h: 1.1, fontSize: 6.5, color: "333333", fontFace: "Arial" });

    slide3.addText("MOCs", { x: leftX + 3.25, y: 4.0, w: 1.45, h: 0.2, fontSize: 7, bold: true, color: "FFFFFF", fill: { color: "5B21B6" }, align: "center", fontFace: "Arial" });
    slide3.addText(mocsBullets.map(b => `• ${b}`).join("\n"), { x: leftX + 3.25, y: 4.25, w: 1.45, h: 1.1, fontSize: 6.5, color: "333333", fontFace: "Arial" });

    // Right Column
    const rightX = 5.4;
    const rightW = 4.1;

    // Card 1: Primero la Vida
    slide3.addShape(pptx.ShapeType.rect, { x: rightX, y: 1.0, w: rightW, h: 1.2, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: rightX + 0.1, y: 1.05, w: rightW - 0.2, h: 0.22, fill: { color: "1B0A45" } });
    slide3.addText("Primero la Vida", {
      x: rightX + 0.1,
      y: 1.05,
      w: rightW - 0.2,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });
    slide3.addText("CERO Incidentes por tecnología del proceso. 👌", {
      x: rightX + 0.15,
      y: 1.3,
      w: rightW - 0.3,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: "10B981",
      fontFace: "Arial"
    });
    slide3.addText(`Llevamos ${getDaysSinceJan1_2026()} días trabajando con seguridad en el 2026.`, {
      x: rightX + 0.15,
      y: 1.6,
      w: rightW - 0.3,
      h: 0.5,
      fontSize: 9,
      bold: true,
      color: "333333",
      fontFace: "Arial"
    });

    // Card 2: Recursos Tecnológicos IA
    slide3.addShape(pptx.ShapeType.rect, { x: rightX, y: 2.3, w: rightW, h: 1.3, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: rightX + 0.1, y: 2.35, w: rightW - 0.2, h: 0.22, fill: { color: "1B0A45" } });
    slide3.addText("Recursos Tecnológicos con IA", {
      x: rightX + 0.1,
      y: 2.35,
      w: rightW - 0.2,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });
    slide3.addText("• App Móvil (100%): Información disponible desde cualquier ubicación del GOR.\n• Power BI + IA: Listados maestros con búsqueda avanzada y previsualización gráfica.", {
      x: rightX + 0.15,
      y: 2.65,
      w: rightW - 0.3,
      h: 0.8,
      fontSize: 8,
      color: "4F4F4F",
      fontFace: "Arial"
    });

    // Card 3: Canal de Comunicación + Accesses
    slide3.addShape(pptx.ShapeType.rect, { x: rightX, y: 3.7, w: rightW, h: 1.7, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 } });
    slide3.addShape(pptx.ShapeType.rect, { x: rightX + 0.1, y: 3.75, w: rightW - 0.2, h: 0.22, fill: { color: "1B0A45" } });
    slide3.addText("Optimización del Canal de Comunicación", {
      x: rightX + 0.1,
      y: 3.75,
      w: rightW - 0.2,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });
    slide3.addText("Difusión ágil de Novedades y actualización de información asegurando la alineación del personal en campo.", {
      x: rightX + 0.15,
      y: 4.0,
      w: rightW - 0.3,
      h: 0.4,
      fontSize: 7.5,
      color: "4F4F4F",
      fontFace: "Arial"
    });

    const accessHeaders: any[] = [{ text: "Mes", options: { bold: true, fontSize: 7, fill: { color: "F1F5F9" } } }];
    const accessVals: any[] = [{ text: "Accesos", options: { bold: false, fontSize: 7, fill: { color: "FFFFFF" } } }];

    accessData.forEach((d) => {
      accessHeaders.push({ text: d.month, options: { bold: true, fontSize: 7, fill: { color: "F1F5F9" } } });
      accessVals.push({ text: d.val > 0 ? String(d.val) : "-", options: { bold: false, fontSize: 7, fill: { color: "FFFFFF" } } });
    });

    slide3.addTable([accessHeaders, accessVals], {
      x: rightX + 0.1,
      y: 4.45,
      w: rightW - 0.2,
      rowH: 0.22,
      border: { type: "solid", color: "E2E8F0", pt: 1 }
    } as any);

    // ----------------------------------------------------
    // SLIDE 4: Outro Slide
    // ----------------------------------------------------
    const slide4 = pptx.addSlide();
    slide4.background = { fill: "003419" };

    slide4.addText("Orgullosamente ECOPETROL", {
      x: 1.0,
      y: 1.5,
      w: 8.0,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Arial"
    });

    slide4.addText("Nuestra energía", {
      x: 1.0,
      y: 2.2,
      w: 8.0,
      h: 0.6,
      fontSize: 28,
      bold: true,
      italic: true,
      color: "FFFF00",
      align: "center",
      fontFace: "Arial"
    });

    slide4.addText("Sostenibilidad, Excelencia y Cero Incidentes", {
      x: 1.0,
      y: 3.2,
      w: 8.0,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: "8AD932",
      align: "center",
      fontFace: "Arial"
    });

    slide4.addText(`© ${contexto?.ano || "2026"} Ecopetrol. Regional Andina Oriente — Gestión ${contexto?.gerencia || "GOR"}.`, {
      x: 1.0,
      y: 4.8,
      w: 8.0,
      h: 0.4,
      fontSize: 10,
      color: "8AD932",
      align: "center",
      fontFace: "Arial"
    });

    const fileName = `Informe_Comite_ASP_${contexto?.gerencia || "GOR"}_${contexto?.mes || "Informe"}.pptx`;
    pptx.writeFile({ fileName });
  };

  return (
    <div className={`flex flex-col gap-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-900 p-6 flex flex-col justify-between" : ""}`}>
      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 rounded-xl p-4 gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ecogreen-primary/15 rounded-lg text-ecogreen-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-headline text-slate-800">
              Informe de Comité ASP
            </h2>
            <p className="text-xs text-slate-400">
              Visualice e imprima el informe de comité ASP {contexto?.gerencia || 'GOR'} {getDynamicDateString(false)}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide Indicator bullets */}
          <div className="flex gap-1.5 mr-4">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "bg-ecogreen-primary w-6" : "bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Diapositiva ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono text-slate-600 px-2 select-none">
              {currentSlide + 1} / {totalSlides}
            </span>
            <button
              onClick={handleNext}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={downloadPowerPoint}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm shrink-0"
            title="Descargar Presentación PowerPoint (PPTX)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PPTX</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shrink-0"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Salir</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presentation Stage Canvas - Exact aspect ratio matching slides (16:9) */}
      <div className="w-full max-w-6xl mx-auto aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 flex flex-col justify-between">
        
        {/* ============================================== */}
        {/* SLIDE 1: INTRO COVER SLIDE (Image 3) */}
        {/* ============================================== */}
        {currentSlide === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#003419] via-[#006d38] to-[#018e4c] p-10 flex flex-col justify-between text-white font-sans overflow-hidden">
            
            {/* Background elements (Parrot, dolphin, etc.) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {/* Parrot vector outline */}
              <div className="absolute top-12 right-12 w-64 h-64 float-animate">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 100 100">
                  <path d="M20,50 Q40,30 60,40 T80,20 Q70,60 50,70 T20,50" />
                  <path d="M50,40 Q55,20 65,30" />
                </svg>
              </div>
              {/* Dolphin */}
              <div className="absolute top-24 left-1/3 w-48 h-24 float-animate" style={{ animationDelay: "3s" }}>
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 100 50">
                  <path d="M10,25 C30,10 60,10 90,20 C70,25 60,35 40,30 C20,32 10,25 10,25" />
                </svg>
              </div>
              {/* Sloth vector */}
              <div className="absolute top-8 left-8 w-24 h-24 text-white">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
                </svg>
              </div>
            </div>

            {/* Top row */}
            <div className="z-10 flex justify-between items-center">
              <span className="text-[11px] font-bold font-headline tracking-widest text-emerald-300 uppercase bg-black/25 px-3 py-1 rounded-full">
                Ecopetrol S.A.
              </span>
              <span className="text-xs font-bold text-yellow-300">{getDynamicDateString()}</span>
            </div>

            {/* Main Content Grid */}
            <div className="z-10 flex flex-col items-center justify-center text-center my-auto w-full">
              <h1 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter leading-none text-white uppercase">
                SEGURIDAD DE
              </h1>
              <h1 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter leading-none text-white uppercase mt-1">
                PROCESOS
              </h1>
              <h1 className="text-5xl sm:text-6xl font-black font-headline tracking-widest leading-none text-white uppercase mt-1">
                {contexto?.gerencia || 'GOR'}
              </h1>
              <p className="text-white text-base font-bold font-headline tracking-widest uppercase mt-4">
                {getDynamicDateString()}
              </p>
              <div className="w-20 h-1 bg-white mt-2"></div>
            </div>

            {/* Bottom Slogans matches Image 3 */}
            <div className="z-10 border-t border-white/10 pt-4 flex justify-between items-center text-[10px] text-white/80">
              <div className="flex gap-4">
                <span>Orgullosamente <span className="font-bold">ECOPETROL</span></span>
                <span>|</span>
                <span>Nuestra <span className="text-yellow-300 font-bold italic">energía</span></span>
              </div>
              <span className="font-mono tracking-widest text-emerald-300">REGIONAL ANDINA ORIENTE</span>
            </div>

          </div>
        )}

        {/* ============================================== */}
        {/* SLIDE 2: SUBELEMENTO TECNOLOGÍA DEL PROCESO (Image 4) */}
        {/* ============================================== */}
        {currentSlide === 1 && (
          <div className="absolute inset-0 bg-[#f3f4f5] p-10 flex flex-col justify-between text-slate-800 font-sans overflow-hidden">
            
            {/* Top Right Logos */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ecogreen-primary/10 rounded-full flex items-center justify-center text-ecogreen-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-sm font-headline text-slate-700 tracking-tight">Subelemento</span>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-semibold flex items-center gap-3">
                <span>Orgullosamente <span className="font-black text-ecogreen-primary">ECOPETROL</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-yellow-600 font-black italic">Nuestra energía</span>
              </div>
            </div>

            {/* Main centered table card matching Image 4 */}
            <div className="my-auto max-w-2xl mx-auto w-full bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-xl border border-slate-200">
              <h2 className="text-2xl font-black font-headline text-center text-[#004e28] mb-6">
                Subelemento Tecnología del Proceso
              </h2>

              <div className="overflow-hidden border border-slate-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {team.map((member, i) => (
                      <tr key={member.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-6 py-3.5 text-xs font-bold text-slate-700 border-r border-b border-slate-200 w-2/5">
                          {member.role}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-medium text-slate-600 border-b border-slate-200">
                          {member.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom decoration outlines */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-200/60 pt-3">
              <span></span>
              <span className="font-mono">DIAPOSITIVA 2 / 4</span>
            </div>

          </div>
        )}

        {/* ============================================== */}
        {/* SLIDE 3: INDICADORES GOR & REPORT DASHBOARD (Image 1) */}
        {/* ============================================== */}
        {currentSlide === 2 && (
          <div className="absolute inset-0 bg-[#e7f0eb] p-4 flex flex-col justify-between text-slate-800 font-sans overflow-hidden">
            
            {/* Top Purple Title bar matching Image 1 */}
            <div className="w-full bg-[#1b0a45] text-white py-1.5 px-4 rounded-lg flex flex-col items-center justify-center text-center shadow-md">
              <h1 className="text-xs sm:text-sm font-bold font-headline uppercase tracking-widest">
                Análisis del subelemento de Tecnología del Proceso
              </h1>
              <p className="text-[10px] font-semibold text-yellow-300 tracking-wider">
                Indicadores {contexto?.gerencia || 'GOR'} - {getDynamicDateString()}
              </p>
            </div>

            {/* Grid Layout matching Slide 3 */}
            <div className="grid grid-cols-12 gap-3 my-auto h-[78%]">
              
              {/* LEFT COLUMN: Line Chart + Technical Analyses + Incorporation box */}
              <div className="col-span-7 flex flex-col justify-between h-full">
                
                {/* 1. Monthly Line Chart (Aseguramiento ITP) */}
                <div className="bg-white/80 rounded-xl p-2 border border-slate-200 h-[30%] flex flex-col justify-between shadow-sm relative overflow-hidden">
                  
                  {/* Chart header badge */}
                  <div className="self-center bg-[#1b0a45] text-white text-[9px] font-bold px-3 py-0.5 rounded-full">
                    Tendencia mensual Aseguramiento ITP
                  </div>

                  {/* Chart Legends */}
                  <div className="flex justify-center gap-4 text-[7.5px] font-bold text-slate-500 leading-none">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-emerald-500 inline-block"></span>
                      <span>Proyectado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-purple-500 inline-block"></span>
                      <span>Ejecutado</span>
                    </div>
                  </div>

                  {/* Interactive SVG Line Graph exact reproduction */}
                  <div className="w-full h-16 relative">
                    <svg className="w-full h-full" viewBox="0 0 480 65">
                      {/* Grid Lines */}
                      <line x1="10" y1="50" x2="470" y2="50" stroke="#f1f3f5" strokeWidth="1" />
                      <line x1="10" y1="30" x2="470" y2="30" stroke="#f1f3f5" strokeWidth="1" />
                      <line x1="10" y1="10" x2="470" y2="10" stroke="#f1f3f5" strokeWidth="1" />

                      {/* Green Proyectado Line */}
                      <path
                        d={projectedPath}
                        fill="none"
                        stroke="#00a859"
                        strokeWidth="2"
                      />

                      {/* Purple Ejecutado Line */}
                      {ejecutadoPath && (
                        <path
                          d={ejecutadoPath}
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                        />
                      )}

                      {/* Proyectado Marker Dots */}
                      {visibleAssuranceData.map((d, index) => {
                        const step = totalVisiblePoints > 1 ? 440 / (totalVisiblePoints - 1) : 440;
                        const x = 20 + index * step;
                        const y = 50 - (d.proyectado / 100) * 45;
                        return (
                          <g key={`p-${index}`}>
                            <circle cx={x} cy={y} r="2" fill="#004e28" stroke="#ffffff" strokeWidth="0.5" />
                            <text x={x} y={y - 4} textAnchor="middle" className="text-[5.5px] font-bold text-slate-800 font-mono">
                              {d.proyectado.toFixed(0)}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Ejecutado Marker Dots */}
                      {visibleExecutedData.map((d, index) => {
                        const step = totalVisiblePoints > 1 ? 440 / (totalVisiblePoints - 1) : 440;
                        const x = 20 + index * step;
                        const y = 50 - (d.ejecutado / 100) * 45;
                        return (
                          <g key={`e-${index}`}>
                            <circle cx={x} cy={y} r="2" fill="#7c3aed" stroke="#ffffff" strokeWidth="0.5" />
                            <text x={x} y={y + 7} textAnchor="middle" className="text-[5.5px] font-black text-purple-700 font-mono">
                              {d.ejecutado.toFixed(0)}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* X Axis Month Labels */}
                    <div className="flex justify-between px-2.5 mt-0.5 text-[6.5px] font-bold text-slate-500 uppercase font-mono">
                      {visibleAssuranceData.map((d) => (
                        <span key={d.month}>{d.month.slice(0, 3)}</span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 2. Análisis Técnicos Equipo de Aseguramiento */}
                <div className="bg-white/80 rounded-xl p-2 border border-slate-200 mt-1.5 h-[23%] flex flex-col justify-between shadow-sm">
                  <div className="bg-[#1b0a45] text-white text-[8px] font-bold text-center py-0.5 rounded uppercase tracking-wider">
                    Análisis Técnicos Equipo de Aseguramiento
                  </div>
                  
                  <div className="bg-slate-50/80 p-2 rounded border border-slate-100 flex-1 flex flex-col justify-center my-1 overflow-y-auto">
                    <p className="text-[7.5px] text-slate-700 leading-relaxed font-medium">
                      Verificación sistemática de diagramas de tuberías e instrumentación (P&IDs) y fichas de seguridad de procesos para mitigar riesgos en campo, junto al análisis riguroso de impacto operacional y aseguramiento normativo en la actualización de la base técnica documental del {contexto?.gerencia || 'GOR'}.
                    </p>
                  </div>
                </div>

                {/* 3. Incorporación Block matching Image 1 */}
                <div className="bg-white/80 rounded-xl p-2 border border-slate-200 mt-1.5 h-[44%] flex flex-col justify-between shadow-sm">
                  
                  {/* Purple header band */}
                  <div className="bg-[#1b0a45] text-white text-[9px] font-bold text-center py-0.5 rounded uppercase tracking-wider">
                    Incorporación
                  </div>
                  
                  <p className="text-[7.5px] text-slate-500 font-medium text-center my-0.5">
                    Se garantiza la completitud, calidad, disponibilidad y actualización de los paquetes tecnológicos de:
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-1 flex-1">
                    {/* Proyectos EDP inner list */}
                    <div className="bg-gradient-to-b from-[#1b0a45]/5 via-white to-transparent p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                      <div className="bg-[#1b0a45] text-white text-[7.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase text-center">
                        Proyectos EDP
                      </div>
                      {renderOptimizedBullets("edp", (
                        <ul className="text-[6.5px] font-medium text-slate-700 space-y-0.5 mt-1 list-disc pl-3 leading-snug flex-1">
                          <li><span className="font-bold">ECU17049:</span> CSE Mód. 3 — Clúster CASE-0021</li>
                          <li><span className="font-bold">ECU17114:</span> Infill B4 — Clúster RB-139</li>
                          <li><span className="font-bold">ECU18023:</span> Alivios — Estación CPF-2</li>
                        </ul>
                      ))}
                    </div>

                    {/* Proyectos Continuidad Operativa */}
                    <div className="bg-gradient-to-b from-emerald-500/5 via-white to-transparent p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                      <div className="bg-emerald-800 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase text-center">
                        Proyectos Continuidad Operativa
                      </div>
                      {renderOptimizedBullets("continuidad", (
                        <ul className="text-[6.5px] font-medium text-slate-700 space-y-0.5 mt-1 list-disc pl-3 leading-snug flex-1">
                          <li><span className="font-bold">ECU18092:</span> Castilla 2 — Repuestos Críticos</li>
                          <li><span className="font-bold">ECU17088:</span> Inyección — Estación S. Fernando</li>
                          <li><span className="font-bold">ECU19011:</span> Rediseño Línea — Fac. Rubiales</li>
                        </ul>
                      ))}
                    </div>

                    {/* MOCs inner list */}
                    <div className="bg-gradient-to-b from-purple-500/5 via-white to-transparent p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                      <div className="bg-purple-800 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase text-center">
                        MOCs
                      </div>
                      {renderOptimizedBullets("mocs", (
                        <ul className="text-[6.5px] font-medium text-slate-700 space-y-0.5 mt-1 list-disc pl-3 leading-snug flex-1">
                          <li><span className="font-bold">MOC-447:</span> Inputs cargados exitosamente</li>
                          <li><span className="font-bold">MOC-52:</span> Firma As-Built completada</li>
                          <li><span className="font-bold">MOC-PCU-7:</span> Revisión técnica aprobada</li>
                        </ul>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: Primero la Vida + Implementación de recursos Tecnológicos potenciados con IA 
 + Canal de Comunicación */}
              <div className="col-span-5 flex flex-col justify-between h-full">
                
                {/* 1. Primero la Vida block */}
                <div className="bg-white/95 rounded-xl p-2.5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Purple header band */}
                  <div className="bg-[#1b0a45] text-white text-[9px] font-bold text-center py-0.5 rounded-full uppercase tracking-wider mb-1">
                    Primero la Vida
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Recreating OK hand gesture */}
                    <div className="text-xl shrink-0 p-1 bg-emerald-50 rounded-lg">👌</div>
                    
                    <div className="text-left">
                      <div className="text-xs font-black text-[#1b0a45] leading-none uppercase">
                        CERO
                      </div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase leading-none">
                        Incidentes por tecnología del proceso
                      </div>
                    </div>
                  </div>

                  {/* Safe days text */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded p-1 text-center mt-1">
                    <span className="text-[10px] font-bold text-emerald-800">
                      Llevamos <span className="text-sm font-black underline">{getDaysSinceJan1_2026()}</span> días trabajando con seguridad en el 2026.
                    </span>
                  </div>

                </div>

                {/* 2. Recursos Tecnológicos IA block */}
                <div className="bg-white/95 rounded-xl p-2.5 border border-slate-200 shadow-sm mt-1.5 flex flex-col justify-between">
                  
                  {/* Purple header band */}
                  <div className="bg-[#1b0a45] text-white text-[7.5px] font-bold text-center py-0.5 rounded uppercase tracking-wider mb-1">
                    Implementación de recursos Tecnológicos potenciados con IA
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[7.5px] leading-tight">
                    <div className="border-r border-slate-100 pr-1.5 flex flex-col justify-between">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-[#1b0a45]" />
                        <span>App Móvil</span>
                      </div>
                      <div className="text-[9px] font-black text-purple-700">[100%]</div>
                      <span className="text-slate-500">Información disponible desde cualquier ubicación de {contexto?.gerencia || 'GOR'}.</span>
                    </div>

                    <div className="flex flex-col justify-between pl-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <BarChart2 className="w-3 h-3 text-[#1b0a45]" />
                        <span>Power BI + IA</span>
                      </div>
                      <span className="text-slate-500">Listados maestros con búsqueda avanzada y previsualización gráfica.</span>
                    </div>
                  </div>

                </div>

                {/* 3. Optimización del Canal de Comunicación + Bar Chart */}
                <div className="bg-white/95 rounded-xl p-2 border border-slate-200 shadow-sm mt-1.5 flex-1 flex flex-col justify-between">
                  
                  {/* Purple header band */}
                  <div className="bg-[#1b0a45] text-white text-[8px] font-bold text-center py-0.5 rounded uppercase tracking-wider">
                    Optimización del Canal de Comunicación
                  </div>

                  <p className="text-[7.2px] text-slate-600 leading-tight my-1.5 text-center font-semibold">
                    Difusión ágil de Novedades y actualización de información asegurando la alineación del personal en campo.
                  </p>

                  {/* Mini Bar Chart exact replication with full X/Y axes */}
                  <div className="bg-slate-50/50 p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                    <div className="text-[6.8px] font-bold text-center text-[#1b0a45] uppercase tracking-wider mb-1">
                      Tendencia mensual de accesos a la solución logística operativa
                    </div>

                    <div className="w-full relative pt-1">
                      <svg className="w-full h-24" viewBox="0 0 450 95">
                        <defs>
                          <linearGradient id="columnGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Horizontal Grid Lines */}
                        <line x1="25" y1="10" x2="435" y2="10" stroke="#f1f3f5" strokeWidth="1" />
                        <line x1="25" y1="26.25" x2="435" y2="26.25" stroke="#f1f3f5" strokeWidth="1" />
                        <line x1="25" y1="42.5" x2="435" y2="42.5" stroke="#f1f3f5" strokeWidth="1" />
                        <line x1="25" y1="58.75" x2="435" y2="58.75" stroke="#f1f3f5" strokeWidth="1" />
                        <line x1="25" y1="75" x2="435" y2="75" stroke="#e2e8f0" strokeWidth="1" />

                        {/* Y-Axis Ticks & Labels (Max 400, steps of 100) */}
                        <text x="20" y="12" textAnchor="end" className="text-[6.5px] font-bold font-mono fill-slate-500">400</text>
                        <text x="20" y="28.25" textAnchor="end" className="text-[6.5px] font-bold font-mono fill-slate-500">300</text>
                        <text x="20" y="44.5" textAnchor="end" className="text-[6.5px] font-bold font-mono fill-slate-500">200</text>
                        <text x="20" y="60.75" textAnchor="end" className="text-[6.5px] font-bold font-mono fill-slate-500">100</text>
                        <text x="20" y="77" textAnchor="end" className="text-[6.5px] font-bold font-mono fill-slate-500">0</text>

                        {/* Y-Axis and X-Axis lines */}
                        <line x1="25" y1="10" x2="25" y2="75" stroke="#94a3b8" strokeWidth="1" />
                        <line x1="25" y1="75" x2="435" y2="75" stroke="#94a3b8" strokeWidth="1" />

                        {/* Columns mapping */}
                        {accessData.map((d, index) => {
                          const isPending = d.val === 0;
                          const widthPerMonth = 34; // 34 * 12 = 408 width space
                          const center = 25 + 10 + index * widthPerMonth + 12;
                          const barWidth = 14;
                          const xPos = center - barWidth / 2;

                          // Y-Axis mapping: 0 to 400 values go to Y = 75 to Y = 10 (height range = 65 pixels)
                          const barHeight = !isPending ? (d.val / 400) * 65 : 6;
                          const yPos = 75 - barHeight;

                          return (
                            <g key={index}>
                              {/* Ticks on X-axis */}
                              <line x1={center} y1="75" x2={center} y2="78" stroke="#94a3b8" strokeWidth="1" />

                              {/* Column Bar */}
                              {!isPending ? (
                                <>
                                  {/* Solid Column */}
                                  <rect
                                    x={xPos}
                                    y={yPos}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="url(#columnGrad)"
                                    rx="1.5"
                                    className="transition-all duration-500 hover:fill-emerald-500 cursor-pointer"
                                  />
                                  {/* Value above the bar */}
                                  <text
                                    x={center}
                                    y={yPos - 2}
                                    textAnchor="middle"
                                    className="text-[6px] font-extrabold font-mono fill-purple-800"
                                  >
                                    {d.val}
                                  </text>
                                </>
                              ) : (
                                <>
                                  {/* Dashed Column for pending status */}
                                  <rect
                                    x={xPos}
                                    y={yPos}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="rgba(241, 245, 249, 0.4)"
                                    stroke="#cbd5e1"
                                    strokeDasharray="2,2"
                                    rx="1"
                                  />
                                  {/* "Pend" label above the bar */}
                                  <text
                                    x={center}
                                    y={yPos - 2}
                                    textAnchor="middle"
                                    className="text-[5px] font-bold font-mono fill-amber-500 uppercase"
                                  >
                                    Pend.
                                  </text>
                                </>
                              )}

                              {/* Month label below X-axis */}
                              <text
                                x={center}
                                          y="86"
                                textAnchor="middle"
                                className="text-[5.5px] font-bold font-mono fill-slate-600 uppercase"
                              >
                                {d.month}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom mini credit */}
            <div className="text-[7.5px] text-slate-400 font-mono flex justify-between items-center border-t border-slate-200/50 pt-2 px-1">
              <span></span>
              <span>Slide 3 de 4</span>
            </div>

          </div>
        )}

        {/* ============================================== */}
        {/* SLIDE 4: OUTRO CORPORATE CLOSE SLIDE (Image 2) */}
        {/* ============================================== */}
        {currentSlide === 3 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#003419] via-[#006d38] to-[#018e4c] p-10 flex flex-col justify-between text-white font-sans overflow-hidden">
            
            {/* Background illustrations (Iguana, parrots, butterflies) */}
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              {/* Giant flying parrot */}
              <div className="absolute top-6 right-16 w-80 h-48 float-animate">
                <svg viewBox="0 0 100 60" fill="currentColor" className="text-white">
                  <path d="M10,30 Q40,10 80,15 T95,5 Q80,45 50,45 T10,30" />
                </svg>
              </div>
              
              {/* Detailed Iguana silhouette in left-bottom margin */}
              <div className="absolute left-6 bottom-6 w-48 h-32 float-animate" style={{ animationDelay: "2s" }}>
                <svg viewBox="0 0 100 60" fill="currentColor" className="text-emerald-300">
                  <path d="M10,50 Q30,45 50,45 T90,30 Q80,55 50,55 T10,50" />
                </svg>
              </div>

              {/* Butterflies */}
              <div className="absolute top-1/3 left-1/4 w-8 h-8 text-amber-300 animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,10 C10,6 6,6 4,8 Q2,12 6,14 C9,14 11,11 12,10 Z" /></svg>
              </div>
            </div>

            {/* Slide Top row */}
            <div className="z-10 flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-emerald-200 font-mono uppercase bg-black/10 px-3 py-1 rounded-full">
                DIAPOSITIVA DE CIERRE DE GESTIÓN
              </span>
              <span className="text-xs font-bold text-yellow-300 font-headline uppercase tracking-wider">
                Ecopetrol S.A.
              </span>
            </div>

            {/* Main Centered Brands block matches Image 2 exactly */}
            <div className="z-10 text-center my-auto flex flex-col sm:flex-row items-center justify-center gap-12 max-w-4xl mx-auto w-full bg-white/5 backdrop-blur-md rounded-2xl p-10 border border-white/10 shadow-2xl">
              
              <div className="flex flex-col items-center">
                <span className="italic text-emerald-200 text-sm font-semibold">Orgullosamente</span>
                <span className="font-extrabold text-2xl tracking-widest text-white mt-1">ECOPETROL</span>
              </div>

              <div className="hidden sm:block h-16 w-0.5 bg-white/20"></div>

              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-yellow-300">Nuestra</span>
                <span className="text-2xl font-black italic text-yellow-300 tracking-wide mt-1">energía</span>
              </div>

              <div className="hidden sm:block h-16 w-0.5 bg-white/20"></div>

              {/* Ecopetrol brand with the iconic Iguana logo representation */}
              <div className="flex items-center gap-2">
                <svg className="w-10 h-10 text-emerald-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                </svg>
                <div className="text-left">
                  <span className="font-extrabold text-2xl tracking-wider text-white">ecopetrol</span>
                </div>
              </div>

            </div>

            {/* Outro credit footer */}
            <div className="z-10 border-t border-white/10 pt-4 flex justify-between items-center text-[10px] text-emerald-100/70 font-mono">
              <span>© {contexto?.ano || '2026'} Ecopetrol. Sostenibilidad, Excelencia y Cero Incidentes en {contexto?.gerencia || 'GOR'}.</span>
              <span>Slide 4 de 4 (Fin)</span>
            </div>

          </div>
        )}

      </div>

      {/* Presentation Stage Helper */}
      <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Recomendación: Use el botón <span className="font-bold">"Pantalla Completa"</span> para proyectar estas diapositivas en sus comités de seguridad.</span>
      </div>
    </div>
  );
}
