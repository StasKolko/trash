# Elysia with Bun Fullstack Dev Server

Bun 1.3 introduces a Fullstack Dev Server with HMR support.

This allows us to directly use React without any bundler like Vite or Webpack.

You can use [this example](https://github.com/example) to quickly try it out.

Otherwise, install it manually:

## Install Elysia Static Plugin

```ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

new Elysia()
    .use(await staticPlugin()) // [!code highlight]
    .listen(3000)
```

> **TIP**:
> Notice that we need to add `await` before `staticPlugin()` to enable Fullstack Dev Server.
> This is required to setup the necessary HMR hooks.

## Create public/index.html and index.tsx

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Elysia React App</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="./index.tsx"></script>
    </body>
</html>
```

```tsx
// public/index.tsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
    const [count, setCount] = useState(0)
    const increase = () => setCount((c) => c + 1)

    return (
        <main>
            <h2>{count}</h2>
            <button onClick={increase}>
                Increase
            </button>
        </main>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

## Enable JSX in tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

Navigate to `http://localhost:3000/public` and see the result.

This allows us to develop frontend and backend in a single project without any bundler.

We have verified that Fullstack Dev Server works with HMR, Tailwind, Tanstack Query, Eden Treaty, and path alias.

## Custom Prefix Path

We can change the default `/public` prefix by passing the `prefix` option to `staticPlugin`.

```ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

new Elysia()
    .use(
        await staticPlugin({
            prefix: '/'
        })
    )
    .listen(3000)
```

This would serve the static files at `/` instead of `/public`.

See **static plugin** for more configuration options.

## Tailwind CSS

We can also use Tailwind CSS with Bun Fullstack Dev Server.

### Install dependencies

```bash
bun add tailwindcss@4
bun add -d bun-plugin-tailwind
```

### Create bunfig.toml with the following content:

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

### Create a CSS file with Tailwind directives

```css
/* public/global.css */
@tailwind base;
```

### Add Tailwind to your HTML or alternatively JavaScript/TypeScript file

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Elysia React App</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="tailwindcss"> <!-- [!code ++] -->
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="./index.tsx"></script>
    </body>
</html>
```

```tsx
// public/index.tsx (alternative)
import '@public/global.css'
```

## Path Alias

We can also use path alias in Bun Fullstack Dev Server.

### Add paths in tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@public/*": ["public/*"]
    }
  }
}
```

### Use the alias in your code

```tsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import '@public/global.css'

function App() {
    const [count, setCount] = useState(0)
    const increase = () => setCount((c) => c + 1)

    return (
        <main>
            <h2>{count}</h2>
            <button onClick={increase}>
                Increase
            </button>
        </main>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

This will work out of the box without any additional configuration.

## Build for Production

You can build fullstack server as if it's a normal Elysia server.

```bash
bun build --compile --target bun --outfile server src/index.ts
```

This would create a single executable file `server`.

When running the server executable, make sure to include the `public` folder similar to the development environment.

See **Deploy to Production** for more information.