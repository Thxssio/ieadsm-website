import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getCurrentUser } from "@/lib/firebase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // extract session cookie
    const cookieHeader = request.headers.get("cookie");
    let sessionCookie = "";
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const sessionCookieString = cookies.find((c) => c.startsWith("session="));
      if (sessionCookieString) {
        sessionCookie = sessionCookieString.split("=")[1];
      }
    }

    const user = await getCurrentUser(sessionCookie);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getFirestore();
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { familyId } = userDoc.data() || {};
    if (!familyId) {
      return NextResponse.json({ elements: [] }, { status: 200 });
    }

    const membersSnap = await db
      .collection(`families/${familyId}/members`)
      .get();
    const relationshipsSnap = await db
      .collection(`families/${familyId}/relationships`)
      .get();

    const nodes = [];
    for (const m of membersSnap.docs) {
      const uSnap = await db.collection("users").doc(m.id).get();
      const data = uSnap.exists ? uSnap.data() : {};
      nodes.push({
        data: {
          id: m.id,
          label: data.displayName || data.name || m.id,
          gender: data.gender || "U",
          alive: data.alive !== false,
          root: data.root ? "true" : undefined,
        },
      });
    }

    const edges = relationshipsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        data: {
          id: doc.id,
          source: d.fromId || d.from,
          target: d.toId || d.to,
          type: d.type || "",
        },
      };
    });

    return NextResponse.json({ elements: [...nodes, ...edges] }, { status: 200 });
  } catch (err) {
    console.error("[family-tree]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

