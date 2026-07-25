import { Request, Response, NextFunction } from 'express';

export const validateSignInRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { email, password } = req.body;

    if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }

    if (!password?.trim()) {
        return res.status(400).json({ message: "Password is required" });
    }

    next();
};

export const validateSignUpRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName?.trim()) {
        return res.status(400).json({ message: "First name is required" });
    }

    if (!lastName?.trim()) {
        return res.status(400).json({ message: "Last name is required" });
    }

    if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }

    if (!password?.trim()) {
        return res.status(400).json({ message: "Password is required" });
    }

    next();
};
