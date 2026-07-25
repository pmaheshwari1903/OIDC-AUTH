<p align="center">
  <img src="https://img.shields.io/badge/Maheshwari_Auth-Identity_Provider-blueviolet?style=for-the-badge&logo=openid&logoColor=white" alt="Maheshwari Auth"/>
  <img src="https://img.shields.io/badge/OAuth_2.0-Secure-success?style=for-the-badge&logo=auth0&logoColor=white" alt="OAuth 2.0"/>
  <img src="https://img.shields.io/badge/OpenID_Connect-Certified-blue?style=for-the-badge&logo=openid&logoColor=white" alt="OIDC"/>
</p>

<h1 align="center">🔐 Maheshwari Auth</h1>

<p align="center">
  <b>An educational OAuth 2.0 and OIDC-inspired authentication provider.</b><br/>
  Learn how Identity Providers work under the hood.<br/>
  Add a basic sign-in experience to your hobby projects in minutes.
</p>

<p align="center">
  <a href="#-why-maheshwari-auth">Why Us</a> •
  <a href="#-get-started-in-3-steps">Get Started</a> •
  <a href="#-integration-guide">Integration Guide</a> •
  <a href="#-code-examples">Code Examples</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-scopes--user-data">Scopes & Data</a> •
  <a href="#-join-the-community">Community</a>
</p>

<br/>

---

## 🌟 Why Maheshwari Auth?

Stop building authentication from scratch. Let Maheshwari Auth handle sign-in, sign-up, email verification, and user management so you can **focus on your product**.

| ✅ Feature | 💡 What You Get |
|---|---|
| **"Sign in with Maheshwari Auth"** | A trusted, branded login experience for your users |
| **Email Verification Built-In** | Every user's email is verified — no spam accounts |
| **Secure OAuth 2.0 Flow** | Industry-standard Authorization Code flow |
| **User Profiles** | Get name, email, and profile picture out of the box |
| **Signed JWTs** | Tokens signed with HS256 — verify them server-side |
| **Zero Cost** | Completely free to integrate into your website |

---

## ⚡ Get Started in 3 Steps

```
1️⃣  Register your app → get your Client ID & Secret
2️⃣  Add a "Sign in with Maheshwari Auth" button to your site
3️⃣  Handle the callback → receive user data
```

That's it. Your users can now sign in securely through Maheshwari Auth. 🎉

---

## 🔄 How It Works

Just like Google or GitHub OAuth — a simple redirect-based flow:

```
┌──────────────┐                              ┌──────────────────┐
│              │  1. User clicks "Sign In"     │                  │
│  Your App    │ ─────────────────────────────►│  Maheshwari Auth  │
│              │                               │                  │
│              │  2. User signs in/signs up     │  We handle:      │
│              │     on our secure page         │  • Sign-in UI    │
│              │                               │  • Sign-up UI    │
│              │  3. Redirected back with code  │  • Email verify  │
│              │◄─────────────────────────────  │  • Password hash │
│              │                               │                  │
│              │  4. Exchange code for tokens   │                  │
│              │ ─────────────────────────────►│                  │
│              │                               │                  │
│              │  5. Get user profile           │                  │
│              │◄─────────────────────────────  │                  │
└──────────────┘                              └──────────────────┘
```

> 💡 **You never handle passwords.** All authentication happens on our secure servers.

---

## 🚀 Integration Guide

### Step 1 — Register Your Application

Head over to the **Maheshwari Auth Registration Portal** and register your app:

### 👉 [**Register Your App Here →**](https://oidcauth.vercel.app/register)

Fill in your **App Name** and **Redirect URI** (the URL where users will be sent after signing in). Once submitted, you'll receive:

```json
{
  "clientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "clientSecret": "your-secret-token-save-it-now"
}
```

> ⚠️ **The `clientSecret` is shown only once.** Copy it immediately and store it securely in your environment variables.

---

### Step 2 — Add a "Sign In" Button

When a user wants to sign in, redirect them to Maheshwari Auth:

```
https://oidcauth.vercel.app/authorize
    ?client_id=YOUR_CLIENT_ID
    &redirect_uri=https://myapp.com/auth/callback
    &response_type=code
    &scope=openid profile email
    &state=random_csrf_token
```

| Parameter | Required | Description |
|---|---|---|
| `client_id` | ✅ | Your Client ID from Step 1 |
| `redirect_uri` | ✅ | Must **exactly** match what you registered |
| `response_type` | ✅ | Always `code` |
| `scope` | ✅ | Must include `openid`. Add `profile` and/or `email` for more data |
| `state` | Recommended | A random string for CSRF protection |

The user will see our sign-in page. After authenticating, we redirect them back to your `redirect_uri`:

```
https://myapp.com/auth/callback?code=AUTH_CODE&state=random_csrf_token
```

---

### Step 3 — Exchange the Code for Tokens

On your **server-side**, exchange the authorization code:

```bash
curl -X POST https://oidcauth.vercel.app/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "AUTH_CODE_FROM_CALLBACK",
    "redirect_uri": "https://myapp.com/auth/callback"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "id_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

> 🔒 **Never expose your `client_secret` on the frontend.** This call must be made from your backend server.

---

### Step 4 — Get the User's Profile

Use the `access_token` to fetch user info:

```bash
curl https://oidcauth.vercel.app/userinfo \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Response:**

```json
{
  "sub": "unique-user-id",
  "email": "user@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.jpg"
}
```

Now create a session for the user in your app — you're done! 🎉

---

## 💻 Code Examples

### Next.js / React

**Sign-in Button (Frontend):**

```tsx
const MAHESHWARI_AUTH = "https://oidcauth.vercel.app";

function SignInButton() {
  const handleSignIn = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/api/auth/callback`,
      response_type: "code",
      scope: "openid profile email",
      state: crypto.randomUUID(),
    });

    window.location.href = `${MAHESHWARI_AUTH}/authorize?${params}`;
  };

  return (
    <button onClick={handleSignIn}>
      🔐 Sign in with Maheshwari Auth
    </button>
  );
}
```

**Callback Handler (Backend API Route):**

```typescript
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER = "https://oidcauth.vercel.app";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  // Exchange code for tokens
  const tokenRes = await fetch(`${AUTH_SERVER}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.OIDC_CLIENT_ID,
      client_secret: process.env.OIDC_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    }),
  });
  const tokens = await tokenRes.json();

  // Get user profile
  const userRes = await fetch(`${AUTH_SERVER}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await userRes.json();

  // Create your session, set cookies, etc.
  // user.sub → unique user ID
  // user.email → verified email
  // user.given_name, user.family_name → display name

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

---

### Express.js

```javascript
const express = require("express");
const app = express();

const AUTH_SERVER = "https://oidcauth.vercel.app";

// Redirect to Maheshwari Auth
app.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: "http://localhost:3000/auth/callback",
    response_type: "code",
    scope: "openid profile email",
    state: Math.random().toString(36).substring(7),
  });

  res.redirect(`${AUTH_SERVER}/authorize?${params}`);
});

// Handle callback
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  // Exchange code for tokens
  const tokenRes = await fetch(`${AUTH_SERVER}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: "http://localhost:3000/auth/callback",
    }),
  });
  const tokens = await tokenRes.json();

  // Get user info
  const userRes = await fetch(`${AUTH_SERVER}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await userRes.json();

  // Create session and redirect
  req.session.user = user;
  res.redirect("/dashboard");
});
```

---

## 📖 API Reference

> **Base URL:** `https://oidcauth.vercel.app`

### Discovery

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/.well-known/openid-configuration` | OIDC discovery — lists all endpoints & capabilities |
| `GET` | `/.well-known/jwks.json` | Public keys to verify token signatures |

### OAuth / OIDC Flow

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/authorize` | Start the sign-in flow — redirect users here |
| `POST` | `/token` | Exchange authorization code for `access_token` + `id_token` |
| `GET` | `/userinfo` | Get the signed-in user's profile (requires Bearer token) |

### Client Registration

| Action | Link | Description |
|---|---|---|
| 🔗 **Register** | [**oidcauth.vercel.app/register**](https://oidcauth.vercel.app/register) | Register your app to get `clientId` and `clientSecret` |

---

## 🔐 Scopes & User Data

Choose which data your app can access:

| Scope | Claims Returned | Description |
|---|---|---|
| `openid` | `sub` | **Required.** Returns the unique user identifier |
| `profile` | `given_name`, `family_name`, `picture` | User's name and profile picture |
| `email` | `email`, `email_verified` | User's verified email address |

**Example scope string:** `openid profile email`

---

## 🛡️ Security & Production Readiness (Disclaimer)

Maheshwari Auth is designed as a **foundational, educational project** to help developers learn how Identity Providers work. 

If you are evaluating this for production, please be aware of the following architectural and security limitations:

### 1. OIDC Compliance Limitations
This is an **"OAuth-inspired"** implementation. While it supports Discovery (`/.well-known/...`) and basic JWT tokens, it **does not** fully implement the OpenID Connect core specification.
- **Missing Features:** No `nonce` validation, no PKCE (Proof Key for Code Exchange) support, and limited `aud` (audience) / `iss` (issuer) validation.
- Token signatures currently use **HS256** (symmetric), not RS256 (asymmetric).

### 2. Missing Core Security Mechanisms
A production OIDC server requires mechanisms we haven't implemented yet:
- No **refresh tokens** or token rotation.
- No **token revocation** or active session management.
- No **logout** endpoint (Session termination is strictly local).
- No replay attack protection or strict CSRF checks.

### 3. Abuse Prevention & Rate Limiting
Authentication APIs are prime targets for attacks. We currently lack:
- Login throttling / Brute-force protection
- Captcha integration
- Malicious bot prevention

### 4. Enterprise Identity Features
To compete with solutions like Google or Auth0, the following would need to be built:
- **Account Recovery / 2FA (MFA)**
- Social login federation (e.g., Sign in with Google)
- Suspicious login detection and automatic account locking
- Audit logs for security monitoring

> **Takeaway:** This project serves as a fantastic learning tool to understand the mechanics of OAuth 2.0 flows, but should be used with caution (or heavily augmented) in a real-world enterprise environment.

---

## ❓ FAQ

<details>
<summary><b>Is Maheshwari Auth free to use?</b></summary>
<br/>
Yes! It's completely free for any website or application.
</details>

<details>
<summary><b>Do I need to handle password storage?</b></summary>
<br/>
No. All passwords are securely hashed and stored on our servers. You never see or touch user passwords.
</details>

<details>
<summary><b>How is this different from Firebase Auth or Auth0?</b></summary>
<br/>
Maheshwari Auth is a lightweight, open-standard OIDC provider. No vendor lock-in, no complex SDKs. Just standard HTTP requests that work with any language or framework.
</details>

<details>
<summary><b>Can I use this with any framework?</b></summary>
<br/>
Yes! If your framework supports OAuth 2.0 / OpenID Connect (virtually all do), it works. We've shown examples with Next.js and Express, but it works with Django, Flask, Spring Boot, Laravel, Rails — anything.
</details>

<details>
<summary><b>What happens if a user forgets their password?</b></summary>
<br/>
Password recovery is handled on the Maheshwari Auth side — your app doesn't need to worry about it.
</details>

<details>
<summary><b>Are emails verified?</b></summary>
<br/>
Yes! Every user must verify their email before they can sign in. The <code>email_verified</code> claim in the user profile will always be <code>true</code>.
</details>

---

## 🤝 Join the Community

Become part of the **Maheshwari Auth ecosystem** and let your users sign in with a trusted identity:

- 🌐 **Integrate** — Add "Sign in with Maheshwari Auth" to your website
- 💬 **Connect** — Share your integration and get featured
- ⭐ **Support** — Star the repo on [GitHub](https://github.com/pmaheshwari1903/OIDC-AUTH) if Maheshwari Auth helped you!
- 🐛 **Report Issues** — Found a bug? [Open an issue](https://github.com/pmaheshwari1903/OIDC-AUTH/issues)

---

<p align="center">
  <b>Built with ❤️ by <a href="https://github.com/pmaheshwari1903">Parth Maheshwari</a></b>
  <br/><br/>
  <i>Empowering developers with simple, secure authentication.</i>
</p>
