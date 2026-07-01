import React, { useState } from "react";
import { TeamMember } from "../types";
import { Edit2, Check, X, Users, Compass, HelpCircle } from "lucide-react";

interface TeamViewProps {
  members: TeamMember[];
  onUpdateMember: (id: string, newName: string) => void;
}

export default function TeamView({ members, onUpdateMember }: TeamViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim() !== "") {
      onUpdateMember(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] w-full flex flex-col justify-center items-center py-10 px-4 select-none">
      {/* Decorative Iguana Drawing on Bottom-Left */}
      <div className="absolute left-6 bottom-4 w-44 sm:w-56 opacity-25 sm:opacity-50 pointer-events-none transition-all hover:opacity-80">
        <svg className="w-full h-auto text-emerald-800" viewBox="0 0 200 150" fill="currentColor">
          {/* Detailed stylized iguana silhouette */}
          <path d="M10,130 C30,130 50,110 70,110 C80,110 90,120 110,120 C120,120 130,90 150,90 C165,90 175,100 190,95 L185,105 C175,110 160,105 150,110 C130,120 120,140 100,140 C80,140 60,135 10,130 Z" />
          <path d="M110,120 C120,115 130,100 145,100 C155,100 160,105 170,102" />
          <path d="M140,90 C140,75 125,60 110,65 C100,68 95,75 80,72 C70,70 65,50 50,55 C40,58 35,70 20,70 C15,70 10,65 5,75" fill="none" stroke="currentColor" strokeWidth="3" />
          {/* Spikes on the back */}
          <polygon points="115,63 118,55 121,62" />
          <polygon points="122,60 125,52 128,59" />
          <polygon points="129,59 132,50 135,58" />
          <polygon points="136,58 139,48 142,57" />
          <polygon points="100,66 103,58 106,65" />
          <polygon points="90,70 93,62 96,69" />
          <polygon points="80,72 83,64 86,71" />
          {/* Iguana eye and head details */}
          <circle cx="130" cy="80" r="2.5" className="text-yellow-400" fill="currentColor" />
          <path d="M135,82 Q145,82 142,88" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="text-[10px] text-emerald-800/60 font-mono tracking-widest mt-1 uppercase text-left">SIMBOLO PROTEGIDO - ECOPETROL</div>
      </div>

      {/* Decorative Lush Tropical Plant on Bottom-Right */}
      <div className="absolute right-6 bottom-4 w-48 sm:w-64 opacity-30 sm:opacity-70 pointer-events-none transition-all hover:opacity-100">
        <svg className="w-full h-auto text-emerald-900" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Lush tropical agave/banana leaves */}
          <path d="M80,150 C50,110 30,80 30,40 C50,60 70,90 80,150 Z" fill="currentColor" opacity="0.8" />
          <path d="M80,150 C110,110 130,80 130,40 C110,60 90,90 80,150 Z" fill="currentColor" opacity="0.8" />
          <path d="M80,150 C60,110 45,70 10,60 C40,75 60,110 80,150 Z" fill="currentColor" opacity="0.9" />
          <path d="M80,150 C100,110 115,70 150,60 C120,75 100,110 80,150 Z" fill="currentColor" opacity="0.9" />
          <path d="M80,150 C70,120 50,90 15,100 C45,100 65,120 80,150 Z" fill="currentColor" />
          <path d="M80,150 C90,120 110,90 145,100 C115,100 95,120 80,150 Z" fill="currentColor" />
          {/* Center glowing plant elements */}
          <path d="M80,150 C80,100 80,60 80,20 C85,60 85,100 80,150 Z" fill="#77fca3" />
        </svg>
        {/* Tiny orange butterfly above the plant */}
        <div className="absolute top-4 right-12 w-6 h-6 text-amber-500 float-animate">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,10 C10,6 6,6 4,8 Q2,12 6,14 C9,14 11,11 12,10 C13,11 15,14 18,14 Q22,12 20,8 C18,6 14,6 12,10 Z" />
          </svg>
        </div>
      </div>

      {/* Main Core Content Panel */}
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 sm:p-10 z-10 transition-all hover:shadow-emerald-950/5">
        
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-ecogreen-primary bg-ecogreen-light/20 px-4 py-1 rounded-full text-xs font-bold font-headline mb-3 tracking-widest uppercase">
            <Compass className="w-4 h-4 text-ecogreen-primary" />
            <span>SUBELEMENTO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-slate-800 leading-tight">
            Tecnología del Proceso
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Designación oficial del equipo directivo y suplentes de seguridad de procesos industriales de la región Andina Oriente.
          </p>
        </div>

        {/* Members Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold font-headline text-slate-500 uppercase tracking-wider w-1/3">
                  Cargo / Rol
                </th>
                <th className="px-6 py-4 text-xs font-bold font-headline text-slate-500 uppercase tracking-wider w-1/2">
                  Nombre Completo
                </th>
                <th className="px-6 py-4 text-xs font-bold font-headline text-slate-500 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Role cell */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 text-sm">
                      {member.role}
                    </span>
                  </td>

                  {/* Name cell */}
                  <td className="px-6 py-4">
                    {editingId === member.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-sm bg-white border border-ecogreen-primary rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-ecogreen-light/50"
                        placeholder="Escribe el nombre del líder..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(member.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <span className="text-slate-600 text-sm font-medium">
                        {member.name}
                      </span>
                    )}
                  </td>

                  {/* Action cell */}
                  <td className="px-6 py-4 text-right">
                    {editingId === member.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveEdit(member.id)}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors"
                          title="Guardar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-700 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(member)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-ecogreen-primary transition-all opacity-40 group-hover:opacity-100"
                        title="Editar líder de subelemento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Instructions Footer */}
        <div className="mt-6 flex items-center gap-2 justify-center text-xs text-slate-400">
          <HelpCircle className="w-4 h-4 text-slate-300" />
          <span>Haga clic en el lápiz a la derecha para actualizar el personal asignado. Los cambios se guardan localmente.</span>
        </div>
      </div>
    </div>
  );
}
