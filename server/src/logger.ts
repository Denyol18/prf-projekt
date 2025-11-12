import * as winston from "winston";
import * as WinstonGraylog2 from "winston-graylog2";

const options = {
  name: "Graylog",
  level: "info",
  graylog: {
    servers: [{ host: "graylog", port: 12201 }],
  },
  staticMeta: { service: "prf-server" },
};

const graylog2Transport = new WinstonGraylog2(options);

const logger = winston.createLogger({
  exitOnError: false,
  transports: [graylog2Transport]
});

export default logger;
