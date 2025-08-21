import { type Knex } from "knex";
import { err, ok, type Result } from "neverthrow";

import { type Clause } from "./clause.js";
import { type Entity } from "./entity.js";
import { DbErrorMessage, DbErrorType, createDbError, type DbError } from "./errors.js";

export interface Repository<T extends Entity> {
  select(id: string): Promise<Result<T | undefined, DbError>>;
  selectAll(clause?: Clause<T>): Promise<Result<T[], DbError>>;
  insert(entity: T): Promise<Result<T, DbError>>;
  insertMany(entities: T[]): Promise<Result<T[], DbError>>;
  update(id: string, entity: Partial<T>): Promise<Result<T, DbError>>;
  delete(id: string): Promise<Result<void, DbError>>;
}

export const buildRepository = <T extends Entity>(db: Knex, tableName: string): Repository<T> => ({
  select: async id => {
    try {
      const result: T | undefined = await db(tableName).where("id", id).first();
      return ok(result);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.Select,
          message: DbErrorMessage.Select,
          error,
        }),
      );
    }
  },
  selectAll: async clause => {
    const { where, orderBys } = clause ?? {};
    try {
      const query = db(tableName)
        .select("*")
        .modify(query => where && query.where(where))
        .modify(
          query =>
            orderBys &&
            orderBys.forEach(({ column, direction, nulls }) =>
              query.orderBy(column, direction, nulls),
            ),
        );
      const result: T[] = await query;
      return ok(result);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.SelectAll,
          message: DbErrorMessage.SelectAll,
          error,
        }),
      );
    }
  },
  insert: async entity => {
    try {
      const result: T[] = await db(tableName).insert(entity).returning("*");
      return ok(result[0]);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.Insert,
          message: DbErrorMessage.Insert,
          error,
        }),
      );
    }
  },
  insertMany: async entities => {
    try {
      const result: T[] = await db(tableName).insert(entities).returning("*");
      return ok(result);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.InsertMany,
          message: DbErrorMessage.InsertMany,
          error,
        }),
      );
    }
  },
  update: async (id, entity) => {
    try {
      const result: T[] = await db(tableName).where({ id }).update(entity).returning("*");
      return ok(result[0]);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.Update,
          message: DbErrorMessage.Update,
          error,
        }),
      );
    }
  },
  delete: async id => {
    try {
      await db(tableName).where({ id }).delete();
      return ok(undefined);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.Delete,
          message: DbErrorMessage.Delete,
          error,
        }),
      );
    }
  },
});
