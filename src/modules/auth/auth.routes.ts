import {Router} from 'express'
import * as controller from "./auth.controller.js"
import { requireAuth } from '../../common/middleware/requireAuth.js'

const router = Router()

router.get('/sign-in', controller.showSignInPage)
router.post('/sign-in', controller.signIn)
router.get('/sign-up', controller.showSignUpPage)
router.post('/sign-up', controller.signUp)
router.post('/logout', requireAuth ,controller.logout)


export default router