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

/** Extract a user-friendly error message from an axios error response. */
export async function extractErrorMessage(error: unknown): Promise<string> {
	if (typeof error === "object" && error !== null) {
		const data = (error as { response?: { data?: { message?: string } } })
			.response?.data;
		if (data?.message) return data.message;
	}
	return "Something went wrong. Please try again.";
}
