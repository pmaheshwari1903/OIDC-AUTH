import { Request, Response } from 'express'
import * as dataAccessServices from './data-access.services.js'

export const getDataAccess = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const accesses = await dataAccessServices.getUserDataAccess(userId);
        return res.status(200).json({ accesses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
