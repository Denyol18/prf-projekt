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
  },
  staticMeta: { service: "prf-server" },
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
