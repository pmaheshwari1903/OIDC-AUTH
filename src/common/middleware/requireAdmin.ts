import { Request, Response, NextFunction } from "express"

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Simplest possible admin check for fresher-friendliness
    if (req.user.email !== "admin@example.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
}
