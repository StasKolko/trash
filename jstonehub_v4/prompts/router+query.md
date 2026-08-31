# Пример интеграции Tanstack Router + Tanstack Query с официальной документации

src/

main.tsx
```typescript
import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { routeTree } from './routeTree.gen'
import './styles.css'

export const queryClient = new QueryClient()

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  scrollRestoration: true,
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
})

// Register things for typesafety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  render(
    () => (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
    rootElement,
  )
}
```

postQueryOptions.tsx
```typescript
import { queryOptions } from '@tanstack/solid-query'
import { fetchPost } from './posts'

export const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', { postId }],
    queryFn: () => fetchPost(postId),
  })
```

posts.tsx
```typescript
import axios from 'redaxios'

export type PostType = {
  id: string
  title: string
  body: string
}

export class PostNotFoundError extends Error {}

export const fetchPost = async (postId: string) => {
  console.info(`Fetching post with id ${postId}...`)
  await new Promise((r) => setTimeout(r, 500))
  const post = await axios
    .get<PostType>(`https://jsonplaceholder.typicode.com/posts/${postId}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new PostNotFoundError(`Post with id "${postId}" not found!`)
      }
      throw err
    })

  return post
}

export const fetchPosts = async () => {
  console.info('Fetching posts...')
  await new Promise((r) => setTimeout(r, 500))
  return axios
    .get<Array<PostType>>('https://jsonplaceholder.typicode.com/posts')
    .then((r) => r.data.slice(0, 10))
}
```

postsQueryOptions.tsx
```typescript
import { queryOptions } from '@tanstack/solid-query'
import { fetchPosts } from './posts'

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetchPosts(),
})
```

src/routes/

__root.tsx
```typescript
import {
  HeadContent,
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import type { QueryClient } from '@tanstack/solid-query'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {
  return (
    <>
      <HeadContent />
      <div class="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            class: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{' '}
        <Link
          to="/posts"
          activeProps={{
            class: 'font-bold',
          }}
        >
          Posts
        </Link>{' '}
        <Link
          to="/route-a"
          activeProps={{
            class: 'font-bold',
          }}
        >
          Pathless Layout
        </Link>{' '}
        <Link
          // @ts-expect-error
          to="/this-route-does-not-exist"
          activeProps={{
            class: 'font-bold',
          }}
        >
          This Route Does Not Exist
        </Link>
      </div>
      <hr />
      <Outlet />
      <SolidQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
```

_pathlessLayout.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
import { Outlet } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pathlessLayout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div class="p-2">
      <div class="border-b">I'm a pathless layout</div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
```

index.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div class="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
```

posts.$postId.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
import { ErrorComponent, useRouter } from '@tanstack/solid-router'
import { useQuery } from '@tanstack/solid-query'
import { createEffect, createMemo } from 'solid-js'
import { PostNotFoundError } from '../posts'
import { postQueryOptions } from '../postQueryOptions'
import { queryClient } from '../main'
import type { ErrorComponentProps } from '@tanstack/solid-router'

export function PostErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  if (error instanceof PostNotFoundError) {
    return <div>{error.message}</div>
  }

  createEffect(() => {
    reset()
    queryClient.resetQueries()
  })

  return (
    <div>
      <button
        onClick={() => {
          router.invalidate()
        }}
      >
        retry
      </button>
      <ErrorComponent error={error} />
    </div>
  )
}

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context: { queryClient }, params: { postId } }) => {
    return queryClient.ensureQueryData(postQueryOptions(postId))
  },
  errorComponent: PostErrorComponent,
  component: PostComponent,
})

function PostComponent() {
  const params = Route.useParams()
  const post = createMemo(() =>
    useQuery(() => postQueryOptions(params().postId)),
  )

  return (
    <div class="space-y-2">
      <h4 class="text-xl font-bold underline">{post().data?.title}</h4>
      <div class="text-sm">{post().data?.body}</div>
    </div>
  )
}
```

posts.index.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
export const Route = createFileRoute('/posts/')({
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  return <div>Select a post.</div>
}
```

posts.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
import { Link, Outlet } from '@tanstack/solid-router'
import { useQuery } from '@tanstack/solid-query'
import { postsQueryOptions } from '../postsQueryOptions'
import { createMemo } from 'solid-js'

export const Route = createFileRoute('/posts')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions),
  component: PostsComponent,
})

function PostsComponent() {
  const postsQuery = useQuery(() => postsQueryOptions)
  const posts = createMemo(() => {
    if (postsQuery.data) {
      return postsQuery.data
    } else {
      return []
    }
  })

  return (
    <div class="p-2 flex gap-2">
      <ul class="list-disc pl-4">
        {[...posts(), { id: 'i-do-not-exist', title: 'Non-existent Post' }].map(
          (post) => {
            return (
              <li class="whitespace-nowrap">
                <Link
                  to="/posts/$postId"
                  params={{
                    postId: post.id,
                  }}
                  class="block py-1 text-blue-600 hover:opacity-75"
                  activeProps={{ class: 'font-bold underline' }}
                >
                  <div>{post.title.substring(0, 20)}</div>
                </Link>
              </li>
            )
          },
        )}
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}
```

src/routes/_pathlessLayout/

_nested-layout.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
import { Link, Outlet } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pathlessLayout/_nested-layout')({
  component: PathlessLayoutComponent,
})

function PathlessLayoutComponent() {
  return (
    <div>
      <div>I'm a nested pathless layout</div>
      <div class="flex gap-2 border-b">
        <Link
          to="/route-a"
          activeProps={{
            class: 'font-bold',
          }}
        >
          Go to route A
        </Link>
        <Link
          to="/route-b"
          activeProps={{
            class: 'font-bold',
          }}
        >
          Go to route B
        </Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
```

src/routes/_pathlessLayout/_nested-layout/

route-a.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
export const Route = createFileRoute('/_pathlessLayout/_nested-layout/route-a')(
  {
    component: LayoutAComponent,
  },
)

function LayoutAComponent() {
  return <div>I'm A!</div>
}
```

route-b.tsx
```typescript
import { createFileRoute } from '@tanstack/solid-router'
export const Route = createFileRoute('/_pathlessLayout/_nested-layout/route-b')(
  {
    component: LayoutBComponent,
  },
)

function LayoutBComponent() {
  return <div>I'm B!</div>
}
```