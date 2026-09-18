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
			// Never SWR-cache full documents here: the SSR HTML embeds the
			// visitor's session (Header + window.$_TSR) and Nitro's URL-only
			// cache key ignores cookies, so a hard refresh can serve another
			// visitor's signed-in/out state. Only static assets are cacheable.
			routeRules: {
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
