# Maheshwari Auth

A generic, domain-agnostic OpenID Connect (OIDC) authentication and authorization platform built by **Maheshwari Auth**. Third-party applications (food delivery, fitness, e-commerce, OTT, education, travel, etc.) can use this service to authenticate users and request specific user information — with full user consent, purpose-based privacy controls, data minimization, access observability, and rule-based anomaly detection.

---

## Architecture

```
User (Browser)
     │
     ▼
Maheshwari Auth Server (Express + PostgreSQL)
     │
     ▼
Third-Party Client Application
```

**Data flow:**

```
Client requests scopes (e.g. profile, email, location)
     ↓
User authenticates (signup/login)
     ↓
User sees consent screen (scopes + purpose)
     ↓
User allows or denies
     ↓
Authorization code issued
     ↓
Client exchanges code for access token
     ↓
Client calls /userinfo with access token
     ↓
Server checks: scope + consent + purpose
     ↓
Only authorized claims returned (data minimization)
     ↓
Data access event recorded (observability)
```

---

## Authentication Flow

```
1. Signup / Login
        ↓
2. GET /authorize?client_id=...&scope=...&purpose=...
        ↓
3. Consent Screen (Allow / Deny)
        ↓
4. Authorization Code → redirect to client
        ↓
5. POST /token (code + client_secret → access_token + id_token)
        ↓
6. GET /userinfo (Bearer access_token → user claims)
```

---

## User Data Model

| Table | Purpose |
|---|---|
| `users` | Core authentication record (email, password, name) |
| `user_profiles` | Extended profile data (city, state, country, locale, location metadata) |
| `user_interests` | User interests (e.g. fitness, technology, cooking) |

Profile and interest data is stored separately from the authentication record because:
- Not all applications need profile data — some only need authentication.
- Keeping them separate supports data minimization: the server only queries profile/interest tables when those scopes are authorized.

---

## Scope + Claim Catalog

The server defines a central catalog of supported scopes and their mapped claims:

| Scope | Claims Returned |
|---|---|
| `openid` | `sub` (always included) |
| `profile` | `given_name`, `family_name`, `picture` |
| `email` | `email` |
| `location` | `city`, `state`, `country`, `locale` |
| `interests` | `interests` |

Defined in: `src/modules/oidc/oidc.scopes.ts`

---

## Consent System

Consent is stored in the `consents` table with the following dimensions:

```
User + Client + Scope + Purpose = Consent Record
```

Each consent is:
- **User-specific** — User A's consent is independent of User B's
- **Client-specific** — consent for FitZone is independent of consent for FoodApp
- **Scope-specific** — consent for `location` is independent of consent for `email`
- **Purpose-specific** — consent for `personalization` does NOT automatically grant `advertising`
- **Revocable** — users can revoke consent at any time
- **Optionally time-limited** — consent can have an expiration date

### Supported Purposes
`authentication`, `personalization`, `recommendations`, `analytics`, `marketing`, `advertising`

---

## Consent Screen

When a third-party client requests user data, the user sees a consent screen showing:
- The client application name
- The scopes being requested (e.g. "Basic profile information", "Email address", "Approximate location")
- The purpose (e.g. "Personalization")
- Allow / Deny buttons

The user must explicitly allow access before any data is shared.

---

## UserInfo Authorization

The `/userinfo` endpoint enforces a strict authorization check:

```
For each requested scope:
  1. Is the scope in the access token?
  2. Does an active consent exist for this user + client + scope + purpose?
  3. Is the consent status = "granted"?
  4. Is it not revoked (revoked_at IS NULL)?
  5. Is it not expired (expires_at IS NULL or expires_at > now)?
     ↓
  If ALL checks pass → include claims for this scope
  If ANY check fails  → silently omit claims (no error thrown)
```

**Formula:** `ALLOWED_CLAIMS = REQUESTED_SCOPES ∩ ACTIVE_CONSENT ∩ MATCHING_PURPOSE`

---

## Data Minimization

The server returns **only** the minimum claims required by authorized scopes:

- If only `location` is requested and authorized → only `city`, `state`, `country`, `locale` are returned
- `email`, `given_name`, `family_name`, `interests` are **not** returned
- Internal fields like `location_source`, `location_precision`, database IDs, timestamps, passwords are **never** exposed

---

## User Consent Management

Authenticated users can manage their consents via REST APIs:

| Endpoint | Purpose |
|---|---|
| `GET /api/consents` | View all granted consents |
| `GET /api/consents/:id` | View a single consent |
| `DELETE /api/consents/:id` | Revoke a consent (soft delete: sets `status = revoked`, `revoked_at = now`) |

Users can only access their own consents. Cross-user access returns a 404.

---

## Data Access Observability

Every `/userinfo` request creates a record in the `data_access_logs` table:

| Field | Description |
|---|---|
| `user_id` | Whose data was accessed |
| `client_id` | Which client accessed it |
| `endpoint` | The endpoint called (e.g. `/userinfo`) |
| `requested_scopes` | Scopes the client requested |
| `granted_scopes` | Scopes that passed consent checks |
| `purpose` | The purpose from the consent |
| `success` | Whether all requested scopes were granted |
| `denial_reason` | Why any scopes were denied (nullable) |
| `created_at` | When the access occurred |

**No credentials are ever stored** in the logs (no tokens, passwords, secrets, or authorization codes).

---

## User Access History

Users can view their own data access history:

| Endpoint | Purpose |
|---|---|
| `GET /api/data-access` | View which apps accessed your data, when, and what was shared |

A simple frontend page at `/data-access` displays this information.

---

## Admin Observability Dashboard

An admin-only dashboard at `/admin` shows:

- **Total data-access requests**
- **Successful vs denied accesses**
- **Active clients count**
- **Top 5 clients** (by access count)
- **Top 5 scopes** (most requested)
- **Recent 10 data-access events**
- **Security alerts** (anomaly detection)

Protected by `requireAuth` + `requireAdmin` middleware. Normal users receive a `403 Forbidden`.

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/observability` | Aggregated metrics from `data_access_logs` |
| `GET /api/admin/anomalies` | Current anomaly alerts |

---

## Anomaly Detection

Simple rule-based anomaly detection using the existing `data_access_logs` table. **No machine learning or AI is used.**

### Rules

| Rule | Description | Severity |
|---|---|---|
| `HIGH_ACCESS_FREQUENCY` | Client makes > 100 requests in 5 minutes | High |
| `HIGH_DENIAL_RATE` | ≥ 70% of a client's recent requests are denied | Medium/High |
| `SCOPE_SPIKE` | Client suddenly requests 2x more distinct scopes than historical average | Medium |

Thresholds are configured in `src/modules/admin/anomaly.config.ts`.

**Interview explanation:** "The system analyzes existing data-access logs and applies predefined rules to identify unusual client behavior, such as excessive request rates, high denial rates, or sudden scope escalation."

---

## Security Controls

| Control | Implementation |
|---|---|
| Redirect URI validation | Checked against registered client redirect URI |
| Scope validation | Only scopes from the central catalog are accepted |
| Authentication | JWT-based session via HttpOnly cookies |
| Consent validation | Every scope checked against active consent records |
| Purpose validation | Consent must match the specific purpose in the access token |
| User/client isolation | Users can only access their own data; clients only get their authorized data |
| Admin authorization | Admin endpoints protected by `requireAuth` + `requireAdmin` |
| Data minimization | Only authorized scope claims are returned; internal fields never exposed |
| No credential logging | Access tokens, passwords, secrets, and authorization codes are never stored in logs |

---

## Technology Stack

| Technology | Usage |
|---|---|
| **TypeScript** | Server-side language |
| **Express 5** | HTTP framework |
| **PostgreSQL** | Database |
| **Drizzle ORM** | Database queries and schema management |
| **JSON Web Tokens (jsonwebtoken)** | Access tokens, ID tokens |
| **node-jose** | JWKS endpoint |
| **bcrypt** | Password hashing |
| **Zod** | Request validation |
| **nodemailer** | Password reset emails |
| **cookie-parser** | Session cookie management |
| **date-fns** | Date utilities |
| **dotenv** | Environment variables |
| **drizzle-kit** | Database migrations |
| **tsc-watch** | Development hot reload |

---

## Project Structure

```
src/
├── common/
│   ├── db/                          # Database schemas and connection
│   │   ├── user.schema.ts
│   │   ├── clients.schema.ts
│   │   ├── authorization-codes.schema.ts
│   │   ├── user-profiles.schema.ts
│   │   ├── user-interests.schema.ts
│   │   ├── consents.schema.ts
│   │   ├── data-access-logs.schema.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── requireAuth.ts           # JWT authentication middleware
│   │   └── requireAdmin.ts          # Admin authorization middleware
│   └── utils/
│       ├── jwt.utils.ts             # Token generation/verification
│       └── cert.ts                  # JWKS key management
├── modules/
│   ├── auth/                        # Signup, login, password reset
│   ├── clients/                     # Client registration
│   ├── oidc/                        # Core OIDC endpoints
│   │   ├── oidc.services.ts         # authorize, token, userinfo, saveConsent
│   │   ├── oidc.controller.ts
│   │   ├── oidc.routes.ts
│   │   └── oidc.scopes.ts           # Central scope + claim + purpose catalog
│   ├── authorization-codes/         # Auth code creation/lookup
│   ├── consents/                    # User consent management APIs
│   ├── data-access/                 # User data-access history API
│   └── admin/                       # Admin observability + anomaly detection
│       ├── admin.services.ts
│       ├── admin.controller.ts
│       ├── admin.routes.ts
│       ├── anomaly.services.ts
│       └── anomaly.config.ts
├── index.ts                         # Express app setup and route mounting
public/
├── consent.html                     # Consent screen
├── data-access.html                 # User data-access history page
├── admin.html                       # Admin dashboard
├── js/
│   ├── consent.js
│   ├── data-access.js
│   └── admin.js
```

---

## Interview Explanation

> "I built Maheshwari Auth — a generic OIDC authentication and authorization server that allows third-party applications to authenticate users and request specific user data. The system uses a central scope-and-claim catalog to define what data each scope represents. Users explicitly provide consent for specific scopes and purposes through a consent screen, and the server enforces data minimization by returning only the claims that are both requested and consented. I implemented user consent management APIs so users can view and revoke permissions, a data-access observability layer that logs every access event, a user-facing access history page, an admin observability dashboard with aggregated metrics, and simple rule-based anomaly detection to flag suspicious client behavior like excessive request rates or high denial rates. The entire system is built with TypeScript, Express, PostgreSQL, and Drizzle ORM, and is designed to be domain-agnostic so any type of application can use it."

---

## Running the Project

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file with:

```
PORT=3000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ISSUER=http://localhost:3000
```
