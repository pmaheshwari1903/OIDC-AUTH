# Maheshwari Auth — Complete Project Structure & Service Flow

---

## TABLE OF CONTENTS

1. [How This Project Was Built (Step by Step)](#how-this-project-was-built)
2. [Complete File Structure](#complete-file-structure)
3. [What Each File Does](#what-each-file-does)
4. [How Files Are Connected](#how-files-are-connected)
5. [Complete Service Flows](#complete-service-flows)
6. [Database Tables](#database-tables)
7. [All API Endpoints](#all-api-endpoints)
8. [Build Process (TS → JS)](#build-process)

---

## HOW THIS PROJECT WAS BUILT

### Phase 0 — Project Foundation (Before Step 1)

These files existed before our 10 steps. They form the base OIDC server.

```
1.  package.json                          ← npm init, install dependencies
2.  tsconfig.json                         ← TypeScript compiler configuration
3.  drizzle.config.ts                     ← Drizzle ORM config (points to DB schemas)
4.  .env                                  ← Environment variables (PORT, DATABASE_URL, secrets)
5.  docker-compose.yml                    ← PostgreSQL container
6.  key-gen.sh                            ← Script to generate RSA keys for JWKS
7.  cert/private.pem, cert/public.pem     ← RSA keys for signing JWTs

8.  src/types/express.d.ts                ← Adds `req.user` to Express Request type
9.  src/common/db/index.ts                ← Database connection + exports all schemas
10. src/common/db/user.schema.ts          ← `users` table
11. src/common/db/clients.schema.ts       ← `clients` table
12. src/common/db/authorization-codes.schema.ts ← `authorization-codes` table
13. src/common/utils/jwt.utils.ts         ← generateAccessToken, verifyAccessToken, etc.
14. src/common/utils/cert.ts              ← Loads RSA key for JWKS
15. src/common/utils/mailer.ts            ← Nodemailer setup for email verification/reset
16. src/common/utils/api-error.ts         ← Error helper
17. src/common/utils/api-response.ts      ← Response helper
18. src/common/middleware/requireAuth.ts   ← JWT auth middleware (reads cookie → verifies → sets req.user)

19. src/modules/auth/auth.schemas.ts      ← Zod schemas for sign-in/sign-up validation
20. src/modules/auth/auth.middlewares.ts   ← Request validators (signIn, signUp, forgotPassword, resetPassword)
21. src/modules/auth/auth.services.ts     ← signUp, signIn, verifyEmail, forgotPassword, resetPassword
22. src/modules/auth/auth.controller.ts   ← HTTP handlers for auth endpoints
23. src/modules/auth/auth.routes.ts       ← POST /sign-in, /sign-up, /logout, etc.

24. src/modules/clients/clients.middlewares.ts ← Request validators for client CRUD
25. src/modules/clients/clients.services.ts   ← createClient, getClients, updateClient, deleteClient, getPublicClientDetails
26. src/modules/clients/clients.controller.ts ← HTTP handlers for client endpoints
27. src/modules/clients/clients.routes.ts     ← POST/GET/PATCH/DELETE /clients

28. src/modules/authorization-codes/authorization-codes.service.ts ← createAuthorizationCode, findAuthorizationCode, markAuthorizationCodeUsed

29. src/modules/oidc/oidc.middlewares.ts  ← Validates /authorize and /token requests
30. src/modules/oidc/oidc.services.ts     ← Core OIDC logic: authorize, token, userInfo, saveConsent
31. src/modules/oidc/oidc.controller.ts   ← HTTP handlers for OIDC endpoints
32. src/modules/oidc/oidc.routes.ts       ← /.well-known/openid-configuration, /authorize, /token, /userinfo, /consent

33. src/index.ts                          ← Express app setup, mounts all routes

34. public/css/style.css                  ← Global styles
35. public/assets/maheshwari-identity-logo.svg ← Logo
36. public/sign-in.html + public/js/sign-in.js ← Login page
37. public/sign-up.html + public/js/sign-up.js ← Register page (redirects from /register)
38. public/register.html                  ← Another register page
39. public/forgot-password.html           ← Forgot password page
40. public/reset-password.html            ← Reset password page
41. public/profile.html + public/js/profile.js ← User profile page
42. public/404.html                       ← Not found page
```

### Step 1 — Generic User Profile & Attributes

```
43. src/common/db/user-profiles.schema.ts   ← `user_profiles` table (city, state, country, locale, location_source, location_precision)
44. src/common/db/user-interests.schema.ts  ← `user_interests` table (userId, interest, category)
    + Updated: src/common/db/index.ts       ← Added exports for new schemas
```

### Step 2 — Scope + Claim Catalog

```
45. src/modules/oidc/oidc.scopes.ts         ← Central catalog: OIDC_SCOPES, SUPPORTED_SCOPES, SUPPORTED_CLAIMS, getClaimsForScopes, isValidScope
    + Updated: src/modules/oidc/oidc.services.ts ← serviceDiscovery returns SUPPORTED_SCOPES/CLAIMS, authorize validates scopes
```

### Step 3 — Consent Database

```
46. src/common/db/consents.schema.ts        ← `consents` table + consentStatusEnum + consentPurposeEnum
    + Updated: src/common/db/index.ts       ← Added export for consents schema
```

### Step 4 — Consent Screen + Authorization Flow

```
47. public/consent.html                     ← Consent screen UI (shows client name, scopes, purpose, Allow/Deny buttons)
48. public/js/consent.js                    ← Fetches client details, displays scopes, handles Allow/Deny
    + Updated: src/modules/oidc/oidc.services.ts   ← authorize checks existing consent, saveConsent creates new consent
    + Updated: src/modules/oidc/oidc.controller.ts ← Added consent handler, authorize redirects to consent screen
    + Updated: src/modules/oidc/oidc.routes.ts     ← Added POST /consent
    + Updated: src/index.ts                        ← Added GET /consent page route
```

### Step 5 — Consent-Aware /userinfo

```
    + Updated: src/modules/oidc/oidc.services.ts ← token() embeds client_id+scope in JWT; userInfo() checks consent per scope, fetches from user_profiles/user_interests
```

### Step 6 — User Consent Management APIs

```
49. src/modules/consents/consents.services.ts   ← getUserConsents, getConsentById, revokeConsent
50. src/modules/consents/consents.controller.ts ← getConsents, getConsent, revokeConsent handlers
51. src/modules/consents/consents.routes.ts     ← GET /consents, GET /consents/:id, DELETE /consents/:id
    + Updated: src/index.ts                     ← Mounted consents route on /api
```

### Step 7 — Data Access Observability + User Access History

```
52. src/common/db/data-access-logs.schema.ts       ← `data_access_logs` table
53. src/modules/data-access/data-access.services.ts ← getUserDataAccess (with client name join)
54. src/modules/data-access/data-access.controller.ts ← getDataAccess handler
55. src/modules/data-access/data-access.routes.ts   ← GET /data-access
56. public/data-access.html                         ← User access history page
57. public/js/data-access.js                        ← Fetches and renders access history
    + Updated: src/common/db/index.ts               ← Added export for data-access-logs schema
    + Updated: src/modules/oidc/oidc.services.ts    ← userInfo() inserts into data_access_logs after consent check
    + Updated: src/index.ts                         ← Mounted data-access route on /api, added /data-access page
```

### Step 8 — Admin Observability Dashboard + Analytics

```
58. src/common/middleware/requireAdmin.ts    ← Admin check middleware (checks req.user.email === "admin@example.com")
59. src/modules/admin/admin.services.ts      ← getObservabilityMetrics (total/success/denied counts, top clients, top scopes, recent)
60. src/modules/admin/admin.controller.ts    ← getObservability handler
61. src/modules/admin/admin.routes.ts        ← GET /admin/observability
62. public/admin.html                        ← Admin dashboard page
63. public/js/admin.js                       ← Fetches and renders dashboard metrics
    + Updated: src/index.ts                  ← Mounted admin route on /api, added /admin page
```

### Step 9 — Purpose-Based Policy + Data Minimization

```
    + Updated: src/common/db/authorization-codes.schema.ts ← Added `purpose` column
    + Updated: src/modules/oidc/oidc.scopes.ts             ← Added SUPPORTED_PURPOSES export
    + Updated: src/modules/authorization-codes/authorization-codes.service.ts ← Accepts and stores purpose
    + Updated: src/modules/oidc/oidc.services.ts           ← authorize/saveConsent/token/userInfo all use purpose
    + Updated: src/modules/oidc/oidc.controller.ts         ← Passes purpose from query/body
    + Updated: public/consent.html                         ← Shows purpose on consent screen
    + Updated: public/js/consent.js                        ← Reads purpose from URL, sends in POST
```

### Step 10 — Rule-Based Anomaly Detection + Documentation

```
64. src/modules/admin/anomaly.config.ts     ← Anomaly thresholds (ACCESS_THRESHOLD, TIME_WINDOW, DENIAL_RATE, SCOPE_SPIKE_MULTIPLIER)
65. src/modules/admin/anomaly.services.ts   ← detectAnomalies (3 rules: high frequency, high denial, scope spike)
66. README.md                               ← Full project documentation
    + Updated: src/modules/admin/admin.controller.ts ← Added getAnomalies handler
    + Updated: src/modules/admin/admin.routes.ts     ← Added GET /admin/anomalies
    + Updated: public/admin.html                     ← Added Security Alerts section
    + Updated: public/js/admin.js                    ← Fetches and renders anomaly alerts
```

---

## COMPLETE FILE STRUCTURE

```
OIDC_AUTH/
│
├── .env                                    # Environment variables
├── .gitignore                              # Git ignore rules
├── package.json                            # NPM dependencies & scripts
├── package-lock.json                       # Locked dependency versions
├── tsconfig.json                           # TypeScript config (src → dist)
├── drizzle.config.ts                       # Drizzle ORM config
├── docker-compose.yml                      # PostgreSQL container
├── key-gen.sh                              # RSA key generation script
├── vercel.json                             # Vercel deployment config
├── apply_migration.js                      # Manual migration helper
├── test-scopes.js                          # Scope testing script
├── README.md                               # Project documentation
│
├── cert/                                   # RSA keys for JWT signing
│   ├── private.pem
│   └── public.pem
│
├── drizzle/                                # Auto-generated SQL migration files
│   ├── 0000_*.sql                          # Initial tables
│   ├── 0001_*.sql                          # user_profiles, user_interests
│   ├── 0002_*.sql                          # consents
│   ├── 0003_*.sql                          # data_access_logs
│   └── 0004_*.sql                          # authorization-codes.purpose column
│
├── src/                                    # -------- TypeScript Source --------
│   │
│   ├── index.ts                            # EXPRESS APP ENTRY POINT
│   │                                       #   - Creates Express app
│   │                                       #   - Mounts all routes
│   │                                       #   - Serves static HTML pages
│   │
│   ├── types/
│   │   └── express.d.ts                    # Extends Express Request with `user` property
│   │
│   ├── common/                             # ---- SHARED / REUSABLE CODE ----
│   │   │
│   │   ├── db/                             # Database schemas & connection
│   │   │   ├── index.ts                    # Creates DB connection, re-exports all schemas
│   │   │   ├── user.schema.ts              # `users` table
│   │   │   ├── clients.schema.ts           # `clients` table
│   │   │   ├── authorization-codes.schema.ts # `authorization-codes` table
│   │   │   ├── user-profiles.schema.ts     # `user_profiles` table (Step 1)
│   │   │   ├── user-interests.schema.ts    # `user_interests` table (Step 1)
│   │   │   ├── consents.schema.ts          # `consents` table + enums (Step 3)
│   │   │   └── data-access-logs.schema.ts  # `data_access_logs` table (Step 7)
│   │   │
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts              # JWT authentication middleware
│   │   │   └── requireAdmin.ts             # Admin authorization middleware (Step 8)
│   │   │
│   │   └── utils/
│   │       ├── jwt.utils.ts                # Token generation/verification
│   │       ├── cert.ts                     # JWKS key loading
│   │       ├── mailer.ts                   # Email sending (Nodemailer)
│   │       ├── api-error.ts                # Error helper
│   │       └── api-response.ts             # Response helper
│   │
│   ├── modules/                            # ---- FEATURE MODULES ----
│   │   │
│   │   ├── auth/                           # User Authentication
│   │   │   ├── auth.schemas.ts             # Zod validation schemas
│   │   │   ├── auth.middlewares.ts          # Request validators
│   │   │   ├── auth.services.ts            # signUp, signIn, verifyEmail, forgotPassword, resetPassword
│   │   │   ├── auth.controller.ts          # HTTP handlers
│   │   │   └── auth.routes.ts              # Routes: /api/auth/*
│   │   │
│   │   ├── clients/                        # Client Application Management
│   │   │   ├── clients.middlewares.ts       # Request validators
│   │   │   ├── clients.services.ts          # CRUD operations + getPublicClientDetails
│   │   │   ├── clients.controller.ts        # HTTP handlers
│   │   │   └── clients.routes.ts            # Routes: /api/clients/*
│   │   │
│   │   ├── authorization-codes/            # Auth Code Management
│   │   │   └── authorization-codes.service.ts # create, find, markUsed
│   │   │
│   │   ├── oidc/                           # Core OIDC Protocol (Steps 2, 4, 5, 9)
│   │   │   ├── oidc.scopes.ts              # OIDC_SCOPES catalog, SUPPORTED_PURPOSES
│   │   │   ├── oidc.middlewares.ts          # /authorize and /token validators
│   │   │   ├── oidc.services.ts            # authorize, saveConsent, token, userInfo, serviceDiscovery, jwks
│   │   │   ├── oidc.controller.ts          # HTTP handlers
│   │   │   └── oidc.routes.ts              # Routes: /authorize, /token, /userinfo, /consent, /.well-known/*
│   │   │
│   │   ├── consents/                       # User Consent Management (Step 6)
│   │   │   ├── consents.services.ts         # getUserConsents, getConsentById, revokeConsent
│   │   │   ├── consents.controller.ts       # HTTP handlers
│   │   │   └── consents.routes.ts           # Routes: /api/consents/*
│   │   │
│   │   ├── data-access/                    # User Data Access History (Step 7)
│   │   │   ├── data-access.services.ts      # getUserDataAccess
│   │   │   ├── data-access.controller.ts    # HTTP handlers
│   │   │   └── data-access.routes.ts        # Routes: /api/data-access
│   │   │
│   │   └── admin/                          # Admin Dashboard + Anomaly Detection (Steps 8, 10)
│   │       ├── anomaly.config.ts            # Anomaly threshold constants
│   │       ├── anomaly.services.ts          # detectAnomalies (3 rules)
│   │       ├── admin.services.ts            # getObservabilityMetrics
│   │       ├── admin.controller.ts          # HTTP handlers
│   │       └── admin.routes.ts              # Routes: /api/admin/*
│   │
│   └── scripts/                            # Utility scripts
│
├── public/                                 # -------- Frontend (Static HTML/CSS/JS) --------
│   │
│   ├── css/style.css                       # Global styles
│   ├── assets/maheshwari-identity-logo.svg # Logo
│   │
│   ├── sign-in.html                        # Login page
│   ├── sign-up.html                        # Register page
│   ├── register.html                       # Alternate register page
│   ├── forgot-password.html                # Forgot password page
│   ├── reset-password.html                 # Reset password page
│   ├── profile.html                        # User profile page
│   ├── consent.html                        # Consent screen (Step 4)
│   ├── data-access.html                    # User data access history (Step 7)
│   ├── admin.html                          # Admin dashboard (Step 8)
│   ├── 404.html                            # Not found page
│   │
│   └── js/
│       ├── sign-in.js                      # Login form logic
│       ├── sign-up.js                      # Register form logic
│       ├── profile.js                      # Profile page logic
│       ├── consent.js                      # Consent screen logic (Step 4)
│       ├── data-access.js                  # Data access history page logic (Step 7)
│       └── admin.js                        # Admin dashboard logic (Step 8 + 10)
│
└── dist/                                   # -------- Compiled JS (auto-generated by tsc) --------
    └── (mirrors src/ structure but .js files)
```

---

## WHAT EACH FILE DOES

### Configuration Files

| File | What It Does |
|---|---|
| `package.json` | Lists all npm dependencies (express, drizzle-orm, jsonwebtoken, bcrypt, zod, etc.) and scripts (`dev`, `build`, `db:generate`, `db:migrate`) |
| `tsconfig.json` | Tells TypeScript: source is in `src/`, output goes to `dist/`, use ESNext modules |
| `drizzle.config.ts` | Tells Drizzle ORM: schemas are in `src/common/db/*.schema.ts`, migrations go to `drizzle/` folder, database is PostgreSQL |
| `.env` | Stores `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ISSUER` |
| `vercel.json` | Deployment config for Vercel |

### Type Definitions

| File | What It Does |
|---|---|
| `src/types/express.d.ts` | Adds `user` property to Express `Request` so we can do `req.user` after authentication without TypeScript errors |

### Database Connection & Schemas

| File | What It Does |
|---|---|
| `src/common/db/index.ts` | Creates the database connection using `drizzle(DATABASE_URL)` and re-exports ALL table schemas so other files can import from one place: `import { db, usersTable, clientsTable, ... } from '../../common/db/index.js'` |
| `src/common/db/user.schema.ts` | Defines `users` table: `id`, `firstName`, `lastName`, `profileImageUrl`, `email`, `emailVerified`, `password`, `salt`, `createdAt`, `updatedAt` |
| `src/common/db/clients.schema.ts` | Defines `clients` table: `id`, `clientId`, `clientSecret`, `name`, `redirectUri`, `allowedScopes`, `createdAt`, `updatedAt` |
| `src/common/db/authorization-codes.schema.ts` | Defines `authorization-codes` table: `id`, `code`, `clientId` (FK→clients), `userId` (FK→users), `redirectUri`, `scope`, `purpose`, `expiresAt`, `used`, `createdAt` |
| `src/common/db/user-profiles.schema.ts` | Defines `user_profiles` table: `id`, `userId` (FK→users), `city`, `state`, `country`, `locale`, `timezone`, `locationSource`, `locationPrecision`, etc. |
| `src/common/db/user-interests.schema.ts` | Defines `user_interests` table: `id`, `userId` (FK→users), `interest`, `category` |
| `src/common/db/consents.schema.ts` | Defines `consents` table: `id`, `userId` (FK→users), `clientId` (FK→clients), `scope`, `purpose` (enum), `status` (enum), `grantedAt`, `revokedAt`, `expiresAt`, `createdAt`, `updatedAt`. Also defines `consentStatusEnum` (granted/revoked/expired) and `consentPurposeEnum` (authentication/personalization/recommendations/analytics/marketing/advertising) |
| `src/common/db/data-access-logs.schema.ts` | Defines `data_access_logs` table: `id`, `userId` (FK→users), `clientId` (FK→clients), `endpoint`, `requestedScopes`, `grantedScopes`, `purpose`, `success`, `denialReason`, `createdAt` |

### Middleware

| File | What It Does |
|---|---|
| `src/common/middleware/requireAuth.ts` | Reads `accessToken` from cookies → calls `verifyAccessToken()` → looks up user in DB → sets `req.user = user` → calls `next()`. If anything fails → returns `401 Unauthorized` |
| `src/common/middleware/requireAdmin.ts` | Checks if `req.user.email === "admin@example.com"`. If not → returns `403 Forbidden`. Must be used AFTER `requireAuth` |

### Utilities

| File | What It Does |
|---|---|
| `src/common/utils/jwt.utils.ts` | `generateAccessToken(payload)` → signs JWT with ACCESS_SECRET (15min expiry). `verifyAccessToken(token)` → verifies and returns payload. Same pattern for refresh tokens and ID tokens |
| `src/common/utils/cert.ts` | Loads the RSA private key from `cert/private.pem` and creates a JWK key for the JWKS endpoint |
| `src/common/utils/mailer.ts` | Configures Nodemailer transporter and provides `sendVerificationEmail()` and `sendPasswordResetEmail()` functions |
| `src/common/utils/api-error.ts` | Helper class for structured API errors |
| `src/common/utils/api-response.ts` | Helper for structured API responses |

### Auth Module

| File | What It Does |
|---|---|
| `auth.schemas.ts` | Zod schemas: `signInSchema` (email + password), `signUpSchema` (email + password + firstName + lastName) |
| `auth.middlewares.ts` | `validateSignInRequest` / `validateSignUpRequest` / `validateForgotPasswordRequest` / `validateResetPasswordRequest` — parse request body with Zod, return 400 if invalid |
| `auth.services.ts` | `signUp()` → hash password → insert into users → send verification email. `signIn()` → find user → compare password → generate access token → set cookie. `verifyEmail()` → mark email verified. `forgotPassword()` → generate reset token → send email. `resetPassword()` → verify token → update password |
| `auth.controller.ts` | HTTP handlers that call service functions and return responses |
| `auth.routes.ts` | `POST /api/auth/sign-in`, `POST /api/auth/sign-up`, `GET /api/auth/verify-email`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |

### Clients Module

| File | What It Does |
|---|---|
| `clients.middlewares.ts` | Validates create/update client request bodies |
| `clients.services.ts` | `createClient()` → generates clientId + clientSecret → inserts into clients table. `getClients()`, `getClientById()`, `updateClient()`, `deleteClient()`. `getPublicClientDetails(clientId)` → returns only name and allowed scopes (used by consent screen) |
| `clients.controller.ts` | HTTP handlers for client CRUD |
| `clients.routes.ts` | `POST /api/clients`, `GET /api/clients`, `GET /api/clients/public/:clientId`, `GET /api/clients/:id`, `PATCH /api/clients/:id`, `DELETE /api/clients/:id` |

### Authorization Codes Module

| File | What It Does |
|---|---|
| `authorization-codes.service.ts` | `createAuthorizationCode({clientId, userId, redirectUri, scope, purpose})` → generates random hex code → inserts with 5-min expiry → returns code. `findAuthorizationCode(code)` → looks up by code. `markAuthorizationCodeUsed(code)` → sets `used = true` |

### OIDC Module (Core Protocol)

| File | What It Does |
|---|---|
| `oidc.scopes.ts` | Central catalog. `OIDC_SCOPES` maps each scope to its claims (profile→given_name,family_name,picture; email→email; location→city,state,country,locale; interests→interests). Exports `SUPPORTED_SCOPES`, `SUPPORTED_CLAIMS`, `SUPPORTED_PURPOSES`, `getClaimsForScopes()`, `isValidScope()` |
| `oidc.middlewares.ts` | Validates `/authorize` query params (client_id, redirect_uri, response_type, scope) and `/token` body params (client_id, client_secret, code, redirect_uri) |
| `oidc.services.ts` | **THE MOST IMPORTANT FILE.** Contains: `serviceDiscovery()` → returns OIDC metadata. `jwks()` → returns public key. `authorize()` → validates client + redirect URI + scopes + purpose → checks existing consent → if no consent, returns `requiresConsent: true` → if consent exists, creates auth code. `saveConsent()` → inserts consent record → creates auth code. `token()` → validates client secret → validates auth code → generates access token (with userId, client_id, scope, purpose) + ID token. `userInfo()` → verifies access token → for each scope: checks consent (user+client+scope+purpose+active) → logs access event → returns only allowed claims |
| `oidc.controller.ts` | `serviceDiscovery` handler. `jwks` handler. `authorize` handler → if user not logged in, redirects to /home → if logged in, calls service → if needs consent, redirects to /consent. `token` handler. `userInfo` handler → extracts Bearer token from Authorization header. `consent` handler → if deny, redirects with error → if allow, calls saveConsent → redirects with auth code |
| `oidc.routes.ts` | `GET /.well-known/openid-configuration`, `GET /.well-known/jwks.json`, `GET /authorize`, `POST /token`, `POST /consent`, `GET /userinfo` |

### Consents Module (Step 6)

| File | What It Does |
|---|---|
| `consents.services.ts` | `getUserConsents(userId)` → joins consents with clients → returns all consents for this user with client name. `getConsentById(userId, consentId)` → returns one consent (only if it belongs to this user). `revokeConsent(userId, consentId)` → sets `status = "revoked"`, `revokedAt = now` (soft delete) |
| `consents.controller.ts` | HTTP handlers, all extract `userId` from `req.user.id` (never from request params) |
| `consents.routes.ts` | `GET /api/consents`, `GET /api/consents/:id`, `DELETE /api/consents/:id` — all protected by `requireAuth` |

### Data Access Module (Step 7)

| File | What It Does |
|---|---|
| `data-access.services.ts` | `getUserDataAccess(userId)` → joins data_access_logs with clients → returns user's access history ordered by newest first → splits comma-separated scopes into arrays |
| `data-access.controller.ts` | HTTP handler, extracts `userId` from `req.user.id` |
| `data-access.routes.ts` | `GET /api/data-access` — protected by `requireAuth` |

### Admin Module (Steps 8, 10)

| File | What It Does |
|---|---|
| `anomaly.config.ts` | Constants: `ANOMALY_ACCESS_THRESHOLD = 100`, `ANOMALY_TIME_WINDOW_MINUTES = 5`, `ANOMALY_DENIAL_RATE = 0.70`, `ANOMALY_SCOPE_SPIKE_MULTIPLIER = 2`, `ANOMALY_MIN_REQUESTS = 10` |
| `anomaly.services.ts` | `detectAnomalies()` → queries data_access_logs within time window → Rule 1: if client > 100 requests in 5 min → HIGH_ACCESS_FREQUENCY. Rule 2: if ≥70% denied → HIGH_DENIAL_RATE. Rule 3: if recent distinct scopes ≥ 2x historical → SCOPE_SPIKE |
| `admin.services.ts` | `getObservabilityMetrics()` → COUNT total/success/denied → COUNT DISTINCT clients → GROUP BY client (top 5) → unnest scopes (top 5) → recent 10 events |
| `admin.controller.ts` | `getObservability` handler + `getAnomalies` handler |
| `admin.routes.ts` | `GET /api/admin/observability`, `GET /api/admin/anomalies` — both protected by `requireAuth` + `requireAdmin` |

### App Entry Point

| File | What It Does |
|---|---|
| `src/index.ts` | Creates Express app → adds `express.json()`, `express.static("public")`, `cookieParser()` → serves HTML pages (/, /home, /register, /forgot-password, /consent, /data-access, /admin, /api/auth/reset-password) → mounts route modules (`/api/auth`, `/api` for clients/consents/data-access/admin, `/` for OIDC) → 404 handler → starts server |

### Frontend Files

| File | What It Does |
|---|---|
| `consent.html` + `consent.js` | Reads query params (client_id, scope, purpose, redirect_uri, state) → fetches client name from `/api/clients/public/:clientId` → displays scopes and purpose → Allow button POSTs to `/consent` → Deny button redirects with `error=access_denied` |
| `data-access.html` + `data-access.js` | Fetches `GET /api/data-access` → renders cards showing client name, requested scopes, granted scopes, purpose, status |
| `admin.html` + `admin.js` | Fetches `GET /api/admin/observability` → renders stat cards + top clients table + top scopes table + recent events. Then fetches `GET /api/admin/anomalies` → renders security alert cards |

---

## HOW FILES ARE CONNECTED

### Connection Map

```
src/index.ts
    │
    ├── imports → auth.routes.ts ─────────→ auth.controller.ts ──→ auth.services.ts ──→ db (usersTable)
    │                                            │                       │
    │                                            │                       └→ jwt.utils.ts
    │                                            └→ auth.middlewares.ts ──→ auth.schemas.ts
    │
    ├── imports → clients.routes.ts ──────→ clients.controller.ts → clients.services.ts → db (clientsTable)
    │                                            └→ clients.middlewares.ts
    │
    ├── imports → oidc.routes.ts ─────────→ oidc.controller.ts ──→ oidc.services.ts
    │                │                                                  │
    │                └→ oidc.middlewares.ts                              ├→ db (clientsTable, usersTable, consentsTable,
    │                                                                   │      userProfilesTable, userInterestsTable,
    │                                                                   │      dataAccessLogsTable)
    │                                                                   ├→ authorization-codes.service.ts → db (authorizationCodesTable)
    │                                                                   ├→ jwt.utils.ts
    │                                                                   ├→ oidc.scopes.ts (SUPPORTED_SCOPES, SUPPORTED_PURPOSES)
    │                                                                   └→ consents.schema.ts (consentsTable)
    │
    ├── imports → consents.routes.ts ─────→ consents.controller.ts → consents.services.ts → db (consentsTable + clientsTable join)
    │                │
    │                └→ requireAuth.ts
    │
    ├── imports → data-access.routes.ts ──→ data-access.controller.ts → data-access.services.ts → db (dataAccessLogsTable + clientsTable join)
    │                │
    │                └→ requireAuth.ts
    │
    └── imports → admin.routes.ts ────────→ admin.controller.ts
                     │                          ├→ admin.services.ts ──→ db (dataAccessLogsTable + clientsTable)
                     ├→ requireAuth.ts          └→ anomaly.services.ts → db (dataAccessLogsTable + clientsTable)
                     └→ requireAdmin.ts                                      └→ anomaly.config.ts (thresholds)
```

### Database Schema Connections

```
users
  │
  ├──(1:1)──→ user_profiles         (user_profiles.user_id → users.id)
  ├──(1:N)──→ user_interests        (user_interests.user_id → users.id)
  ├──(1:N)──→ consents              (consents.user_id → users.id)
  ├──(1:N)──→ authorization-codes   (authorization-codes.user_id → users.id)
  └──(1:N)──→ data_access_logs      (data_access_logs.user_id → users.id)

clients
  │
  ├──(1:N)──→ consents              (consents.client_id → clients.id)
  ├──(1:N)──→ authorization-codes   (authorization-codes.client_id → clients.id)
  └──(1:N)──→ data_access_logs      (data_access_logs.client_id → clients.id)
```

---

## COMPLETE SERVICE FLOWS

### Flow 1: User Sign Up

```
Browser                         Server
  │                               │
  │  POST /api/auth/sign-up       │
  │  {email, password, ...}       │
  │──────────────────────────────→│
  │                               │  auth.routes.ts
  │                               │       │
  │                               │       ▼
  │                               │  validateSignUpRequest (auth.middlewares.ts)
  │                               │       │ Zod validates body
  │                               │       ▼
  │                               │  signUp (auth.controller.ts)
  │                               │       │
  │                               │       ▼
  │                               │  signUp (auth.services.ts)
  │                               │       │
  │                               │       ├→ Hash password with bcrypt
  │                               │       ├→ INSERT into usersTable
  │                               │       ├→ Send verification email (mailer.ts)
  │                               │       └→ Return success
  │                               │
  │  { message: "User created" }  │
  │←──────────────────────────────│
```

### Flow 2: User Sign In

```
Browser                         Server
  │                               │
  │  POST /api/auth/sign-in       │
  │  {email, password}            │
  │──────────────────────────────→│
  │                               │  auth.routes.ts → validateSignInRequest → signIn controller → signIn service
  │                               │       │
  │                               │       ├→ Find user by email (usersTable)
  │                               │       ├→ Compare password with bcrypt
  │                               │       ├→ generateAccessToken({id: user.id}) (jwt.utils.ts)
  │                               │       └→ Set cookie: accessToken=<JWT>
  │                               │
  │  Set-Cookie: accessToken=...  │
  │  { message: "Login success" } │
  │←──────────────────────────────│
```

### Flow 3: OIDC Authorization (Full Flow)

```
Third-Party App                 Browser                         Maheshwari Auth Server
     │                            │                                    │
     │  Redirect user to:         │                                    │
     │  /authorize?               │                                    │
     │    client_id=abc           │                                    │
     │    redirect_uri=https://.. │                                    │
     │    response_type=code      │                                    │
     │    scope=openid profile    │                                    │
     │    purpose=personalization │                                    │
     │    state=xyz               │                                    │
     │───────────────────────────→│                                    │
     │                            │  GET /authorize?...                │
     │                            │───────────────────────────────────→│
     │                            │                                    │
     │                            │           ┌────────────────────────┤
     │                            │           │ oidc.controller.ts     │
     │                            │           │ authorize()            │
     │                            │           │                        │
     │                            │           │ 1. Read accessToken    │
     │                            │           │    from cookie         │
     │                            │           │                        │
     │                            │           │ 2. If no cookie →      │
     │                            │           │    redirect to /home   │
     │                            │           │    (login page)        │
     │                            │           │                        │
     │                            │           │ 3. Verify JWT →        │
     │                            │           │    find user in DB     │
     │                            │           │                        │
     │                            │           │ 4. Call oidc.services  │
     │                            │           │    .authorize()        │
     │                            │           │    ├→ Find client      │
     │                            │           │    ├→ Validate redirect│
     │                            │           │    ├→ Validate scopes  │
     │                            │           │    ├→ Resolve purpose  │
     │                            │           │    ├→ Check existing   │
     │                            │           │    │  consent in DB    │
     │                            │           │    │  (user+client+    │
     │                            │           │    │   scope+purpose)  │
     │                            │           │    │                   │
     │                            │           │    ├→ If NO consent:   │
     │                            │           │    │  return           │
     │                            │           │    │  requiresConsent  │
     │                            │           │    │  = true           │
     │                            │           │    │                   │
     │                            │           │    └→ If consent       │
     │                            │           │       EXISTS:          │
     │                            │           │       create auth code │
     │                            │           │       → redirect to    │
     │                            │           │       client           │
     │                            │           └────────────────────────┘
     │                            │                                    │
     │                            │  (If requiresConsent = true)       │
     │                            │  Redirect to /consent?...          │
     │                            │←───────────────────────────────────│
     │                            │                                    │
     │                            │  consent.html loads                │
     │                            │  consent.js runs:                  │
     │                            │  ├→ Reads query params             │
     │                            │  ├→ Fetches client name from       │
     │                            │  │  GET /api/clients/public/:id    │
     │                            │  ├→ Displays scopes + purpose      │
     │                            │  └→ Shows Allow / Deny buttons     │
     │                            │                                    │
     │                            │  User clicks "Allow"               │
     │                            │                                    │
     │                            │  POST /consent                     │
     │                            │  {client_id, scope, redirect_uri,  │
     │                            │   state, decision:"allow", purpose}│
     │                            │───────────────────────────────────→│
     │                            │                                    │
     │                            │           ┌────────────────────────┤
     │                            │           │ consent controller     │
     │                            │           │                        │
     │                            │           │ 1. Verify user JWT     │
     │                            │           │ 2. Call saveConsent()   │
     │                            │           │    ├→ Find client      │
     │                            │           │    ├→ Validate redirect│
     │                            │           │    ├→ Resolve purpose  │
     │                            │           │    ├→ INSERT consent   │
     │                            │           │    │  (user+client+    │
     │                            │           │    │   scope+purpose)  │
     │                            │           │    └→ Create auth code │
     │                            │           │       (with purpose)   │
     │                            │           │                        │
     │                            │           │ 3. Return redirectUri  │
     │                            │           │    with ?code=abc123   │
     │                            │           └────────────────────────┘
     │                            │                                    │
     │                            │  { redirectUri: "https://..?code=.."}
     │                            │←───────────────────────────────────│
     │                            │                                    │
     │  Browser redirects to:     │                                    │
     │  https://client.com/       │                                    │
     │    callback?code=abc123    │                                    │
     │    &state=xyz              │                                    │
     │←───────────────────────────│                                    │
```

### Flow 4: Token Exchange

```
Third-Party App Server                    Maheshwari Auth Server
     │                                           │
     │  POST /token                              │
     │  {client_id, client_secret,               │
     │   code, redirect_uri}                     │
     │──────────────────────────────────────────→│
     │                                           │  oidc.routes → validateTokenRequest → token controller → token service
     │                                           │       │
     │                                           │       ├→ Find client by client_id
     │                                           │       ├→ Hash client_secret → compare with DB
     │                                           │       ├→ Find authorization code
     │                                           │       ├→ Check: not expired, not used, redirect matches, client matches
     │                                           │       ├→ generateAccessToken({id, client_id, scope, purpose})
     │                                           │       ├→ generateIdToken({sub, email, given_name, family_name})
     │                                           │       └→ Mark auth code as used
     │                                           │
     │  { access_token, id_token,                │
     │    token_type: "Bearer",                  │
     │    expires_in: 900 }                      │
     │←──────────────────────────────────────────│
```

### Flow 5: UserInfo (Consent-Aware + Purpose-Based + Data Minimization + Logging)

```
Third-Party App Server                    Maheshwari Auth Server
     │                                           │
     │  GET /userinfo                            │
     │  Authorization: Bearer <access_token>     │
     │──────────────────────────────────────────→│
     │                                           │  oidc.routes → userInfo controller → userInfo service
     │                                           │       │
     │                                           │       ├→ verifyAccessToken(token)
     │                                           │       │  Extracts: { id, client_id, scope, purpose }
     │                                           │       │
     │                                           │       ├→ Find user from usersTable
     │                                           │       │
     │                                           │       ├→ Split scope string: ["openid", "profile", "location"]
     │                                           │       │
     │                                           │       ├→ For each scope (skip "openid"):
     │                                           │       │    │
     │                                           │       │    ├→ Query consentsTable WHERE:
     │                                           │       │    │    userId = token.id
     │                                           │       │    │    clientId = token.client_id
     │                                           │       │    │    scope = current scope
     │                                           │       │    │    purpose = token.purpose    ← PURPOSE CHECK
     │                                           │       │    │    status = "granted"
     │                                           │       │    │    revokedAt IS NULL
     │                                           │       │    │
     │                                           │       │    ├→ If consent found AND not expired
     │                                           │       │    │    → add to allowedScopes
     │                                           │       │    │
     │                                           │       │    └→ If NO consent or expired
     │                                           │       │         → mark as denied (with reason)
     │                                           │       │
     │                                           │       ├→ INSERT into data_access_logs:    ← OBSERVABILITY
     │                                           │       │    { userId, clientId, endpoint,
     │                                           │       │      requestedScopes, grantedScopes,
     │                                           │       │      purpose, success, denialReason }
     │                                           │       │
     │                                           │       ├→ Build response (DATA MINIMIZATION):
     │                                           │       │    { sub: user.id }               ← always
     │                                           │       │    IF "profile" allowed:
     │                                           │       │      + given_name, family_name, picture
     │                                           │       │    IF "email" allowed:
     │                                           │       │      + email
     │                                           │       │    IF "location" allowed:
     │                                           │       │      + query user_profiles → city, state, country, locale
     │                                           │       │    IF "interests" allowed:
     │                                           │       │      + query user_interests → interests[]
     │                                           │       │
     │                                           │       └→ Return response
     │                                           │
     │  { sub, given_name, city, ... }           │  ← Only allowed claims!
     │←──────────────────────────────────────────│
```

### Flow 6: User Views/Revokes Consent

```
Browser                                  Server
  │                                        │
  │  GET /api/consents                     │
  │  Cookie: accessToken=...               │
  │───────────────────────────────────────→│
  │                                        │  requireAuth → consents.controller → consents.services
  │                                        │  getUserConsents(req.user.id) → JOIN consents + clients
  │                                        │
  │  { consents: [{id, clientName,         │
  │    scope, purpose, status, ...}] }     │
  │←───────────────────────────────────────│
  │                                        │
  │  DELETE /api/consents/:id              │  ← User revokes
  │───────────────────────────────────────→│
  │                                        │  revokeConsent(userId, consentId)
  │                                        │  → Checks consent belongs to user
  │                                        │  → UPDATE status = "revoked", revokedAt = now()
  │                                        │
  │  { message: "Consent revoked" }        │
  │←───────────────────────────────────────│
```

### Flow 7: Admin Dashboard

```
Admin Browser                            Server
  │                                        │
  │  GET /api/admin/observability          │
  │  Cookie: accessToken=...               │
  │───────────────────────────────────────→│
  │                                        │  requireAuth → requireAdmin → admin.controller
  │                                        │  getObservabilityMetrics() → queries data_access_logs
  │                                        │
  │  { totalAccesses, successfulAccesses,  │
  │    deniedAccesses, activeClients,      │
  │    topClients, topScopes,              │
  │    recentAccesses }                    │
  │←───────────────────────────────────────│
  │                                        │
  │  GET /api/admin/anomalies              │
  │───────────────────────────────────────→│
  │                                        │  requireAuth → requireAdmin → admin.controller
  │                                        │  detectAnomalies() → queries data_access_logs
  │                                        │  → applies 3 rules → returns anomalies
  │                                        │
  │  { anomalies: [{clientName, type,      │
  │    description, severity, ...}] }      │
  │←───────────────────────────────────────│
```

---

## DATABASE TABLES

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id (UUID PK)                        │
│ first_name                          │
│ last_name                           │
│ profile_image_url                   │
│ email (unique, required)            │
│ email_verified (boolean)            │
│ password (hashed)                   │
│ salt                                │
│ created_at                          │
│ updated_at                          │
└──────────┬──────────────────────────┘
           │
    ┌──────┼──────────────┬──────────────────┬───────────────────┐
    │      │              │                  │                   │
    ▼      ▼              ▼                  ▼                   ▼
┌────────────┐  ┌──────────────┐  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐
│user_profiles│  │user_interests│  │    consents      │  │authorization- │  │data_access_logs  │
├────────────┤  ├──────────────┤  ├──────────────────┤  │   codes       │  ├──────────────────┤
│id (PK)     │  │id (PK)       │  │id (PK)           │  ├───────────────┤  │id (PK)           │
│user_id(FK) │  │user_id (FK)  │  │user_id (FK)      │  │id (PK)        │  │user_id (FK)      │
│city        │  │interest      │  │client_id (FK)    │  │code (unique)  │  │client_id (FK)    │
│state       │  │category      │  │scope             │  │client_id (FK) │  │endpoint          │
│country     │  └──────────────┘  │purpose (enum)    │  │user_id (FK)   │  │requested_scopes  │
│locale      │                    │status (enum)     │  │redirect_uri   │  │granted_scopes    │
│timezone    │                    │granted_at        │  │scope          │  │purpose           │
│location_   │                    │revoked_at        │  │purpose        │  │success (boolean) │
│  source    │                    │expires_at        │  │expires_at     │  │denial_reason     │
│location_   │                    │created_at        │  │used (boolean) │  │created_at        │
│  precision │                    │updated_at        │  │created_at     │  └──────────────────┘
│created_at  │                    └──────────────────┘  └───────────────┘
│updated_at  │                           │                     │
└────────────┘                           │                     │
                                         └─────────┬──────────┘
                                                   │
                                    ┌──────────────┴───────┐
                                    │       clients        │
                                    ├──────────────────────┤
                                    │ id (UUID PK)         │
                                    │ client_id (public)   │
                                    │ client_secret(hashed)│
                                    │ name                 │
                                    │ redirect_uri         │
                                    │ allowed_scopes       │
                                    │ created_at           │
                                    │ updated_at           │
                                    └──────────────────────┘
```

---

## ALL API ENDPOINTS

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| POST | `/api/auth/sign-up` | No | Register a new user |
| POST | `/api/auth/sign-in` | No | Login, sets accessToken cookie |
| GET | `/api/auth/verify-email` | No | Verify email via token link |
| POST | `/api/auth/logout` | Yes | Clears accessToken cookie |
| POST | `/api/auth/forgot-password` | No | Sends password reset email |
| POST | `/api/auth/reset-password` | No | Resets password via token |

### Client Management (`/api/clients`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| POST | `/api/clients` | No | Register a new OIDC client |
| GET | `/api/clients` | No | List all clients |
| GET | `/api/clients/public/:clientId` | No | Get client name (for consent screen) |
| GET | `/api/clients/:id` | No | Get client details |
| PATCH | `/api/clients/:id` | No | Update client |
| DELETE | `/api/clients/:id` | No | Delete client |

### OIDC Protocol (`/`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| GET | `/.well-known/openid-configuration` | No | OIDC service discovery |
| GET | `/.well-known/jwks.json` | No | Public signing keys |
| GET | `/authorize` | Cookie | Start authorization flow |
| POST | `/token` | Client Secret | Exchange auth code for tokens |
| POST | `/consent` | Cookie | Save user consent decision |
| GET | `/userinfo` | Bearer Token | Get user claims (consent-aware) |

### User Consent Management (`/api/consents`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| GET | `/api/consents` | Cookie | List user's consents |
| GET | `/api/consents/:id` | Cookie | Get single consent |
| DELETE | `/api/consents/:id` | Cookie | Revoke consent (soft delete) |

### User Data Access History (`/api/data-access`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| GET | `/api/data-access` | Cookie | View who accessed your data |

### Admin (`/api/admin`)
| Method | Endpoint | Auth | What It Does |
|---|---|---|---|
| GET | `/api/admin/observability` | Admin | Dashboard metrics |
| GET | `/api/admin/anomalies` | Admin | Security anomaly alerts |

### HTML Pages
| URL | File Served | What It Shows |
|---|---|---|
| `/home` | `sign-in.html` | Login form |
| `/register` | `register.html` | Register form |
| `/forgot-password` | `forgot-password.html` | Forgot password form |
| `/api/auth/reset-password` | `reset-password.html` | Reset password form |
| `/consent` | `consent.html` | OIDC consent screen |
| `/data-access` | `data-access.html` | User's access history |
| `/admin` | `admin.html` | Admin dashboard |

---

## BUILD PROCESS

### TypeScript → JavaScript

```
1. You write code in:     src/*.ts
2. Run:                   npm run build    (which runs: tsc)
3. TypeScript compiles to: dist/*.js       (mirrors src/ structure)
4. Server runs from:      dist/index.js
```

### Development

```
npm run dev
  → runs tsc-watch
  → watches src/ for changes
  → auto-compiles to dist/
  → auto-restarts node dist/index
```

### Database Migrations

```
1. You define schemas in:   src/common/db/*.schema.ts
2. Run:                     npm run db:generate    (drizzle-kit generate)
3. Drizzle creates SQL in:  drizzle/0001_*.sql, 0002_*.sql, etc.
4. Run:                     npm run db:migrate     (drizzle-kit migrate)
5. Tables are created/updated in PostgreSQL
```

### Route Mounting Order in index.ts

```typescript
app.use('/api/auth', authRoute)        // /api/auth/sign-in, /api/auth/sign-up, etc.
app.use('/api', clientRoute)           // /api/clients, /api/clients/:id, etc.
app.use('/api', consentsRoute)         // /api/consents, /api/consents/:id
app.use('/api', dataAccessRoute)       // /api/data-access
app.use('/api', adminRoute)            // /api/admin/observability, /api/admin/anomalies
app.use('/', oidcRoute)                // /authorize, /token, /userinfo, /consent, /.well-known/*
```

The OIDC route is mounted LAST on `/` because it has broad path matching.
