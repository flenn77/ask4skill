// src/api/axios.js
import axios from "axios";

const DEFAULT_BASE = import.meta.env.VITE_API_BASE || ""; // optionnel (gateway)
const BASES = {
  auth:  import.meta.env.VITE_AUTH_API_BASE  || "http://localhost:5000",
  coach: import.meta.env.VITE_COACH_API_BASE || import.meta.env.VITE_COACH_API_URL || "http://localhost:5002",
  // ajoute d’autres services ici si besoin
};

function resolveBase(url = "") {
  // Laisse passer les URLs absolues (http/https)
  if (/^https?:\/\//i.test(url)) return undefined;

  const u = url.startsWith("/") ? url : `/${url}`;
  if (u.startsWith("/auth/")) return BASES.auth;
  if (u.startsWith("/coach/") || u.startsWith("/coachs")) return BASES.coach;

  // fallback: DEFAULT_BASE (gateway) ou rien
  return DEFAULT_BASE || undefined;
}

const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Interceptor: token + baseURL dynamique
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  const chosen = resolveBase(config.url);
  if (chosen) config.baseURL = chosen; // seulement si non absolue
  return config;
});

export default api;
