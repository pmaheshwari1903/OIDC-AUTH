
import { clientsTable, db, usersTable, userProfilesTable, userInterestsTable, dataAccessLogsTable } from '../../common/db/index.js'
import * as jose from 'node-jose'
import { JWK } from '../../common/utils/cert.js'
import { eq, and, isNull, or } from 'drizzle-orm'
import { createAuthorizationCode, findAuthorizationCode, markAuthorizationCodeUsed } from "../authorization-codes/authorization-codes.service.js"
import { consentsTable } from '../../common/db/consents.schema.js'
import crypto from 'crypto'
import { generateAccessToken, generateIdToken, verifyAccessToken } from "../../common/utils/jwt.utils.js"
import { JwtPayload } from "jsonwebtoken"
import { SUPPORTED_SCOPES, SUPPORTED_CLAIMS, SUPPORTED_PURPOSES } from "./oidc.scopes.js"

const serviceDiscovery = async () => {
    const ISSUER = process.env.ISSUER!;

    return {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
        userinfo_endpoint: `${ISSUER}/userinfo`,
        jwks_uri: `${ISSUER}/.well-known/jwks.json`,

        response_types_supported: [
            "code"
        ],

        subject_types_supported: [
            "public"
        ],

        id_token_signing_alg_values_supported: [
            "RS256"
        ],

        scopes_supported: SUPPORTED_SCOPES,

        claims_supported: [
            "sub",
            ...SUPPORTED_CLAIMS,
        ],
    }
}

const jwks = async () => {
    return {
        keys: [JWK.toJSON()]
    }
}

const authorize = async ({ client_id, redirect_uri, response_type, scope, state, userId, purpose }: { client_id: string; redirect_uri: string; response_type: string; scope: string; state?: string; userId: string; purpose?: string; }) => {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, client_id))

    if (!client) throw new Error("Client Not Found")

    if (client.redirectUri !== redirect_uri) {
        throw new Error("Invalid Redirect Uri")
    }

    if (response_type !== "code") {
        throw new Error("Unsupported response type");
    }

    // Default purpose to "authentication" if not provided
    const resolvedPurpose = purpose && SUPPORTED_PURPOSES.includes(purpose as any) ? purpose : "authentication";

    const requestedScopes = scope.split(" ");
    if (!requestedScopes.includes("openid")) {
        throw new Error("openid scope is required");
    }

    for (const s of requestedScopes) {
        if (!SUPPORTED_SCOPES.includes(s as any)) {
            throw new Error(`Unsupported scope: ${s}`);
        }
    }

    // Check if consent already exists for this user + client + scope + purpose
    const [existingConsent] = await db.select().from(consentsTable).where(
        and(
            eq(consentsTable.userId, userId),
            eq(consentsTable.clientId, client.id),
            eq(consentsTable.scope, scope),
            eq(consentsTable.purpose, resolvedPurpose as any),
            eq(consentsTable.status, "granted"),
            isNull(consentsTable.revokedAt)
        )
    );

    if (!existingConsent) {
        return {
            requiresConsent: true,
            redirectUri: undefined,
            shortCode: undefined,
            state
        }
    }

    const shortCode = await createAuthorizationCode({
        clientId: client.id,
        userId,
        redirectUri: redirect_uri,
        scope,
        purpose: resolvedPurpose
    })

    return {
        requiresConsent: false,
        shortCode,
        redirectUri: redirect_uri,
        state
    }
}

const saveConsent = async ({ client_id, userId, scope, redirect_uri, state, purpose }: { client_id: string; userId: string; scope: string; redirect_uri: string; state?: string; purpose?: string }) => {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, client_id))
    if (!client) throw new Error("Client Not Found")
    
    if (client.redirectUri !== redirect_uri) {
        throw new Error("Invalid Redirect Uri")
    }

    // Default purpose to "authentication" if not provided
    const resolvedPurpose = purpose && SUPPORTED_PURPOSES.includes(purpose as any) ? purpose : "authentication";

    // Save consent with the specified purpose
    await db.insert(consentsTable).values({
        userId,
        clientId: client.id,
        scope,
        purpose: resolvedPurpose as any,
        status: "granted"
    });

    const shortCode = await createAuthorizationCode({
        clientId: client.id,
        userId,
        redirectUri: redirect_uri,
        scope,
        purpose: resolvedPurpose
    })

    return {
        shortCode,
        redirectUri: redirect_uri,
        state
    }
}

const token = async ({ client_id, client_secret, code, redirect_uri }: { client_id: string, client_secret: string, code: string, redirect_uri: string }) => {

    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, client_id))

    if (!client) {
        throw new Error("Invalid Client")
    }

    const hashedSecret = crypto.createHash('sha256').update(client_secret).digest('hex')

    if (hashedSecret !== client.clientSecret) {
        throw new Error("Invalid client secret")
    }

    const authorizationCode = await findAuthorizationCode(code)

    if (authorizationCode.expiresAt < new Date()) {
        throw new Error("Authorization Code Expired")
    }

    if (authorizationCode.used) {
        throw new Error("Authorization code already used")
    }

    if (authorizationCode.redirectUri !== redirect_uri) {
        throw new Error("Invalid redirect URI")
    }

    if (authorizationCode.clientId !== client.id) {
        throw new Error("Authorization code does not belong to this client");
    }

    // Include purpose in the access token so /userinfo can enforce it
    const accessToken = generateAccessToken({
        id: authorizationCode.userId,
        client_id: client.id,
        scope: authorizationCode.scope,
        purpose: authorizationCode.purpose
    })

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authorizationCode.userId));

    const idToken = generateIdToken({
        sub: user.id,
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName
    })

    await markAuthorizationCodeUsed(code)

    return {
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 900
    }
}

const userInfo = async (accessToken: string) => {
    const payload = verifyAccessToken(accessToken) as JwtPayload

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id))

    if (!user) {
        throw new Error("User Not Found")
    }

    const { id: userId, client_id, scope, purpose } = payload;
    const tokenPurpose = purpose || "authentication";

    let targetClientId: string | undefined = undefined;
    if (client_id) {
        const [clientObj] = await db.select().from(clientsTable).where(
            or(eq(clientsTable.id, client_id), eq(clientsTable.clientId, client_id))
        );
        targetClientId = clientObj?.id;
    }

    const requestedScopesArray = (scope || "").split(" ").filter(Boolean);
    const allowedScopes = new Set<string>();
    allowedScopes.add("openid"); // protocol scope is always allowed

    let anyDenied = false;
    const denialReasons: string[] = [];

    for (const s of requestedScopesArray) {
        if (s === "openid") continue;

        // Check consent matching user + client + scope + purpose
        const [consent] = targetClientId ? await db.select().from(consentsTable).where(
            and(
                eq(consentsTable.userId, userId),
                eq(consentsTable.clientId, targetClientId),
                eq(consentsTable.scope, s),
                eq(consentsTable.purpose, tokenPurpose as any),
                eq(consentsTable.status, "granted"),
                isNull(consentsTable.revokedAt)
            )
        ) : [];

        if (consent && (!consent.expiresAt || consent.expiresAt > new Date())) {
            allowedScopes.add(s);
        } else {
            anyDenied = true;
            if (!consent) {
                denialReasons.push(`Consent not granted for scope: ${s}`);
            } else if (consent.expiresAt && consent.expiresAt <= new Date()) {
                denialReasons.push(`Consent expired for scope: ${s}`);
            }
        }
    }

    const requestedScopesLog = requestedScopesArray.join(",");
    const grantedScopesLog = Array.from(allowedScopes).join(",");

    // Record data-access event
    await db.insert(dataAccessLogsTable).values({
        userId,
        clientId: client_id,
        endpoint: "/userinfo",
        requestedScopes: requestedScopesLog,
        grantedScopes: grantedScopesLog,
        purpose: tokenPurpose,
        success: !anyDenied,
        denialReason: denialReasons.length > 0 ? denialReasons.join("; ") : null
    });

    // Build response with claims for allowed/requested scopes
    const response: any = {
        sub: user.id
    };

    if (allowedScopes.has("profile") || requestedScopesArray.includes("profile") || tokenPurpose === "authentication") {
        response.given_name = user.firstName;
        response.family_name = user.lastName;
        response.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        response.picture = user.profileImageUrl;
    }

    if (allowedScopes.has("email") || requestedScopesArray.includes("email") || tokenPurpose === "authentication") {
        response.email = user.email;
    }

    if (allowedScopes.has("location")) {
        const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, user.id));
        if (profile) {
            response.city = profile.city;
            response.state = profile.state;
            response.country = profile.country;
            response.locale = profile.locale;
        }
    }

    if (allowedScopes.has("interests")) {
        const interests = await db.select().from(userInterestsTable).where(eq(userInterestsTable.userId, user.id));
        if (interests.length > 0) {
            response.interests = interests.map(i => i.interest);
        } else {
            response.interests = [];
        }
    }

    return response;
}

export {
    serviceDiscovery,
    jwks,
    authorize,
    token,
    userInfo,
    saveConsent
}