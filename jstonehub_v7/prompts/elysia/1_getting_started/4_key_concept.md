# Key Concept `MUST READ`

## Encapsulation `MUST READ`

Elysia lifecycle methods are **encapsulated** to its own instance only.

Which means if you create a new instance, it will not share the lifecycle methods with others.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
	.onBeforeHandle(({ cookie }) => {
		throwIfNotSignIn(cookie)
	})
	.get('/profile', () => 'Hi there!')

const app = new Elysia()
	.use(profile)
	// ⚠️ This will NOT have sign in check
	.patch('/rename', ({ body }) => updateProfile(body))
```

> In this example, the `isSignIn` check will only apply to `profile` but not `app`.


**Elysia isolates lifecycle by default** unless explicitly stated. This is similar to **export** in JavaScript, where you need to export the function to make it available outside the module.

To "**export**" the lifecycle to other instances, you must add specify the scope.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
	.onBeforeHandle(
		{ as: 'global' }, 
		({ cookie }) => {
			throwIfNotSignIn(cookie)
		}
	)
	.get('/profile', () => 'Hi there!')

const app = new Elysia()
	.use(profile)
	// This has sign in check
	.patch('/rename', ({ body }) => updateProfile(body))
```

Casting lifecycle to "**global**" will export lifecycle to **every instance**.

## Method Chaining `Important`

Elysia code should **ALWAYS** use method chaining.

This is **important to ensure type safety**.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .state('build', 1)
    // Store is strictly typed
    .get('/', ({ store: { build } }) => build)
    .listen(3000)
```

In the code above, **state** returns a new **ElysiaInstance** type, adding a typed `build` property.

### Without method chaining

As Elysia type system is complex, every method in Elysia returns a new type reference.

Without using method chaining, Elysia doesn't save these new types, leading to no type inference.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()

app.state('build', 1)

app.get('/', ({ store: { build } }) => build)
Property 'build' does not exist on type '{}'.

app.listen(3000)
```

We recommend to <u>**always use method chaining**</u> to provide an accurate type inference.

## Dependency `MUST READ`

Elysia, by design, is composed of multiple mini Elysia apps which can run **independently** like microservices that communicate with each other.

Each Elysia instance is independent and **can run as a standalone server**.

When an instance needs to use another instance's service, you **must explicitly declare the dependency**.

```ts
import { Elysia } from 'elysia'

const auth = new Elysia()
	.decorate('Auth', Auth)
	.model(Auth.models)

const main = new Elysia()
 	// ❌ 'auth' is missing
	.get('/', ({ Auth }) => Auth.getProfile())
Property 'Auth' does not exist on type '{ body: unknown; query: Record<string, string>; params: {}; headers: Record<string, string | undefined>; cookie: Record<string, Cookie<unknown>>; server: Server<unknown> | null; ... 6 more ...; status: <const Code extends number | keyof StatusMap, const T = Code extends 100 | ... 59 more ... | 511 ? { ...; }[Code] :...'.
	// auth is required to use Auth's service
	.use(auth) 
	.get('/profile', ({ Auth }) => Auth.getProfile())
```

This is similar to **Dependency Injection** where each instance must declare its dependencies.

This approach forces you to be explicit about dependencies, allowing better tracking and modularity.

### Deduplication `Important`

By default, each plugin will be re-executed **every time** applying to another instance.

To prevent this, Elysia can deduplicate lifecycle with **a unique identifier** using `name` and optional `seed` property.

```ts
import { Elysia } from 'elysia'

// `name` is a unique identifier
const ip = new Elysia({ name: 'ip' }) 
	.derive(
		{ as: 'global' },
		({ server, request }) => ({
			ip: server?.requestIP(request)
		})
	)
	.get('/ip', ({ ip }) => ip)

const router1 = new Elysia()
	.use(ip)
	.get('/ip-1', ({ ip }) => ip)

const router2 = new Elysia()
	.use(ip)
	.get('/ip-2', ({ ip }) => ip)

const server = new Elysia()
	.use(router1)
	.use(router2)
```

Adding the `name` and optional `seed` to the instance will make it a unique identifier, preventing it from being called multiple times.

### Global vs Explicit Dependency

There are some cases where global dependency makes more sense than an explicit one.

**Global** plugin example:

- **Plugins that don't add types** - eg. cors, compress, helmet
- Plugins that add global lifecycle that no instance should have control over - eg. tracing, logging

Example use cases:

- OpenAPI/Open - Global document
- OpenTelemetry - Global tracer
- Logging - Global logger

In cases like this, it makes more sense to create it as global dependency instead of applying it to every instance.

However, if your dependency doesn't fit into these categories, it's recommended to use **explicit dependency** instead.

**Explicit dependency** example:

- **Plugins that add types** - eg. macro, state, model
- Plugins that add business logic that an instance can interact with - eg. Auth, Database

Example use cases:

- State management - eg. Store, Session
- Data modeling - eg. ORM, ODM
- Feature module - eg. Chat, Notification
- Business logic - eg. Auth, Database

## Order of code `Important`

The order of Elysia's life-cycle code is very important.

Because events will only apply to routes **after** they are registered.

If you put the onError before plugin, plugin will not inherit the onError event.

```ts
import { Elysia } from 'elysia'

new Elysia()
 	.onBeforeHandle(() => {
        console.log('1')
    })
	.get('/', () => 'hi')
    .onBeforeHandle(() => {
        console.log('2')
    })
    .listen(3000)
```

Console should log the following:

`1`

Notice that it doesn't log **2**, because the event is registered after the route so it is not applied to the route.

## Type Inference

Elysia has a complex type system that allows you to infer types from the instance.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
	.post('/', ({ body }) => body, {




		body: t.Object({
			name: t.String()
		})
	})
```

You should **always use an inline function** to provide an accurate type inference.

If you need to apply a separate function, eg. MVC's controller pattern, it's recommended to destructure properties from inline function to prevent unnecessary type inference as follows:

```ts
import { Elysia, t } from 'elysia'

abstract class Controller {
	static greet({ name }: { name: string }) {
		return 'hello ' + name
	}
}

const app = new Elysia()
	.post('/', ({ body }) => Controller.greet(body), {
		body: t.Object({
			name: t.String()
		})
	})
```

### TypeScript

We can get type definitions for every Elysia/TypeBox type by accessing the `static` property as follows:

```ts
import { t } from 'elysia'

const MyType = t.Object({
	hello: t.Literal('Elysia')
})

type MyType = typeof MyType.static
```

This allows Elysia to infer and provide types automatically, reducing the need to declare duplicate schemas.

A single Elysia/TypeBox schema can be used for:

- Runtime validation
- Data coercion
- TypeScript type
- OpenAPI schema

This allows us to make a schema as a **single source of truth**.