# Handler

**Handler** - a function that accepts an HTTP request and returns a response.

```ts
import { Elysia } from 'elysia'

new Elysia()
    // the function `() => 'hello world'` is a handler
    .get('/', () => 'hello world')
    .listen(3000)
```

A handler may be a literal value, and can be inlined.

```ts
import { Elysia, file } from 'elysia'

new Elysia()
    .get('/', 'Hello Elysia')
    .get('/video', file('kyuukurarin.mp4'))
    .listen(3000)
```

Using an **inline value** always returns the same value which is useful to optimize performance for static resources like files.

This allows Elysia to compile the response ahead of time to optimize performance.

> **TIP**:
> Providing an inline value is not a cache.
> Static resource values, headers and status can be mutated dynamically using lifecycle.

## Context

**Context** contains request information which is unique for each request, and is not shared except for `store` (global mutable state).

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', (context) => context.path)
              // ^ This is a context
```

**Context** can only be retrieved in a route handler. It consists of:

### Property

- **body** - HTTP message, form or file upload.
- **query** - Query String, includes additional parameters for search query as JavaScript Object. (Query is extracted from a value after pathname starting from `?` question mark sign)
- **params** - Elysia's path parameters parsed as JavaScript object
- **headers** - HTTP Header, additional information about the request like User-Agent, Content-Type, Cache Hint.
- **cookie** - A global mutable signal store for interacting with Cookie (including get/set)
- **store** - A global mutable store for Elysia instance

### Utility Function

- **redirect** - A function to redirect a response
- **status** - A function to return custom status code
- **set** - Property to apply to Response:
    - **headers** - Response headers

### Additional Property

- **request** - Web Standard Request
- **server** - Bun server instance
- **path** - Pathname of the request

## status

A function to return a custom status code with type narrowing.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ status }) => status(418, "Kirifuji Nagisa"))
    .listen(3000)
```

It's recommended to use the **never-throw** approach to return **status** instead of throwing as it:

- allows TypeScript to check if a return value is correctly typed to the response schema
- autocompletion for type narrowing based on status code
- type narrowing for error handling using End-to-end type safety (Eden)

## Set

**set** is a mutable property that forms a response accessible via `Context.set`.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ set, status }) => {
        set.headers = { 'X-Teapot': 'true' }

        return status(418, 'I am a teapot')
    })
    .listen(3000)
```

### set.headers

Allows us to append or delete response headers represented as an Object.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ set }) => {
        set.headers['x-powered-by'] = 'Elysia'

        return 'a mimir'
    })
    .listen(3000)
```

> **TIP**:
> Elysia provides auto-completion for lowercase for case-sensitivity consistency, eg. use `set-cookie` rather than `Set-Cookie`.

## Cookie

Elysia provides a mutable store for interacting with cookies.

There's no need for get/set; you can extract the cookie name and retrieve or update its value directly.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/set', ({ cookie: { name } }) => {
        // Get
        name.value

        // Set
        name.value = "New Value"
    })
```

## Redirect

Redirect a request to another resource.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ redirect }) => {
        return redirect('https://youtu.be/whpVWVWBW4U?&t=8')
    })
    .get('/custom-status', ({ redirect }) => {
        // You can also set custom status to redirect
        return redirect('https://youtu.be/whpVWVWBW4U?&t=8', 302)
    })
    .listen(3000)
```

When using redirect, returned value is not required and will be ignored. As response will be from another resource.

## Formdata

We can return a `FormData` by returning the `form` utility directly from the handler.

```ts
import { Elysia, form, file } from 'elysia'

new Elysia()
    .get('/', () => form({
        name: 'Tea Party',
        images: [file('nagi.web'), file('mika.webp')]
    }))
    .listen(3000)
```

This pattern is useful if you ever need to return a file or multipart form data.

### Return a file

Or alternatively, you can return a single file by returning `file` directly without `form`.

```ts
import { Elysia, file } from 'elysia'

new Elysia()
    .get('/', file('nagi.web'))
    .listen(3000)
```

## Stream

To return a response streaming out of the box, use a generator function with the `yield` keyword.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* () {
        yield 1
        yield 2
        yield 3
    })
```

In this example, we stream a response by using the `yield` keyword.

### Server Sent Events (SSE)

Elysia supports <u>**Server Sent Events**</u> by providing a `sse` utility function.

```ts
import { Elysia, sse } from 'elysia'

new Elysia()
    .get('/sse', function* () {
        yield sse('hello world')
        yield sse({
            event: 'message',
            data: {
                message: 'This is a message',
                timestamp: new Date().toISOString()
            },
        })
    })
```

When a value is wrapped in `sse`, Elysia will automatically set the response headers to `text/event-stream` and format the data as an SSE event.

### Headers in Server-Sent Event

Headers can only be set before the first chunk is yielded.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* ({ set }) {
        // This will set headers
        set.headers['x-name'] = 'Elysia'
        yield 1
        yield 2

        // This will do nothing
        set.headers['x-id'] = '1'
        yield 3
    })
```

Once the first chunk is yielded, Elysia will send the headers to the client, therefore mutating headers after the first chunk is yielded will do nothing.

### Conditional Stream

If the response is returned without `yield`, Elysia will automatically convert stream to normal response instead.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* () {
        if (Math.random() > 0.5) return 'ok'

        yield 1
        yield 2
        yield 3
    })
```

This allows us to conditionally stream a response or return a normal response if necessary.

### Automatic cancellation

Before response streaming is completed, if the user cancels the request, Elysia will automatically stop the generator function.

### Eden

Eden will interpret a stream response as `AsyncGenerator` allowing us to use `for await` loop to consume the stream.

```ts
import { Elysia } from 'elysia'
import { treaty } from '@elysiajs/eden'

const app = new Elysia()
    .get('/ok', function* () {
        yield 1
        yield 2
        yield 3
    })

const { data, error } = await treaty(app).ok.get()
if (error) throw error

for await (const chunk of data)
    console.log(chunk)
```

## Request

Elysia is built on top of <u>**Web Standard Request**</u> which is shared between multiple runtime like Node, Bun, Deno, Cloudflare Worker, Vercel Edge Function, and more.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/user-agent', ({ request }) => {
        return request.headers.get('user-agent')
    })
    .listen(3000)
```

This allows access to low-level request information if necessary.

## Server

> **Bun only**

Server instance is a Bun server instance, allowing us to access server information like port number or request IP.

Server will only be available when HTTP server is running with `listen`.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/port', ({ server }) => {
        return server?.port
    })
    .listen(3000)
```

### Request IP

> **Bun only**

We can get request IP by using `server.requestIP` method

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/ip', ({ server, request }) => {
        return server?.requestIP(request)
    })
    .listen(3000)
```

## Extending context

> **Advanced concept**

Elysia provides a minimal Context by default, allowing you to extend the Context for your specific needs using `state`, `decorate`, `derive`, and `resolve`.