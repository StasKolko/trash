vite.config.ts

```ts
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "node:path";

export default defineConfig({
	build: {
		ssr: path.join(__dirname, "src/index.ts"),
		emptyOutDir: true,
		target: "esnext",
		rollupOptions: {
			plugins: [],
		},
	},
	plugins: [
		/* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
		// devtools(),
		solidPlugin({
			ssr: true,
		}),
	],
});
```

src/index.ts

```ts
import { Elysia } from "elysia";

import elysiaSolid from "./elysia_solid";

import IndexPage from "../src/pages/index";

const app = new Elysia()
	.use(
		elysiaSolid({
			components: {
				"./src/pages/index": IndexPage,
			},
		}),
	)
	.get("/", ({ renderPage, set }) => {
		set.headers["content-type"] = "text/html; charset=utf8";
		return renderPage("./src/pages/index", {
			counter: 42,
		});
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
```

src/pages/entry.ts

```ts
import { generateHydrationScript, getAssets } from "solid-js/web";

export default ({
	children,
	scripts,
}: {
	children: string;
	scripts: string;
}) => `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      ${getAssets()}
      ${generateHydrationScript()}
   </head>
   <body>
      <div id="app">
         ${children}
      </div>
      ${scripts}
   </body>
</html>
`;
```

src/pages/index.ts

```ts
import App from "../components/App";
import { MetaProvider, Title } from "@solidjs/meta";

export default (props: {
	counter: number;
}) => {
	return (
		<MetaProvider>
			<Title>Hello Elysia</Title>
			<App counter={props.counter} />
		</MetaProvider>
	);
};
```

src/elysia_solid/config.ts

```ts
import virtual from "@rollup/plugin-virtual";
import type { ModuleFormat } from "bun";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export const buildConfig = ({
	entryScript,
	format,
}: {
	entryScript: string;
	format?: ModuleFormat;
}) => {
	return defineConfig({
		build: {
			ssr: false,
			emptyOutDir: false,
			rollupOptions: {
				input: "entry",
				output: {
					dir: "dist",
					format: format ?? "iife",
					entryFileNames: "[hash].js",
				},
				plugins: [
					virtual({
						entry: entryScript,
					}),
				],
			},
		},
		plugins: [
			/* 
      Uncomment the following line to enable solid-devtools.
      For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
      */
			// devtools(),
			solidPlugin({
				ssr: true,
			}),
		],
	});
};
```

src/elysia_solid/hydrate.ts

```ts
import { build } from "vite";
import { renderToString } from "solid-js/web";
import type { JSXElement } from "solid-js";
import { buildConfig } from "./config";
import entry from "../pages/entry";

export const hydrateScript = async (componentPath: string): Promise<string> => {
	const entryScript = `
		import { hydrate } from "solid-js/web";
		import App from "${componentPath}";
		hydrate(
			() => 
				App(JSON.parse(document.getElementById("_prop").innerText)),
			document.getElementById("app"));
	`;

	return `./dist/${
		(
			(await build(
				buildConfig({
					entryScript,
				}),
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			)) as any
		).output[0].fileName
	}`;
};

export const renderPage = <S>(
	component: (props: S) => JSXElement,
	props: S,
	hash: string,
) => {
	return entry({
		children: renderToString(() => component(props)),
		scripts: `
		<script id="_prop" type="application/json">${JSON.stringify(props)}</script>
		<script async src="/_hydrate.js?hash=${hash}" type="module"></script>`,
	});
};
```

src/elysia_solid/index.ts

```ts
import crypto from "node:crypto";

import Elysia, { NotFoundError, t } from "elysia";

import { hydrateScript, renderPage } from "./hydrate";

import type { JSXElement } from "solid-js";

const _hydrations = new Map<string, Promise<string>>();

export default <
	const C extends Record<string, (props: any) => JSXElement>,
>(config: {
	components: C;
}) => {
	for (const componentPath in config.components) {
		const md5 = crypto.createHash("md5");
		const hash = md5.update(componentPath).digest("hex");
		if (!_hydrations.has(hash)) {
			_hydrations.set(hash, hydrateScript(componentPath));
		}
	}

	return new Elysia()
		.decorate(
			"renderPage",
			<const P extends string>(
				componentPath: P,
				props: Parameters<C[P]>[0],
			) => {
				const component = config.components[componentPath];

				const md5 = crypto.createHash("md5");
				const hash = md5.update(componentPath).digest("hex");

				return renderPage(component, props, hash);
			},
		)
		.get(
			"/_hydrate.js",
			async ({ query: { hash }, set }) => {
				const hydrationScript = _hydrations.get(hash);
				if (!hydrationScript) {
					throw new NotFoundError();
				}

				set.headers["content-type"] = "application/javascript; charset=utf8";
				return await Bun.file(await hydrationScript).text();
			},
			{
				query: t.Object({
					hash: t.String(),
				}),
			},
		);
};
```

src/components/App.tsx

```tsx
import { createEffect, createSignal } from "solid-js";

export default (props: {
	counter: number;
}) => {
	const [count, setCount] = createSignal(props.counter);
	const increment = () => setCount((count) => count + 1);

	createEffect(() => {
		console.log("Hi");
	});

	return (
		<div>
			Hello Solid/Elysia
			<button type="button" onClick={increment}>
				{count()}
			</button>
		</div>
	);
};
```