import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function getCurrentUser(sessionCookie) {
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error(error);
    return null;
  }
}