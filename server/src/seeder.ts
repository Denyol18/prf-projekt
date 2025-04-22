import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Doctor from './models/Doctor';
import Patient from './models/Patient';
import Measurement from "./models/Measurement";

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.ATLAS_URI || '', { dbName: 'healthcare_data_manager' });
        console.log('MongoDB connected');

        await Doctor.deleteMany({});
        await Patient.deleteMany({});

        const user_doc1 = await User.create({
            email: 'doktor1@klinika.hu',
            password: await bcrypt.hash('dokika12345', 10),
            role: 'doctor',
        });

        const user_doc2 = await User.create({
            email: 'doktor2@klinika.hu',
            password: await bcrypt.hash('dokika67890', 10),
            role: 'doctor',
        });

        const user_pa1 = await User.create({
            email: 'demo1@patient.com',
            password: await bcrypt.hash('wawawa123', 10),
            role: 'patient',
        })

        const user_pa2 = await User.create({
            email: 'demo2@patient.com',
            password: await bcrypt.hash('wawawa456', 10),
            role: 'patient',
        })

        const doctor1 = await Doctor.create({
            userId: user_doc1._id,
            fullName: 'Dr. Kovács Ákos',
        });

        const doctor2 = await Doctor.create({
            userId: user_doc2._id,
            fullName: 'Dr. Juhász Mária',
        });

        const patient1 = await Patient.create({
            userId: user_pa1._id,
            fullName: 'Bálint Sándor',
            birthDate: new Date('1990-01-01'),
            birthPlace: 'Budapest',
            phone: '36123456764',
            doctorId: doctor1._id,
        })

        const patient2 = await Patient.create({
            userId: user_pa2._id,
            fullName: 'Lakatos István',
            birthDate: new Date('1995-01-01'),
            birthPlace: 'Szeged',
            phone: '36643765753',
            doctorId: doctor2._id,
        })

        const measurement1 = await Measurement.create({
            patientId: patient1._id,
            date: new Date('2025-04-16'),
            bloodPressure: 120,
            pulse: 78,
            weight: 80,
            bloodSugar: 5,
        })

        const measurement2 = await Measurement.create({
            patientId: patient2._id,
            date: new Date('2025-04-16'),
            bloodPressure: 100,
            pulse: 86,
            weight: 90,
            bloodSugar: 3,
        })

        const measurement3 = await Measurement.create({
            patientId: patient2._id,
            date: new Date('2025-04-17'),
            bloodPressure: 105,
            pulse: 83,
            weight: 89,
            bloodSugar: 2,
        })

        const measurement4 = await Measurement.create({
            patientId: patient1._id,
            date: new Date('2025-04-17'),
            bloodPressure: 112,
            pulse: 72,
            weight: 81,
            bloodSugar: 4,
        })

        console.log('Demo data successfully created');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
}

seed();