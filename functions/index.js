const functions = require("firebase-functions/v1");
const admin     = require("firebase-admin");

try { admin.app(); } catch { admin.initializeApp(); }

/**
 * Define uma role (custom claim) para um usuário e espelha no Firestore.
 * Somente 'admin' ou 'pastor' podem chamar. Regras:
 *  - admin: pode definir QUALQUER role (incl. admin/pastor)
 *  - pastor: pode definir SOMENTE roles não-elevadas (membro, ministro, supervisor_* ou null)
 *  - ninguém pode alterar a própria role, exceto admin
 *
 * data: { email: string, role: "admin"|"pastor"|"supervisor_departamento"|"supervisor_setor"|"ministro"|"membro"|null }
 */
exports.setUserRole = functions
  .region("us-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Você precisa estar autenticado.");
    }

    const callerUid  = context.auth.uid;
    const callerRole = context.auth.token?.role || null;

    // Quem pode entrar aqui?
    const allowedSetters = new Set(["admin", "pastor"]);
    if (!allowedSetters.has(callerRole)) {
      throw new functions.https.HttpsError("permission-denied", "Somente administradores ou pastores podem definir funções.");
    }

    // Entrada
    const rawEmail = (data?.email ?? "").toString().trim().toLowerCase();
    const role     = (data?.role ?? null);

    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      throw new functions.https.HttpsError("invalid-argument", "Email inválido.");
    }

    // Whitelist de roles
    const ALLOWED_ROLES = new Set([
      "admin",
      "pastor",
      "supervisor_departamento",
      "supervisor_setor",
      "ministro",
      "membro",
      null,
    ]);
    if (!ALLOWED_ROLES.has(role)) {
      throw new functions.https.HttpsError("invalid-argument", "Função inválida.");
    }

    // Restrições por perfil do chamador
    const ELEVATED = new Set(["admin", "pastor"]);

    // pastor não pode definir admin/pastor
    if (callerRole === "pastor" && ELEVATED.has(role)) {
      throw new functions.https.HttpsError("permission-denied", "Pastores não podem atribuir funções elevadas (admin/pastor).");
    }

    try {
      const user = await admin.auth().getUserByEmail(rawEmail);

      // Bloqueia auto-edição exceto admin
      if (user.uid === callerUid && callerRole !== "admin") {
        throw new functions.https.HttpsError("permission-denied", "Você não pode alterar a própria função.");
      }

      // Define custom claims (limpa se null)
      const claims = role ? { role } : {};
      await admin.auth().setCustomUserClaims(user.uid, claims);

      // Revoga tokens pra aplicar imediatamente
      await admin.auth().revokeRefreshTokens(user.uid);

      // Espelha no Firestore (sem quebrar doc existente)
      await admin.firestore().doc(`users/${user.uid}`).set({
        role: role ?? null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: callerUid,
      }, { merge: true });

      return {
        ok: true,
        uid: user.uid,
        email: user.email,
        role: role ?? null,
        message: `Função de ${user.email} atualizada para ${role || "nenhuma"}.`,
      };
    } catch (error) {
      console.error("[setUserRole] error:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Erro ao definir a permissão.");
    }
  });
  
exports.mergeFamiliesOnUserRegister = require("./mergeFamiliesOnUserRegister").mergeFamiliesOnUserRegister;
exports.getFamilyGraph = require("./getFamilyGraph").getFamilyGraph;
