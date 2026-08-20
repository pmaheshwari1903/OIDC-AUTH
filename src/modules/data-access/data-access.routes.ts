import { Router } from 'express'
import * as controller from './data-access.controller.js'
import { requireAuth } from '../../common/middleware/requireAuth.js'

const router = Router()

router.get('/data-access', requireAuth, controller.getDataAccess)

export default router
