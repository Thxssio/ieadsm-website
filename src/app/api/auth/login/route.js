import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// A função precisa ser exportada como POST
export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided." }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const options = {
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const response = NextResponse.json({ status: "success" }, { status: 200 });
    response.cookies.set(options);
    return response;

  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ error: "Failed to create session." }, { status: 401 });
  }
}