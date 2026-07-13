import { Request, Response, NextFunction } from "express"

import { verifyAccessToken } from "../utils/jwt.utils.js"
import { JwtPayload } from "jsonwebtoken";
import { db, usersTable } from "../db/index.js";
import { eq } from "drizzle-orm";


export const requireAuth = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;

        if(!token){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const payload = verifyAccessToken(token) as JwtPayload;

        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id))

        if(!user){
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        req.user = user;
    } catch (error) {
        
    }
}