// src/lib/api/http.ts
// Minimal fetch wrapper for same-origin calls to /api/* route handlers.
// Browser-only by design: form mutations run in client components.

type Options = {
	headers?: Record<string, string | undefined>;
	timeout?: number;
};

async function parseJsonSafe(res: Response): Promise<unknown> {
	try {
		return await res.json();
	} catch {
		return null;
	}
}

function messageFrom(data: unknown, status: number): string {
	if (typeof data === "object" && data !== null && "message" in data) {
		const m = (data as { message: unknown }).message;
		if (typeof m === "string" && m) return m;
	}
	return `Request failed (${status})`;
}

async function request<T>(
	method: string,
	url: string,
	body?: unknown,
	opts?: Options,
): Promise<{ data: T }> {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), opts?.timeout ?? 15_000);
	try {
		const isForm = typeof FormData !== "undefined" && body instanceof FormData;
		const headers: Record<string, string> = {};
		if (!isForm) headers["Content-Type"] = "application/json";
		for (const [k, v] of Object.entries(opts?.headers ?? {})) {
			if (v === undefined) delete headers[k];
			else headers[k] = v;
		}
		const res = await fetch(url, {
			method,
			headers,
			body:
				body === undefined
					? undefined
					: isForm
						? (body as FormData)
						: JSON.stringify(body),
			signal: ctrl.signal,
		});
		const data = await parseJsonSafe(res);
		if (!res.ok) throw new Error(messageFrom(data, res.status));
		return { data: data as T };
	} catch (e) {
		if (e instanceof DOMException && e.name === "AbortError")
			throw new Error("Request timed out. Please try again.");
		throw e;
	} finally {
		clearTimeout(t);
	}
}

export const http = {
	get: <T>(url: string, opts?: Options) =>
		request<T>("GET", url, undefined, opts),
	post: <T>(url: string, body?: unknown, opts?: Options) =>
		request<T>("POST", url, body, opts),
	patch: <T>(url: string, body?: unknown, opts?: Options) =>
		request<T>("PATCH", url, body, opts),
	put: <T>(url: string, body?: unknown, opts?: Options) =>
		request<T>("PUT", url, body, opts),
	delete: <T>(url: string, opts?: Options) =>
		request<T>("DELETE", url, undefined, opts),
};

/** Extract a user-friendly error message from a fetch failure. */
export async function extractErrorMessage(error: unknown): Promise<string> {
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong. Please try again.";
}
