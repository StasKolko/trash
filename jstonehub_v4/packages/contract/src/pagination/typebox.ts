import { Type } from "typebox";

import {
  PAGINATION_CURSOR_LIMIT_DEFAULT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY,
} from "./constant";

type FilterConfig<Values extends readonly string[]> = {
  values: Values;
};

type QueryParamsConfigAll<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "all";
  sorts: Sorts;
  filters?: Filters;
};

type QueryParamsConfigCursor<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "cursor";
  sorts: Sorts;
  filters?: Filters;
  limitDefault?: number;
  limitMax?: number;
};

type QueryParamsConfig<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> =
  | QueryParamsConfigAll<Sorts, Filters>
  | QueryParamsConfigCursor<Sorts, Filters>;

function createQueryParamsSchema<
  const Sorts extends readonly string[],
  const Filters extends Record<string, FilterConfig<readonly string[]>>,
>(config: QueryParamsConfig<Sorts, Filters>) {
  const filterSchemas: Record<string, unknown> = {};

  if (config.filters) {
    for (const [key, filter] of Object.entries(config.filters)) {
      filterSchemas[key] = Type.Optional(
        Type.Union([
          Type.Literal(PAGINATION_FILTER_ALL),
          Type.Array(
            Type.Union(filter.values.map((val) => Type.Literal(val))),
            {
              minItems: 1,
            },
          ),
        ]),
      );
    }
  }

  const base = {
    query: Type.Optional(Type.String({ maxLength: PAGINATION_QUERY.max })),
    sort: Type.Optional(Type.Union(config.sorts.map((s) => Type.Literal(s)))),
    order: Type.Optional(
      Type.Union(PAGINATION_ORDERS.map((o) => Type.Literal(o))),
    ),
    ...filterSchemas,
  };

  if (config.mode === "all") {
    return Type.Object(base);
  }

  const limitDefault = config.limitDefault ?? PAGINATION_CURSOR_LIMIT_DEFAULT;
  const limitMax = config.limitMax ?? limitDefault;

  return Type.Object({
    ...base,
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: limitMax,
        default: limitDefault,
      }),
    ),
  });
}

export { createQueryParamsSchema };
