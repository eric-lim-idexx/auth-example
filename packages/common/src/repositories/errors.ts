export enum DbErrorType {
  Select = "Select",
  SelectAll = "SelectAll",
  Insert = "Insert",
  InsertMany = "InsertMany",
  Update = "Update",
  Delete = "Delete",
  SimilaritySearch = "SimilaritySearch",
}

export enum DbErrorMessage {
  Select = "Failed to select entity from database",
  SelectAll = "Failed to select all entities from database",
  Insert = "Failed to insert entity into database",
  InsertMany = "Failed to insert multiple entities into database",
  Update = "Failed to update entity in database",
  Delete = "Failed to delete entity from database",
  SimilaritySearch = "Failed to perform similarity search",
}

export type DbError = Error & {
  type: DbErrorType;
  message: DbErrorMessage;
  details?: {
    cause: string;
  };
};

type CreateDbErrorOptions = Omit<DbError, "name" | "stack"> & { error?: unknown };
export const createDbError = ({
  type,
  message,
  details,
  error,
}: CreateDbErrorOptions): DbError => ({
  name: "DbError",
  type,
  message,
  details: {
    ...details,
    cause: details?.cause ?? (error instanceof Error ? error.message : "Unknown error"),
  },
});
