const admin = require("firebase-admin");

const FAMILY_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

async function generateFamilyId(db) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let id = "";
    for (let i = 0; i < 6; i += 1) {
      id += FAMILY_CHARS.charAt(Math.floor(Math.random() * FAMILY_CHARS.length));
    }
    const famSnap = await db.doc(`families/${id}`).get();
    if (famSnap.exists) continue;
    const idxRef = db.doc(`familyId_index/${id}`);
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

module.exports = generateFamilyId;
