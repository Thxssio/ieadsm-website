// src/app/lib/firebase/callables/setUserRole.js
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { app } from "../client"; // caminho corrigido

// Região da função (deve bater com a usada no deploy/emulador)
const REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "us-east1";

// Instância única do Functions na região
const functions = getFunctions(app, REGION);

// Conecta ao emulador, se ativo (apenas uma vez)
let _emuConnected = false;
if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true" && !_emuConnected) {
  const host = process.env.NEXT_PUBLIC_EMU_FN_HOST || "127.0.0.1";
  const port = Number(process.env.NEXT_PUBLIC_EMU_FN_PORT || 5001);
  try {
    connectFunctionsEmulator(functions, host, port);
    _emuConnected = true;
  } catch {
    // ignora se já estiver conectado
  }
}

/**
 * Chama a callable setUserRole.
 * Aceita:
 *  - (email: string, role: string|null)
 *  - ({ email: string, role: string|null })
 */
export async function setUserRoleCallable(emailOrPayload, maybeRole) {
  const payload =
    typeof emailOrPayload === "string"
      ? { email: emailOrPayload, role: maybeRole ?? null }
      : emailOrPayload;

  if (!payload?.email) {
    throw new Error("Parâmetro 'email' é obrigatório.");
  }

  // Validação simples do role
  const allowedRoles = new Set([
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor",
    "ministro",
    "membro",
    null,
  ]);
  if (!allowedRoles.has(payload.role)) {
    throw new Error("Função inválida.");
  }

  try {
    const callable = httpsCallable(functions, "setUserRole");
    const res = await callable(payload);
    return res.data; // { uid, email, role, message }
  } catch (err) {
    const msg =
      err?.message || err?.code || "Falha ao chamar a função setUserRole.";
    throw new Error(msg);
  }
}
