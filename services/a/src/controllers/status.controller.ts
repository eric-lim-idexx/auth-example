import { getServiceToken, sendErrorResponse, type Controller } from "@workspace/common";

import { StatusCodes } from "http-status-codes";

import { config } from "../common/config.js";
import { logger } from "../common/logger.js";
import { getServiceBData } from "../common/serviceBClient.js";

const log = logger.child({
  module: "status.controller",
});

export type GetAggregatedDataRequest = Record<string, never>;

type AggregatedDataResponse = {
  serviceA: {
    service: string;
    status: string;
    timestamp: string;
  };
  serviceBData: {
    service: string;
    data: Array<{
      id: string;
      name: string;
      value: number;
      category: string;
      createdAt: string;
    }>;
    meta: {
      total: number;
      timestamp: string;
    };
  } | null;
  aggregation: {
    totalDataPoints: number;
    averageValue: number;
    categories: string[];
  };
};

export const getAggregatedData: Controller<
  GetAggregatedDataRequest,
  AggregatedDataResponse
> = async (_request, reply) => {
  log.debug("Received request to get aggregated data from Service B");

  // Get a service token to call Service B
  const tokenResult = await getServiceToken({
    keycloakUrl: config.keycloakUrl,
    realm: config.keycloakRealm,
    clientId: "service-a",
    clientSecret: "9PJyfNUrzLEdF3iKHihyX3FeZPVvWC7n",
  });

  if (tokenResult.isErr()) {
    log.error({ error: tokenResult.error }, "Failed to get service token");
    return sendErrorResponse(
      reply,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to authenticate with Service B",
    );
  }

  // Get data from Service B using the service token
  const serviceBResult = await getServiceBData(tokenResult.value.access_token);

  if (serviceBResult.isErr()) {
    const { type, message } = serviceBResult.error;
    log.error({ message }, "Failed to retrieve data from Service B");

    switch (type) {
      case "NetworkError":
      case "ServiceUnavailable":
        return sendErrorResponse(
          reply,
          StatusCodes.SERVICE_UNAVAILABLE,
          "Service B is currently unavailable",
        );
      case "InvalidResponse":
        return sendErrorResponse(reply, StatusCodes.BAD_GATEWAY, "Invalid response from Service B");
    }
  }

  const serviceBData = serviceBResult.value;

  // Perform some aggregation on the data
  const dataPoints = serviceBData.data;
  const totalDataPoints = dataPoints.length;
  const averageValue =
    totalDataPoints > 0
      ? dataPoints.reduce((sum, item) => sum + item.value, 0) / totalDataPoints
      : 0;
  const categories = [...new Set(dataPoints.map(item => item.category))];

  const response: AggregatedDataResponse = {
    serviceA: {
      service: "service-a",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
    serviceBData,
    aggregation: {
      totalDataPoints,
      averageValue: Math.round(averageValue * 100) / 100, // Round to 2 decimal places
      categories,
    },
  };

  log.info(
    {
      totalDataPoints,
      averageValue,
      categoriesCount: categories.length,
    },
    "Aggregated data retrieved successfully",
  );

  return reply.status(StatusCodes.OK).send(response);
};
