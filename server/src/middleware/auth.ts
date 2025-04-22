import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Nincs token megadva' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        (req as AuthRequest).user = { userId: decoded.userId };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Érvénytelen token' });
    }
};
