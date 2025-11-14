import request from "supertest";
import express from "express";
import Patient from "../../src/models/Patient";
import User from "../../src/models/User";
import Measurement from "../../src/models/Measurement";
import patientRouter from "../../src/routes/patient";

jest.mock("../../src/models/Patient");
jest.mock("../../src/models/User");
jest.mock("../../src/models/Measurement");

jest.mock("../../src/middleware/auth", () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { userId: "test-user" };
        next();
    }
}));

function createApp() {
    const app = express();
    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
        req.user = { userId: "test-user" };
        next();
    });

    app.use("/patient", patientRouter);
    return app;
}

function createNoAuthApp() {
    const app = express();
    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
        req.user = undefined;
        next();
    });

    app.use("/patient", patientRouter);
    return app;
}

describe("Patient Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Patient as unknown as jest.Mock).mockReset?.();
    });

    describe("GET /patient/doctor", () => {
        it("should return 404 if doctor has no patients", async () => {
            (Patient.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue([])
            });

            const app = createApp();

            const res = await request(app).get("/patient/doctor");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Orvosnak nincsenek páciensei");
        });

        it("should return doctor patients", async () => {
            (Patient.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue([
                    { _id: "p1", fullName: "John" }
                ])
            });

            const app = createApp();

            const res = await request(app).get("/patient/doctor");

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Patient.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error("Fail"))
            });

            const app = createApp();

            const res = await request(app).get("/patient/doctor");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Orvos pácienseinek lekérése sikertelen");
        });
    });

    describe("GET /patient/", () => {
        it("should return 404 if patient not found", async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue(null);

            const app = createApp();

            const res = await request(app).get("/patient");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Páciens nem létezik");
        });

        it("should return patient", async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue({ _id: "test-user", fullName: "John" });

            const app = createApp();

            const res = await request(app).get("/patient");

            expect(res.status).toBe(200);
            expect(res.body.fullName).toBe("John");
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Patient.findOne as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).get("/patient");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Páciens lekérése sikertelen");
        });
    });

    describe("DELETE /patient/:id", () => {
        it("should return 404 if patient not found", async () => {
            (Patient.findById as jest.Mock).mockResolvedValue(null);

            const app = createApp();

            const res = await request(app).delete("/patient/test-user");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Páciens nem létezik");
        });

        it("should return 403 if trying to delete another user", async () => {
            (Patient.findById as jest.Mock).mockResolvedValue({ _id: "test-user" });

            const app = createApp();

            const res = await request(app).delete("/patient/other-user");

            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it("should delete patient successfully", async () => {
            (Patient.findById as jest.Mock).mockResolvedValue({
                _id: "test-user",
                userId: "user123"
            });

            (Measurement.deleteMany as jest.Mock).mockResolvedValue({});
            (Patient.findByIdAndDelete as jest.Mock).mockResolvedValue({});
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            const app = createApp();

            const res = await request(app).delete("/patient/test-user");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Páciens törölve");
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Patient.findById as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();

            const res = await request(app).delete("/patient/test-user");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Szerverhiba");
        });
    });

    describe("PUT /patient/:id", () => {
        it("should return 404 if patient not found", async () => {
            (Patient.findById as jest.Mock).mockResolvedValue(null);

            const app = createApp();
            const res = await request(app).put("/patient/test-user").send({});

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Páciens nem létezik");
        });

        it("should return 403 when editing another user", async () => {
            (Patient.findById as jest.Mock).mockResolvedValue({ _id: "test-user" });

            const app = createApp();
            const res = await request(app).put("/patient/other-user").send({});

            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Nincs jogosultság");
        });

        it("should update patient successfully", async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            const patient = {
                _id: "test-user",
                fullName: "Old",
                phone: "000",
                birthPlace: "BP",
                birthDate: "2000",
                save: mockSave
            };

            (Patient.findById as jest.Mock).mockResolvedValue(patient);

            const app = createApp();
            const res = await request(app)
                .put("/patient/test-user")
                .send({
                    fullName: "New",
                    phone: "111",
                    birthPlace: "NY",
                    birthDate: "1999"
                });

            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.body.fullName).toBe("New");
            expect(res.body.phone).toBe("111");
        });

        it("should keep old values if not provided", async () => {
            const mockSave = jest.fn().mockResolvedValue({});

            const patient = {
                _id: "test-user",
                fullName: "OldName",
                phone: "000",
                birthPlace: "BP",
                birthDate: "2000",
                save: mockSave
            };

            (Patient.findById as jest.Mock).mockResolvedValue(patient);

            const app = createApp();
            const res = await request(app)
                .put("/patient/test-user")
                .send({});

            expect(res.status).toBe(200);
            expect(res.body.fullName).toBe("OldName");
            expect(res.body.birthPlace).toBe("BP");
        });

        it("should return 500 if an unexpected error occurs", async () => {
            (Patient.findById as jest.Mock).mockRejectedValue(new Error("Fail"));

            const app = createApp();
            const res = await request(app).put("/patient/test-user").send({});

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Szerverhiba");
        });
    });
});