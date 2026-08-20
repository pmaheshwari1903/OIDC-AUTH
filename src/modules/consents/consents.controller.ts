import { Request, Response } from 'express'
import * as consentsServices from './consents.services.js'

export const getConsents = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const consents = await consentsServices.getUserConsents(userId);
        return res.status(200).json({ consents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getConsent = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const consentId = req.params.id as string;
        const consent = await consentsServices.getConsentById(userId, consentId);
        return res.status(200).json(consent);
    } catch (error) {
        return res.status(404).json({
            message: error instanceof Error ? error.message : "Consent not found"
        });
    }
};

export const revokeConsent = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const consentId = req.params.id as string;
        await consentsServices.revokeConsent(userId, consentId);
        return res.status(200).json({ message: "Consent revoked successfully" });
    } catch (error) {
        return res.status(404).json({
            message: error instanceof Error ? error.message : "Consent not found"
        });
    }
};
