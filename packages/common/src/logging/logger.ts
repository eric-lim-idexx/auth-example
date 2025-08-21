import { pino, type Logger } from "pino";

export enum LogLevel {
  Trace = "trace",
  Debug = "debug",
  Info = "info",
  Error = "error",
}

export const isLogLevel = (value: string): value is LogLevel =>
  Object.values(LogLevel).includes(value as LogLevel);

export type InitLoggerOptions = {
  name: string;
  logLevel: LogLevel;
};

export const initLogger = ({ name, logLevel }: InitLoggerOptions): Logger =>
  pino({
    name,
    level: logLevel,
    transport: {
      targets: [
        {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: false,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      ],
    },
  });
