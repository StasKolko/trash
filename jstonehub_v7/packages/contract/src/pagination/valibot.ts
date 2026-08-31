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
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";

type SearchConfig = SearchConfigAll | SearchConfigCursor;

type SearchConfigAll = SearchConfigBase & { mode: "all" };
type SearchConfigCursor = SearchConfigBase & {
  mode: "cursor";
  limitDefault?: number;
  limitMax?: number;
};

type SearchConfigBase = {
  sorts: readonly string[];
  sortDefault: string;
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Record<string, FilterConfig>;
};

type FilterConfig = {
  values: readonly string[];
  default?: typeof PAGINATION_FILTER_ALL | string[];
};

type BaseOutput = {
  query: string;
  sort: string;
  order: (typeof PAGINATION_ORDERS)[number];
  [key: string]: unknown;
};

type CursorOutput = BaseOutput & {
  cursor: string | undefined;
  limit: number;
};

function createValidateSearch(
  config: SearchConfigCursor,
): GenericSchema<unknown, CursorOutput>;

function createValidateSearch(
  config: SearchConfigAll,
): GenericSchema<unknown, BaseOutput>;

function createValidateSearch(
  config: SearchConfig,
): GenericSchema<unknown, BaseOutput | CursorOutput> {
  const base = buildBaseFields(config);
  const filterFields = buildFilterFields(config.filters);

  if (config.mode === "all") {
    return object({ ...base, ...filterFields }) as GenericSchema<
      unknown,
      BaseOutput
    >;
  }

  const cursorFields = buildCursorFields(config);

  return object({ ...base, ...filterFields, ...cursorFields }) as GenericSchema<
    unknown,
    CursorOutput
  >;
}

function buildBaseFields(config: SearchConfigBase) {
  return {
    query: fallback(
      pipe(string(), maxLength(PAGINATION_QUERY_MAX_LENGTH)),
      config.queryDefault ?? "",
    ),
    sort: fallback(
      picklist(config.sorts as unknown as readonly string[]),
      config.sortDefault,
    ),
    order: fallback(
      picklist(PAGINATION_ORDERS),
      config.orderDefault ?? DEFAULT_PAGINATION_ORDER,
    ),
  };
}

function buildFilterFields(filters: Record<string, FilterConfig> | undefined) {
  if (!filters) {
    return {};
  }

  const schemas: Record<string, ReturnType<typeof fallback>> = {};

  for (const [key, filter] of Object.entries(filters)) {
    const defaultValue = filter.default ?? PAGINATION_FILTER_ALL;
    schemas[key] = fallback(
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

  return schemas;
}

function buildCursorFields(config: SearchConfigCursor) {
  const limitDefault = config.limitDefault ?? DEFAULT_PAGINATION_CURSOR_LIMIT;
  const limitMax = config.limitMax ?? limitDefault;

  return {
    cursor: fallback(optional(string()), undefined),
    limit: fallback(
      pipe(number(), integer(), minValue(1), maxValue(limitMax)),
      limitDefault,
    ),
  };
}

export { createValidateSearch };
