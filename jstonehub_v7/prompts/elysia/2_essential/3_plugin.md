# Plugin

A plugin is a part that is decoupled from the main instance.

Every Elysia instance can run independently or be used as part of another instance.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .decorate('plugin', 'hi')
    .get('/plugin', ({ plugin }) => plugin)

const app = new Elysia()
    .use(plugin)
    .get('/', ({ plugin }) => plugin)
    .listen(3000)
```

We can use the plugin by passing an instance to `Elysia.use`.

The plugin will inherit all properties of the plugin instance like `state`, `decorate` but **WILL NOT** inherit plugin lifecycle as it's isolated by default (mentioned in the next section ↓).

Elysia will also handle the type inference automatically as well.

> **TIP**:
> It's highly recommended that you have read **Key Concept: Dependency** before continuing.

## Dependency

> **MUST READ**

Elysia, by design, is composed of multiple mini Elysia apps which can run independently like microservices that communicate with each other.

Each Elysia instance is independent and can run as a standalone server.

When an instance needs to use another instance's service, you must explicitly declare the dependency.

```ts
import { Elysia } from 'elysia'

const auth = new Elysia()
    .decorate('Auth', Auth)
    .model(Auth.models)

const main = new Elysia()
    // ❌ 'auth' is missing
    .get('/', ({ Auth }) => Auth.getProfile())
    // auth is required to use Auth's service
    .use(auth)
    .get('/profile', ({ Auth }) => Auth.getProfile())
```

This is similar to Dependency Injection where each instance must declare its dependencies.

This approach force you to be explicit about dependencies allowing better tracking, modularity.

## Deduplication

> **Important**

By default, each plugin will be re-executed every time applying to another instance.

To prevent this, Elysia can deduplicate lifecycle with a unique identifier using `name` and optional `seed` property.

```ts
import { Elysia } from 'elysia'

// `name` is an unique identifier
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

Adding the `name` and optional `seed` to the instance will make it a unique identifier to prevent it from being called multiple times.

Learn more about this in **plugin deduplication**.

### Global vs Explicit Dependency

There are some cases where global dependency makes more sense than an explicit one.

**Global plugin example:**

- Plugin that doesn't add types - eg. cors, compress, helmet
- Plugin that add global lifecycle that no instance should have control over - eg. tracing, logging

**Example use cases:**

- OpenAPI/Open - Global document
- OpenTelemetry - Global tracer
- Logging - Global logger

In cases like this, it makes more sense to create it as a global dependency instead of applying it to every instance.

However, if your dependency doesn't fit into these categories, it's recommended to use explicit dependency instead.

**Explicit dependency example:**

- Plugin that add types - eg. macro, state, model
- Plugin that add business logic that instance can interact with - eg. Auth, Database

**Example use cases:**

- State management - eg. Store, Session
- Data modeling - eg. ORM, ODM
- Business logic - eg. Auth, Database
- Feature module - eg. Chat, Notification

## Scope

> **MUST READ**

Elysia lifecycle methods are encapsulated within their own instance.

This means if you create a new instance, it will not share the lifecycle methods with other instances.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
    .onBeforeHandle(({ cookie }) => {
        throwIfNotSignIn(cookie)
    })
    .get('/profile', () => 'Hi there!')

const app = new Elysia()
    .use(profile)
    // ⚠️ This will NOT have a sign-in check
    .patch('/rename', ({ body }) => updateProfile(body))
```

In this example, the `isSignIn` check will only apply to `profile` but not `app`.

Elysia isolate lifecycle by default unless explicitly stated. This is similar to `export` in JavaScript, where you need to export the function to make it available outside the module.

To "export" the lifecycle to other instances, you must specify the scope.

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

Casting lifecycle to `"global"` will export lifecycle to every instance.

### Scope level

Elysia has 3 levels of scope as the following:

- **local** (default) - applies to the current instance and its descendants only
- **scoped** - applies to the parent, current instance, and descendants
- **global** - applies to all instances that use the plugin (all parents, current, and descendants)

Let's review what each scope level does by using the following example:

```ts
import { Elysia } from 'elysia'

const child = new Elysia()
    .get('/child', 'hi')

const current = new Elysia()
    // ? Value based on the table provided below
    .onBeforeHandle({ as: 'local' }, () => {
        console.log('hi')
    })
    .use(child)
    .get('/current', 'hi')

const parent = new Elysia()
    .use(current)
    .get('/parent', 'hi')

const main = new Elysia()
    .use(parent)
    .get('/main', 'hi')
```

By changing the `type` value, the result should be as follows:

| type   | child | current | parent | main |
|--------|-------|---------|--------|------|
| local  | ✅    | ✅      | ❌     | ❌   |
| scoped | ✅    | ✅      | ✅     | ❌   |
| global | ✅    | ✅      | ✅     | ✅   |

### Descendant

By default, a plugin will apply a hook to itself and its descendants only.

If the hook is registered in a plugin, instances that use the plugin will **NOT** inherit hooks and schema.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .onBeforeHandle(() => {
        console.log('hi')
    })
    .get('/child', 'log hi')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'not log hi')
```

To apply a hook globally, we need to specify the hook as global.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .onBeforeHandle(() => {
        return 'hi'
    })
    .get('/child', 'child')
    .as('scoped')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'parent')
```

## Config

To make the plugin more useful, allowing customization via config is recommended.

You can create a function that accepts parameters that may change the behavior of the plugin to make it more reusable.

```ts
import { Elysia } from 'elysia'

const version = (version = 1) => new Elysia()
        .get('/version', version)

const app = new Elysia()
    .use(version(1))
    .listen(3000)
```

## Functional callback

It's recommended to define a new plugin instance instead of using a function callback.

Functional callbacks allow access to existing properties of the main instance. For example, checking if specific routes or stores exist, but they make encapsulation and scope harder to handle correctly.

To define a functional callback, create a function that accepts Elysia as a parameter.

```ts
import { Elysia } from 'elysia'

const plugin = (app: Elysia) => app
    .state('counter', 0)
    .get('/plugin', () => 'Hi')

const app = new Elysia()
    .use(plugin)
    .get('/counter', ({ store: { counter } }) => counter)
    .listen(3000)
```

Once passed to `Elysia.use`, functional callback behaves as a normal plugin except the property is assigned directly to the main instance.

> **TIP**:
> You should not worry about the performance difference between a functional callback and creating an instance.
> Elysia can create 10k instances in a matter of milliseconds, the `new Elysia` instance has even better type inference performance than the functional callback.

## Guard

Guard allows you to apply a hook and schema to multiple routes all at once.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard(
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        },
        (app) =>
            app
                .post('/sign-up', ({ body }) => signUp(body))
                .post('/sign-in', ({ body }) => signIn(body), {
                    beforeHandle: isUserExists
                })
    )
    .get('/', 'hi')
    .listen(3000)
```

This code applies validation for `body` to both `/sign-in` and `/sign-up` instead of inlining the schema one by one, but does not apply to `/`.

We can summarize the route validation as the following:

| Path     | Has validation |
|----------|----------------|
| /sign-up | ✅             |
| /sign-in | ✅             |
| /        | ❌             |

Guard accepts the same parameters as inline hooks; the only difference is that you can apply a hook to multiple routes in the scope.

This means that the code above is translated into:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/sign-up', ({ body }) => signUp(body), {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/sign-in', ({ body }) => body, {
        beforeHandle: isUserExists,
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .get('/', () => 'hi')
    .listen(3000)
```

### Grouped Guard

We can use a group with prefixes by providing 3 parameters to the group.

- **Prefix** - Route prefix
- **Guard** - Schema
- **Scope** - Elysia app callback

With the same API as guard apply to the 2nd parameter, instead of nesting group and guard together.

Consider the following example:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group('/v1', (app) =>
        app.guard(
            {
                body: t.Literal('Rikuhachima Aru')
            },
            (app) => app.post('/student', ({ body }) => body)
        )
    )
    .listen(3000)
```

From nested grouped guards, we can merge group and guard together by providing guard scope to the 2nd parameter of group:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group(
        '/v1',
        (app) => app.guard(
            {
                body: t.Literal('Rikuhachima Aru')
            },
            (app) => app.post('/student', ({ body }) => body)
        )
    )
    .listen(3000)
```

This results in the following syntax:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group(
        '/v1',
        {
            body: t.Literal('Rikuhachima Aru')
        },
        (app) => app.post('/student', ({ body }) => body)
    )
    .listen(3000)
```

## Scope cast

> **Advanced Concept**

To apply a hook to a parent, you may use one of the following:

- **inline `as`** applies to only a single hook
- **guard `as`** applies to all hooks in a guard
- **instance `as`** applies to all hooks in an instance

### Inline as

Every event listener will accept `as` parameter to specify the scope of the hook.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .derive({ as: 'scoped' }, () => {
        return { hi: 'ok' }
    })
    .get('/child', ({ hi }) => hi)

const main = new Elysia()
    .use(plugin)
    // ✅ Hi is now available
    .get('/parent', ({ hi }) => hi)
```

However, this method applies to only a single hook and may not be suitable for multiple hooks.

### Guard as

Every event listener will accept `as` parameter to specify the scope of the hook.

```ts
import { Elysia, t } from 'elysia'

const plugin = new Elysia()
    .guard({
        as: 'scoped',
        response: t.String(),
        beforeHandle() {
            console.log('ok')
        }
    })
    .get('/child', 'ok')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'hello')
```

Guard allows us to apply schema and hook to multiple routes all at once while specifying the scope.

However, it doesn't support `derive` and `resolve` method.

### Instance as

`as` reads all hooks and schema scopes of the current instance, modifying them.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .derive(() => {
        return { hi: 'ok' }
    })
    .get('/child', ({ hi }) => hi)
    .as('scoped')

const main = new Elysia()
    .use(plugin)
    // ✅ Hi is now available
    .get('/parent', ({ hi }) => hi)
```

Sometimes we want to reapply plugin to parent instance as well but as it's limited by scoped mechanism, it's limited to 1 parent only.

To apply to the parent instance, we need to lift the scope up to the parent instance, and `as` is the perfect method to do so.

Which means if you have local scope, and want to apply it to the parent instance, you can use `as('scoped')` to lift it up.

```ts
import { Elysia, t } from 'elysia'

const plugin = new Elysia()
    .guard({
        response: t.String()
    })
    .onBeforeHandle(() => { console.log('called') })
    .get('/ok', () => 'ok')
    .get('/not-ok', () => 1)
    .as('scoped')

const instance = new Elysia()
    .use(plugin)
    .get('/no-ok-parent', () => 2)
    .as('scoped')

const parent = new Elysia()
    .use(instance)
    // This now error because `scoped` is lifted up to parent
    .get('/ok', () => 3)
```

## Lazy Load

Modules are eagerly loaded by default.

Elysia will make sure that all modules are registered before the server starts.

However, some modules may be computationally heavy or blocking, making the server startup slow.

To solve this, Elysia allows you to provide an async plugin that will not block the server startup.

### Deferred Module

The deferred module is an async plugin that can be registered after the server is started.

```ts
// plugin.ts
import { Elysia, file } from 'elysia'
import { loadAllFiles } from './files'

export const loadStatic = async (app: Elysia) => {
    const files = await loadAllFiles()

    files.forEach((asset) => app
        .get(asset, file(file))
    )

    return app
}
```

And in the main file:

```ts
import { Elysia } from 'elysia'
import { loadStatic } from './plugin'

const app = new Elysia()
    .use(loadStatic)
```

### Lazy Load Module

Same as an async plugin, the lazy-load module will be registered after the server is started.

A lazy-load module can be either synchronous or asynchronous; as long as the module is used with `import`, the module will be lazy-loaded.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .use(import('./plugin'))
```

Using module lazy-loading is recommended when the module is computationally heavy and/or blocking.

To ensure module registration before the server starts, we can use `await` on the deferred module.

### Testing

In a test environment, we can use `await app.modules` to wait for deferred and lazy-loading modules.

```ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

describe('Modules', () => {
    it('inline async', async () => {
        const app = new Elysia()
              .use(async (app) =>
                  app.get('/async', () => 'async')
              )

        await app.modules

        const res = await app
            .handle(new Request('http://localhost/async'))
            .then((r) => r.text())

        expect(res).toBe('async')
    })
})
```