// src/lib/firebase/client.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// App Check (opcional, mas recomendado se Storage estiver "Enforced")
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Singletons
let app;
let auth = null;
let db;
let storage;
let appCheck; // opcional

function initFirebase() {
  // Evita inicializações múltiplas
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Firestore e Storage podem existir em SSR também
  db = db || getFirestore(app);
  storage = storage || getStorage(app);

  // Auth e App Check apenas no client
  if (typeof window !== "undefined") {
    if (!auth) {
      auth = getAuth(app);
      // Persistência da sessão no navegador
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    }

    // --- App Check (opcional) ---
    const appCheckEnabled = process.env.NEXT_PUBLIC_APPCHECK_ENABLED === "true";
    const siteKey = process.env.NEXT_PUBLIC_APPCHECK_SITE_KEY;

    if (appCheckEnabled && siteKey && !appCheck) {
      // Debug token para DEV (opcional)
      const dbg = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
      if (dbg) {
        // Pode ser "true" para gerar no console ou um token fixo
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = dbg; // eslint-disable-line
      }

      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }

    // --- Emuladores (opcional) ---
    const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
    if (useEmulators) {
      try {
        // Firestore
        const fsHost = process.env.NEXT_PUBLIC_EMU_FS_HOST || "localhost";
        const fsPort = Number(process.env.NEXT_PUBLIC_EMU_FS_PORT || 8080);
        connectFirestoreEmulator(db, fsHost, fsPort);

        // Auth
        const authHost = process.env.NEXT_PUBLIC_EMU_AUTH_HOST || "http://localhost";
        const authPort = Number(process.env.NEXT_PUBLIC_EMU_AUTH_PORT || 9099);
        connectAuthEmulator(auth, `${authHost}:${authPort}`, { disableWarnings: true });

        // Storage
        const stHost = process.env.NEXT_PUBLIC_EMU_ST_HOST || "localhost";
        const stPort = Number(process.env.NEXT_PUBLIC_EMU_ST_PORT || 9199);
        connectStorageEmulator(storage, stHost, stPort);
      } catch {
        // Ignora se já estiver conectado
      }
    }
  }
}

// Inicializa ao importar
initFirebase();

export { app, auth, db, storage, appCheck };
