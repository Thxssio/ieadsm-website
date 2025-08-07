import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../lib/firebase/client";

export async function setUserRoleCallable(email, role) {
  const functions = getFunctions(app);
  const setUserRole = httpsCallable(functions, "setUserRole");
  const res = await setUserRole({ email, role });
  return res.data; 
}
