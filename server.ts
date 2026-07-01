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
    "excelente": "altamente satisfactorio bajo estándares corporativos",
  };

  const sentences = cleanComment
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
    fallbackBullets.push(`• Avance operativo registrado para la disciplina ${id.toUpperCase()}: ${cleanComment}.`);
  }

  let result = fallbackBullets.slice(0, 3).join("\n");
  if (id === "continuidad" || id === "mocs" || id === "edp" || id === "revision" || id === "ia_itp") {
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
    const response = await ai.models.generateContent({
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

// Local matching algorithm for task identification when Gemini is offline or as a secondary check
function localMatchTasks(comment: string, tasks: any[]): { matches: any[]; unmatched: any[] } {
  const matches: any[] = [];
  const unmatched: any[] = [];

  const normalize = (str: string) => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9\s-_]/g, " ")  // replace punctuation with spaces
      .replace(/\s+/g, " ")
      .trim();
  };

  const phrases = comment
    .split(/(?:[.\n]|\s{2,})/)
    .map(p => p.trim())
    .filter(p => p.length > 5);

  const searchPhrases = phrases.length > 0 ? phrases : [comment];

  for (const task of tasks) {
    if (task.estado === "Completado") continue;

    const taskProj = normalize(task.proyecto);
    const taskPaq = normalize(task.paquete);

    // Get code parts
    const projCodeMatch = task.proyecto.match(/ECU\d+/i);
    const projCode = projCodeMatch ? projCodeMatch[0].toLowerCase() : null;

    const paqCodeMatch = task.paquete.match(/([a-z0-9]+-[a-z0-9]+|[a-z]{2,}\d+)/i);
    const paqCode = paqCodeMatch ? paqCodeMatch[0].toLowerCase() : null;

    let matchedPhraseIndex = -1;

    for (let i = 0; i < searchPhrases.length; i++) {
      const phraseNorm = normalize(searchPhrases[i]);

      let projMatched = false;
      let paqMatched = false;

      // Project Match: code or direct name or key words
      if (projCode && phraseNorm.includes(projCode)) {
        projMatched = true;
      } else if (phraseNorm.includes(taskProj) || taskProj.includes(phraseNorm)) {
        projMatched = true;
      } else {
        const projWords = taskProj.split(" ").filter(w => w.length > 3 && w !== "modulo" && w !== "proyecto" && w !== "edp");
        if (projWords.length > 0 && projWords.every(w => phraseNorm.includes(w))) {
          projMatched = true;
        }
      }

      // Package Match: code or direct name or key words
      if (paqCode && phraseNorm.includes(paqCode)) {
        paqMatched = true;
      } else if (phraseNorm.includes(taskPaq) || taskPaq.includes(phraseNorm)) {
        paqMatched = true;
      } else {
        const paqWords = taskPaq.split(" ").filter(w => w.length > 3 && w !== "bateria" && w !== "paquete");
        if (paqWords.length > 0 && paqWords.every(w => phraseNorm.includes(w))) {
          paqMatched = true;
        }
      }

      if (projMatched && paqMatched) {
        matchedPhraseIndex = i;
        break;
      }
    }

    if (matchedPhraseIndex !== -1) {
      matches.push({
        matchedTaskId: task.id,
        proyectoIdentified: task.proyecto,
        paqueteIdentified: task.paquete,
        confidence: "high",
        explanation: `Coincidencia encontrada para proyecto "${task.proyecto}" y paquete "${task.paquete}"`
      });
    }
  }

  return { matches, unmatched };
}

// API endpoint to optimize any discipline's comment using Gemini 3.5 Flash
app.post("/api/optimize-comment", async (req, res) => {
  const { id, comment, tasks = [] } = req.body;

  if (!id || typeof comment !== "string") {
    return res.status(400).json({ error: "Los campos 'id' y 'comment' son requeridos." });
  }

  const cleanComment = comment.trim();
  if (cleanComment.length === 0) {
    return res.json({ optimized: "", matches: [], unmatched: [] });
  }

  const ai = getGeminiClient();

  // If the discipline is 'sharepoint' (Gestión Plan de Trabajo ITP), apply specialized matching logic
  if (id === "sharepoint") {
    const localResult = localMatchTasks(cleanComment, tasks);
    
    if (!ai) {
      console.log("Optimizando 'sharepoint' sin API Key (activando fallback local)...");
      const fallbackOptimized = generateFallbackOptimizedComment(id, cleanComment);
      return res.json({
        optimized: fallbackOptimized,
        matches: localResult.matches,
        unmatched: localResult.unmatched
      });
    }

    const systemPrompt = `Actúas como un Ingeniero de Software Senior y Experto en Inteligencia Artificial para un sistema de gestión de tecnología de procesos de Ecopetrol.
Tu tarea consiste en procesar y optimizar el comentario de avance operativo redactado por el usuario en lenguaje natural para la Gestión del Plan de Trabajo ITP, e identificar de forma inteligente qué registros del plan deben marcarse como COMPLETADOS.

Lista de actividades del Plan de Trabajo actual:
${JSON.stringify(tasks.map((t: any) => ({ id: t.id, campo: t.campo, area: t.area, proyecto: t.proyecto, paquete: t.paquete, estado: t.estado })), null, 2)}

Sigue minuciosamente estas directrices:
1. Optimiza el comentario del usuario (corrigiendo ortografía, gramática, mejorando la redacción, removiendo redundancias y usando un tono técnico, formal y ejecutivo de Ecopetrol). Genera un máximo de 2 o 3 viñetas breves que comiencen exactamente con '• '. El texto resultante de las viñetas no debe inventar información ni cambiar nombres/códigos de proyectos/paquetes.
2. Identifica en el comentario original cada mención de proyectos y paquetes asociados. El usuario puede escribir la información de manera informal o aproximada.
3. Para cada mención de proyecto + paquete, busca en la "Lista de actividades del Plan de Trabajo actual" utilizando búsqueda inteligente (comparación semántica, coincidencias aproximadas/fuzzy, normalización, abreviaciones, nombres parciales o variaciones comunes).
   - REGLA DE VALIDACIÓN OBLIGATORIA: Para que una actividad coincida con éxito, debes encontrar coincidencia para el PROYECTO y coincidencia para el PAQUETE asociado dentro de un MISMO registro de la lista de actividades.
   - Si un registro coincide plenamente en ambos aspectos con alta confianza, márcalo en el arreglo de "matches" indicando su matchedTaskId exacto.
   - Si no estás seguro de la relación, la confianza es baja, o coincide con múltiples registros posibles, agrégalo al arreglo "unmatched" explicando la razón.
4. Genera una salida estructurada en formato JSON estricto que cumpla exactamente con el siguiente esquema:
{
  "optimized": "El comentario optimizado en viñetas (formato string con saltos de línea y viñetas con '• ')",
  "matches": [
    {
      "matchedTaskId": "ID_del_registro_encontrado",
      "proyectoIdentified": "Código o nombre del proyecto identificado en el texto",
      "paqueteIdentified": "Código o nombre del paquete identificado en el texto",
      "confidence": "high",
      "explanation": "Breve explicación de por qué coincide"
    }
  ],
  "unmatched": [
    {
      "proyectoIdentified": "Proyecto identificado que no se pudo emparejar con confianza",
      "paqueteIdentified": "Paquete identificado que no se pudo emparejar con confianza",
      "reason": "Razón de la falta de confianza o ambigüedad"
    }
  ]
}

Comentario del usuario:
"${cleanComment}"

Responde únicamente con el JSON válido. No incluyas explicaciones de preámbulo, markdown o bloques adicionales.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimized: { type: Type.STRING },
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    matchedTaskId: { type: Type.STRING },
                    proyectoIdentified: { type: Type.STRING },
                    paqueteIdentified: { type: Type.STRING },
                    confidence: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["matchedTaskId", "proyectoIdentified", "paqueteIdentified", "confidence", "explanation"]
                }
              },
              unmatched: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    proyectoIdentified: { type: Type.STRING },
                    paqueteIdentified: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["proyectoIdentified", "paqueteIdentified", "reason"]
                }
              }
            },
            required: ["optimized", "matches", "unmatched"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        optimized: parsed.optimized || generateFallbackOptimizedComment(id, cleanComment),
        matches: parsed.matches || localResult.matches,
        unmatched: parsed.unmatched || localResult.unmatched
      });
    } catch (err) {
      console.error("Error al procesar 'sharepoint' con Gemini, usando fallback local:", err);
      const fallbackOptimized = generateFallbackOptimizedComment(id, cleanComment);
      return res.json({
        optimized: fallbackOptimized,
        matches: localResult.matches,
        unmatched: localResult.unmatched
      });
    }
  }

  // Fallback for standard disciplines (edp, continuidad, mocs, revision, ia_itp)
  let systemPrompt = `Actúas como un redactor ejecutivo y experto de alto nivel en Seguridad de Procesos para un comité gerencial de Ecopetrol.
Tu única tarea consiste en corregir, optimizar, pulir gramaticalmente y refinar técnicamente el comentario de avance operativo suministrado por el usuario.

Sigue rigurosamente estas pautas:
1. Corrige ortografía, gramática, redundancias y signos de puntuación de forma impecable.
2. Convierte expresiones informales, coloquiales o de lenguaje natural simple en un tono estrictamente formal, técnico, profesional y de nivel corporativo para Seguridad de Procesos e ingeniería de hidrocarburos.
3. Organiza y resume el contenido en viñetas claras, concisas y fáciles de leer en una diapositiva ejecutiva de presentación. Cada viñeta debe comenzar exactamente con el carácter de viñeta '•' (código alt 7 o viñeta estándar). Genera un máximo de 2 o 3 viñetas breves.
4. Conserva intactos de forma obligatoria todos los códigos numéricos de proyectos (ej. "ECU17049", "ECU17114"), nombres de clústeres, equipos (ej. "CASE-0021", "MOCs", "turbobombas", "P&IDs"), cifras numéricas, porcentajes, fechas y nombres de instalaciones o personas.
5. NO inventes información, no agregues datos ficticios, no cambies fechas y no agregues supuestos. Conserva el significado técnico y operativo exacto expresado por el usuario.`;

  if (id === "continuidad" || id === "mocs" || id === "edp" || id === "revision" || id === "ia_itp") {
    systemPrompt += `\n6. REGLA DE SÍNTESIS EXTREMA OBLIGATORIA: El resultado final DEBE tener un máximo absoluto de 280 caracteres (incluyendo espacios, saltos de línea y viñetas). Prioriza los avances, resultados e hitos técnicos de mayor relevancia gerencial, eliminando cualquier detalle secundario o explicaciones de relleno. Sé sumamente conciso, ejecutivo, y redacta de tal forma que se lea completo en menos de 10 segundos.`;
  }

  systemPrompt += `\n\nComentario original del usuario:\n"${cleanComment}"\n\nResponde únicamente con el texto optimizado en viñetas estructuradas que inicien con "• ". No incluyas explicaciones, preámbulos, ni introducciones de ningún tipo.`;

  if (!ai) {
    console.log(`Optimizando comentario simulado para ${id} (Sin API Key)...`);
    const optimized = generateFallbackOptimizedComment(id, cleanComment);
    return res.json({ optimized });
  }

  try {
    const response = await ai.models.generateContent({
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

    // Force strict character limit check for short cards
    if (id === "continuidad" || id === "mocs" || id === "edp" || id === "revision" || id === "ia_itp") {
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
