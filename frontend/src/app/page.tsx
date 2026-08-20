"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3101";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }
        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch(() => setError("無法連線到 Backend"));
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Enterprise Exhibition Platform</h1>
      <p>第一階段：確認前端與後端可以互相溝通。</p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!health && !error && <p>Checking backend...</p>}
      {health && (
        <p style={{ color: "green" }}>
          Backend status: {health.status} ({health.service})
        </p>
      )}
    </main>
  );
}
