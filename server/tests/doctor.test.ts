import request from 'supertest';
import express from 'express';
import doctorRouter from '../src/routes/doctor';
import Doctor from '../src/models/Doctor';

jest.mock('../src/models/Doctor');

const app = express();
app.use(express.json());
app.use('/doctors', doctorRouter);

describe('Doctor Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /doctors', () => {
        it('should return a list of doctors', async () => {
            const mockDoctors = [
                { _id: '1', fullName: 'Dr. Alice Smith' },
                { _id: '2', fullName: 'Dr. Bob Johnson' },
            ];

            (Doctor.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockDoctors),
            });

            const res = await request(app).get('/doctors');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockDoctors);
            expect(Doctor.find).toHaveBeenCalled();
        });

        it('should return 500 if an unexpected error occurs', async () => {
            (Doctor.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            const res = await request(app).get('/doctors');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Orvosok lekérése sikertelen');
            expect(res.body.details).toBeDefined();
        });
    });
});