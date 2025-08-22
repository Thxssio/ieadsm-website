"use client";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { app } from "../client";

const REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "us-east1";
const functions = getFunctions(app, REGION);

// Emulador (opcional)
let _emuConnected = false;
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true" &&
  !_emuConnected
) {
  const host = process.env.NEXT_PUBLIC_EMU_FN_HOST || "127.0.0.1";
  const port = Number(process.env.NEXT_PUBLIC_EMU_FN_PORT || 5001);
  try {
    connectFunctionsEmulator(functions, host, port);
    _emuConnected = true;
  } catch {
    // Ignora falha ao conectar no emulador
  }
}
export async function claimPlaceholderByCpfCallable({ cpf, userPayload }) {
  if (!cpf) throw new Error("CPF é obrigatório.");
  if (!userPayload?.uid) throw new Error("UID é obrigatório em userPayload.");

  const callable = httpsCallable(functions, "claimPlaceholderByCpf");
  try {
    const res = await callable({ cpf, userPayload });
    return res.data; // { ok, familyId }
  } catch (err) {
    const code = err?.code || "";
    const msg  = err?.message || "";

    // Função não encontrada/404 -> trate como "não tem placeholder", segue fluxo normal
    if (code === "functions/not-found" || /404/.test(msg)) {
      return { ok: false, notDeployed: true };
    }

    // Propaga os outros (failed-precondition, unauthenticated etc.)
    throw err;
  }
}