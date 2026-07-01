import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { Task, Discipline, TeamMember, SmartInsights, ContextoInforme } from "../types";

const firebaseConfig = {
  projectId: "magnetic-dogfish-w6tp2",
  appId: "1:1053695998908:web:2981264db42ef24b2989b9",
  apiKey: "AIzaSyAAhxdY10qshtIzxutNEgA2reClzqvGfLk",
  authDomain: "magnetic-dogfish-w6tp2.firebaseapp.com",
  storageBucket: "magnetic-dogfish-w6tp2.firebasestorage.app",
  messagingSenderId: "1053695998908"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, "ai-studio-seguridaddeproce-b23347e8-195b-479d-afd7-fc21888e6287");

// Validate connection on start as required by skills guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && (error.message.includes("client is offline") || error.message.includes("offline"))) {
      console.warn("Firebase: Client is currently offline.");
    } else {
      console.error("Firebase connection test error:", error);
    }
  }
}

// Generate a clean string key for the report based on its context
export function getReportKey(context: ContextoInforme): string {
  const cleanGerencia = context.gerencia.toLowerCase().trim();
  const cleanMes = context.mes.toLowerCase().trim();
  const cleanAno = context.ano.toLowerCase().trim();
  return `${cleanGerencia}_${cleanMes}_${cleanAno}`;
}

export interface FirestoreReport {
  reportContext: ContextoInforme;
  tasks: Task[];
  disciplines: Discipline[];
  teamMembers: TeamMember[];
  insights: SmartInsights;
  updatedAt: string;
}

// Save a report to Firestore
export async function saveReportToFirestore(
  context: ContextoInforme,
  data: {
    tasks: Task[];
    disciplines: Discipline[];
    teamMembers: TeamMember[];
    insights: SmartInsights;
  }
) {
  const reportKey = getReportKey(context);
  const docRef = doc(db, "reports", reportKey);
  const payload: FirestoreReport = {
    reportContext: context,
    tasks: data.tasks,
    disciplines: data.disciplines,
    teamMembers: data.teamMembers,
    insights: data.insights,
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, payload);
}

// Load a report from Firestore
export async function loadReportFromFirestore(context: ContextoInforme): Promise<FirestoreReport | null> {
  const reportKey = getReportKey(context);
  const docRef = doc(db, "reports", reportKey);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as FirestoreReport;
  }
  return null;
}
