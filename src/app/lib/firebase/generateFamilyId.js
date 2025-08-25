import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

const FAMILY_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export async function generateFamilyId() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let id = "";
    for (let i = 0; i < 6; i += 1) {
      id += FAMILY_CHARS.charAt(Math.floor(Math.random() * FAMILY_CHARS.length));
    }
    try {
      const success = await runTransaction(db, async (tx) => {
        const famRef = doc(db, "families", id);
        const famSnap = await tx.get(famRef);
        if (famSnap.exists()) return false;

        const idxRef = doc(db, "familyId_index", id);
        const idxSnap = await tx.get(idxRef);
        if (idxSnap.exists()) return false;

        tx.set(idxRef, { createdAt: new Date() });
        return true;
      });
      if (success) return id;
    } catch (e) {
      console.error("Failed to reserve familyId", e);
    }
  }
}
