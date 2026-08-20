import { Request, Response } from 'express'
import * as adminServices from './admin.services.js'
import { detectAnomalies } from './anomaly.services.js'

export const getObservability = async (req: Request, res: Response) => {
    try {
        const metrics = await adminServices.getObservabilityMetrics();
        return res.status(200).json(metrics);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getAnomalies = async (req: Request, res: Response) => {
    try {
        const anomalies = await detectAnomalies();
        return res.status(200).json({ anomalies });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
