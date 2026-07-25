import { Router } from 'express'
import * as controller from "./clients.controller.js"
import { validateCreateClientRequest, validateUpdateClientRequest } from './clients.middlewares.js'

const router = Router()

router.post('/clients', validateCreateClientRequest, controller.createClient)
router.get('/clients', controller.getClients)
router.get('/clients/:id', controller.getClientById)
router.patch('/clients/:id', validateUpdateClientRequest, controller.updateClient)
router.delete('/clients/:id', controller.deleteClient)

export default router