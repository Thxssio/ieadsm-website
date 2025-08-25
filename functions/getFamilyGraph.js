const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

try {
  admin.app();
} catch {
  admin.initializeApp();
}

/**
 * Builds a family relationship graph for a given familyId.
 * Returns hierarchy and loop detection info.
 *
 * data: { familyId: string }
 */
exports.getFamilyGraph = functions
  .region("us-east1")
  .https.onCall(async (data, context) => {
    const familyId = (data?.familyId || "").toString().trim();
    if (!familyId) {
      throw new functions.https.HttpsError("invalid-argument", "familyId is required.");
    }

    const db = admin.firestore();
    const relSnap = await db.collection(`families/${familyId}/relationships`).get();

    const graph = {};

    relSnap.forEach((doc) => {
      const { from, to } = doc.data();
      if (!from || !to) return;

      if (!graph[from]) graph[from] = { children: new Set(), parents: new Set() };
      if (!graph[to]) graph[to] = { children: new Set(), parents: new Set() };

      graph[from].children.add(to);
      graph[to].parents.add(from);
    });

    // Convert sets to arrays
    Object.keys(graph).forEach((id) => {
      graph[id].children = Array.from(graph[id].children);
      graph[id].parents = Array.from(graph[id].parents);
    });

    // Find roots (nodes without parents)
    let roots = Object.keys(graph).filter((id) => graph[id].parents.length === 0);
    if (roots.length === 0) roots = Object.keys(graph);

    let hasLoop = false;
    const globalVisited = new Set();

    function buildTree(id, stack = new Set()) {
      if (stack.has(id)) {
        hasLoop = true;
        return { id, children: [] };
      }
      if (globalVisited.has(id)) {
        return { id, children: [] };
      }
      globalVisited.add(id);
      stack.add(id);
      const children = (graph[id]?.children || []).map((childId) => buildTree(childId, new Set(stack)));
      stack.delete(id);
      return { id, children };
    }

    const hierarchy = [];
    roots.forEach((rootId) => {
      if (!globalVisited.has(rootId)) {
        hierarchy.push(buildTree(rootId));
      }
    });

    return { familyId, hierarchy, hasLoop };
  });
