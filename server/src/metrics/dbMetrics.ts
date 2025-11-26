import { Counter, Histogram, register } from 'prom-client';

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of DB queries in seconds',
  labelNames: ['operation', 'collection', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of DB queries',
  labelNames: ['operation', 'collection', 'status'],
});

register.registerMetric(dbQueryDuration);
register.registerMetric(dbQueriesTotal);

export async function trackDbOperation(operation: string, collection: string, fn: () => Promise<any>) {
    const start = process.hrtime();
    try {
        const result = await fn();
        const [s, ns] = process.hrtime(start);
        const duration = s + ns / 1e9;

        dbQueryDuration.labels(operation, collection, 'success').observe(duration);
        dbQueriesTotal.labels(operation, collection, 'success').inc();

        return result;
    } catch (err) {
        const [s, ns] = process.hrtime(start);
        const duration = s + ns / 1e9;

        dbQueryDuration.labels(operation, collection, 'failure').observe(duration);
        dbQueriesTotal.labels(operation, collection, 'failure').inc();

        throw err;
    }
}
