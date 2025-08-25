import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCurrentUser } from "@/lib/firebase/server";

// Only allow dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { familyId } = params;

  try {
    const { fromId, toId, type } = await request.json();
    if (!fromId || !toId || !type) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (fromId === toId) {
      return NextResponse.json({ error: "Members must be distinct." }, { status: 400 });
    }

    // Extract session cookie
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
    const uid = user.uid;
    const role = user.role || null;
    const elevated = new Set(["admin", "pastor", "supervisor_departamento", "supervisor_setor"]);

    if (!elevated.has(role)) {
      const memberDoc = await db.doc(`families/${familyId}/members/${uid}`).get();
      if (!memberDoc.exists) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const relationshipsRef = db.collection(`families/${familyId}/relationships`);

    // Ensure members exist
    const fromDoc = await db.doc(`families/${familyId}/members/${fromId}`).get();
    const toDoc = await db.doc(`families/${familyId}/members/${toId}`).get();
    if (!fromDoc.exists || !toDoc.exists) {
      return NextResponse.json({ error: "Members not found in family." }, { status: 404 });
    }

    // Prevent duplicates
    const dupSnap = await relationshipsRef
      .where("fromId", "==", fromId)
      .where("toId", "==", toId)
      .where("type", "==", type)
      .get();
    if (!dupSnap.empty) {
      return NextResponse.json({ error: "Relationship already exists." }, { status: 409 });
    }

    // Load existing graph
    const graphSnap = await relationshipsRef.get();
    const graph = {};
    graphSnap.forEach((doc) => {
      const d = doc.data();
      if (!graph[d.fromId]) graph[d.fromId] = [];
      graph[d.fromId].push(d.toId);
    });
    if (!graph[fromId]) graph[fromId] = [];
    graph[fromId].push(toId);

    const hasPath = (start, target, visited = new Set()) => {
      if (start === target) return true;
      if (visited.has(start)) return false;
      visited.add(start);
      for (const next of graph[start] || []) {
        if (hasPath(next, target, visited)) return true;
      }
      return false;
    };

    if (hasPath(toId, fromId)) {
      return NextResponse.json({ error: "Relationship would create a cycle." }, { status: 400 });
    }

    const docRef = await relationshipsRef.add({
      fromId,
      toId,
      type,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: uid,
    });

    return NextResponse.json({ ok: true, id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("[relationships]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
