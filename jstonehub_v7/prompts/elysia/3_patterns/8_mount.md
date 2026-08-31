# Mount

WinterTC is a standard for building HTTP Server behind Cloudflare, Deno, Vercel, and others.

It allows web servers to run interoperably across runtimes by using `Request`, and `Response`.

Elysia is WinterTC compliant. Optimized to run on Bun, but also supports other runtimes if possible.

This allows any WinterTC-compliant framework or code to run together, allowing frameworks like Elysia, Hono, Remix, Itty Router to run together in a simple function.

## Mount

To use `.mount`, simply pass a `fetch` function:

```ts
import { Elysia } from 'elysia'
import { Hono } from 'hono'

const hono = new Hono()
    .get('/', (c) => c.text('Hello from Hono!'))

const app = new Elysia()
    .get('/', () => 'Hello from Elysia')
    .mount('/hono', hono.fetch)
```

Any framework that uses `Request` and `Response` can interoperate with Elysia like:

- Hono
- Nitro
- H3
- Next.js API Route
- Nuxt API Route
- SvelteKit API Route

And these can be used on multiple runtimes like:

- Bun
- Deno
- Vercel Edge Runtime
- Cloudflare Worker
- Netlify Edge Function

If the framework supports the `.mount` function, you can also mount Elysia inside another framework:

```ts
import { Elysia } from 'elysia'
import { Hono } from 'hono'

const elysia = new Elysia()
    .get('/', () => 'Hello from Elysia inside Hono inside Elysia')

const hono = new Hono()
    .get('/', (c) => c.text('Hello from Hono!'))
    .mount('/elysia', elysia.fetch)

const main = new Elysia()
    .get('/', () => 'Hello from Elysia')
    .mount('/hono', hono.fetch)
    .listen(3000)
```

This makes the possibility of an interoperable framework and runtime a reality.