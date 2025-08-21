export type ServiceError<TErrorType extends string, TErrorMessage extends string> = Error & {
  type: TErrorType;
  message: TErrorMessage;
  details?: {
    cause: string;
  };
};

type CreateServiceErrorOptions<TErrorType extends string, TErrorMessage extends string> = Omit<
  ServiceError<TErrorType, TErrorMessage>,
  "name" | "stack"
> & {
  error?: unknown;
};

export const createServiceError = <TErrorType extends string, TErrorMessage extends string>({
  type,
  message,
  details,
  error,
}: CreateServiceErrorOptions<TErrorType, TErrorMessage>): ServiceError<
  TErrorType,
  TErrorMessage
> => ({
  name: "ServiceError",
  type,
  message,
  details: {
    ...details,
    cause: details?.cause ?? (error instanceof Error ? error.message : "Unknown error"),
  },
});
