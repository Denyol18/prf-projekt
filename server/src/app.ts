import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

import logger from './logger';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import doctorRoutes from './routes/doctor';
import measurementRoutes from './routes/measurement';
import { authenticate } from './middleware/auth';
import './metrics/dbMetrics';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

collectDefaultMetrics({ prefix: 'healthapp_' });

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});

const dbConnectionErrors = new Counter({
  name: 'db_connection_errors_total',
  help: 'Number of MongoDB connection errors',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(dbConnectionErrors);

app.use((req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;

    httpRequestDuration
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(duration);

    httpRequestTotal
      .labels(req.method, req.path, res.statusCode.toString())
      .inc();
	
	logger.info("HTTP Request", {
	  _method: req.method,
	  _path: req.path,
	  _statusCode: res.statusCode,
	  _duration: duration.toFixed(3) + "s",
	});
  });

  next();
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send('Error collecting metrics');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/measurements', authenticate, measurementRoutes);

mongoose.connect(process.env.ATLAS_URI || '', { dbName: 'healthcare_data_manager' })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log(`Server running on port ${port}`));
    })
    .catch(err => { 
		console.error('MongoDB connection error:', err);
		dbConnectionErrors.inc();
	});