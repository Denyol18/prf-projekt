import express from 'express';
import Measurement from '../models/Measurement';
import Patient from '../models/Patient';
import { AuthRequest, authenticate } from '../middleware/auth';
import { trackDbOperation } from '../metrics/dbMetrics';

const router = express.Router();

router.get('/', async (req: AuthRequest, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Nincs jogosultság' });
        return;
    }

    try {
        const patient = await trackDbOperation(
            'findOne',
            'patients',
            () => Patient.findOne({ _id: req.user?.userId })
        );
        if (!patient) {
            res.status(404).json({ error: 'Páciens nem létezik' });
            return;
        }

        const measurements = await trackDbOperation(
            'find',
            'measurements',
            () => Measurement.find({ patientId: patient._id }).sort({ date: -1 })
        );

        res.json(measurements);
    } catch (err) {
        res.status(500).json({ error: 'Nem sikerült lekérni a méréseket', details: err });
    }
});

router.post('/', async (req: AuthRequest, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Nincs jogosultság' });
        return;
    }

    try {
        const patient = await trackDbOperation(
            'findOne',
            'patients',
            () => Patient.findOne({ _id: req.user?.userId })
        );
        if (!patient) {
            res.status(404).json({ error: 'Páciens nem létezik' });
            return;
        }

        const { date, bloodPressure, pulse, weight, bloodSugar } = req.body;
        const newMeasurement = new Measurement({
            patientId: patient._id,
            date,
            bloodPressure,
            pulse,
            weight,
            bloodSugar,
        });

        await trackDbOperation('save', 'measurements', () => newMeasurement.save());
        res.status(201).json(newMeasurement);
    } catch (err) {
        res.status(400).json({ error: 'Nem sikerült az új mérés hozzáadása', details: err });
    }
});

router.get('/doctor', authenticate, async (req: AuthRequest, res) => {
    try {
        const doctorUserId = req.user?.userId;

        const patients = await trackDbOperation(
            'find',
            'patients',
            () => Patient.find({ doctorId: doctorUserId })
        );

        if (!patients.length) {
            res.json([]);
            return;
        }

        const patientIds = patients.map((p: any) => p._id);
        const measurements = await trackDbOperation(
            'find',
            'measurements',
            () =>
                Measurement.find({ patientId: { $in: patientIds } })
                    .populate('patientId', 'fullName')
                    .sort({ date: -1 })
        );

        res.json(measurements);
    } catch (err) {
        //console.error('Nem sikerült lekérni a méréseket az orvos számára:', err);
        res.status(500).json({ error: 'Szerverhiba', details: err });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const measurement = await trackDbOperation(
            'findById',
            'measurements',
            () => Measurement.findById(req.params.id)
        );
        if (!measurement) {
            res.status(404).json({ error: 'Mérés nem található' });
            return;
        }

        if (measurement.patientId.toString() !== req.user?.userId) {
            res.status(403).json({ error: 'Nincs jogosultság' });
            return;
        }

        await trackDbOperation(
            'findByIdAndDelete',
            'measurements',
            () => Measurement.findByIdAndDelete(req.params.id)
        );
        res.json({ message: 'Mérés törölve' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba', details: err });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const measurement = await trackDbOperation(
            'findById',
            'measurements',
            () => Measurement.findById(req.params.id)
        );
        if (!measurement) {
            res.status(404).json({ error: 'Mérés nem található' });
            return;
        }

        if (measurement.patientId.toString() !== req.user?.userId) {
            res.status(403).json({ error: 'Nincs jogosultság' });
            return;
        }

        const { date, bloodPressure, pulse, weight, bloodSugar } = req.body;

        measurement.date = date || measurement.date;
        measurement.bloodPressure = bloodPressure ?? measurement.bloodPressure;
        measurement.pulse = pulse ?? measurement.pulse;
        measurement.weight = weight ?? measurement.weight;
        measurement.bloodSugar = bloodSugar ?? measurement.bloodSugar;

        await trackDbOperation('save', 'measurements', () => measurement.save());
        res.json(measurement);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba', details: err });
    }
});

export default router;