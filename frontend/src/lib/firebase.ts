"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getDatabase, ref, push, type Database } from "firebase/database"
import { getAuth, signInAnonymously, type Auth } from "firebase/auth"

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(
  cfg.apiKey && cfg.authDomain && cfg.databaseURL && cfg.projectId && cfg.appId
)

let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null

if (firebaseEnabled) {
  const apps = getApps()
  app = apps.length ? apps[0]! : initializeApp(cfg as any)
  db = getDatabase(app)
  auth = getAuth(app)
}

export async function ensureAnonAuth(): Promise<void> {
  if (!firebaseEnabled || !auth) return
  if (!auth.currentUser) {
    try { await signInAnonymously(auth) } catch {}
  }
}

export async function logChatMessage(sessionId: string, data: any): Promise<void> {
  if (!firebaseEnabled || !db) return
  try { await push(ref(db, `chats/${sessionId}/messages`), { ...data, ts: Date.now() }) } catch {}
}

export async function logScanResult(kind: "url" | "file", data: any): Promise<void> {
  if (!firebaseEnabled || !db) return
  try { await push(ref(db, `scans/${kind}`), { ...data, ts: Date.now() }) } catch {}
}
