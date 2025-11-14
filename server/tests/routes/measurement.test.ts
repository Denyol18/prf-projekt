import request from 'supertest';
import express from "express";
import Measurement from '../../src/models/Measurement';
import Patient from '../../src/models/Patient';
import measurementRouter from "../../src/routes/measurement";

jest.mock("../../src/models/Measurement");
jest.mock("../../src/models/Patient");

jest.mock('../../src/middleware/auth', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { userId: 'test-user' };
        next();
    },
}));

function createApp() {
    const app = express();
    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
        req.user = { userId: "test-user" };
        next();
    });

    app.use("/measurement", measurementRouter);
    return app;
}

function createNoAuthApp() {
    const app = express();
    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
        req.user = undefined;
        next();
    });

    app.use("/measurement", measurementRouter);
    return app;
}

describe('Measurement Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Measurement as unknown as jest.Mock).mockReset();
    });

    describe('GET /measurement/', () => {
        it('should return 401 if no user in req', async () => {
            const app = createNoAuthApp();

            const res = await request(app).get("/measurement");

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it('should return 404 if patient not found', async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue(null);

            const app = createApp();

            const res = await request(app).get("/measurement");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Páciens nem létezik");
        });

        it('should return measurements for patient', async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue({ _id: "patient123" });

            (Measurement.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue([
                    { _id: "m1", value: 120 },
                    { _id: "m2", value: 130 }
                ])
            });

            const app = createApp();

            const res = await request(app).get("/measurement");

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });

        it('should return 500 if an unexpected error occurs', async () => {
            (Patient.findOne as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).get("/measurement");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Nem sikerült lekérni a méréseket");
        });
    });

    describe("POST /measurement/", () => {
        it("should return 401 if no user in req", async () => {
            const app = createNoAuthApp();

            const res = await request(app).post("/measurement").send({});

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it("should return 404 if patient not found", async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue(null);

            const app = createApp();

            const res = await request(app).post("/measurement").send({ date: "2025-01-01" });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Páciens nem létezik");
        });

        it("should create a new measurement successfully", async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue({ _id: "patient123" });

            const mockSave = jest.fn().mockImplementation(function (this: any) {
                this._id = "new123";
                return Promise.resolve(this);
            });

            (Measurement as unknown as jest.Mock).mockImplementation((data: any) => {
                return {
                    ...data,
                    save: mockSave
                };
            });

            const app = createApp();

            const res = await request(app)
                .post("/measurement")
                .send({ date: "2025-01-01", pulse: 80 });

            expect(res.status).toBe(201);
            expect(res.body._id).toBe("new123");
        });

        it("should return 400 on save error", async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue({ _id: "patient123" });
            (Measurement.prototype.save as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).post("/measurement").send({ date: "2025-01-01" });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Nem sikerült az új mérés hozzáadása");
        });
    });

    describe("GET /measurement/doctor", () => {

        it("should return empty list when doctor has no patients", async () => {
            (Patient.find as jest.Mock).mockResolvedValue([]);

            const app = createApp();

            const res = await request(app).get("/measurement/doctor");

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it("should return patient measurements for doctor", async () => {
            (Patient.find as jest.Mock).mockResolvedValue([{ _id: "p1" }, { _id: "p2" }]);
            (Measurement.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue([{ _id: "m1" }, { _id: "m2" }])
                })
            });

            const app = createApp();

            const res = await request(app).get("/measurement/doctor");

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Patient.find as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).get("/measurement/doctor");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Szerverhiba");
        });
    });

    describe("DELETE /measurement/:id", () => {

        it("should return 404 when measurement not found", async () => {
            (Measurement.findById as jest.Mock).mockResolvedValue(null);

            const app = createApp();

            const res = await request(app).delete("/measurement/123");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Mérés nem található");
        });

        it("should return 403 if measurement belongs to another user", async () => {
            (Measurement.findById as jest.Mock).mockResolvedValue({
                _id: "123",
                patientId: { toString: () => "other-user" }
            });

            const app = createApp();

            const res = await request(app).delete("/measurement/123");

            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it("should delete measurement successfully", async () => {
            (Measurement.findById as jest.Mock).mockResolvedValue({ _id: "123", patientId: "test-user" });
            (Measurement.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            const app = createApp();

            const res = await request(app).delete("/measurement/123");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Mérés törölve");
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Measurement.findById as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).delete("/measurement/123");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Szerverhiba");
        });
    });

    describe("PUT /measurement/:id", () => {

        it("should return 404 if measurement not found", async () => {
            (Measurement.findById as jest.Mock).mockResolvedValue(null);

            const app = createApp()

            const res = await request(app).put("/measurement/123").send({});

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Mérés nem található");
        });

        it("should return 403 if measurement belongs to another user", async () => {
            (Measurement.findById as jest.Mock).mockResolvedValue({
                _id: "123",
                patientId: { toString: () => "other-user" }
            });

            const app = createApp();

            const res = await request(app).put("/measurement/123").send({});

            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it("should update measurement successfully", async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            const measurement = {
                _id: "123",
                patientId: "test-user",
                date: "old",
                bloodPressure: 120,
                pulse: 70,
                weight: 80,
                bloodSugar: 5.0,
                save: mockSave
            };
            (Measurement.findById as jest.Mock).mockResolvedValue(measurement);

            const app = createApp();

            const res = await request(app).put("/measurement/123").send({ pulse: 99 });

            expect(res.status).toBe(200);
            expect(mockSave).toHaveBeenCalled();
            expect(res.body.pulse).toBe(99);
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Measurement.findById as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).put("/measurement/123").send({});

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Szerverhiba");
        });
    });

});