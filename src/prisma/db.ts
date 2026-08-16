import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./schema.d";
import contractJson from "./schema.json" with { type: "json" };

export const db = postgres<Contract>({
	contractJson,
	// biome-ignore lint/complexity/useLiteralKeys: this is fine
	// biome-ignore lint/style/noNonNullAssertion: this is fine
	url: process.env["DATABASE_URL"]!,
});
