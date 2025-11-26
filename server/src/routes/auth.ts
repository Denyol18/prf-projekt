import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from "../models/Doctor";
import { trackDbOperation } from '../app';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, birthDate, birthPlace, phone, doctorId } = req.body;

        const existingUser = await trackDbOperation('findOne', 'users', () => User.findOne({ email }));
        if (existingUser) {
            res.status(400).json({ error: 'Az email már használatban van' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'patient',
        });

        await trackDbOperation('save', 'users', () => newUser.save());

        const newPatient = new Patient({
            userId: newUser._id,
            fullName,
            birthDate,
            birthPlace,
            phone,
            doctorId,
        });

        await trackDbOperation('save', 'patients', () => newPatient.save());

        res.status(201).json({ message: 'Páciens sikeresen regisztrálva' });
    } catch (err) {
        res.status(400).json({ error: 'Sikertelen regisztráció', details: err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await trackDbOperation('findOne', 'users', () => User.findOne({ email }));
        if (!user) {
            res.status(400).json({ error: 'A felhasználó nem létezik vagy nem adtál meg emailt' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Hibás jelszó vagy nem adtál meg jelszót' });
            return;
        }

        let user_type: any;

        if (user.role === 'patient') {
            const userId = user._id
            user_type = await trackDbOperation('findOne', 'patients', () => Patient.findOne({ userId }));
        }
        else if (user.role === 'doctor') {
            const userId = user._id
            user_type = await trackDbOperation('findOne', 'doctors', () => Doctor.findOne({ userId }));
        }

        const token = jwt.sign(
            { userId: user_type._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Sikertelen bejelentkezés', details: err });
    }
});

export default router;
