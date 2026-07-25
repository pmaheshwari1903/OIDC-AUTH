import { Router } from 'express'
import * as controller from "./oidc.controller.js"
import { validateTokenRequest, validateAuthorizeRequest } from './oidc.middlewares.js'

const router = Router()

router.get('/.well-known/openid-configuration', controller.serviceDiscovery)
router.get('/.well-known/jwks.json', controller.jwks)
router.get('/authorize', validateAuthorizeRequest, controller.authorize)
router.post('/token', validateTokenRequest, controller.token)
router.get('/userinfo', controller.userInfo)

export default router