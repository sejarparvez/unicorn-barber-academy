// routes/api/admin/certificates/$id.tsx
// PATCH — revoke or restore a certificate. Revocation is soft: the record
// stays and /verify/<code> reports it as revoked (audit trail).
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { setCertificateRevocation } from "@/server/certificate-db";

type Params = { id: string };

export const Route = createFileRoute("/api/admin/certificates/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid certificate id" }, { status: 400 });
				}

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}
				if (typeof body.revoked !== "boolean") {
					return json(
						{ message: "'revoked' must be true or false" },
						{ status: 400 },
					);
				}
				const reason =
					typeof body.reason === "string" && body.reason.trim()
						? body.reason.trim()
						: null;

				const updated = await setCertificateRevocation({
					id,
					revoked: body.revoked,
					reason,
				});
				if (!updated) {
					return json({ message: "Certificate not found" }, { status: 404 });
				}
				return json({ ok: true });
			},
		},
	},
});
