import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig(({ mode }) => ({
	resolve: { tsconfigPaths: true },
	plugins: [
		...(mode === "development" ? [devtools()] : []),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
			routeRules: {
				"/": { swr: 300 },
				"/programs/**": { swr: 3600 },
				"/blog/**": { swr: 600 },
				"/assets/**": {
					headers: { "cache-control": "public, max-age=31536000, immutable" },
				},
			},
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
}));

export default config;
