import { Request, Response, NextFunction } from 'express';

export const validateCreateClientRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { name, redirectUri } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ message: "Client name is required" });
    }

    if (name.trim().length < 3) {
        return res.status(400).json({ message: "Client name must be at least 3 characters long" });
    }

    if (!redirectUri?.trim()) {
        return res.status(400).json({ message: "Redirect URI is required" });
    }

    try {
        const url = new URL(redirectUri);
        if (!["http:", "https:"].includes(url.protocol)) {
            return res.status(400).json({ message: "Invalid Redirect URI" });
        }
    } catch {
        return res.status(400).json({ message: "Invalid Redirect URI" });
    }

    next();
};

export const validateUpdateClientRequest = (req: Request, res: Response, next: NextFunction): any => {
    const { name, redirectUri } = req.body;

    if (name !== undefined) {
        if (!name.trim()) {
            return res.status(400).json({ message: "Client name is required" });
        }
        if (name.trim().length < 3) {
            return res.status(400).json({ message: "Client name must be at least 3 characters long" });
        }
    }

    if (redirectUri !== undefined) {
        if (!redirectUri?.trim()) {
            return res.status(400).json({ message: "Invalid Redirect URI" });
        }
        try {
            const url = new URL(redirectUri);
            if (!["http:", "https:"].includes(url.protocol)) {
                return res.status(400).json({ message: "Invalid Redirect URI" });
            }
        } catch {
            return res.status(400).json({ message: "Invalid Redirect URI" });
        }
    }

    if (name === undefined && redirectUri === undefined) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    next();
};
