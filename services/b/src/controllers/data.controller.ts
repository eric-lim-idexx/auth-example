import { type Controller } from "@workspace/common";

import { StatusCodes } from "http-status-codes";

import { logger } from "../common/logger.js";

const log = logger.child({
  module: "data.controller",
});

export type GetDataRequest = Record<string, never>;

type DataResponse = {
  service: string;
  data: {
    id: string;
    name: string;
    value: number;
    category: string;
    createdAt: string;
  }[];
  meta: {
    total: number;
    timestamp: string;
  };
};

// Mock data for demonstration
const mockData = [
  {
    id: "data-001",
    name: "Sample Dataset Alpha",
    value: 42.5,
    category: "analytics",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "data-002",
    name: "Sample Dataset Beta",
    value: 78.2,
    category: "metrics",
    createdAt: "2024-01-15T11:15:00Z",
  },
  {
    id: "data-003",
    name: "Sample Dataset Gamma",
    value: 156.7,
    category: "analytics",
    createdAt: "2024-01-15T12:00:00Z",
  },
];

export const getData: Controller<GetDataRequest, DataResponse> = async (
  _request,
  reply,
) => {
  log.debug("Received request to get data");

  const response: DataResponse = {
    service: "service-b",
    data: mockData,
    meta: {
      total: mockData.length,
      timestamp: new Date().toISOString(),
    },
  };

  log.info({ dataCount: mockData.length }, "Data retrieved successfully");
  return reply.status(StatusCodes.OK).send(response);
};
