import { Request, Response, NextFunction } from 'express';
import { signInSchema, signUpSchema } from './auth.schemas.js';

export const validateSignInRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = signInSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues
        });
    }

    req.body = result.data;
    next();
};

export const validateSignUpRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = signUpSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues
        });
    }

    req.body = result.data;
    next();
};

export const validateForgotPasswordRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { email } = req.body;

    if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }

    next();
};

export const validateResetPasswordRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { token, newPassword } = req.body;

    if (!token?.trim()) {
        return res.status(400).json({ message: "Token is required" });
    }

    if (!newPassword?.trim() || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    next();
};
