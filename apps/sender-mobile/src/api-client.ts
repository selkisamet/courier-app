import { getApiBaseUrl } from "./config";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
  }

  return payload as T;
}
