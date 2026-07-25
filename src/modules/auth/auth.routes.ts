import { Router } from 'express'
import * as controller from "./auth.controller.js"
import { requireAuth } from '../../common/middleware/requireAuth.js'
import { validateSignInRequest, validateSignUpRequest } from './auth.middlewares.js'

const router = Router()

router.get('/sign-in', controller.showSignInPage)
router.post('/sign-in', validateSignInRequest, controller.signIn)
router.get('/sign-up', controller.showSignUpPage)
router.post('/sign-up', validateSignUpRequest, controller.signUp)
router.post('/logout', requireAuth, controller.logout)


export default router