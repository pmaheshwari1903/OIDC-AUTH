import { Router } from 'express';
import * as controller from "./clients.controller.js";
import {
    validateCreateClientRequest,
    validateUpdateClientRequest,
    requireClientManagementAuth
} from './clients.middlewares.js';

const router = Router();

router.post('/clients', validateCreateClientRequest, controller.createClient);
router.get('/clients', controller.getClients);
router.get('/clients/public/:clientId', controller.getPublicClientDetails);
router.get('/clients/:clientId', controller.getClientById);
router.patch('/clients/:clientId', requireClientManagementAuth, validateUpdateClientRequest, controller.updateClient);
router.delete('/clients/:clientId', requireClientManagementAuth, controller.deleteClient);

export default router;