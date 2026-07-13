import crypto from 'node:crypto'
import {db, authorizationCodesTable} from '../../common/db/index.js'
import {addMinutes} from 'date-fns'
import { eq } from 'drizzle-orm'

const createAuthorizationCode = async ({clientId, userId, redirectUri, scope} : {clientId: string; userId: string; redirectUri: string; scope: string;}) => {
    const code = crypto.randomBytes(16).toString('hex')
    const expiresAt = addMinutes(new Date(), 5)
    const [authorizationCode] = await db.insert(authorizationCodesTable).values({
        code,
        clientId,
        userId,
        redirectUri,
        scope,
        expiresAt,
    }).returning()
    return authorizationCode.code
}

const findAuthorizationCode = async(shortCode: string) => {
    const [authorizationCode] = await db.select().from(authorizationCodesTable).where(eq(authorizationCodesTable.code, shortCode))
    if(!authorizationCode) throw new Error("Authorization Code not Found")
    return authorizationCode
}

const markAuthorizationCodeUsed = async(shortCode: string) => {
    await db.update(authorizationCodesTable).set({used: true}).where(eq(authorizationCodesTable.code,shortCode)).returning();
}


export {
    createAuthorizationCode,
    findAuthorizationCode,
    markAuthorizationCodeUsed
}