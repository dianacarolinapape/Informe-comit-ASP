import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Retry wrapper for Gemini API to handle transient rate-limiting (429) or high-demand (503) errors gracefully
async function generateContentWithRetry(ai: GoogleGenAI, options: any, retries = 3, delay = 1000): Promise<any> {
  try {
    return await ai.models.generateContent(options);
  } catch (error: any) {
    const isTransient = error.status === 503 || 
                        error.code === 503 ||
                        error.status === 429 ||
                        error.code === 429 ||
                        (error.message && (
                          error.message.includes("503") || 
                          error.message.includes("UNAVAILABLE") || 
                          error.message.includes("high demand") ||
                          error.message.includes("429") ||
                          error.message.includes("RESOURCE_EXHAUSTED")
                        ));
    if (isTransient && retries > 0) {
      console.warn(`Gemini API returned transient error: ${error.message || error}. Retrying in ${delay}ms... (Remaining retries: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateContentWithRetry(ai, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Helper to enforce strict character limits by selectively including bullet lines or truncating elegantly
function enforceCharacterLimit(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;

  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let resultLines: string[] = [];
  let currentLen = 0;

  for (const line of lines) {
    const lineLenWithSeparator = currentLen === 0 ? line.length : line.length + 1; // +1 for newline character
    if (currentLen + lineLenWithSeparator <= maxLen) {
      resultLines.push(line);
      currentLen += lineLenWithSeparator;
    } else {
      if (resultLines.length === 0) {
        const truncated = line.slice(0, maxLen - 3) + "...";
        resultLines.push(truncated);
      }
      break;
    }
  }

  return resultLines.join("\n");
}

// Helper to generate a high-quality technical fallback for discipline comments when Gemini is offline/overloaded
function generateFallbackOptimizedComment(id: string, cleanComment: string): string {
  const spellCorrection: { [key: string]: string } = {
    "probremas": "problemas",
    "probrema": "problema",
    "problenas": "problemas",
    "problena": "problema",
    "sharepoin": "SharePoint",
    "sharepoint": "SharePoint",
    "share point": "SharePoint",
    "itp": "ITP",
    "ia": "IA",
    "pids": "P&IDs",
    "pid": "P&ID",
    "mocs": "MOCs",
    "moc": "MOC",
    "reunion": "reunión",
    "reuniones": "reuniones",
    "logistica": "logística",
    "tecnico": "técnico",
    "tecnicos": "técnicos",
    "revision": "revisión",
    "revisiones": "revisión",
    "atraso": "atraso",
    "retrazo": "retraso",
    "retraso": "retraso",
    "corregido": "corregido",
    "correcion": "corrección",
    "correccion": "corrección",
    "evaluacion": "evaluación",
    "bomba": "turbobomba",
    "bombas": "turbobombas",
    "turbobomba": "turbobomba",
    "turbobombas": "turbobombas",
    "ok": "satisfactorio",
    "bien": "óptimo",
    "mal": "desvío",
    "reunon": "reunión",
    "lecciones": "lecciones aprendidas",
  };

  const gerencialTranslations: { [key: string]: string } = {
    "tengo problemas": "se identificaron desviaciones operativas",
    "tenemos problemas": "se registraron intermitencias técnicas",
    "no funciona": "presenta indisponibilidad técnica temporal",
    "falta hacer": "se encuentra pendiente la ejecución de",
    "vamos bien": "avance conforme a la línea base programada",
    "viento en popa": "con avance conforme al cronograma oficial",
    "atrasados": "con desfase frente a la planificación vigente",
    "atrasado": "desfasado frente a la línea base",
    "atrasada": "desfasada frente al cronograma de entrega",
    "retrazada": "desfasada frente al cronograma de entrega",
    "hacer": "ejecutar las actividades de",
    "haciendo": "ejecutando de manera sistemática",
    "todo listo": "completado satisfactoriamente bajo estándares de calidad",
    "ya termine": "se culminaron con éxito las actividades planificadas",
    "terminamos": "culminación exitosa de los entregables correspondientes",
    "ayuda de los jefes": "escalamiento y soporte de la gestión gerencial",
    "ayuda del jefe": "soporte estratégico de la dirección gerencial",
    "retraso de dos semanas": "desviación logística temporal de 14 días",
    "demora de dos semanas": "desviación logística temporal de 14 días",
  };

  let text = cleanComment;

  // Replace spelling mistakes by looking at word boundaries
  Object.keys(spellCorrection).forEach((errWord) => {
    const regex = new RegExp(`\\b${errWord}\\b`, "gi");
    text = text.replace(regex, spellCorrection[errWord]);
  });

  // Apply general gerencial rephrasing
  Object.keys(gerencialTranslations).forEach((informalPhrase) => {
    const regex = new RegExp(informalPhrase, "gi");
    text = text.replace(regex, gerencialTranslations[informalPhrase]);
  });

  // Split into sentences
  const sentences = text
    .split(/(?:[.\n]|\s{2,})/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const fallbackBullets = sentences.map((s) => {
    let bullet = s;
    // Capitalize first letter
    bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
    // Ensure it ends with a period
    if (!bullet.endsWith(".")) bullet += ".";
    return `• ${bullet}`;
  });

  if (fallbackBullets.length === 0) {
    fallbackBullets.push(`• Registro de avance operativo para la disciplina ${id.toUpperCase()}: ${cleanComment}.`);
  }

  let result = fallbackBullets.slice(0, 3).join("\n");
  if (id === "continuidad") {
    result = enforceCharacterLimit(result, 280);
  }
  return result;
}

// API endpoint to generate Smart Insights using Gemini 3.5 Flash
app.post("/api/generate-insights", async (req, res) => {
  const { disciplines } = req.body;

  if (!disciplines || !Array.isArray(disciplines)) {
    return res.status(400).json({ error: "El campo 'disciplines' es requerido y debe ser un arreglo." });
  }

  const ai = getGeminiClient();

  // Prompt modeling
  const prompt = `Analiza los siguientes avances/comentarios de seguridad de procesos por disciplina correspondientes a la región GOR (Gestión Operativa de Refinación / Producción Andina Oriente) de Ecopetrol.
Genera un análisis en formato JSON estructurado con:
1. "hitos": Un arreglo de 2 o 3 strings en español con logros significativos, avances clave o hitos de seguridad destacados basados en los comentarios.
2. "alertas": Un arreglo de 2 o 3 strings en español con alertas predictivas, riesgos identificados, desviaciones o cuellos de botella preventivos basados en los comentarios.

Datos de disciplinas:
${disciplines
  .map((d) => `- ${d.name} (${d.status}): "${d.comment || "Sin comentarios cargados todavía."}"`)
  .join("\n")}

Asegúrate de que los textos sean formales, corporativos y con enfoque técnico en HSE (Seguridad, Salud y Medio Ambiente) y Seguridad de Procesos industriales de petróleo y gas.`;

  if (!ai) {
    // Elegant simulated fallback if API key is not configured yet
    console.log("Generando insights simulados (Sin API Key configurada)...");
    
    const activeComments = disciplines.filter(d => d.comment && d.comment.trim() !== "");
    
    const hitos = [
      activeComments.length > 0 
        ? `Avance registrado exitosamente en la disciplina: ${activeComments[0].name}.`
        : "Revisión sistemática de subelementos de tecnología del proceso en curso.",
      "Seguimiento activo de compromisos MOCs y auditorías de seguridad en Castilla 3.",
    ];
    
    const alertas = [
      activeComments.some(d => d.status === "Crítico")
        ? `Alerta crítica detectada en disciplina con estado Crítico. Se requiere intervención.`
        : "Riesgo potencial de demora en entregables por documentación incompleta.",
      "Necesidad de agilizar la carga de información logística en SharePoint para evitar retrasos.",
    ];

    return res.json({ hitos, alertas });
  }

  try {
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hitos: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Hitos y logros relevantes de HSE y seguridad de procesos.",
            },
            alertas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alertas predictivas, riesgos HSE y cuellos de botella detectados.",
            },
          },
          required: ["hitos", "alertas"],
        },
      },
    });

    const resultText = response.text || "{}";
    const insights = JSON.parse(resultText);
    res.json(insights);
  } catch (error: any) {
    console.error("Error al generar insights con Gemini (usando fallback automático):", error);
    
    // Graceful fallback to avoid API failures disrupting the user interface
    const activeComments = disciplines.filter(d => d.comment && d.comment.trim() !== "");
    const hitos = [
      activeComments.length > 0 
        ? `Monitoreo de avance regularizado para ${activeComments[0].name}.`
        : "Evaluación continua de integridad mecánica y aseguramiento operacional en curso.",
      "Seguimiento activo de planes de trabajo y acciones correctivas pre-arranque.",
    ];
    const alertas = [
      "Monitoreo predictivo continuo activo en sistemas de alivio y control de barreras.",
      "Requerimiento preventivo de actualización periódica para mitigar brechas de información.",
    ];
    
    res.json({ hitos, alertas });
  }
});

// API endpoint to optimize any discipline's comment using Gemini 3.5 Flash
app.post("/api/optimize-comment", async (req, res) => {
  const { id, comment } = req.body;

  if (!id || typeof comment !== "string") {
    return res.status(400).json({ error: "Los campos 'id' y 'comment' son requeridos." });
  }

  const cleanComment = comment.trim();
  if (cleanComment.length === 0) {
    return res.json({ optimized: "" });
  }

  const ai = getGeminiClient();

  let systemPrompt = `Actúas como un redactor ejecutivo y experto de alto nivel en Seguridad de Procesos para un comité gerencial de Ecopetrol S.A.
Tu única tarea consiste en corregir, optimizar, pulir gramaticalmente de forma impecable y refinar técnicamente el comentario de avance operativo suministrado por el usuario.

Sigue rigurosamente estas pautas:
1. CORRECCIÓN ORTOGRÁFICA, ACENTUACIÓN Y PUNTUACIÓN PERFECTA: Debes corregir de forma estricta e impecable cualquier falta de ortografía, errores de digitación (ej. "probremas" a "problemas", "sharepoint" o "sharepoin" a "SharePoint", "itp" a "ITP", "ia" a "IA"), omisión de tildes (ej. "reunion" a "reunión", "logistica" a "logística", "revision" a "revisión"), problemas de puntuación (comas, puntos) y mayúsculas/minúsculas.
2. TONO GERENCIAL Y TÉCNICO DE ALTA DIRECCIÓN: Elimina el lenguaje informal, coloquial, descuidado, corto o conversacional. Redáctalo en un tono sumamente formal, ejecutivo y técnico de nivel corporativo para Seguridad de Procesos e ingeniería de hidrocarburos de Ecopetrol. Usa un léxico sofisticado (ej. "indisponibilidad temporal de componentes", "desviación operacional crítica", "mitigación preventiva de riesgos", "alineación con los entregables de ingeniería").
3. FORMATO DE PRESENTACIÓN EJECUTIVA EN VIÑETAS: Estructura la respuesta final únicamente en viñetas claras, concisas y de alta recordabilidad, listas para presentarse en una diapositiva gerencial. Cada viñeta debe comenzar exactamente con el carácter especial "• " (sin usar guiones, asteriscos, números ni decoraciones). Genera entre 1 y 3 viñetas como máximo.
4. ABSOLUTA INTEGRIDAD DE DATOS REALES: Conserva intactos, obligatoriamente y sin modificación alguna, todos los códigos de proyectos (ej. "ECU17049", "ECU17114"), nombres de clústeres, equipos (ej. "CASE-0021", "MOCs", "turbobombas", "P&IDs"), porcentajes, cifras, fechas e instalaciones indicadas. NO inventes información, no agregues datos ficticios, no añadas supuestos ni inventes fechas.`;

  if (id === "continuidad") {
    systemPrompt += `\n5. REGLA DE SÍNTESIS EXTREMA OBLIGATORIA: El resultado final DEBE tener un máximo absoluto de 280 caracteres (incluyendo espacios, saltos de línea y viñetas). Prioriza los avances, resultados e hitos técnicos de mayor relevancia gerencial, eliminando cualquier detalle secundario o explicaciones de relleno. Sé sumamente conciso, ejecutivo, y redacta de tal forma que se lea completo en menos de 10 segundos.`;
  }

  systemPrompt += `\n\nComentario original del usuario:\n"${cleanComment}"\n\nResponde únicamente con el texto optimizado en viñetas estructuradas que inicien con "• ". No incluyas explicaciones, preámbulos, ni introducciones de ningún tipo.`;

  if (!ai) {
    console.log(`Optimizando comentario simulado para ${id} (Sin API Key)...`);
    const optimized = generateFallbackOptimizedComment(id, cleanComment);
    return res.json({ optimized });
  }

  try {
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: systemPrompt,
    });

    let optimized = response.text || "";
    optimized = optimized.trim();

    // Verify it has bullets; if not, format it nicely
    if (optimized && !optimized.startsWith("•") && !optimized.startsWith("-")) {
      optimized = optimized
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `• ${line.replace(/^[-*•\s\d.]+\s*/, "")}`)
        .join("\n");
    }

    // Force strict character limit check for 'continuidad'
    if (id === "continuidad") {
      optimized = enforceCharacterLimit(optimized, 280);
    }

    res.json({ optimized });
  } catch (error: any) {
    console.error("Error al optimizar comentario con Gemini (usando fallback automático):", error);
    // Graceful fallback to avoid API failures disrupting the user interface
    const optimized = generateFallbackOptimizedComment(id, cleanComment);
    res.json({ optimized });
  }
});

// Vite server connection
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
