import type { HealthResponse } from "@rhythm-battle/shared";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchHealthStatus(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data: HealthResponse = await response.json();
  return data;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

