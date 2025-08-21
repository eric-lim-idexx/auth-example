import { type Entity } from "./entity.js";

export type SimilaritySearchOptions = {
  threshold?: number; // Minimum similarity score (0-1)
  includeScore?: boolean; // Whether to include similarity score in results
  excludeIds?: string[]; // IDs to exclude from results
};

export type SimilaritySearchOk<T extends Entity> = T & {
  similarity?: number; // Only included if includeScore is true
};
