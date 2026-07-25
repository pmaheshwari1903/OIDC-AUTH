import { Request, Response, NextFunction } from 'express';

export const validateTokenRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { client_id, client_secret, code, redirect_uri } = req.body;

    if (!client_id) {
        return res.status(400).json({ message: "client_id is required" });
    }

    if (!client_secret) {
        return res.status(400).json({ message: "client_secret is required" });
    }

    if (!code) {
        return res.status(400).json({ message: "code is required" });
    }

    if (!redirect_uri) {
        return res.status(400).json({ message: "redirect_uri is required" });
    }

    next();
};

export const validateAuthorizeRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { client_id, redirect_uri, response_type, scope } = req.query;

    if (!client_id) {
        return res.status(400).json({ message: "client_id is required" });
    }

    if (!redirect_uri) {
        return res.status(400).json({ message: "redirect_uri is required" });
    }

    if (!response_type) {
        return res.status(400).json({ message: "response_type is required" });
    }

    if (!scope) {
        return res.status(400).json({ message: "scope is required" });
    }

    next();
};

