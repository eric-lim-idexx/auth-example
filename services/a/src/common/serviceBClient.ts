import axios, { type AxiosError } from "axios";
import { Result, err, ok } from "neverthrow";

import { config } from "./config.js";
import { logger } from "./logger.js";

const log = logger.child({
  module: "serviceBClient",
});

type ServiceBDataItem = {
  id: string;
  name: string;
  value: number;
  category: string;
  createdAt: string;
};

type ServiceBResponse = {
  service: string;
  data: ServiceBDataItem[];
  meta: {
    total: number;
    timestamp: string;
  };
};

export type ServiceBError = {
  type: "NetworkError" | "InvalidResponse" | "ServiceUnavailable";
  message: string;
};

const getData = async (
  baseUrl: string = config.serviceBUrl,
  jwtToken?: string,
): Promise<Result<ServiceBResponse, ServiceBError>> => {
  try {
    log.debug({ baseUrl }, "Calling Service B for data");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (jwtToken) {
      headers.Authorization = `Bearer ${jwtToken}`;
    }

    const response = await axios.get<ServiceBResponse>(`${baseUrl}/v1/data`, {
      headers,
      timeout: 5000,
    });

    const data = response.data;

    log.info({ dataCount: data.data?.length ?? 0 }, "Successfully retrieved data from Service B");

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const errorMsg = `Service B returned status ${statusCode}`;
        log.error({ statusCode }, errorMsg);
        return err({
          type: "ServiceUnavailable",
          message: errorMsg,
        });
      } else if (axiosError.request) {
        const errorMsg = "No response received from Service B";
        log.error({ error: axiosError.message }, errorMsg);
        return err({
          type: "NetworkError",
          message: errorMsg,
        });
      }
    }

    const errorMsg = `Failed to call Service B: ${error instanceof Error ? error.message : "Unknown error"}`;
    log.error({ error }, errorMsg);

    return err({
      type: "NetworkError",
      message: errorMsg,
    });
  }
};

export const getServiceBData = (jwtToken?: string) => getData(config.serviceBUrl, jwtToken);
