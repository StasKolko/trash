import { Type } from "typebox";

import {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";

type SchemaConfig = SchemaConfigAll | SchemaConfigCursor;

type SchemaConfigAll = { mode: "all" };
type SchemaConfigCursor = {
  mode: "cursor";
  sorts: readonly string[];
  filters?: Record<string, FilterConfig>;
  limitDefault?: number;
  limitMax?: number;
};

type FilterConfig = { values: readonly string[] };

function createQueryParamsSchema(config: SchemaConfig) {
  if (config.mode === "all") {
    return Type.Object({});
  }

  const base = buildBaseFields(config.sorts);
  const filterFields = buildFilterFields(config.filters);
  const cursorFields = buildCursorFields(config);

  return Type.Object({ ...base, ...filterFields, ...cursorFields });
}

function buildBaseFields(sorts: readonly string[]) {
  return {
    query: Type.Optional(
      Type.String({ maxLength: PAGINATION_QUERY_MAX_LENGTH }),
    ),
    sort: Type.Optional(Type.Union(sorts.map((s) => Type.Literal(s)))),
    order: Type.Optional(
      Type.Union(PAGINATION_ORDERS.map((o) => Type.Literal(o))),
    ),
  };
}

function buildFilterFields(filters: Record<string, FilterConfig> | undefined) {
  if (!filters) {
    return {};
  }

  const schemas: Record<string, unknown> = {};

  for (const [key, filter] of Object.entries(filters)) {
    schemas[key] = Type.Optional(
      Type.Union([
        Type.Literal(PAGINATION_FILTER_ALL),
        Type.Array(Type.Union(filter.values.map((val) => Type.Literal(val))), {
          minItems: 1,
        }),
      ]),
    );
  }

  return schemas;
}

function buildCursorFields(config: SchemaConfigCursor) {
  const limitDefault = config.limitDefault ?? DEFAULT_PAGINATION_CURSOR_LIMIT;
  const limitMax = config.limitMax ?? limitDefault;

  return {
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: limitMax,
        default: limitDefault,
      }),
    ),
  };
}

export { createQueryParamsSchema };
