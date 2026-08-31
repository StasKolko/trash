import { createFileRoute, Link } from "@tanstack/solid-router";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";

import { client } from "#admin/shared/api/client";

const Route = createFileRoute("/_private/users/")({
  component: UserListPage,
});

const AVATAR_LIST_SIZE = 32;

type UserListItem = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isBanned: boolean;
  energyBalance: string;
  loginStreak: number;
  createdAt: Date | string;
};

type UserListResponse = {
  items: UserListItem[];
  nextCursor: string | null;
  prevCursor: string | null;
};

function UserListPage() {
  const [search, setSearch] = createSignal("");
  const [bannedFilter, setBannedFilter] = createSignal<string>("all");
  const [sort, setSort] = createSignal("createdAt");
  const [order, setOrder] = createSignal<"asc" | "desc">("desc");
  const [cursor, setCursor] = createSignal<string | undefined>(undefined);

  const fetchParams = createMemo(() => ({
    search: search(),
    banned: bannedFilter(),
    sort: sort(),
    order: order(),
    cursor: cursor(),
  }));

  const [data] = createResource(fetchParams, fetchUsers);

  function handleSort(field: string) {
    if (sort() === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setCursor(undefined);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setCursor(undefined);
  }

  function handleFilterChange(value: string) {
    setBannedFilter(value);
    setCursor(undefined);
  }

  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Users</h1>

      <UserListControls
        search={search()}
        bannedFilter={bannedFilter()}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      <UserTable
        data={data()}
        sort={sort()}
        order={order()}
        onSort={handleSort}
      />

      <UserListPagination
        data={data()}
        onNext={(next) => setCursor(next)}
        onFirst={() => setCursor(undefined)}
      />
    </div>
  );
}

function UserListControls(props: {
  search: string;
  bannedFilter: string;
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
}) {
  return (
    <div class="flex gap-4">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={props.search}
        onInput={(e) => props.onSearch(e.currentTarget.value)}
        class="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
      />

      <select
        value={props.bannedFilter}
        onChange={(e) => props.onFilterChange(e.currentTarget.value)}
        class="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
      >
        <option value="all">All users</option>
        <option value="false">Active</option>
        <option value="true">Banned</option>
      </select>
    </div>
  );
}

function UserTable(props: {
  data: UserListResponse | undefined;
  sort: string;
  order: string;
  onSort: (field: string) => void;
}) {
  return (
    <div class="overflow-hidden rounded-lg border border-gray-800">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-800 bg-gray-900">
          <tr>
            <SortHeader
              label="Name"
              field="name"
              currentSort={props.sort}
              currentOrder={props.order}
              onSort={props.onSort}
            />
            <SortHeader
              label="Email"
              field="email"
              currentSort={props.sort}
              currentOrder={props.order}
              onSort={props.onSort}
            />
            <th class="px-4 py-3 font-medium text-gray-400">Status</th>
            <SortHeader
              label="Energy"
              field="energyBalance"
              currentSort={props.sort}
              currentOrder={props.order}
              onSort={props.onSort}
            />
            <SortHeader
              label="Created"
              field="createdAt"
              currentSort={props.sort}
              currentOrder={props.order}
              onSort={props.onSort}
            />
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.data?.items}
            fallback={
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            }
          >
            {(items) => (
              <For
                each={items()}
                fallback={
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                }
              >
                {(user) => <UserRow user={user} />}
              </For>
            )}
          </Show>
        </tbody>
      </table>
    </div>
  );
}

function UserRow(props: { user: UserListItem }) {
  return (
    <tr class="border-b border-gray-800 transition hover:bg-gray-900/50">
      <td class="px-4 py-3">
        <Link
          to="/users/$userId"
          params={{ userId: props.user.id }}
          class="flex items-center gap-3 hover:underline"
        >
          <Show
            when={props.user.avatarUrl}
            fallback={
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-bold">
                {props.user.name.charAt(0)}
              </div>
            }
          >
            {(url) => (
              <img
                src={url()}
                alt=""
                width={AVATAR_LIST_SIZE}
                height={AVATAR_LIST_SIZE}
                class="h-8 w-8 rounded-full"
              />
            )}
          </Show>
          <span>{props.user.name}</span>
        </Link>
      </td>
      <td class="px-4 py-3 text-gray-400">{props.user.email}</td>
      <td class="px-4 py-3">
        {props.user.isBanned ? (
          <span class="rounded bg-red-900 px-2 py-0.5 text-xs text-red-300">
            Banned
          </span>
        ) : (
          <span class="rounded bg-green-900 px-2 py-0.5 text-xs text-green-300">
            Active
          </span>
        )}
      </td>
      <td class="px-4 py-3 text-gray-400">{props.user.energyBalance}</td>
      <td class="px-4 py-3 text-gray-400">
        {new Date(props.user.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

function UserListPagination(props: {
  data: UserListResponse | undefined;
  onNext: (cursor: string) => void;
  onFirst: () => void;
}) {
  return (
    <Show when={props.data}>
      {(response) => (
        <div class="flex justify-between">
          <Show when={response().prevCursor}>
            <button
              type="button"
              onClick={props.onFirst}
              class="rounded bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
            >
              ← First page
            </button>
          </Show>
          <div />
          <Show when={response().nextCursor}>
            {(next) => (
              <button
                type="button"
                onClick={() => props.onNext(next())}
                class="rounded bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
              >
                Next page →
              </button>
            )}
          </Show>
        </div>
      )}
    </Show>
  );
}

function SortHeader(props: {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: string;
  onSort: (field: string) => void;
}) {
  const isActive = () => props.currentSort === props.field;

  return (
    <th class="px-4 py-3">
      <button
        type="button"
        onClick={() => props.onSort(props.field)}
        class="flex items-center gap-1 font-medium text-gray-400 transition hover:text-white"
      >
        {props.label}
        <Show when={isActive()}>
          <span class="text-xs">
            {props.currentOrder === "asc" ? "↑" : "↓"}
          </span>
        </Show>
      </button>
    </th>
  );
}

async function fetchUsers(params: {
  search: string;
  banned: string;
  sort: string;
  order: string;
  cursor: string | undefined;
}): Promise<UserListResponse> {
  const query: Record<string, string> = {
    sort: params.sort,
    order: params.order,
  };

  if (params.search) {
    query.query = params.search;
  }

  if (params.banned !== "all") {
    query.isBanned = params.banned;
  }

  if (params.cursor) {
    query.cursor = params.cursor;
  }

  const { data } = await client.admin.users.get({ query });

  if (!data || "error" in data) {
    return { items: [], nextCursor: null, prevCursor: null };
  }

  return data as UserListResponse;
}

export { Route };
