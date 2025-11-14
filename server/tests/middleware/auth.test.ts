import { authenticate, AuthRequest } from "../../src/middleware/auth";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");

describe("authenticate middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            header: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    it("should return 401 if no token provided", () => {
        (req.header as jest.Mock).mockReturnValue(undefined);

        authenticate(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Nincs token megadva" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should authenticate successfully with valid token", () => {
        (req.header as jest.Mock).mockReturnValue("Bearer validtoken");

        (jwt.verify as jest.Mock).mockReturnValue({ userId: "user123" });

        authenticate(req as Request, res as Response, next);

        expect(jwt.verify).toHaveBeenCalledWith("validtoken", "testsecret");
        expect((req as AuthRequest).user).toEqual({ userId: "user123" });
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 on invalid token", () => {
        (req.header as jest.Mock).mockReturnValue("Bearer wrongtoken");

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("invalid");
        });

        authenticate(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Érvénytelen token" });
        expect(next).not.toHaveBeenCalled();
    });
});
