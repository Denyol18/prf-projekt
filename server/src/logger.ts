import winston from "winston";
import WinstonGraylog2 from "winston-graylog2";

const GRAYLOG_HOST = "graylog";
const GRAYLOG_PORT = 12201;

const graylogTransport = new WinstonGraylog2({
  name: "Graylog",
  level: "info",
  graylog: {
    servers: [{ host: GRAYLOG_HOST, port: GRAYLOG_PORT }],
	hostname: "prf_server",
	facility: "node_app",
	bufferSize: 1400,
  },
  staticMeta: { service: "prf-server" },
});

graylogTransport.on("error", (error) => {
  console.error("\x1b[31m[Graylog Transport Error]\x1b[0m", error.message);
});

graylogTransport.on("close", () => {
  console.warn("\x1b[33m[Graylog Transport Closed]\x1b[0m");
});

graylogTransport.on("connect", () => {
  console.log("\x1b[32m[Graylog Connected]\x1b[0m Sending logs to", GRAYLOG_HOST + ":" + GRAYLOG_PORT);
});

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
	// @ts-expect-error
    graylogTransport,
  ],
});

logger.info("Logger initialized, attempting to connect to Graylog", {
  graylogHost: GRAYLOG_HOST,
  graylogPort: GRAYLOG_PORT,
});

export default logger;