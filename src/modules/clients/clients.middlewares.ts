import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../common/utils/jwt.utils.js';
import { JwtPayload } from 'jsonwebtoken';
import { db, usersTable, clientsTable } from '../../common/db/index.js';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { findClientByIdentifier } from './clients.services.js';

export const validateCreateClientRequest = (req: Request, res: Response, next: NextFunction): any => {
    const rawName = req.body.applicationName !== undefined ? req.body.applicationName : req.body.name;
    const { redirectUri } = req.body;

    if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
        return res.status(400).json({ message: "Client name is required" });
    }

    if (rawName.trim().length < 3) {
        return res.status(400).json({ message: "Client name must be at least 3 characters long" });
    }

    if (!redirectUri || typeof redirectUri !== 'string' || !redirectUri.trim()) {
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

    req.body.name = rawName.trim();
    next();
};

export const validateUpdateClientRequest = (req: Request, res: Response, next: NextFunction): any => {
    const rawName = req.body.applicationName !== undefined ? req.body.applicationName : req.body.name;
    const { redirectUri } = req.body;

    if (rawName !== undefined) {
        if (typeof rawName !== 'string' || !rawName.trim()) {
            return res.status(400).json({ message: "Application name is required" });
        }
        if (rawName.trim().length < 3) {
            return res.status(400).json({ message: "Application name must be at least 3 characters long" });
        }
    }

    if (redirectUri !== undefined) {
        if (typeof redirectUri !== 'string' || !redirectUri.trim()) {
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

    if (rawName === undefined && redirectUri === undefined) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    next();
};

export const requireClientManagementAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.accessToken;
        const targetClientId = (req.params.clientId || req.params.id) as string;

        // 1. Check user JWT access token from cookies or Bearer auth header
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
        const candidateToken = cookieToken || bearerToken;

        if (candidateToken) {
            try {
                const payload = verifyAccessToken(candidateToken) as JwtPayload;
                if (payload && payload.id) {
                    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
            } catch {
                // Not a valid user JWT, proceed to check client credentials
            }
        }

        // 2. Check HTTP Basic Authentication (Authorization: Basic base64(clientId:clientSecret))
        if (authHeader?.startsWith('Basic ')) {
            try {
                const credentials = Buffer.from(authHeader.substring(6).trim(), 'base64').toString('utf8');
                const [clientId, clientSecret] = credentials.split(':');
                if (clientId && clientSecret) {
                    const client = await findClientByIdentifier(clientId);
                    if (client) {
                        const hashed = crypto.createHash('sha256').update(clientSecret).digest('hex');
                        if (hashed === client.clientSecret) {
                            return next();
                        }
                    }
                }
            } catch {}
        }

        // 3. Check client secret via x-client-secret header or Bearer client secret
        const customSecret = (req.headers['x-client-secret'] as string) || (bearerToken && !bearerToken.includes('.') ? bearerToken : undefined);
        if (customSecret && targetClientId) {
            const client = await findClientByIdentifier(targetClientId);
            if (client) {
                const hashed = crypto.createHash('sha256').update(customSecret.trim()).digest('hex');
                if (hashed === client.clientSecret) {
                    return next();
                }
            }
        }

        // 4. If none of the authorization methods matched
        return res.status(401).json({
            message: "Unauthorized: Authentication required to manage client"
        });
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};
