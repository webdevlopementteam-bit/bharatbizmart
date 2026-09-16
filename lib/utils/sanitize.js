// Strips Mongo operator keys ($gt, $where, ...) and dotted paths out of any
// value that will be interpolated into a Mongoose query, so query params
// coming straight from the client can never inject operators.
export function sanitizeQueryValue(value) {
  if (typeof value === "string") return value.replace(/^\$/, "");
  if (Array.isArray(value)) return value.map(sanitizeQueryValue);
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeQueryValue(val);
    }
    return clean;
  }
  return value;
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
