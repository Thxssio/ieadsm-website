// src/app/lib/firebase/callables/setUserRole.js
"use client";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase/client"; // seu init do Firebase app

// Região da função (deve bater com a usada no deploy/emulador)
const REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "us-east1";

// Instância única do Functions na região
const functions = getFunctions(app, REGION);

// Conecta ao emulador apenas no client e apenas uma vez
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
    // console.info(`[functions] conectado ao emulador ${host}:${port}`);
  } catch {
    // se já conectou em hot-reload, silencie
  }
}

// Whitelist de roles aceitas
const ALLOWED_ROLES = new Set([
  "admin",
  "pastor",
  "supervisor_departamento",
  "supervisor_setor",
  "ministro",
  "membro",
  null,
]);

// Mapa de códigos de erro → mensagens amigáveis
const FRIENDLY = {
  "functions/unauthenticated": "Você precisa estar autenticado.",
  "functions/permission-denied":
    "Você não tem permissão para definir funções.",
  "functions/invalid-argument": "Parâmetros inválidos.",
  "functions/internal": "Erro interno ao definir a permissão.",
};

/**
 * Normaliza e valida o payload para a callable.
 */
function normalizePayload(emailOrPayload, maybeRole) {
  const payload =
    typeof emailOrPayload === "string"
      ? { email: emailOrPayload, role: maybeRole ?? null }
      : emailOrPayload || {};

  const email = String(payload.email || "").trim().toLowerCase();
  const role = payload.role ?? null;

  if (!email) throw new Error("Parâmetro 'email' é obrigatório.");

  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(
      "Função inválida. Use: admin, pastor, supervisor_departamento, supervisor_setor, ministro, membro ou null."
    );
  }
  return { email, role };
}

/**
 * Chama a callable setUserRole.
 * Aceita:
 *  - (email: string, role: string|null)
 *  - ({ email: string, role: string|null })
 * Retorna: { ok, uid, email, role, message }
 */
export async function setUserRoleCallable(emailOrPayload, maybeRole) {
  const { email, role } = normalizePayload(emailOrPayload, maybeRole);

  try {
    const callable = httpsCallable(functions, "setUserRole");
    const res = await callable({ email, role });
    return res.data; // { ok, uid, email, role, message }
  } catch (err) {
    // Firebase Functions HttpsError → tem .code e .message
    const code = err?.code || "functions/internal";
    const fallback =
      err?.message ||
      FRIENDLY[code] ||
      "Falha ao chamar a função setUserRole.";
    throw new Error(fallback);
  }
}

/**
 * (Opcional) Após alterar a role, se o usuário afetado for o atual,
 * force o refresh do ID token para refletir as novas claims imediatamente.
 */
export async function maybeRefreshCurrentUserClaimsIfAffected(targetEmail) {
  try {
    const auth = getAuth();
    const me = auth.currentUser;
    if (me && me.email && me.email.toLowerCase() === targetEmail.toLowerCase()) {
      await me.getIdToken(true);
    }
  } catch {
    // silencioso
  }
}

