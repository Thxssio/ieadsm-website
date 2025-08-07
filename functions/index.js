const functions = require("firebase-functions");
const admin = require("firebase-admin");

try {
  admin.app();
} catch {
  admin.initializeApp();
}

/**
 * Define a role (custom claim) para um usuário e também espelha no Firestore.
 * Somente quem já é 'admin' (ou 'pastor') pode chamar.
 * data: { email: string, role: string|null }
 */
exports.setUserRole = functions
  .region("us-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Você precisa estar autenticado."
      );
    }

    // Quem pode alterar a função de outros?
    const callerRole = context.auth.token?.role;
    const allowedSetters = ["admin", "pastor"];
    if (!allowedSetters.includes(callerRole)) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Somente administradores podem definir funções."
      );
    }

    const { email, role } = data || {};
    if (!email || typeof email !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "Email inválido.");
    }

    // Lista branca de funções permitidas
    const allowedRoles = new Set([
      "admin",
      "pastor",
      "supervisor_departamento",
      "supervisor_setor",
      "ministro",
      "membro",
      null
    ]);
    if (!allowedRoles.has(role)) {
      throw new functions.https.HttpsError("invalid-argument", "Função inválida.");
    }

    try {
      const user = await admin.auth().getUserByEmail(email);

      // Define custom claims
      await admin.auth().setCustomUserClaims(user.uid, role ? { role } : {});

      // Espelha no Firestore
      await admin.firestore().doc(`users/${user.uid}`).set(
        { role: role ?? null },
        { merge: true }
      );

      return {
        uid: user.uid,
        email: user.email,
        role: role ?? null,
        message: `Função do usuário ${email} atualizada para ${role || "nenhuma"}.`
      };
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        "internal",
        "Erro ao definir a permissão."
      );
    }
  });
