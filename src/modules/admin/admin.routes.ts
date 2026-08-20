import { Router } from 'express'
import * as controller from './admin.controller.js'
import { requireAuth } from '../../common/middleware/requireAuth.js'
import { requireAdmin } from '../../common/middleware/requireAdmin.js'

const router = Router()

router.get('/admin/observability', requireAuth, requireAdmin, controller.getObservability)
router.get('/admin/anomalies', requireAuth, requireAdmin, controller.getAnomalies)

export default router
