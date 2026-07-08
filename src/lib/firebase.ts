import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { Task, Discipline, TeamMember, SmartInsights, ContextoInforme } from "../types";

// Firebase Applet Config
const firebaseConfig = {
  apiKey: "AIzaSyAAhxdY10qshtIzxutNEgA2reClzqvGfLk",
  authDomain: "magnetic-dogfish-w6tp2.firebaseapp.com",
  projectId: "magnetic-dogfish-w6tp2",
  storageBucket: "magnetic-dogfish-w6tp2.firebasestorage.app",
  messagingSenderId: "1053695998908",
  appId: "1:1053695998908:web:2981264db42ef24b2989b9"
};

const databaseId = "ai-studio-seguridaddeproce-b23347e8-195b-479d-afd7-fc21888e6287";

let db: any;
let isFirebaseInitialized = false;

try {
  const app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {}, databaseId);
  isFirebaseInitialized = true;
  console.log("Firebase Firestore initialized successfully with databaseId:", databaseId);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

export { db, isFirebaseInitialized };

export interface CloudReport {
  id: string;
  reportContext: ContextoInforme | null;
  tasks: Task[];
  disciplines: Discipline[];
  teamMembers: TeamMember[];
  insights: SmartInsights;
  updatedAt: string;
}

/**
 * Saves a report to Firebase Firestore.
 */
export async function saveReportToCloud(
  reportId: string,
  reportContext: ContextoInforme | null,
  tasks: Task[],
  disciplines: Discipline[],
  teamMembers: TeamMember[],
  insights: SmartInsights
): Promise<void> {
  if (!isFirebaseInitialized || !db) {
    throw new Error("Firebase is not initialized.");
  }

  const cleanReportId = reportId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!cleanReportId) {
    throw new Error("ID de reporte inválido.");
  }

  const reportRef = doc(db, "reports", cleanReportId);
  const payload: Omit<CloudReport, "id"> = {
    reportContext,
    tasks,
    disciplines,
    teamMembers,
    insights,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(reportRef, payload);
  console.log(`Report ${cleanReportId} successfully saved to Firestore.`);
}

/**
 * Loads a report from Firebase Firestore.
 */
export async function loadReportFromCloud(reportId: string): Promise<CloudReport | null> {
  if (!isFirebaseInitialized || !db) {
    throw new Error("Firebase is not initialized.");
  }

  const cleanReportId = reportId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!cleanReportId) {
    throw new Error("ID de reporte inválido.");
  }

  const reportRef = doc(db, "reports", cleanReportId);
  const docSnap = await getDoc(reportRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as Omit<CloudReport, "id">;
    return {
      id: cleanReportId,
      ...data,
    };
  }

  return null;
}

/**
 * Fetches a list of all saved reports in Firestore.
 */
export async function getSavedReportsList(): Promise<{ id: string; updatedAt: string; gerencia?: string; mes?: string }[]> {
  if (!isFirebaseInitialized || !db) {
    return [];
  }

  try {
    const reportsCollection = collection(db, "reports");
    const querySnapshot = await getDocs(reportsCollection);
    const list: { id: string; updatedAt: string; gerencia?: string; mes?: string }[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        updatedAt: data.updatedAt || "",
        gerencia: data.reportContext?.gerencia || "",
        mes: data.reportContext?.mes || "",
      });
    });

    // Sort by most recently updated
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Error fetching reports list:", error);
    return [];
  }
}
