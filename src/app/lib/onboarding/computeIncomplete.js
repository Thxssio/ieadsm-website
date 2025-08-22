export function computeIncomplete({ authUser, userDoc, required = [] }) {
  const missing = [];
  const get = (k) => {
    if (k === "displayName") return authUser?.displayName || userDoc?.displayName;
    if (k === "email") return authUser?.email || userDoc?.email;
    return userDoc?.[k] ?? authUser?.[k];
  };
  required.forEach((k) => {
    const v = get(k);
    if (!v || String(v).trim() === "") missing.push(k);
  });
  return missing;
}
