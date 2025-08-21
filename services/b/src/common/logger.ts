import { initLogger } from "@workspace/common";

import { config } from "./config.js";

export const logger = initLogger({
  name: "service-b",
  logLevel: config.logLevel,
});
