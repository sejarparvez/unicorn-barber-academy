// src/lib/api/http.ts
// Shared axios instance for same-origin calls to /api/* route handlers.
//
// Browser-only by design: form mutations run in client components. Axios
// cannot resolve a relative baseURL during SSR — if a server-side call is
// ever needed, pass an absolute URL explicitly at that call site.
import axios from "axios";

export const http = axios.create({
	baseURL: "/",
	timeout: 15_000,
	headers: { "Content-Type": "application/json" },
});
