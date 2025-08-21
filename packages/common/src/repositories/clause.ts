import { type Entity } from "./entity.js";

export enum OrderByDirection {
  Asc = "asc",
  Desc = "desc",
}

export enum OrderByNulls {
  First = "first",
  Last = "last",
}

export type OrderBy<T extends Entity> = {
  column: Extract<keyof T, string>;
  direction: OrderByDirection;
  nulls: OrderByNulls;
};

export type Clause<T extends Entity> = {
  where?: Partial<T>;
  orderBys?: OrderBy<T>[];
};
