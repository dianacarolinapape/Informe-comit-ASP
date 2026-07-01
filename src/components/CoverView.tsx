import React, { useState } from "react";
import { Play } from "lucide-react";
import { ContextoInforme } from "../types";

interface CoverViewProps {
  reportContext: ContextoInforme | null;
  onConfirmContext: (context: ContextoInforme) => void;
}

export default function CoverView({ reportContext, onConfirmContext }: CoverViewProps) {
  const [gerencia, setGerencia] = useState<"GOR" | "GPA">(
    reportContext?.gerencia || "GOR"
  );
  const [mes, setMes] = useState<string>(reportContext?.mes || "Junio");
  const [ano, setAno] = useState<string>(reportContext?.ano || "2026");

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

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#003419] via-[#006d38] to-[#018e4c] p-6 sm:p-12 text-white font-sans">
      {/* Background Graphic Overlays for Colombian Biodiversity (Dolphin, Iguana, Leaves) */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        {/* Abstract tropical leaf outlines */}
        <svg className="absolute -left-10 -bottom-10 w-96 h-96 text-white" fill="currentColor" viewBox="0 0 100 100">
          <path d="M10,90 Q40,30 90,10 Q60,60 10,90 Z" />
        </svg>
        {/* Dolphin shape representation at top */}
        <div className="absolute top-20 right-1/4 w-64 h-32 float-animate">
          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 100 50">
            <path d="M10,25 C30,10 60,10 90,20 C70,25 60,35 40,30 C20,32 15,28 10,25 Z" />
            <path d="M45,15 Q52,5 58,16" />
          </svg>
        </div>
        {/* Small butterfly decoration */}
        <div className="absolute top-1/3 left-1/2 w-12 h-12 text-amber-400 float-animate" style={{ animationDelay: "2s" }}>
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,10 C10,6 6,6 4,8 Q2,12 6,14 C9,14 11,11 12,10 C13,11 15,14 18,14 Q22,12 20,8 C18,6 14,6 12,10 Z" />
          </svg>
        </div>
      </div>

      {/* Header Info */}
      <div className="z-10 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold font-headline tracking-widest text-emerald-300">SISTEMA ACTIVO</span>
          </div>
        </div>
        <button
          onClick={() => onConfirmContext({ gerencia, mes, ano })}
          className="group flex items-center gap-2 bg-white/10 hover:bg-white/25 active:scale-95 transition-all text-sm font-semibold px-4 py-2 rounded-full border border-white/20 cursor-pointer"
        >
          <span>Ir al Panel de Control</span>
          <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto w-full max-w-7xl mx-auto">
        {/* Left Side: Illustrative Operator Avatars + Industrial Welder Spark */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-center relative">
          
          <div className="relative w-full max-w-md h-[340px] sm:h-[400px] flex items-end justify-center">
            {/* Ambient glows behind operators */}
            <div className="absolute -bottom-10 left-1/4 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-12 left-1/3 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Industrial Plant / Leaves Backdrop */}
            <div className="absolute bottom-4 inset-x-0 h-44 flex items-end justify-around opacity-40 pointer-events-none">
              <div className="w-16 h-40 bg-gradient-to-t from-emerald-800 to-transparent rounded-t-full transform -rotate-12"></div>
              <div className="w-24 h-48 bg-gradient-to-t from-emerald-700 to-transparent rounded-t-full"></div>
              <div className="w-20 h-44 bg-gradient-to-t from-emerald-800 to-transparent rounded-t-full transform rotate-12"></div>
            </div>

            {/* Ecopetrol Operator illustration with helmet, earmuffs, and iguana heart shape matching user's original image */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pb-8">
              <div className="relative w-72 h-72 bg-slate-950/40 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-2xl p-4 group hover:border-emerald-400/50 transition-all duration-500 backdrop-blur-sm">
                {/* Subtle glowing ring backdrops */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 animate-pulse"></div>
                <div className="absolute -inset-1.5 rounded-full border border-yellow-400/5 animate-spin" style={{ animationDuration: '30s' }}></div>

                {/* High-fidelity Vector SVG matching the uploaded image */}
                <svg
                  id="operator-vector-svg"
                  viewBox="0 0 400 400"
                  className="w-full h-full drop-shadow-2xl select-none"
                >
                  <defs>
                    <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="uniform" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="helmet" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="earmuffs" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4c1d95" />
                      <stop offset="100%" stopColor="#2e1065" />
                    </linearGradient>
                    <linearGradient id="glasses" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="iguana" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a3e635" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>

                  {/* Outer Glow */}
                  <circle cx="200" cy="200" r="180" fill="url(#uniform)" fillOpacity="0.03" />

                  {/* 1. Body & Uniform (Turquoise Green) */}
                  <path
                    d="M80,380 C80,280 120,240 200,240 C280,240 320,280 320,380 Z"
                    fill="url(#uniform)"
                    stroke="#064e3b"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  {/* Uniform Collar */}
                  <path
                    d="M160,240 L200,270 L240,240 L200,245 Z"
                    fill="#047857"
                    stroke="#064e3b"
                    strokeWidth="3"
                  />
                  <path
                    d="M140,240 L165,260 L160,240 Z"
                    fill="#065f46"
                    stroke="#064e3b"
                    strokeWidth="3"
                  />
                  <path
                    d="M260,240 L235,260 L240,240 Z"
                    fill="#065f46"
                    stroke="#064e3b"
                    strokeWidth="3"
                  />

                  {/* Chest pockets */}
                  <rect x="105" y="275" width="55" height="45" rx="5" fill="#047857" stroke="#064e3b" strokeWidth="3" />
                  <path d="M105,275 L132.5,285 L160,275" fill="none" stroke="#064e3b" strokeWidth="3" />
                  <rect x="240" y="275" width="55" height="45" rx="5" fill="#047857" stroke="#064e3b" strokeWidth="3" />
                  <path d="M240,275 L267.5,285 L295,275" fill="none" stroke="#064e3b" strokeWidth="3" />

                  {/* Neck */}
                  <path
                    d="M170,240 L170,210 C170,210 185,225 200,225 C215,225 230,210 230,210 L230,240 Z"
                    fill="#f59e0b"
                    stroke="#78350f"
                    strokeWidth="3"
                  />

                  {/* 2. Head & Face */}
                  <path
                    d="M150,140 C150,90 250,90 250,140 C250,195 150,195 150,140 Z"
                    fill="url(#skin)"
                    stroke="#78350f"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />

                  {/* Smiling mouth with teeth */}
                  <path
                    d="M175,180 C185,195 215,195 225,180 Z"
                    fill="#991b1b"
                    stroke="#78350f"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M180,181 C190,190 210,190 220,181 C220,181 210,181 180,181 Z"
                    fill="#ffffff"
                  />

                  {/* Nose line */}
                  <path
                    d="M200,150 L200,165 C200,168 196,168 195,168"
                    fill="none"
                    stroke="#78350f"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Safety Glasses (Dark Sunglasses with Cyan Reflective Shading) */}
                  <g id="safety-glasses">
                    {/* Left Frame */}
                    <path
                      d="M155,142 C155,130 192,130 195,145 C195,155 160,158 155,142 Z"
                      fill="url(#glasses)"
                      stroke="#0f172a"
                      strokeWidth="3.5"
                    />
                    {/* Right Frame */}
                    <path
                      d="M245,142 C245,130 208,130 205,145 C205,155 240,158 245,142 Z"
                      fill="url(#glasses)"
                      stroke="#0f172a"
                      strokeWidth="3.5"
                    />
                    {/* Bridge */}
                    <rect x="193" y="138" width="14" height="4" fill="#0f172a" rx="1" />
                    {/* Cyan Gloss Reflections */}
                    <path
                      d="M162,137 L185,148"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                    <path
                      d="M212,137 L235,148"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                    {/* Small white highlights */}
                    <circle cx="180" cy="142" r="2.5" fill="#ffffff" />
                    <circle cx="230" cy="142" r="2.5" fill="#ffffff" />
                  </g>

                  {/* 3. White Safety Helmet */}
                  {/* Base Helmet Dome */}
                  <path
                    d="M142,105 C142,50 258,50 258,105 Z"
                    fill="url(#helmet)"
                    stroke="#334155"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  {/* Helmet Brim */}
                  <path
                    d="M130,105 C130,101 270,101 270,105 C270,111 130,111 130,105 Z"
                    fill="#f1f5f9"
                    stroke="#334155"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  {/* Helmet Crest/Ridge */}
                  <path
                    d="M188,52 C188,52 200,45 200,45 C200,45 212,52 212,52 L206,101 L194,101 Z"
                    fill="#e2e8f0"
                    stroke="#334155"
                    strokeWidth="2.5"
                  />

                  {/* 4. Purple Earmuffs (Hearing Protection) */}
                  {/* Left Earmuff */}
                  <rect
                    x="122"
                    y="110"
                    width="22"
                    height="50"
                    rx="11"
                    fill="url(#earmuffs)"
                    stroke="#1e1b4b"
                    strokeWidth="3.5"
                    transform="rotate(-10, 133, 135)"
                  />
                  {/* Left Earmuff inner cushion */}
                  <rect
                    x="136"
                    y="120"
                    width="6"
                    height="30"
                    rx="3"
                    fill="#1e1b4b"
                  />
                  {/* Right Earmuff */}
                  <rect
                    x="256"
                    y="110"
                    width="22"
                    height="50"
                    rx="11"
                    fill="url(#earmuffs)"
                    stroke="#1e1b4b"
                    strokeWidth="3.5"
                    transform="rotate(10, 267, 135)"
                  />
                  {/* Right Earmuff inner cushion */}
                  <rect
                    x="258"
                    y="120"
                    width="6"
                    height="30"
                    rx="3"
                    fill="#1e1b4b"
                  />
                  {/* Earmuff Headband */}
                  <path
                    d="M136,115 C136,115 150,75 200,75 C250,75 264,115 264,115"
                    fill="none"
                    stroke="#1e1b4b"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* 5. Heart hands and Ecopetrol's Iguana */}
                  {/* Iguana Backdrop circle */}
                  <circle cx="200" cy="275" r="50" fill="#047857" stroke="#064e3b" strokeWidth="4" />

                  {/* Detailed Green Iguana Lizard */}
                  <g id="ecopetrol-iguana">
                    {/* Body / Torso */}
                    <path
                      d="M185,295 Q200,250 215,295"
                      fill="url(#iguana)"
                      stroke="#14532d"
                      strokeWidth="2.5"
                    />
                    {/* Tail curving around inside the heart */}
                    <path
                      d="M215,295 C235,310 240,280 230,265 C220,250 190,250 180,265"
                      fill="none"
                      stroke="url(#iguana)"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    {/* Tail Stripes */}
                    <path d="M225,295 L227,290" stroke="#14532d" strokeWidth="2" />
                    <path d="M232,284 L233,279" stroke="#14532d" strokeWidth="2" />
                    <path d="M229,271 L226,267" stroke="#14532d" strokeWidth="2" />
                    <path d="M215,258 L210,256" stroke="#14532d" strokeWidth="2" />

                    {/* Head of the Iguana */}
                    <path
                      d="M178,255 C178,245 195,245 195,255 C195,260 178,260 178,255 Z"
                      fill="url(#iguana)"
                      stroke="#14532d"
                      strokeWidth="2"
                    />
                    {/* Iguana Eye */}
                    <circle cx="187" cy="252" r="2.5" fill="#facc15" />
                    <circle cx="187" cy="252" r="1" fill="#000000" />
                    {/* Spines/Crest on back */}
                    <path d="M185,251 L187,247 L189,251 L191,247 L193,251" fill="none" stroke="#facc15" strokeWidth="1.5" />
                    <path d="M192,258 Q200,248 208,260" fill="none" stroke="#facc15" strokeWidth="2" />

                    {/* Legs */}
                    {/* Front Left Leg */}
                    <path d="M180,270 Q170,275 174,285" fill="none" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Front Right Leg */}
                    <path d="M195,270 Q205,272 202,282" fill="none" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Back Left Leg */}
                    <path d="M185,288 Q175,295 180,305" fill="none" stroke="#14532d" strokeWidth="4.5" strokeLinecap="round" />
                  </g>

                  {/* 6. Hands Forming a Perfect Heart Shape (Superimposed in front of the Iguana) */}
                  <g id="heart-hands">
                    {/* Left Arm / Wrist coming in */}
                    <path
                      d="M80,380 C110,340 130,300 160,290"
                      fill="none"
                      stroke="#064e3b"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M80,380 C110,340 130,300 160,290"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Right Arm / Wrist coming in */}
                    <path
                      d="M320,380 C290,340 270,300 240,290"
                      fill="none"
                      stroke="#064e3b"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M320,380 C290,340 270,300 240,290"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Left hand fingers forming left half of heart */}
                    <path
                      d="M160,290 C150,260 185,240 200,265"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M160,290 C150,260 185,240 200,265"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />

                    {/* Right hand fingers forming right half of heart */}
                    <path
                      d="M240,290 C250,260 215,240 200,265"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M240,290 C250,260 215,240 200,265"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />

                    {/* Left thumb forming left bottom V-point */}
                    <path
                      d="M160,290 C175,295 190,305 200,312"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M160,290 C175,295 190,305 200,312"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />

                    {/* Right thumb forming right bottom V-point */}
                    <path
                      d="M240,290 C225,295 210,305 200,312"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M240,290 C225,295 210,305 200,312"
                      fill="none"
                      stroke="url(#skin)"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                {/* Badge */}
                <div className="absolute -bottom-4 bg-emerald-600 border border-emerald-400 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-lg shadow-emerald-950/50">
                  SEGURIDAD Y PROCESOS
                </div>
              </div>
            </div>

            {/* Glowing welding spark icon matching the images */}
            <div className="absolute bottom-6 left-12 z-20 spark-animate">
              <div className="relative">
                {/* Center bright core */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <span className="w-4 h-4 bg-amber-400 rounded-full animate-ping"></span>
                </div>
                {/* Spark rays */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-0.5 bg-yellow-300 transform rotate-45"></div>
                  <div className="w-12 h-0.5 bg-yellow-300 transform -rotate-45"></div>
                  <div className="w-0.5 h-12 bg-yellow-300"></div>
                  <div className="w-12 h-0.5 bg-yellow-300"></div>
                </div>
              </div>
            </div>
            
            {/* Secondary tiny sparks floating */}
            <div className="absolute bottom-16 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-ping duration-1000"></div>
            <div className="absolute bottom-24 left-8 w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce"></div>
          </div>

        </div>

        {/* Right Side: Large Typography Titles matching Image 1 */}
        <div className="lg:col-span-6 text-center lg:text-left flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline tracking-tight leading-snug text-white">
              Sistema de Optimización y Control de Información de <span className="text-emerald-300">Tecnología del Proceso</span> <span className="text-yellow-300">(ITP)</span>
            </h1>
          </div>

          <div className="mt-6">
            <span className="text-lg sm:text-2xl font-bold font-headline tracking-widest text-emerald-100/90 border-b border-emerald-400/40 pb-2">
              Introducción y Marco de Cumplimiento
            </span>
          </div>

          <p className="mt-6 text-emerald-100/80 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            Este portal web constituye la herramienta tecnológica de soporte para la gestión, seguimiento y optimización del subelemento de <strong className="font-semibold text-white">Tecnología del Proceso (TP)</strong>, en estricto cumplimiento de la guía <strong className="font-semibold text-yellow-300">HSE-G-049</strong>. Su propósito fundamental es asegurar la integridad del <strong className="font-semibold text-white">ciclo de vida de la Información de Tecnología del Proceso (ITP)</strong> mediante la automatización inteligente de reportes. El sistema garantiza la completitud, calidad, disponibilidad y actualización de la data técnica, sirviendo como pilar operativo para las áreas de operaciones, mantenimiento, inspección, ingeniería y proyectos, con el fin de mitigar los riesgos inherentes a la operación y apalancar las decisiones del <strong className="font-semibold text-emerald-300">Comité de Seguridad de Procesos (ASP)</strong>.
          </p>

          {/* Configuración de Periodo inmediata en la Portada */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 sm:p-6 shadow-2xl max-w-xl text-left space-y-4">
            <h3 className="text-sm sm:text-base font-black font-headline text-yellow-300 flex items-center gap-2">
              <span className="text-base">📅</span>
              <span>CONFIGURACIÓN INMEDIATA DEL PERÍODO DEL INFORME</span>
            </h3>
            
            <div className="space-y-3">
              {/* Gerencia */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Gerencia Seleccionada</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGerencia("GOR")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      gerencia === "GOR"
                        ? "bg-yellow-400 text-[#003419] border-yellow-300 shadow-md"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="text-left">
                      <span className="block font-extrabold text-sm">GOR</span>
                      <span className={`text-[9px] block ${gerencia === "GOR" ? "text-emerald-900" : "text-slate-300"}`}>Rubiales / Caño Sur</span>
                    </div>
                    {gerencia === "GOR" && <span className="font-extrabold text-xs">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGerencia("GPA")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      gerencia === "GPA"
                        ? "bg-yellow-400 text-[#003419] border-yellow-300 shadow-md"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="text-left">
                      <span className="block font-extrabold text-sm">GPA</span>
                      <span className={`text-[9px] block ${gerencia === "GPA" ? "text-emerald-900" : "text-slate-300"}`}>Huila / Putumayo</span>
                    </div>
                    {gerencia === "GPA" && <span className="font-extrabold text-xs">✓</span>}
                  </button>
                </div>
              </div>

              {/* Mes y Año en un grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Mes del Informe</span>
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="w-full bg-[#003419]/80 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                  >
                    {monthsWithRanges.map((m) => (
                      <option key={m.name} value={m.name} className="bg-slate-900 text-white">
                        {m.name} ({m.name === "Febrero" ? "01 Feb - 28/29 Feb" : `01 ${m.name.slice(0, 3)} - ${getDaysInMonth(m.name, ano)} ${m.name.slice(0, 3)}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Año del Informe</span>
                  <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full bg-[#003419]/80 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-slate-900 text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Coverage notification */}
            <div className="bg-emerald-950/55 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-100 leading-relaxed">
              📅 Cobertura: del <strong className="text-yellow-300">01 de {mes}</strong> al <strong className="text-yellow-300">{getDaysInMonth(mes, ano)} de {mes} de {ano}</strong>.
            </div>

            {/* Acceder al Panel Button */}
            <div className="pt-1">
              <button
                onClick={() => onConfirmContext({ gerencia, mes, ano })}
                className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all text-[#003419] font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>Acceder al Panel de Control</span>
                <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slogans and Logos at the bottom matching Image 1 */}
      <div className="z-10 mt-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold tracking-wide text-white/75">
          <div className="flex items-center gap-1">
            <span className="italic text-emerald-200">Orgullosamente</span>
            <span className="font-extrabold">ECOPETROL</span>
          </div>
          <span className="hidden sm:inline text-white/30">|</span>
          <div className="flex items-center gap-1 text-yellow-300">
            <span className="font-bold">Nuestra</span>
            <span className="font-bold italic">energía</span>
          </div>
        </div>

        {/* Ecopetrol Iguana Vector Brand Icon */}
        <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          {/* Custom Ecopetrol Iguana Representation */}
          <svg className="w-8 h-8 text-emerald-400 fill-current" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20C11,20 9.8,19.5 9,18.7L10.5,17.2C11,17.7 11.5,18 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6C9,6 7,8 7,11C7,11.5 7.1,12 7.3,12.5L5.7,14C5.2,13 5,12 5,11A7,7 0 0,1 12,4M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16C10.5,16 9.5,15.2 9,14.2L10.5,12.7C10.8,13.2 11.3,13.5 11.8,13.5A1.5,1.5 0 0,0 13.3,12A1.5,1.5 0 0,0 11.8,10.5C11.3,10.5 10.8,10.8 10.5,11.3L9,9.8C9.5,8.8 10.5,8 12,8Z" />
          </svg>
          <div className="text-left">
            <div className="text-[10px] text-white/50 leading-none">REGIONAL</div>
            <div className="text-xs font-black tracking-widest text-yellow-300">ANDINA ORIENTE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
