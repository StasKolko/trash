# TypeBox (Elysia.t)

Here's common patterns for writing validation types using `Elysia.t`.

## Primitive Type

The TypeBox API is designed around and is similar to TypeScript types.

There are many familiar names and behaviors that intersect with TypeScript counterparts, such as `String`, `Number`, `Boolean`, and `Object`, as well as more advanced features like `Intersect`, `KeyOf`, and `Tuple` for versatility.

If you are familiar with TypeScript, creating a TypeBox schema behaves the same as writing a TypeScript type, except it provides actual type validation at runtime.

To create your first schema, import `Elysia.t` from Elysia and start with the most basic type:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/', ({ body }) => `Hello ${body}`, {
        body: t.String()
    })
    .listen(3000)
```

This code tells Elysia to validate an incoming HTTP body, ensuring that the body is a string. If it is a string, it will be allowed to flow through the request pipeline and handler.

If the shape doesn't match, it will throw an error into the **Error Life Cycle**.

## Basic Type

TypeBox provides basic primitive types with the same behavior as TypeScript types.

The following table lists the most common basic types:

| TypeBox | TypeScript |
|---------|------------|
| `t.String()` | `string` |
| `t.Number()` | `number` |
| `t.Boolean()` | `boolean` |
| `t.Array(t.Number())` | `number[]` |
| `t.Object({ x: t.Number() })` | `{ x: number }` |
| `t.Null()` | `null` |
| `t.Literal(42)` | `42` |

Elysia extends all types from TypeBox, allowing you to reference most of the API from TypeBox for use in Elysia.

See **TypeBox's Type** for additional types supported by TypeBox.

## Attribute

TypeBox can accept arguments for more comprehensive behavior based on the JSON Schema 7 specification.

| TypeBox | TypeScript |
|---------|------------|
| `t.String({ format: 'email' })` | `saltyaom@elysiajs.com` |
| `t.Number({ minimum: 10, maximum: 100 })` | `10` |
| `t.Array(t.Number(), { minItems: 1, maxItems: 5 })` | `[1, 2, 3, 4, 5]` |
| `t.Object({ x: t.Number() }, { additionalProperties: true })` | `x: 100, y: 200` |

See **JSON Schema 7 specification** for more explanation of each attribute.

## Honorable Mentions

The following are common patterns often found useful when creating a schema.

### Union

Allows a field in `t.Object` to have multiple types.

```ts
t.Union([
    t.String(),
    t.Number()
])
```

TypeScript equivalent: `string | number`

### Optional

Allows a field in `t.Object` to be undefined or optional.

```ts
t.Object({
    x: t.Number(),
    y: t.Optional(t.Number())
})
```

TypeScript equivalent: `{ x: number, y?: number }`

### Partial

Allows all fields in `t.Object` to be optional.

```ts
t.Partial(
    t.Object({
        x: t.Number(),
        y: t.Number()
    })
)
```

TypeScript equivalent: `{ x?: number, y?: number }`

---

## Elysia Type

`Elysia.t` is based on TypeBox with pre-configuration for server usage, providing additional types commonly found in server-side validation.

You can find all the source code for Elysia types in `elysia/type-system`.

The following are types provided by Elysia:

### UnionEnum

`UnionEnum` allows the value to be one of the specified values.

```ts
t.UnionEnum(['rapi', 'anis', 1, true, false])
```

### File

A singular file, often useful for file upload validation.

```ts
t.File()
```

File extends the attributes of the base schema, with additional properties as follows:

**type** — Specifies the format of the file, such as image, video, or audio. If an array is provided, it will attempt to validate if any of the formats are valid.

```ts
type?: MaybeArray<string>
```

**minSize** — Minimum size of the file. Accepts a number in bytes or a suffix of file units:

```ts
minSize?: number | `${number}${'k' | 'm'}`
```

**maxSize** — Maximum size of the file. Accepts a number in bytes or a suffix of file units:

```ts
maxSize?: number | `${number}${'k' | 'm'}`
```

> **File Unit Suffix:**
> - `m`: MegaByte (1048576 byte)
> - `k`: KiloByte (1024 byte)

### Files

Extends from `File`, but adds support for an array of files in a single field.

```ts
t.Files()
```

Files extends the attributes of the base schema, array, and File.

### Cookie

Object-like representation of a Cookie Jar extended from the Object type.

```ts
t.Cookie({
    name: t.String()
})
```

Cookie extends the attributes of Object and Cookie with additional properties as follows:

**secrets** — The secret key for signing cookies. Accepts a string or an array of strings.

```ts
secrets?: string | string[]
```

If an array is provided, **Key Rotation** will be used. The newly signed value will use the first secret as the key.

### Nullable

Allows the value to be null but not undefined.

```ts
t.Nullable(t.String())
```

### MaybeEmpty

Allows the value to be null and undefined.

```ts
t.MaybeEmpty(t.String())
```

For additional information, you can find the full source code of the type system in `elysia/type-system`.

### Form

A syntax sugar for `t.Object` with support for verifying return value of form (`FormData`).

```ts
t.Form({
    someValue: t.File()
})
```

### UInt8Array

Accepts a buffer that can be parsed into a `Uint8Array`.

```ts
t.UInt8Array()
```

This is useful when you want to accept a buffer that can be parsed into a `Uint8Array`, such as in a binary file upload. It's designed to use for the validation of body with `arrayBuffer` parser to enforce the body type.

### ArrayBuffer

Accepts a buffer that can be parsed into an `ArrayBuffer`.

```ts
t.ArrayBuffer()
```

This is useful when you want to accept a buffer that can be parsed into an `ArrayBuffer`, such as in a binary file upload. It's designed to use for the validation of body with `arrayBuffer` parser to enforce the body type.

### ObjectString

Accepts a string that can be parsed into an object.

```ts
t.ObjectString()
```

This is useful when you want to accept a string that can be parsed into an object but the environment does not allow it explicitly, such as in a query string, header, or FormData body.

### BooleanString

Accepts a string that can be parsed into a boolean.

```ts
t.BooleanString()
```

Similar to `ObjectString`, this is useful when you want to accept a string that can be parsed into a boolean but the environment does not allow it explicitly.

### Numeric

Numeric accepts a numeric string or number and then transforms the value into a number.

```ts
t.Numeric()
```

This is useful when an incoming value is a numeric string, for example, a path parameter or query string.

Numeric accepts the same attributes as Numeric Instance.

---

## Elysia Behavior

Elysia uses TypeBox by default.

However, to help make handling HTTP easier, Elysia has some dedicated types and has some behavioral differences from TypeBox.

### Optional

To make a field optional, use `t.Optional`.

This will allow clients to optionally provide a query parameter. This behavior also applies to `body`, `headers`.

This is different from TypeBox where optional is to mark a field of an object as optional.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/optional', ({ query }) => query, {
        query: t.Optional(
            t.Object({
                name: t.String()
            })
        )
    })
```

### Number to Numeric

By default, Elysia will convert a `t.Number` to `t.Numeric` when provided as route schema.

Because parsed HTTP headers, query, and URL parameters are always strings. This means that even if a value is a number, it will be treated as a string.

Elysia overrides this behavior by checking if a string value looks like a number then converting it appropriately.

This is only applied when it is used as a route schema and not in a nested `t.Object`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/:id', ({ id }) => id, {
        params: t.Object({
            // Converted to t.Numeric()
            id: t.Number()
        }),
        body: t.Object({
            // NOT converted to t.Numeric()
            id: t.Number()
        })
    })

// NOT converted to t.Numeric()
t.Number()
```

### Boolean to BooleanString

Similar to Number to Numeric.

Any `t.Boolean` will be converted to `t.BooleanString`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/:id', ({ id }) => id, {
        params: t.Object({
            // Converted to t.BooleanString()
            id: t.Boolean()
        }),
        body: t.Object({
            // NOT converted to t.BooleanString()
            id: t.Boolean()
        })
    })

// NOT converted to t.BooleanString()
t.Boolean()
```