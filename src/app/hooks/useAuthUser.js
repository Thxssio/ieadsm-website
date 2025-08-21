import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setUserDoc(snap.exists() ? snap.data() : null);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const photoURL =
    (user?.photoURL && user.photoURL.replace("=s96-c", "=s256-c")) ||
    userDoc?.photoURL ||
    userDoc?.photoUrl ||
    null;

  return { user, userDoc, photoURL, loading };
}

