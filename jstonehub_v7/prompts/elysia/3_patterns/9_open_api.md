# OpenAPI

Elysia has first-class support and follows OpenAPI schema by default.

Elysia can automatically generate an API documentation page by using an OpenAPI plugin.

To generate the Swagger page, install the plugin:

```bash
bun add @elysiajs/openapi
```

And register the plugin to the server:

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
```

Accessing `/openapi` would show you a Scalar UI with the generated endpoint documentation from the Elysia server.

For OpenAPI plugin configuration, see the **OpenAPI plugin** page.

## OpenAPI from Types

> This is optional, but we highly recommend it for much better documentation experience.

By default, Elysia relies on runtime schema to generate OpenAPI documentation.

However, you can also generate OpenAPI documentation from types by using a generator from OpenAPI plugin as follows:

1. Specify your Elysia root file (if not specified, Elysia will use `src/index.ts`), and export an instance
2. Import a generator and provide a file path from project root to type generator

```ts
import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'

export const app = new Elysia() // [!code highlight]
    .use(
        openapi({
            references: fromTypes() // [!code highlight]
        })
    )
    .get('/', { test: 'hello' as const })
    .post('/json', ({ body, status }) => body, {
        body: t.Object({
            hello: t.String()
        })
    })
    .listen(3000)
```

Elysia will attempt to generate OpenAPI documentation by reading the type of an exported instance to generate OpenAPI documentation.

This will co-exist with the runtime schema, and the runtime schema will take precedence over the type definition.

### Production

In production environment, it's likely that you might compile Elysia to a single executable with Bun or bundle into a single JavaScript file.

It's recommended that you should pre-generate the declaration file (`.d.ts`) to provide type declaration to the generator.

```ts
import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'

const app = new Elysia()
    .use(
        openapi({
            references: fromTypes(
                process.env.NODE_ENV === 'production'
                    ? 'dist/index.d.ts'
                    : 'src/index.ts'
            )
        })
    )
```

## Standard Schema with OpenAPI

Elysia will try to use a native method from each schema to convert to OpenAPI schema.

However, if the schema doesn't provide a native method, you can provide a custom schema to OpenAPI by providing a `mapJsonSchema` as follows:

### Zod OpenAPI

As Zod doesn't have a `toJSONSchema` method on the schema, we need to provide a custom mapper to convert Zod schema to OpenAPI schema.

**Zod 4:**

```ts
import openapi from '@elysiajs/openapi'
import * as z from 'zod'

openapi({
    mapJsonSchema: {
        zod: z.toJSONSchema
    }
})
```

## Describing Routes

We can add route information by providing a schema type.

However, sometimes defining only a type does not make it clear what the route might do. You can use `detail` fields to explicitly describe the route.

```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .post(
        '/sign-in',
        ({ body }) => body,
        {
            body: t.Object(
                {
                    username: t.String(),
                    password: t.String({
                        minLength: 8,
                        description: 'User password (at least 8 characters)'
                    })
                },
                {
                    description: 'Expected a username and password' // [!code highlight]
                }
            ),
            detail: { // [!code highlight]
                summary: 'Sign in the user', // [!code highlight]
                tags: ['authentication'] // [!code highlight]
            } // [!code highlight]
        }
    )
```

The `detail` fields follows an OpenAPI V3 definition with auto-completion and type-safety by default.

Detail is then passed to OpenAPI to put the description to OpenAPI route.

## Response Headers

We can add response headers by wrapping a schema with `withHeader`:

```ts
import { Elysia, t } from 'elysia'
import { openapi, withHeader } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .get(
        '/thing',
        ({ body, set }) => {
            set.headers['x-powered-by'] = 'Elysia'

            return body
        },
        {
            response: withHeader( // [!code highlight]
                t.Literal('Hi'), // [!code highlight]
                { // [!code highlight]
                    'x-powered-by': t.Literal('Elysia') // [!code highlight]
                } // [!code highlight]
            ) // [!code highlight]
        }
    )
```

> Note that `withHeader` is an annotation only, and does not enforce or validate the actual response headers. You need to set the headers manually.

## Hide Route

You can hide the route from the Swagger page by setting `detail.hide` to `true`:

```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .post(
        '/sign-in',
        ({ body }) => body,
        {
            body: t.Object(
                {
                    username: t.String(),
                    password: t.String()
                },
                {
                    description: 'Expected a username and password'
                }
            ),
            detail: { // [!code highlight]
                hide: true // [!code highlight]
            } // [!code highlight]
        }
    )
```

## Tags

Elysia can separate the endpoints into groups by using the Swagger tag system.

Firstly define the available tags in the Swagger config object:

```ts
new Elysia().use(
    openapi({
        documentation: {
            tags: [
                { name: 'App', description: 'General endpoints' },
                { name: 'Auth', description: 'Authentication endpoints' }
            ]
        }
    })
)
```

Then use the `detail` property of the endpoint configuration section to assign that endpoint to the group:

```ts
new Elysia()
    .get('/', () => 'Hello Elysia', {
        detail: {
            tags: ['App']
        }
    })
    .group('/auth', (app) =>
        app.post(
            '/sign-up',
            ({ body }) =>
                db.user.create({
                    data: body,
                    select: {
                        id: true,
                        username: true
                    }
                }),
            {
                detail: {
                    tags: ['Auth']
                }
            }
        )
    )
```

### Tags Group

Elysia may accept `tags` to add an entire instance or group of routes to a specific tag.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    tags: ['user']
})
    .get('/user', 'user')
    .get('/admin', 'admin')
```

## Models

By using reference model, Elysia will handle the schema generation automatically.

By separating models into a dedicated section and linked by reference.

```ts
new Elysia()
    .model({
        User: t.Object({
            id: t.Number(),
            username: t.String()
        })
    })
    .get('/user', () => ({ id: 1, username: 'saltyaom' }), {
        response: {
            200: 'User'
        },
        detail: {
            tags: ['User']
        }
    })
```

## Guard

Alternatively, Elysia may accept guards to add an entire instance or group of routes to a specific guard.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard({
        detail: {
            description: 'Require user to be logged in'
        }
    })
    .get('/user', 'user')
    .get('/admin', 'admin')
```

## Change OpenAPI Endpoint

You can change the OpenAPI endpoint by setting `path` in the plugin config.

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(
        openapi({
            path: '/v2/openapi'
        })
    )
    .listen(3000)
```

## Customize OpenAPI Info

We can customize the OpenAPI information by setting `documentation.info` in the plugin config.

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(
        openapi({
            documentation: {
                info: {
                    title: 'Elysia Documentation',
                    version: '1.0.0'
                }
            }
        })
    )
    .listen(3000)
```

This can be useful for:

- Adding a title
- Setting an API version
- Adding a description explaining what our API is about
- Explaining what tags are available, what each tag means

## Security Configuration

To secure your API endpoints, you can define security schemes in the Swagger configuration. The example below demonstrates how to use Bearer Authentication (JWT) to protect your endpoints:

```ts
new Elysia().use(
    openapi({
        documentation: {
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    })
)

export const addressController = new Elysia({
    prefix: '/address',
    detail: {
        tags: ['Address'],
        security: [
            {
                bearerAuth: []
            }
        ]
    }
})
```

This will ensure that all endpoints under the `/address` prefix require a valid JWT token for access.