import { initLogger } from "@workspace/common";

import { config } from "./config.js";

export const logger = initLogger({
  name: "service-a",
  logLevel: config.logLevel,
});
