import { type Knex } from "knex";
import { err, ok, type Result } from "neverthrow";

import { buildRepository, type Repository } from "./baseRepository.js";
import { type EntityWithEmbedding } from "./entity.js";
import { DbErrorMessage, DbErrorType, createDbError, type DbError } from "./errors.js";
import { type SimilaritySearchOk, type SimilaritySearchOptions } from "./similarity.js";

export interface VectorRepository<T extends EntityWithEmbedding> extends Repository<T> {
  similaritySearch(
    embedding: number[],
    limit: number,
    options?: SimilaritySearchOptions,
  ): Promise<Result<SimilaritySearchOk<T>[], DbError>>;

  similaritySearchById(
    id: string,
    limit: number,
    options?: SimilaritySearchOptions,
  ): Promise<Result<SimilaritySearchOk<T>[], DbError>>;
}

export const buildVectorRepository = <T extends EntityWithEmbedding>(
  db: Knex,
  tableName: string,
): VectorRepository<T> => {
  const baseRepo = buildRepository<T>(db, tableName);

  const similaritySearch = async (
    embedding: number[],
    limit: number,
    options: SimilaritySearchOptions,
  ): Promise<Result<SimilaritySearchOk<T>[], DbError>> => {
    const { threshold = 0.0, includeScore = true, excludeIds = [] } = options;

    try {
      let embeddingVector: string;
      if (Array.isArray(embedding)) {
        embeddingVector = `[${embedding.join(",")}]`;
      } else {
        embeddingVector = embedding as string;
      }

      const selectCols = ["*"];
      if (includeScore) {
        const similarityCol = await db.raw<string>("1 - (embedding <=> ?::vector) as similarity", [
          embeddingVector,
        ]);
        selectCols.push(similarityCol);
      }

      let query = db(tableName).select(selectCols).whereNotNull("embedding");
      if (excludeIds.length > 0) {
        query = query.whereNotIn("id", excludeIds);
      }

      query = query.orderByRaw("embedding <=> ?::vector", [embeddingVector]).limit(limit);

      const results = await query;
      const filteredResults =
        threshold > 0 ? results.filter(result => (result.similarity || 1) >= threshold) : results;

      return ok(filteredResults);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.SimilaritySearch,
          message: DbErrorMessage.SimilaritySearch,
          error,
        }),
      );
    }
  };

  const similaritySearchById = async (
    id: string,
    limit: number,
    options: SimilaritySearchOptions,
  ): Promise<Result<SimilaritySearchOk<T>[], DbError>> => {
    try {
      // First get the target entity
      const targetResult = await baseRepo.select(id);
      if (targetResult.isErr()) {
        return err(targetResult.error);
      }

      const target = targetResult.value;
      if (!target || !target.embedding) {
        return ok([]); // Return empty array if no embedding
      }

      // Add the target ID to excludeIds
      const updatedOptions = {
        ...options,
        excludeIds: [...(options.excludeIds || []), id],
      };

      return await similaritySearch(target.embedding, limit, updatedOptions);
    } catch (error) {
      return err(
        createDbError({
          type: DbErrorType.SimilaritySearch,
          message: DbErrorMessage.SimilaritySearch,
          error,
        }),
      );
    }
  };

  return {
    ...baseRepo,
    similaritySearch,
    similaritySearchById,
  };
};
