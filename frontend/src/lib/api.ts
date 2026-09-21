const API_BASE = "http://localhost:4000/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    // fetch() itself throws when the server isn't reachable at all -- most
    // commonly because the backend is still starting up (Postgres connect +
    // migrations + syncs all run before the API server starts listening).
    console.error(`[api] Could not reach ${path} -- is the backend still starting up?`, err);
    throw new Error(`Could not reach the backend at ${path}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[api] ${path} failed: ${res.status} ${res.statusText}`, body);
    throw new Error(`API request to ${path} failed: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}
