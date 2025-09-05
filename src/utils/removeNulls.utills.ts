export function removeNulls<T = any>(value: T): T | undefined {
  // remove null/undefined
  if (value === null || value === undefined) return undefined;

  // arrays: clean elements, drop any elements that become `undefined` (i.e., were null)
  if (Array.isArray(value)) {
    const arr = (value as any[])
      .map((v) => removeNulls(v))
      .filter((v) => v !== undefined);
    return arr as any;
  }

  // plain objects: recursively clean properties
  if (typeof value === "object") {
    // Preserve special objects like Date and Buffer
    if (value instanceof Date) return value as any;
    if (typeof Buffer !== "undefined" && value instanceof Buffer)
      return value as any;

    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      const cleaned = removeNulls(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out as any;
  }

  return value;
}
