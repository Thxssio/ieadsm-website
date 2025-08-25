import { db } from "./client";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { RelationshipType, RELATIONSHIPS_COLLECTION } from "../relationships";

export async function addRelationship(userId, relatedUserId, relationshipType) {
  await addDoc(collection(db, RELATIONSHIPS_COLLECTION), {
    userId,
    relatedUserId,
    relationshipType,
  });
}

async function getRelationships(userId, relationshipType) {
  const q = query(
    collection(db, RELATIONSHIPS_COLLECTION),
    where("userId", "==", userId),
    where("relationshipType", "==", relationshipType)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export function getParents(userId) {
  return getRelationships(userId, RelationshipType.PARENT);
}

export function getChildren(userId) {
  return getRelationships(userId, RelationshipType.CHILD);
}
