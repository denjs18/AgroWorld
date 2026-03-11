const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://agroworld.railway.app";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function put<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "PUT" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  getDashboard:   (deviceId: string) => get(`/parcelles/${deviceId}/dashboard`),
  getAlerts:      (parcelleId: string) => get(`/parcelles/${parcelleId}/alerts`),
  markAlertRead:  (alertId: string) => put(`/alerts/${alertId}/read`),
  getReadings:    (deviceId: string, hours = 24) =>
    get(`/parcelles/${deviceId}/readings?hours=${hours}`),
  getJournal:     (parcelleId: string) => get(`/journal/${parcelleId}`),
  addJournalEntry:(entry: unknown) => post("/journal", entry),
  createParcelle: (p: unknown) => post("/parcelles", p),
  simulate:       (deviceId: string, scenario: string) =>
    post(`/parcelles/${deviceId}/simulate`, { scenario }),
};
