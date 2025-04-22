import express from 'express';
import Doctor from '../models/Doctor';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('_id fullName');

        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: 'Orvosok lekérése sikertelen', details: err });
    }
});

export default router;