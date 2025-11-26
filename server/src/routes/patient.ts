import express from 'express';
import Patient from '../models/Patient';
import User from "../models/User";
import Measurement from '../models/Measurement';
import { AuthRequest, authenticate } from '../middleware/auth';
import { trackDbOperation } from '../app';

const router = express.Router();

router.get('/doctor', authenticate, async (req: AuthRequest, res) => {
    try {
        const doctorUserId = req.user?.userId;
        
		const patients = await trackDbOperation(
            'find',
            'patients',
            () => Patient.find({ doctorId: doctorUserId }).populate('userId', 'email')
        );

        if (!patients.length) {
            res.status(404).json({ error: 'Orvosnak nincsenek páciensei' });
            return;
        }

        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: 'Orvos pácienseinek lekérése sikertelen', details: err });
    }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const patientUserId = req.user?.userId;
        const patient = await trackDbOperation(
            'findOne',
            'patients',
            () => Patient.findOne({ _id: patientUserId })
        );

        if (!patient) {
            res.status(404).json({ error: 'Páciens nem létezik' });
            return;
        }

        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: 'Páciens lekérése sikertelen', details: err });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const patient = await trackDbOperation(
            'findById',
            'patients',
            () => Patient.findById(req.user?.userId)
        );

        if (!patient) {
            res.status(404).json({ error: 'Páciens nem létezik' });
            return;
        }

        if (req.params.id !== req.user?.userId) {
            res.status(403).json({ error: 'Nincs jogosultság' });
            return;
        }
        const patientId = patient.userId;

        await trackDbOperation(
            'deleteMany',
            'measurements',
            () => Measurement.deleteMany({ patientId: req.params.id })
        );
        await trackDbOperation('findByIdAndDelete', 'patients', () =>
            Patient.findByIdAndDelete(req.params.id)
        );
        await trackDbOperation('findByIdAndDelete', 'users', () =>
            User.findByIdAndDelete(patientId)
        );
        res.json({ message: 'Páciens törölve' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba', details: err })
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const patient = await trackDbOperation(
            'findById',
            'patients',
            () => Patient.findById(req.user?.userId)
        );

        if (!patient) {
            res.status(404).json({ error: 'Páciens nem létezik' });
            return;
        }

        if (req.params.id !== req.user?.userId) {
            res.status(403).json({ error: 'Nincs jogosultság' });
            return;
        }

        const { fullName, phone, birthPlace, birthDate } = req.body;

        patient.fullName = fullName || patient.fullName;
        patient.phone = phone || patient.phone;
        patient.birthPlace = birthPlace || patient.birthPlace;
        patient.birthDate = birthDate || patient.birthDate;

        await trackDbOperation('save', 'patients', () => patient.save());
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba', details: err });
    }
});

export default router;