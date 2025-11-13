import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../src/models/User';
import Patient from '../src/models/Patient';
import Doctor from "../src/models/Doctor";
import authRouter from '../src/routes/auth';

jest.mock('../src/models/User');
jest.mock('../src/models/Patient');
jest.mock('../src/models/Doctor');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new user and patient', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.prototype.save as jest.Mock).mockResolvedValue({});
            (Patient.prototype.save as jest.Mock).mockResolvedValue({});

            const res = await request(app)
                .post('/auth/register')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    birthDate: '2000-01-01',
                    birthPlace: 'City',
                    phone: '123456789',
                    doctorId: 'doctor123',
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Páciens sikeresen regisztrálva');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.prototype.save).toHaveBeenCalled();
            expect(Patient.prototype.save).toHaveBeenCalled();
        });

        it('should return 400 if email already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Az email már használatban van');
        });

        it('should return 400 if an unexpected error occurs during registration', async () => {
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/auth/register')
                .send({
                    fullName: 'Crash Test',
                    email: 'error@example.com',
                    password: 'password123',
                    birthDate: '1990-01-01',
                    birthPlace: 'TestCity',
                    phone: '123456789',
                    doctorId: 'doctor123',
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Sikertelen regisztráció');
            expect(res.body.details).toBeDefined();
        });
    });

    describe('POST /auth/login', () => {
        it('should login a patient and return a token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);

            (User.findOne as jest.Mock).mockResolvedValue({
                _id: 'user123',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'patient',
            });
            (Patient.findOne as jest.Mock).mockResolvedValue({ _id: 'patient123' });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();

            const decoded: any = jwt.verify(res.body.token, process.env.JWT_SECRET || 'secret');
            expect(decoded.userId).toBe('patient123');
            expect(decoded.role).toBe('patient');
        });

        it('should login a doctor and return a token', async () => {
            const hashedPassword = await bcrypt.hash('password456', 10);

            (User.findOne as jest.Mock).mockResolvedValue({
                _id: 'user456',
                email: 'test2@example.com',
                password: hashedPassword,
                role: 'doctor',
            });
            (Doctor.findOne as jest.Mock).mockResolvedValue({ _id: 'doctor456' });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test2@example.com', password: 'password456' });

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();

            const decoded: any = jwt.verify(res.body.token, process.env.JWT_SECRET || 'secret');
            expect(decoded.userId).toBe('doctor456');
            expect(decoded.role).toBe('doctor');
        });

        it('should return 400 for invalid or no email', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'invalid@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('A felhasználó nem létezik vagy nem adtál meg emailt');
        });

        it('should return 400 for wrong or no password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);

            (User.findOne as jest.Mock).mockResolvedValue({
                _id: 'user123',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'patient',
            });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Hibás jelszó vagy nem adtál meg jelszót');
        });

        it('should return 500 if an unexpected error occurs during login', async () => {
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Sikertelen bejelentkezés');
            expect(res.body.details).toBeDefined();
        });
    });
});