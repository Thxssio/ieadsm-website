import { onSnapshot } from "firebase/firestore";

export function onSnapshotSafe(refOrQuery, next, onError) {
  return onSnapshot(
    refOrQuery,
    next,
    (err) => {
      if (err?.code === "permission-denied") {
        return;
      }
      console.error("Snapshot error:", err);
      onError && onError(err);
    }
  );
}
