export type GenericError<TErrorType extends string, TErrorMessage extends string> = Error & {
  type: TErrorType;
  message: TErrorMessage;
  details?: {
    cause: string;
  };
};

type CreateGenericErrorOptions<TErrorType extends string, TErrorMessage extends string> = Omit<
  GenericError<TErrorType, TErrorMessage>,
  "name" | "stack"
> & {
  error?: unknown;
};

export const createGenericError = <TErrorType extends string, TErrorMessage extends string>({
  type,
  message,
  details,
  error,
}: CreateGenericErrorOptions<TErrorType, TErrorMessage>): GenericError<
  TErrorType,
  TErrorMessage
> => ({
  name: "GenericError",
  type,
  message,
  details: {
    ...details,
    cause: details?.cause ?? (error instanceof Error ? error.message : "Unknown error"),
  },
});
