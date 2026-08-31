# Пример интеграции Tanstack Router + Auth с официальной документации

src/

auth.tsx
```typescript
import * as Solid from 'solid-js'

import { sleep } from './utils'

export interface AuthContext {
  isAuthenticated: () => boolean
  login: (username: string) => Promise<void>
  logout: () => Promise<void>
  user: () => string | null
}

const AuthContext = Solid.createContext<AuthContext | null>(null)

const key = 'tanstack.auth.user'

function getStoredUser() {
  return localStorage.getItem(key)
}

function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(key, user)
  } else {
    localStorage.removeItem(key)
  }
}

export function AuthProvider(props: { children: Solid.JSX.Element }) {
  const [user, setUser] = Solid.createSignal<string | null>(getStoredUser())
  const isAuthenticated = () => !!user()

  const logout = async () => {
    await sleep(250)

    setStoredUser(null)
    setUser(null)
  }

  const login = async (username: string) => {
    await sleep(500)

    setStoredUser(username)
    setUser(username)
  }

  Solid.createEffect(() => {
    setUser(getStoredUser())
  })

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = Solid.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```


main.tsx
```typescript
import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'

import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './auth'
import './styles.css'

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
})

// Register things for typesafety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}

const rootElement = document.getElementById('app')!

render(() => <App />, rootElement)
```

posts.tsx
```typescript
import axios from 'redaxios'

async function loaderDelayFn<T>(fn: (...args: Array<any>) => Promise<T> | T) {
  const delay = Number(sessionStorage.getItem('loaderDelay') ?? 0)
  const delayPromise = new Promise((r) => setTimeout(r, delay))

  await delayPromise
  const res = await fn()

  return res
}

type Invoice = {
  id: number
  title: string
  body: string
}

let invoices: Array<Invoice> = null!

let invoicesPromise: Promise<void> | undefined = undefined

const ensureInvoices = async () => {
  if (!invoicesPromise) {
    invoicesPromise = Promise.resolve().then(async () => {
      const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/posts',
      )
      invoices = data.slice(0, 10)
    })
  }

  await invoicesPromise
}

export async function fetchInvoices() {
  return loaderDelayFn(() => ensureInvoices().then(() => invoices))
}

export async function fetchInvoiceById(id: number) {
  return loaderDelayFn(() =>
    ensureInvoices().then(() => {
      const invoice = invoices.find((d) => d.id === id)
      if (!invoice) {
        throw new Error('Invoice not found')
      }
      return invoice
    }),
  )
}
```

utils.tsx
```typescript
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

src/routes/

__root.tsx
```typescript
import { Outlet, createRootRouteWithContext } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import type { AuthContext } from '../auth'

interface MyRouterContext {
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
})
```

_auth.dashboard.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'

import { useAuth } from '../auth'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useAuth()

  return (
    <section class="grid gap-2 p-2">
      <p>Hi {auth.user()}!</p>
      <p>You are currently on the dashboard route.</p>
    </section>
  )
}
```

_auth.invoices.$invoiceId.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'

import { fetchInvoiceById } from '../posts'

export const Route = createFileRoute('/_auth/invoices/$invoiceId')({
  loader: async ({ params: { invoiceId } }) => {
    return {
      invoice: await fetchInvoiceById(parseInt(invoiceId)),
    }
  },
  component: InvoicePage,
})

function InvoicePage() {
  const loaderData = Route.useLoaderData()

  return (
    <section class="grid gap-2">
      <h2 class="text-lg">
        <strong>Invoice No.</strong> #
        {loaderData().invoice.id.toString().padStart(2, '0')}
      </h2>
      <p>
        <strong>Invoice title:</strong> {loaderData().invoice.title}
      </p>
      <p>
        <strong>Invoice body:</strong> {loaderData().invoice.body}
      </p>
    </section>
  )
}
```

_auth.invoices.index.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_auth/invoices/')({
  component: () => <div>Select an invoice to view it!</div>,
})
```

_auth.invoices.tsx
```typescript
import { Link, Outlet, createFileRoute } from '@tanstack/solid-router'

import { fetchInvoices } from '../posts'

export const Route = createFileRoute('/_auth/invoices')({
  loader: async () => ({
    invoices: await fetchInvoices(),
  }),
  component: InvoicesRoute,
})

function InvoicesRoute() {
  const loaderData = Route.useLoaderData()

  return (
    <div class="grid grid-cols-3 md:grid-cols-5 min-h-[500px]">
      <div class="col-span-1 py-2 pl-2 pr-4 md:border-r">
        <p class="mb-2">Choose an invoice from the list below.</p>
        <ol class="grid gap-2">
          {loaderData().invoices.map((invoice) => (
            <li>
              <Link
                to="/invoices/$invoiceId"
                params={{ invoiceId: invoice.id.toString() }}
                class="text-blue-600 hover:opacity-75"
                activeProps={{ class: 'font-bold underline' }}
              >
                <span class="tabular-nums">
                  #{invoice.id.toString().padStart(2, '0')}
                </span>{' '}
                - {invoice.title.slice(0, 16)}...
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div class="col-span-2 md:col-span-4 py-2 px-4">
        <Outlet />
      </div>
    </div>
  )
}
```

_auth.tsx
```typescript
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/solid-router'

import { useAuth } from '../auth'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const auth = useAuth()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: '/' })
        })
      })
    }
  }

  return (
    <div class="p-2 h-full">
      <h1>Authenticated Route</h1>
      <p>This route's content is only visible to authenticated users.</p>
      <ul class="py-2 flex gap-2">
        <li>
          <Link
            to="/dashboard"
            class="hover:underline data-[status='active']:font-semibold"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/invoices"
            class="hover:underline data-[status='active']:font-semibold"
          >
            Invoices
          </Link>
        </li>
        <li>
          <button type="button" class="hover:underline" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}
```

index.tsx
```typescript
import { Link, createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div class="p-2 grid gap-2">
      <h1 class="text-xl">Welcome!</h1>
      <p class="py-4 px-2 italic bg-slate-100 dark:bg-slate-800">
        <strong class="text-red-500">IMPORTANT!!!</strong> This is just an
        example of how to use authenticated routes with TanStack Router.
        <br />
        This is NOT an example how you'd write a production-level authentication
        system.
        <br />
        You'll need to take the concepts and patterns used in this example and
        adapt then to work with your authentication flow/system for your app.
      </p>
      <p>
        You are currently on the index route of the{' '}
        <strong>authenticated-routes</strong> example.
      </p>
      <p>You can try going through these options.</p>
      <ol class="list-disc list-inside px-2">
        <li>
          <Link to="/login" class="text-blue-500 hover:opacity-75">
            Go to the public login page.
          </Link>
        </li>
        <li>
          <Link to="/dashboard" class="text-blue-500 hover:opacity-75">
            Go to the auth-only dashboard page.
          </Link>
        </li>
        <li>
          <Link to="/invoices" class="text-blue-500 hover:opacity-75">
            Go to the auth-only invoices page.
          </Link>
        </li>
      </ol>
    </div>
  )
}
```

login.tsx
```typescript
import * as Solid from 'solid-js'
import {
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/solid-router'
import { z } from 'zod'

import { useAuth } from '../auth'
import { sleep } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const fallback = '/dashboard' as const

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const auth = useAuth()
  const router = useRouter()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = Solid.createSignal(false)

  const search = Route.useSearch()

  const onFormSubmit = async (evt: any) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const fieldValue = data.get('username')

      if (!fieldValue) return
      const username = fieldValue.toString()
      await auth.login(username)

      await router.invalidate()

      // This is just a hack being used to wait for the auth state to update
      // in a real app, you'd want to use a more robust solution
      await sleep(1)

      await navigate({ to: search().redirect || fallback })
    } catch (error) {
      console.error('Error logging in: ', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoggingIn = isLoading() || isSubmitting()

  return (
    <div class="p-2 grid gap-2 place-items-center">
      <h3 class="text-xl">Login page</h3>
      {search().redirect ? (
        <p class="text-red-500">You need to login to access this page.</p>
      ) : (
        <p>Login to see all the cool content in here.</p>
      )}
      <form class="mt-4 max-w-lg" onSubmit={onFormSubmit}>
        <fieldset disabled={isLoggingIn} class="w-full grid gap-2">
          <div class="grid gap-2 items-center min-w-[300px]">
            <label for="username-input" class="text-sm font-medium">
              Username
            </label>
            <input
              id="username-input"
              name="username"
              placeholder="Enter your name"
              type="text"
              class="border rounded-md p-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            class="bg-blue-500 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isLoggingIn ? 'Loading...' : 'Login'}
          </button>
        </fieldset>
      </form>
    </div>
  )
}
```