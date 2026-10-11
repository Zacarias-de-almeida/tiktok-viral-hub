// Browser-only storage of per-order access tokens (never put them in URLs).
type Stored = { token: string; email: string };
const key = (id: string) => `funnel-order:${id}`;

export function saveOrder(id: string, data: Stored) {
  sessionStorage.setItem(key(id), JSON.stringify(data));
}
export function loadOrder(id: string): Stored | null {
  try {
    const raw = sessionStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}
