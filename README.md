<p align="center">
  <img src="https://img.shields.io/badge/Maheshwari_Auth-Identity_Provider-blueviolet?style=for-the-badge&logo=openid&logoColor=white" alt="Maheshwari Auth"/>
  <img src="https://img.shields.io/badge/OAuth_2.0-Secure-success?style=for-the-badge&logo=auth0&logoColor=white" alt="OAuth 2.0"/>
  <img src="https://img.shields.io/badge/OpenID_Connect-Certified-blue?style=for-the-badge&logo=openid&logoColor=white" alt="OIDC"/>
  <img src="https://img.shields.io/badge/Privacy-First-green?style=for-the-badge&logo=shield&logoColor=white" alt="Privacy First"/>
</p>

<h1 align="center">🔐 Maheshwari Auth</h1>

<p align="center">
  <b>Secure, standards-compliant authentication for your website.</b><br/>
  Just like "Sign in with Google" — but powered by Maheshwari Auth with advanced privacy controls.<br/>
  Add a trusted sign-in experience to your app in minutes.
</p>

<p align="center">
  <a href="#-why-maheshwari-auth">Why Us</a> •
  <a href="#-features">Features</a> •
  <a href="#-get-started-in-3-steps">Get Started</a> •
  <a href="#-integration-guide">Integration Guide</a> •
  <a href="#-scopes--user-data">Scopes & Data</a> •
  <a href="#-api-reference">API Reference</a>
</p>

<br/>

---

## 🌟 Why Maheshwari Auth?

Stop building authentication from scratch. Let Maheshwari Auth handle sign-in, sign-up, email verification, and user management so you can **focus on your product**. We go beyond simple authentication by providing enterprise-grade privacy and observability features.

## ✨ Features

| ✅ Feature | 💡 What You Get |
|---|---|
| **"Sign in with Maheshwari Auth"** | A trusted, branded login experience for your users |
| **Email Verification Built-In** | Every user's email is verified — no spam accounts |
| **Secure OAuth 2.0 Flow** | Industry-standard Authorization Code flow |
| **Granular Scopes & Claims** | Access to `profile`, `email`, `location`, and `interests` with user consent |
| **Purpose-Based Policy** | Data access is tied to specific purposes (e.g., personalization, analytics) |
| **User Data Observability** | Users can see exactly who accessed their data, when, and for what purpose |
| **Consent Management** | Users have full control to view and revoke active consents |
| **Admin Analytics & Anomaly Detection** | Built-in dashboards to monitor access patterns and detect security anomalies |
| **RS256 Token Signing** | Tokens signed with RSA keys — verify them with our public JWKS |

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
│              │  2. User authenticates &       │  We handle:      │
│              │     grants consent            │  • Sign-in UI    │
│              │                               │  • Consent UI    │
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
    &scope=openid profile email location
    &purpose=personalization
    &state=random_csrf_token
```

| Parameter | Required | Description |
|---|---|---|
| `client_id` | ✅ | Your Client ID from Step 1 |
| `redirect_uri` | ✅ | Must **exactly** match what you registered |
| `response_type` | ✅ | Always `code` |
| `scope` | ✅ | Must include `openid`. Add `profile`, `email`, `location`, or `interests` for more data |
| `purpose` | ✅ | The reason you are requesting this data (e.g., `personalization`, `analytics`, `marketing`) |
| `state` | Recommended | A random string for CSRF protection |

The user will see our sign-in page, followed by a consent screen if they haven't authorized your app for these scopes and purposes before. After authenticating, we redirect them back to your `redirect_uri`:

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

**Response:** (Depends on requested scopes and user consent)

```json
{
  "sub": "unique-user-id",
  "email": "user@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.jpg",
  "city": "New York",
  "country": "USA"
}
```

Now create a session for the user in your app — you're done! 🎉

---

## 🔐 Scopes & User Data

Choose which data your app can access. Users must explicitly consent to providing this information for a specified purpose.

| Scope | Claims Returned | Description |
|---|---|---|
| `openid` | `sub` | **Required.** Returns the unique user identifier |
| `profile` | `given_name`, `family_name`, `picture` | User's name and profile picture |
| `email` | `email`, `email_verified` | User's verified email address |
| `location`| `city`, `state`, `country`, `locale` | User's demographic location |
| `interests`| `interests` array | User's specified interests |

**Example scope string:** `openid profile email location`

### Supported Purposes

When requesting data, you must provide a `purpose`. Supported purposes include:
- `authentication`
- `personalization`
- `recommendations`
- `analytics`
- `marketing`
- `advertising`

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
      purpose: "authentication",
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
  
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
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

## 🛠️ Project Structure & Architecture

For a deep dive into how Maheshwari Auth is built, including database schemas, service flows, and architecture details, please refer to the [Project Documentation](PROJECT_DOCUMENTATION.md).

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
Maheshwari Auth is a lightweight, open-standard OIDC provider with a strong emphasis on user privacy, consent management, and data observability. It provides advanced features out of the box without complex SDKs.
</details>

<details>
<summary><b>Can users revoke my access?</b></summary>
<br/>
Yes, users have a centralized dashboard where they can view all apps they've granted access to, along with the specific data scopes and purposes, and can revoke access at any time.
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
  <i>Empowering developers with simple, secure, and privacy-first authentication.</i>
</p>
