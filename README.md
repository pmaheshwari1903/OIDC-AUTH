<div align="center">
  <h1>🛡️ Maheshwari Auth</h1>
  <p><strong>The Next-Generation, Domain-Agnostic OIDC Identity Platform</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  </p>

  <p>
    <em>Secure, transparent, and built for privacy. Give your users the confidence to share data with third-party applications while keeping full control.</em>
  </p>
</div>

---

## 🚀 Why Maheshwari Auth?

In today's digital ecosystem, users demand privacy and transparency. Maheshwari Auth isn't just an authentication server; it's a **trust engine** for your platform.

Whether you're building an ecosystem for food delivery, fitness apps, e-commerce, OTT platforms, or education tools, Maheshwari Auth empowers third-party applications to authenticate users and request specific data—with uncompromising security and privacy.

### ✨ The Maheshwari Advantage:
- 🔐 **Explicit User Consent:** Users always know exactly what data they're sharing, to whom, and why.
- 🎯 **Purpose-Based Privacy:** Granular permissions tied to specific use cases (e.g., personalization vs. marketing).
- 📉 **Data Minimization by Default:** We return only the absolute minimum claims authorized. Nothing more, ever.
- 👁️ **Total Observability:** Complete transparency into data-access logs for both end-users and administrators.
- 🛡️ **Built-in Anomaly Detection:** Real-time, rule-based security monitoring to guard against malicious client behavior.

---

## 🏗️ Architecture at a Glance

Maheshwari Auth sits securely between your users and third-party applications, ensuring that every data exchange is verified, authorized, and logged.

```mermaid
graph TD
    A[User Browser] -->|Authenticates & Consents| B(Maheshwari Auth Server)
    B -->|Issues Tokens| C[Third-Party Application]
    C -->|Requests /userinfo with Token| B
    B -->|Returns Minimized Data| C
```

### 🔄 The Seamless Authentication Flow
1. **Signup / Login**: The user establishes their core identity.
2. **Authorize**: Client requests specific scopes (e.g., `profile`, `location`) and a purpose.
3. **Consent Screen**: User reviews the request and clicks Allow/Deny.
4. **Code Exchange**: Secure authorization code is exchanged for an Access Token.
5. **Data Access**: Client calls `/userinfo`, and the server enforces strict data minimization before returning data.

---

## 💎 Features Built for Enterprise Trust

### 1. Granular Scope & Claim Catalog
Our centralized catalog maps scopes perfectly to actionable claims, ensuring clients get exactly what they need without over-fetching.

| Scope | Claims Returned |
|:---|:---|
| `openid` | `sub` (Always included) |
| `profile` | `given_name`, `family_name`, `picture` |
| `email` | `email` |
| `location` | `city`, `state`, `country`, `locale` |
| `interests` | `interests` |

### 2. Multi-Dimensional Consent System
Consent isn't just a simple toggle. It's a precise contract:
`User` + `Client` + `Scope` + `Purpose` = **Consent Record**

- **Client-specific:** Permissions for App A don't apply to App B.
- **Purpose-specific:** Granting access for `personalization` doesn't grant access for `advertising`.
- **Revocable & Expirable:** Users maintain lifetime control over their data.

### 3. Absolute Data Minimization
If a client requests `location`, they get `location`—and absolutely nothing else. Internal database IDs, timestamps, and credential hashes are **never** exposed.

### 4. Panoptic Observability & Anomaly Detection
Every single `/userinfo` request is logged (without ever storing credentials). 
- **Users** get a beautiful dashboard to see exactly who accessed their data and when.
- **Admins** get a powerful observability suite featuring rule-based anomaly detection to automatically flag:
  - 🚨 **High Access Frequency** (>100 requests / 5 mins)
  - 🚨 **High Denial Rates** (Suspicious probing)
  - 🚨 **Scope Spikes** (Sudden aggressive data requests)

---

## 🛠️ Uncompromising Security Controls

We take security seriously so you don't have to second guess.

| Control Area | Implementation |
|:---|:---|
| **URI Validation** | Strict checking against registered client redirect URIs. |
| **Token Security** | Robust JWT sessions via HttpOnly cookies; `node-jose` for JWKS. |
| **Consent Enforcement** | Every scope is cross-checked against active, non-expired consent records. |
| **Isolation** | Strict User/Client isolation boundaries enforced at the database level. |
| **Credential Hygiene**| Access tokens, passwords, and auth codes are **never** stored in logs. |

---

## 💻 Tech Stack Powering the Platform

Built on a modern, high-performance stack designed for scale and developer happiness.

- **Language:** TypeScript 
- **Framework:** Express 5
- **Database:** PostgreSQL + Drizzle ORM
- **Security & Crypto:** jsonwebtoken, node-jose, bcrypt, Zod
- **Tooling:** drizzle-kit, tsc-watch

---

## 🚀 Get Started Today

Ready to integrate trust into your ecosystem? Spin up Maheshwari Auth in seconds.

```bash
# 1. Install dependencies
npm install

# 2. Setup your database schemas
npm run db:generate

# 3. Apply the migrations
npm run db:migrate

# 4. Ignite the development server
npm run dev
```

### ⚙️ Environment Configuration

Create a `.env` file in the root directory and you're ready to go:

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/maheshwari_auth
JWT_ACCESS_SECRET=your-super-secure-access-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
ISSUER=http://localhost:3000
```

---

<div align="center">
  <p>Built with ❤️ by <strong>Maheshwari Auth</strong></p>
  <p><em>Empowering privacy-first digital experiences.</em></p>
</div>
