import winston from "winston";
import WinstonGraylog2 from "winston-graylog2";

const graylogTransport = new WinstonGraylog2({
  name: "Graylog",
  level: "info",
  graylog: {
    servers: [{ host: "graylog", port: 12201 }],
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
    graylogTransport as any,
  ],
});

export default logger;
