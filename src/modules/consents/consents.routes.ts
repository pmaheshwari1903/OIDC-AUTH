import { Router } from 'express'
import * as controller from './consents.controller.js'
import { requireAuth } from '../../common/middleware/requireAuth.js'

const router = Router()

router.get('/consents', requireAuth, controller.getConsents)
router.get('/consents/:id', requireAuth, controller.getConsent)
router.delete('/consents/:id', requireAuth, controller.revokeConsent)

export default router
