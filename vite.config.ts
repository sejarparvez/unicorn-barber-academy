import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig(({ mode }) => ({
	resolve: { tsconfigPaths: true },
	optimizeDeps: {
		// Each `@base-ui/react/*` subpath is a separate dep chunk in dev. Without
		// explicit includes, adding/removing deps invalidates the optimizer hash
		// and lazy routes fail with "error loading dynamically imported module".
		include: [
			"@base-ui/react/accordion",
			"@base-ui/react/alert-dialog",
			"@base-ui/react/avatar",
			"@base-ui/react/button",
			"@base-ui/react/checkbox",
			"@base-ui/react/dialog",
			"@base-ui/react/input",
			"@base-ui/react/menu",
			"@base-ui/react/merge-props",
			"@base-ui/react/progress",
			"@base-ui/react/scroll-area",
			"@base-ui/react/select",
			"@base-ui/react/separator",
			"@base-ui/react/tabs",
			"@base-ui/react/tooltip",
			"@base-ui/react/use-render",
		],
	},
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
