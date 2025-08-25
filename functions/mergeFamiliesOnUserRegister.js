const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { randomUUID } = require("crypto");

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

    // 1) tenta encontrar família onde o próprio usuário seja responsável
    const userFamilySnap = await db
      .collection("families")
      .where("responsibleCpf", "==", cpfUsuario)
      .limit(1)
      .get();

    if (!userFamilySnap.empty) {
      familyIdToUse = userFamilySnap.docs[0].id;
    }

    // 2) se ainda não encontrou, verifica CPFs relacionados
    if (!familyIdToUse) {
      for (const cpf of cpfsRelacionados) {
        // procura por famílias onde o CPF seja o responsável
        const familiesSnap = await db
          .collection("families")
          .where("responsibleCpf", "==", cpf)
          .limit(1)
          .get();

        if (!familiesSnap.empty) {
          familyIdToUse = familiesSnap.docs[0].id;
          break;
        }

        // se não encontrou pelo responsável, procura em membros existentes
        const membersSnap = await db
          .collectionGroup("members")
          .where("cpf", "==", cpf)
          .limit(1)
          .get();

        if (!membersSnap.empty) {
          familyIdToUse = membersSnap.docs[0].ref.parent.parent.id;
          break;
        }
      }
    }

    // 3) se ainda não há família, cria uma nova com UUID
    if (!familyIdToUse) {
      familyIdToUse = randomUUID();
      await db.doc(`families/${familyIdToUse}`).set(
        {
          responsibleCpf: cpfUsuario,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 4) garante que o usuário tenha o familyId
    await db.doc(`users/${uid}`).set({ familyId: familyIdToUse }, { merge: true });

    // 5) adiciona o membro à família
    await db.doc(`families/${familyIdToUse}/members/${uid}`).set(
      {
        uid,
        name: user.name || user.email,
        cpf: cpfUsuario,
        kinship: "titular", // opcional, pode ajustar conforme quiser
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Remove placeholder baseado no CPF se existir
    const placeholderRef = db.doc(`families/${familyIdToUse}/members/${cpfUsuario}`);
    try {
      const placeholderSnap = await placeholderRef.get();
      if (placeholderSnap.exists && placeholderRef.id !== uid) {
        await placeholderRef.delete();
      }
    } catch (err) {
      console.error("Erro ao remover placeholder de membro", err);
    }
  });
