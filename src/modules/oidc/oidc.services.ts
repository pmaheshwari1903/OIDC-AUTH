import ApiError from "../../common/utils/api-error.js"
import ApiResponse from "../../common/utils/api-response.js"
import { clientsTable, db, usersTable } from '../../common/db/index.js'
import * as jose from 'node-jose'
import { JWK } from '../../common/utils/cert.js'
import { eq } from 'drizzle-orm'
import { createAuthorizationCode, findAuthorizationCode, markAuthorizationCodeUsed } from "../authorization-codes/authorization-codes.service.js"
import crypto from 'crypto'
import { generateAccessToken, generateIdToken, verifyAccessToken } from "../../common/utils/jwt.utils.js"
import { JwtPayload } from "jsonwebtoken"

const serviceDiscovery = async () => {
    const ISSUER = process.env.ISSUER!;

    return {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        userinfo_endpoint: `${ISSUER}/userinfo`,
        jwks_uri: `${ISSUER}/.well-known/jwks.json`,

        response_types_supported: [
            "code"
        ],

        subject_types_supported: [
            "public"
        ],

        id_token_signing_alg_values_supported: [
            "RZ256"
        ],

        scopes_supported: [
            "openid",
            "profile",
            "email",
        ],

        claims_supported: [
            "sub",
            "email",
            "email_verified",
            "given_name",
            "family_name",
            "name",
            "picture",
        ],
    }
}

const jwks = async () => {
    return {
        keys: [JWK.toJSON()]
    }
}

const authorize = async ({ client_id, redirect_uri, response_type, scope, state, userId }: { client_id?: string; redirect_uri?: string; response_type?: string; scope?: string; state?: string; userId: string; }) => {
    if (!client_id) {
        throw new Error("client_id is required");
    }

    if (!redirect_uri) {
        throw new Error("redirect_uri is required");
    }

    if (!response_type) {
        throw new Error("response_type is required");
    }

    if (!scope) {
        throw new Error("scope is required");
    }

    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, client_id))

    if (!client) throw new Error("Client Not Found")

    if (client.redirectUri !== redirect_uri) {
        throw new Error("Invalid Redirect Uri")
    }

    if (response_type !== "code") {
        throw new Error("Unsupported response type");
    }

    if (!scope.includes("openid")) {
        throw new Error("openid scope is required");
    }

    const shortCode = await createAuthorizationCode({
        clientId: client.id,
        userId,
        redirectUri: redirect_uri,
        scope
    })

    return {
        shortCode,
        redirectUri: redirect_uri,
        state
    }
}

const token = async({client_id, client_secret, shortCode, redirect_uri} : {client_id?: string, client_secret?: string, shortCode?: string, redirect_uri?: string}) => {
    if (!client_id) {
        throw new Error("client_id is required");
    }

    if (!client_secret) {
        throw new Error("client_secret is required");
    }

    if (!shortCode) {
        throw new Error("code is required");
    }

    if (!redirect_uri) {
        throw new Error("redirect_uri is required");
    }

    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, client_id))

    if(!client){
        throw new Error("Invalid Client")
    }

    const hashedSecret = crypto.createHash('sha256').update(client_secret).digest('hex')

    if(hashedSecret !== client.clientSecret){
        throw new Error("Invalid client secret")
    }

    const authorizationCode = await findAuthorizationCode(shortCode)

    if(authorizationCode.expiresAt < new Date()){
        throw new Error("Authorization Code Expired")
    }

    if(authorizationCode.used){
        throw new Error("Authorization code already used")
    }

    if(authorizationCode.redirectUri !== redirect_uri){
        throw new Error("Invalid redirect URI")
    }

    if (authorizationCode.clientId !== client.id) {
        throw new Error("Authorization code does not belong to this client");
    }

    const accessToken = generateAccessToken({
        id : authorizationCode.userId
    })

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authorizationCode.userId));

    const idToken = generateIdToken({
        sub: user.id,
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName
    })

    await markAuthorizationCodeUsed(shortCode)

    return{
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 900
    }
}

const userInfo = async(accessToken: string) => {
    const payload = verifyAccessToken(accessToken) as JwtPayload

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id))

    if(!user){
        throw new Error("User Not Found")
    }

    return {
        sub: user.id,
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName,
        picture: user.profileImageUrl,
    };
}

export {
    serviceDiscovery,
    jwks,
    authorize,
    token,
    userInfo
}