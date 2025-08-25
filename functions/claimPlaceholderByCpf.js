// functions/claimPlaceholderByCpf.js
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const generateFamilyId = require("./generateFamilyId");

try { admin.app(); } catch { admin.initializeApp(); }

exports.claimPlaceholderByCpf = functions
  .region("us-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login necessário.");
    }

    const rawCpf = (data?.cpf || "").toString();
    const cpf = rawCpf.replace(/\D/g, ""); // só dígitos
    const userPayload = data?.userPayload || null;

    if (!cpf) {
      throw new functions.https.HttpsError("invalid-argument", "CPF é obrigatório.");
    }
    if (!userPayload?.uid) {
      throw new functions.https.HttpsError("invalid-argument", "UID é obrigatório em userPayload.");
    }
    // segurança: quem chama precisa ser o próprio usuário que está “claimando”
    if (context.auth.uid !== userPayload.uid) {
      throw new functions.https.HttpsError("permission-denied", "Operação não permitida para este usuário.");
    }

    const db = admin.firestore();

    // 1) localizar placeholder por CPF
    const q = await db.collection("users").where("cpf", "==", cpf).limit(1).get();
    if (q.empty) {
      throw new functions.https.HttpsError("not-found", "Placeholder não encontrado.");
    }
    const srcSnap = q.docs[0];
    const srcRef = srcSnap.ref;
    const src = srcSnap.data();

    // 1.a) checar se é realmente placeholder
    const isPlaceholder =
      src.isPlaceholder === true || (!src.uid && !src.email);

    if (!isPlaceholder) {
      // já é usuário real com esse CPF
      throw new functions.https.HttpsError(
        "failed-precondition",
        "CPF já está em uso por usuário real."
      );
    }

    // 2) decidir familyId
    let familyId = src.familyId || userPayload.familyId || null;

    if (!familyId) {
      // tenta localizar família onde o CPF seja o responsável
      const famQuery = await db
        .collection("families")
        .where("responsibleCpf", "==", cpf)
        .limit(1)
        .get();

      if (!famQuery.empty) {
        familyId = famQuery.docs[0].id;
      } else {
        // gera um novo ID para a família
        familyId = await generateFamilyId(db);
      }
    }

    // 3) montar destino users/{uid}
    const dstRef = db.doc(`users/${userPayload.uid}`);
    const shouldMove = srcRef.id !== userPayload.uid;

    // payload consolidado
    const now = admin.firestore.FieldValue.serverTimestamp();
    const mergedUser = {
      ...src,                 // mantém campos antigos úteis
      ...userPayload,         // sobrescreve com dados atuais
      cpf,                    // normalizado
      familyId,
      isPlaceholder: false,
      updatedAt: now,
      updatedBy: context.auth.uid,
      // createdAt: mantém se já existia no placeholder; se precisar, setaremos abaixo
    };

    // 4) transação: gravar users/{uid}, apagar placeholder (se mudar de id),
    //    e garantir vínculo na família
    await db.runTransaction(async (tx) => {
      // garantir families/{familyId}
      const famRef = db.doc(`families/${familyId}`);
      const famSnap = await tx.get(famRef);
      if (!famSnap.exists) {
        tx.set(
          famRef,
          {
            responsibleCpf: cpf,
            createdAt: now,
            updatedAt: now,
          },
          { merge: true }
        );
      } else {
        tx.set(famRef, { updatedAt: now }, { merge: true });
      }

      // gravar users/{uid}
      const dstSnap = await tx.get(dstRef);
      if (!dstSnap.exists) {
        // se o placeholder tinha createdAt, preserve
        const createdAt = src.createdAt || now;
        tx.set(dstRef, { ...mergedUser, createdAt }, { merge: true });
      } else {
        tx.set(dstRef, mergedUser, { merge: true });
      }

      // vincular membro em families/{familyId}/members/{uid}
      const memRef = db.doc(`families/${familyId}/members/${userPayload.uid}`);
      tx.set(memRef, {
        uid: userPayload.uid,
        name: userPayload.name || src.name || userPayload.email,
        cpf,
        // kinship pode ser inferido depois; mantemos se já houver
        updatedAt: now,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // remover placeholder antigo se o id for diferente
      if (shouldMove) {
        tx.delete(srcRef);
      }
    });

    return { ok: true, familyId };
  });
