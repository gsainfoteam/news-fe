export function getFileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

// news-be accepts upload names matching only `^[a-zA-Z0-9_.-]+$`, so Korean
// names would be rejected outright. Keep the ASCII parts and the (lowercased)
// extension the backend reads the type from; "file" stands in for a name with
// nothing left.
export function toSafeFileName(name: string) {
  const ext = getFileExtension(name).replace(/[^a-z0-9]/g, "");
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "")
    .slice(0, 100);
  const safeBase = /[a-zA-Z0-9]/.test(base) ? base : "file";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 ** 2) return `${round1(bytes / 1024)}KB`;
  return `${round1(bytes / 1024 ** 2)}MB`;
}
