import client from 'prom-client';

const register = new client.Registry();

register.setDefaultLabels({
  app: 'prf-server'
});

client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'] as const,
  buckets: [0.1, 0.5, 1, 1.5, 2, 3]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'] as const,
});

const activeUsersGauge = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsersGauge);
register.registerMetric(databaseQueryDuration);

export { 
  register, 
  httpRequestDurationMicroseconds, 
  httpRequestsTotal, 
  activeUsersGauge,
  databaseQueryDuration 
};
