import { Router } from 'express'
import * as controller from "./auth.controller.js"
import { requireAuth } from '../../common/middleware/requireAuth.js'
import { validateSignInRequest, validateSignUpRequest, validateForgotPasswordRequest, validateResetPasswordRequest } from './auth.middlewares.js'

const router = Router()

router.post('/sign-in', validateSignInRequest, controller.signIn)
router.post('/sign-up', validateSignUpRequest, controller.signUp)
router.get('/verify-email', controller.verifyEmail)
router.post('/logout', requireAuth, controller.logout)
router.post('/forgot-password', validateForgotPasswordRequest, controller.forgotPassword)
router.post('/reset-password', validateResetPasswordRequest, controller.resetPassword)


export default router