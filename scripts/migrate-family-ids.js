/* eslint-disable no-console */
const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const FAMILY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
async function generateFamilyId() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let id = '';
    for (let i = 0; i < 6; i += 1) {
      id += FAMILY_CHARS.charAt(Math.floor(Math.random() * FAMILY_CHARS.length));
    }
    const famSnap = await db.collection('families').doc(id).get();
    if (famSnap.exists) continue;
    const idxRef = db.collection('familyId_index').doc(id);
    try {
      await idxRef.create({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return id;
    } catch (e) {
      if (e.code !== 6) throw e; // 6 = ALREADY_EXISTS
    }
  }
}

function isValidCpf(raw) {
  const cpf = (raw || '').replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(cpf.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === parseInt(cpf.charAt(10), 10);
}

async function migrate() {
  const familiesSnap = await db.collection('families').get();
  const cpfFamilies = familiesSnap.docs.filter((doc) => isValidCpf(doc.id));
  console.log(`Encontradas ${cpfFamilies.length} famílias com ID CPF.`);

  for (const snap of cpfFamilies) {
    const oldId = snap.id;
    const data = snap.data();
    const newId = await generateFamilyId();
    const newRef = db.collection('families').doc(newId);
    console.log(`Migrando família ${oldId} -> ${newId}`);

    const membersSnap = await snap.ref.collection('members').get();
    const usersSnap = await db.collection('users').where('familyId', '==', oldId).get();

    await db.runTransaction(async (tx) => {
      tx.set(newRef, { ...data, responsibleCpf: oldId });
      membersSnap.docs.forEach((m) => {
        const mRef = newRef.collection('members').doc(m.id);
        tx.set(mRef, m.data());
      });
      usersSnap.docs.forEach((u) => {
        tx.update(u.ref, { familyId: newId });
      });
    });

    const remainingUsers = await db.collection('users').where('familyId', '==', oldId).get();
    const newMembersSnap = await newRef.collection('members').get();
    if (!remainingUsers.empty) {
      console.error(`Usuários ainda referenciam ${oldId}. Abortando deleção.`);
      continue;
    }
    if (newMembersSnap.size !== membersSnap.size) {
      console.error(`Inconsistência nos membros de ${oldId}. Abortando deleção.`);
      continue;
    }

    for (const m of membersSnap.docs) {
      await m.ref.delete();
    }
    await snap.ref.delete();
    console.log(`Família ${oldId} migrada e antiga removida.`);
  }

  console.log('Migração finalizada.');
}

migrate().catch((err) => {
  console.error('Erro durante migração', err);
  process.exit(1);
});
