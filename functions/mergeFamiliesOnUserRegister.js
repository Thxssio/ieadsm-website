const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

try {
  admin.app();
} catch {
  admin.initializeApp();
}

/**
 * Quando um novo usuário é criado, verifica os CPFs do pai/mãe/cônjuge
 * e associa à família existente, se houver.
 */
exports.mergeFamiliesOnUserRegister = functions
  .region("us-east1")
  .firestore.document("users/{uid}")
  .onCreate(async (snap, context) => {
    const uid = context.params.uid;
    const user = snap.data();

    if (!user || !user.cpf) return;

    const cpfUsuario = user.cpf;
    const cpfsRelacionados = [
      user.cpfPai,
      user.cpfMae,
      user.cpfConjuge,
    ].filter(Boolean);

    const db = admin.firestore();

    let familyIdToUse = null;

    // Verifica se algum dos CPFs relacionados já está em uma família
    for (const cpf of cpfsRelacionados) {
      const familiesSnap = await db
        .collection("families")
        .where("responsibleCpf", "==", cpf)
        .limit(1)
        .get();

      if (!familiesSnap.empty) {
        familyIdToUse = familiesSnap.docs[0].id;
        break;
      }
    }

    // Se não achou família existente, cria nova usando o CPF do próprio usuário
    if (!familyIdToUse) {
      familyIdToUse = cpfUsuario;
      await db.doc(`families/${familyIdToUse}`).set({
        responsibleCpf: cpfUsuario,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    // Adiciona o membro à família
    await db.doc(`families/${familyIdToUse}/members/${uid}`).set({
      uid,
      name: user.name || user.email,
      cpf: cpfUsuario,
      kinship: "titular", // opcional, pode ajustar conforme quiser
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });
