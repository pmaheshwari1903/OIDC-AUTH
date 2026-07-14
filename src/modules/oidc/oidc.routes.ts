import { Router } from 'express'
import * as controller from "./oidc.controller.js"
import { requireAuth } from '../../common/middleware/requireAuth.js'

const router = Router()

router.get('/.well-known/openid-configuration', controller.serviceDiscovery)
router.get('/.well-known/jwks.json', controller.jwks)
router.get('/authorize', controller.authorize)
router.post('/token', controller.token)
router.get('/userinfo', controller.userInfo)

export default router