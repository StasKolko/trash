import type { GenericSchema } from "valibot";

import {
  array,
  fallback,
  integer,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  union,
} from "valibot";

import {
  PAGINATION_CURSOR_LIMIT_DEFAULT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDER_DEFAULT,
  PAGINATION_ORDERS,
  PAGINATION_QUERY,
} from "./constant";

type FilterConfig<Values extends readonly string[]> = {
  values: Values;
  default?: typeof PAGINATION_FILTER_ALL | Values[number][];
};

type ValidateSearchConfigAll<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "all";
  sorts: Sorts;
  sortDefault: Sorts[number];
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Filters;
};

type ValidateSearchConfigCursor<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "cursor";
  sorts: Sorts;
  sortDefault: Sorts[number];
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Filters;
  limitDefault?: number;
  limitMax?: number;
};

type ValidateSearchConfig<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> =
  | ValidateSearchConfigAll<Sorts, Filters>
  | ValidateSearchConfigCursor<Sorts, Filters>;

type FilterOutput<F extends FilterConfig<readonly string[]>> =
  | typeof PAGINATION_FILTER_ALL
  | F["values"][number][];

type BaseOutput<Sorts extends readonly string[]> = {
  query: string;
  sort: Sorts[number];
  order: (typeof PAGINATION_ORDERS)[number];
};

type CursorOutput<Sorts extends readonly string[]> = BaseOutput<Sorts> & {
  cursor: string | undefined;
  limit: number;
};

type FiltersOutput<
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  [K in keyof Filters]: FilterOutput<Filters[K]>;
};

type ValidateSearchOutput<
  Config extends ValidateSearchConfig<
    readonly string[],
    Record<string, FilterConfig<readonly string[]>>
  >,
> =
  Config extends ValidateSearchConfigCursor<infer S, infer F>
    ? CursorOutput<S> & FiltersOutput<F>
    : Config extends ValidateSearchConfigAll<infer S, infer F>
      ? BaseOutput<S> & FiltersOutput<F>
      : never;

function createValidateSearch<
  const Sorts extends readonly string[],
  const Filters extends Record<string, FilterConfig<readonly string[]>>,
  const Config extends ValidateSearchConfig<Sorts, Filters>,
>(config: Config): GenericSchema<unknown, ValidateSearchOutput<Config>> {
  const filterSchemas: Record<string, ReturnType<typeof fallback>> = {};

  if (config.filters) {
    for (const [key, filter] of Object.entries(config.filters)) {
      const defaultValue = filter.default ?? PAGINATION_FILTER_ALL;
      filterSchemas[key] = fallback(
        union([
          literal(PAGINATION_FILTER_ALL),
          pipe(
            array(picklist(filter.values as unknown as readonly string[])),
            minLength(1),
          ),
        ]),
        defaultValue,
      );
    }
  }

  const base = {
    query: fallback(
      pipe(string(), maxLength(PAGINATION_QUERY.max)),
      config.queryDefault ?? "",
    ),
    sort: fallback(
      picklist(config.sorts as unknown as readonly string[]),
      config.sortDefault,
    ),
    order: fallback(
      picklist(PAGINATION_ORDERS),
      config.orderDefault ?? PAGINATION_ORDER_DEFAULT,
    ),
    ...filterSchemas,
  };

  if (config.mode === "all") {
    return object(base) as unknown as GenericSchema<
      unknown,
      ValidateSearchOutput<Config>
    >;
  }

  const limitDefault =
    (config as ValidateSearchConfigCursor<Sorts, Filters>).limitDefault
    ?? PAGINATION_CURSOR_LIMIT_DEFAULT;
  const limitMax =
    (config as ValidateSearchConfigCursor<Sorts, Filters>).limitMax
    ?? limitDefault;

  return object({
    ...base,
    cursor: fallback(optional(string()), undefined),
    limit: fallback(
      pipe(number(), integer(), minValue(1), maxValue(limitMax)),
      limitDefault,
    ),
  }) as unknown as GenericSchema<unknown, ValidateSearchOutput<Config>>;
}

export { createValidateSearch };
