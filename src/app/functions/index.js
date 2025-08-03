const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setMinisterRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Você precisa estar autenticado para executar esta ação."
    );
  }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "ministro" });
    return { message: `Sucesso! O usuário ${email} agora tem a permissão de ministro.` };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", "Ocorreu um erro ao definir a permissão.");
  }
});