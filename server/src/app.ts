import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import doctorRoutes from './routes/doctor';
import measurementRoutes from './routes/measurement';
import metrics from './metrics';

import { authenticate } from './middleware/auth';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/measurements', authenticate, measurementRoutes);

app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
});

mongoose.connect(process.env.ATLAS_URI || '', { dbName: 'healthcare_data_manager' })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log(`Server running on port ${port}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));