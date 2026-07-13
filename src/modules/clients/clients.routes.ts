import { Router } from 'express'
import * as controller from "./clients.controller.js"

const router = Router()

router.post('/clients', controller.createClient)
router.get('/clients', controller.getClients)
router.get('/clients/:id', controller.getClientById)
router.patch('/clients/:id', controller.updateClient)
router.delete('/clients/:id', controller.deleteClient)

export default router