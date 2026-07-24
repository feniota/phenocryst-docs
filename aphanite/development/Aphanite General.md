---
outline: "deep"
---

# Aphanite General API

The part shared between Yggdrasil and Phenocryst in the Aphanite system is called the General API.

This page defines the endpoints and implementation details of the Aphanite General API, using TypeScript types to describe the expected request bodies and response payloads.

## Basic Conventions

Unless otherwise specified, both the Aphanite General API and Phenocryst API follow these conventions:

1. Request and response bodies must be in JSON format, with the correct `Content-Type: application/json` header.
2. The server responds with the following format regardless of success:
    ```typescript
    type Response<Payload> = {
      success: boolean; // Whether the operation succeeded
      payload?: Payload; // The actual response data on success
      reason?: string; // A human-readable error reason on failure
    };

    // Or more specifically:
    type Response<Payload> = {
      success: true;
      payload: Payload;
    } | {
      success: false;
      reason: string;
    };
    ```
   If an error occurs, the HTTP status code should be set appropriately, but the `reason` field should contain the actual cause of the error — it doesn't have to match the HTTP Reason Phrase.
   The `payload` type is unrestricted and can be any JSON-representable type (determined by the specific business API), but cannot be empty. If there's nothing meaningful to return, use `204 No Content`. All response body types mentioned below are treated as the `Payload` generic parameter here.
3. All endpoint paths mentioned below are subdirectories of `<aphanite_base_url>/api`.

## Data Models

Common data models referenced in the responses below.

```typescript
// User metadata
type User = {
    id: string; // User UUID
    name: string; // User name (note: not unique)
    email: string; // User email
    permissions: Permission[]; // User permissions
};

// User permissions. Stored as numeric bit flags internally,
// but serialized as an enum array. Clients just need to parse the enum.
const enum Permission {
    Management = "management",
}

// Player profile metadata
type Profile = {
    id: string; // Profile UUID
    name: string; // In-game name. **ASCII strings only**
    owner: string; // UUID of the Aphanite user who owns this profile
};

// Player skin data
type ProfileSkin = {
    skin?: string; // Skin URL
    model?: "default" | "slim"; // Arm thickness
    cape?: string; // Cape URL
}
```

## Authentication

Aphanite uses a token-based authentication mechanism. To avoid the complexity of maintaining multiple systems, token issuance shares the same pool as Yggdrasil. That is, Phenocryst clients only need to log in once to access both Phenocryst API and Yggdrasil API.

However, although tokens share the same pool as Minecraft authentication, Aphanite has its own user model. Clients designed for Aphanite should use Aphanite's own API to obtain Aphanite-specific user information.

Endpoints marked with <Badge type="tip" text="Auth required" /> require [authentication](#authorization); endpoints marked with <Badge type="danger" text="Auth required (Admin)" /> require [authentication](#authorization) and the current user must have Management permission.

### Login

Authenticate with email and password to get user info and issue a set of auth tokens.

```http
POST /auth/login
```

Request body:

```typescript
type Request = {
    email: string; // Account email
    password?: string; // Account password (plain text)
    otp_token?: string; // OTP challenge result
}
```

The `otp_token` value and how to obtain it are described in [OTP Verification](#otp).

The purpose of OTP here is to prevent credential-stuffing attacks in case Aphanite's password database is leaked. However, unlike traditional security practices, OTP in Aphanite acts as 1FA — it carries the same authority as a password. This does make Aphanite somewhat less secure.

Clients should prefer using OTP to obtain tokens, treating passwords as a secondary, fallback option.

Response:

```typescript
type Payload = {
    access_token: string;
    client_token: string;
    user: User;
}
```

Note: Client Token is only used in special Yggdrasil API scenarios. We agree to ignore it in Aphanite General and Phenocryst APIs. However, launchers should still store it for when it's needed.

### Refresh Token <Badge type="tip" text="Auth required" />

Tokens expire after 15 days and can be used for authentication within that period. In principle, Phanerite should refresh tokens once per day. Since the Yggdrasil token refresh API involves profile selection and such, we provide a simpler API.

```http
POST /auth/refresh
```

Request body is empty.

Response:

```typescript
type Payload = {
    access_token: string; // New Access Token
    user: User; // The user info associated with the token; launchers should update their local storage — useful if the user has changed their info
}
```

The Client Token remains unchanged after refreshing; the server no longer returns it.

### Validate Token <Badge type="tip" text="Auth required" />

```http
GET /auth/validate
```

Returns `204 No Content` if the token is valid.

### API Authorization {#authorization}

In Phenocryst and other General APIs, authentication is done by putting the Access Token as a Bearer token in the `Authorization` header, e.g.:

```http
POST /api/endpoint HTTP/1.1
Authorization: Bearer access_token
Content-Type: application/json; charset=utf-8
Content-Length: 18

{"request":"body"}
```

Requests to <Badge type="tip" text="Auth required" /> endpoints without authentication info, or with invalid auth (e.g., expired token), return `401 Unauthorized`.

## OTP Verification {#otp}

### Verication Flow

The OTP mechanism is designed for passwordless login or password resets, so it does not require authentication.

Verification uses a session-based flow:

- The client requests [OTP session creation](#create-otp-session).
- The client receives the session ID and waits for the verification code. (In design, codes can be admin panel codes, email codes, or TOTP; currently only TOTP is supported.)
- The client uses the session ID and code to [complete OTP verification](#validate-otp).
- The client receives an `otp_token`, a one-time token with the same authority as a password, usable with the [Login API](#login).

#### TOTP

Phanerite should store the TOTP secret locally instead of storing the plain-text password. This allows persistent login without frequent password entry, without storing the user's actual password.

To create a TOTP private key, the client should request [Issue or rotate TOTP private key](#new-totp-privkey) while logged in.

To log in with TOTP, the client follows the verification flow above, sets `method` to `totp`, and submits the current TOTP code as the OTP verification code.

TOTP uses the algorithm defined in RFC 6238, with a 30-second time step and 6-digit length.

### Create OTP Session {#create-otp-session}

```http
POST /verification
```

Request body:

```typescript
type Request = {
    email: string;
    method: string;
}
```

As of Aphanite v0.1.0, `method` only supports `totp`.

Response:

```typescript
type Payload = {
    id: string;
}
```

- Returns `400 Bad Request` if the user has no [activated](#activate-totp) [TOTP private key](#new-totp-privkey).

### Complete OTP Verification {#validate-otp}

```http
POST /verification/{id}
```

Request body:

```typescript
type Request = {
    code: string; // OTP verification code
}
```

Response:

```typescript
type Payload = {
    otp_token: string;
}
```

- Returns `404 Not Found` if the OTP session ID doesn't exist.
- Returns `401 Unauthorized` if the session exists but the code is wrong.

## User System

Most APIs below provide two endpoints:

- One under `/users/{id}`, targeting a specific user by UUID.
- One under `/users/me`, representing the current authenticated user.

### Get User Info <Badge type="tip" text="Auth required" />

```http
GET /users/{id}
GET /users/me
```

Response:

```typescript
type Payload = User;
```

Permission check:

- Requesting `/user/me` — succeeds.
- Requesting `/users/{id}` where `id` matches the current user — succeeds.
- Requesting `/users/{id}` where `id` differs — checks if the current user has Management permission.
- Returns `401 Unauthorized` if no auth or invalid auth.

### Update User Metadata <Badge type="tip" text="Auth required" />

```http
PATCH /users/{id}
PATCH /users/me
```

Request body:

```typescript
type Request = {
    name?: string;
    email?: string;
}
```

Response:

```typescript
type Payload = User;
```

Permission check: Same as [Get User Info](#get-user-info).

Note: Aphanite user email addresses are **globally unique**. Returns `409 Conflict` if the target email is already associated with another user.

### Change Password <Badge type="info" text="Partially requires auth" />

```http
PATCH /users/{id}/credentials/password
PATCH /users/me/credentials/password
```

Request body:

```typescript
type Request = {
    old_password?: string;
    otp_token?: string;
    new_password: string;
}
```

Returns `204 No Content` on success.

Permission check:

- Without valid auth:
    - Cannot request the ID-less endpoint.
    - Must provide `otp_token` or `old_password`.
- With valid auth:
    - May omit `otp_token` and `old_password`.
    - Other restrictions same as [Get User Info](#get-user-info).

The `otp_token` semantics and how to obtain it are described in [OTP Verification](#otp).

### Issue or Rotate TOTP Private Key <Badge type="tip" text="Auth required" /> {#new-totp-privkey}

Note: Given the practical situation, we don't expect users to manage TOTP themselves — that's Phanerite's job.

```http
POST /users/me/credentials/totp
```

Request body is empty.

Response:

```typescript
type Payload = {
    secret: string; // TOTP secret key
    otpauth_url: string; // Secret key URL in otpauth:// format
}
```

The TOTP is temporary at this point. The user must complete a TOTP challenge to confirm successful setup (see [Activate TOTP](#activate-totp)).

After a successful request, the old TOTP key is immediately invalidated. Phanerite should store the new key.

Note: This endpoint has no user-ID-parameterized version; it only operates on the currently logged-in user.

### Activate TOTP <Badge type="tip" text="Auth required" /> {#activate-totp}

A newly issued or rotated TOTP key is considered inactive and cannot be used for authentication. The client must perform the following operation once to activate it.

```http
PATCH /users/me/credentials/totp
```

Request body:

```typescript
type Request = {
    otp_token: string;
}
```

Returns `204 No Content` on success.

### Disable TOTP <Badge type="tip" text="Auth required" />

```http
DELETE /users/me/credentials/totp
```

Returns `204 No Content` on success.

### Create User (Admin) <Badge type="danger" text="Auth required (Admin)" />

This endpoint is designed for administrators to create users from the admin panel. General registration should not use this endpoint (see [Registration](#register)).

```http
POST /user
```

Request body:

```typescript
type Request = {
    email: string;
    name?: string; // Uses email if not specified
    permissions: Permission[];
}
```

Response:

```typescript
type Payload = User & { password: string };
```

Only admin users can call this endpoint; otherwise returns `403 Forbidden`.

Users created this way get a randomly generated password. They should change it immediately after first login.

## Registration {#register}

This is a relatively complex feature, so it gets its own section.

### For Public Instances

This covers the case where `config.service.public` is `true` — the server owner expects their Aphanite instance to be a general-purpose, public skin server allowing open registration.

In this case, we introduce Cloudflare Turnstile to prevent abuse (i.e., bulk bot registration). Turnstile can be disabled — though we strongly advise against it.

#### Get Turnstile Site Key

For displaying the Turnstile widget client-side, see the [Turnstile documentation](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

```http
GET /turnstile
```

Response:

```typescript
type Payload={
  site_key:string;
}
```

- Returns `403 Forbidden` if the server hasn't enabled public registration.
- Returns `404 Not Found` if the server has public registration but Turnstile is not enabled.

### For Private Instances

User creation for private instances is more involved — it requires administrator approval. An admin creates a temporary registration token (valid only for the registration endpoint), which the user can then use to request registration.

> [!TIP]
>
> **Suggested frontend implementation**: Append the token as a query parameter to the registration URL. Frontend JS automatically extracts it and uses it for authentication — achieving registration via a special URL.

#### Create Registration Token <Badge type="danger" text="Auth required (Admin)" />

```http
POST /register/session
```

Request body:

```typescript
type Payload = {
  expires_after: number; // Registration token lifetime in minutes, max 10080 minutes (7 days)
}
```

Response:

```typescript
type Payload={
  token: string;
};
```

### Register

Both private and public instances use the same `/register` endpoint. However, depending on the registration type and whether Turnstile is enabled, `turnstile_token` and `register_token` are optional.


```http
POST /register
```

Request body:

```typescript
type Request={
  register_token?:string;
  turnstile_token?:string;
  email:string;
  name?:string; // Defaults to email if not specified. Should not exceed 20 characters.
  password:string; // Should be more than 8 characters and less than 128 characters.
}
```

Response:

```typescript
type Payload=User;
```

- If the server has public registration enabled:
  - If Turnstile is enabled:
    - If neither a registration token nor Turnstile token is provided → `400 Bad Request`.
    - If a Turnstile token is provided but fails validation → `422 Unprocessable Content`.
    - If a registration token is provided but fails validation → `403 Forbidden`.
  - If Turnstile is not enabled:
    - No auth-related failures.
- If the server does not have public registration:
  - If no registration token is provided (Turnstile token ignored) → `400 Bad Request`.
  - If a registration token is provided but fails validation → `403 Forbidden`.
- If the email conflicts with an existing user → `409 Conflict`.
- If the name and password failed the length checks → `418 I'm a Teapot`.

## Profiles

A Profile represents a Minecraft player entity — containing the player name, UUID, textures, etc.

### List User Profiles <Badge type="tip" text="Auth required" />

List all player profiles for the current user or a specified user.

```http
GET /users/{id}/profiles?with_skin={bool}
GET /users/me/profiles?with_skin={bool}
```

Response:

```typescript
type Payload = Array<{
  metadata: Profile;
  skin?: ProfileSkin;
}>;
```

- If the auth info is invalid → `401 Unauthorized`.
- If requesting the endpoint without an ID:
  - Succeeds.
- If a user ID is specified:
  - If the ID matches the current user → succeeds.
  - Otherwise, if the current user does not have Management permission → `403 Forbidden`.
  - If the current user has Management permission but the target user does not exist → `404 Not Found`.
  - If the current user has Management permission and the target user exists → succeeds.

Same as [below](#get-profile), a profile may not have skin or cape set — even if `with_skin=true` is specified, the returned `skin` may be an empty object.

### Create Profile <Badge type="tip" text="Auth required" />

```http
POST /profile
```

Request body:

```typescript
type Request = {
    name: string;
}
```

Response:

```typescript
type Payload = Profile;
```

### Delete Profile <Badge type="tip" text="Auth required" />

```http
DELETE /profiles/{id}
```

Response:

```typescript
type Payload = Profile;
```

- Returns `404 Not Found` if the target profile doesn't exist.
- If the target profile exists but doesn't belong to the current user:
    - If the current user has Management permission → succeeds.
    - Otherwise → `403 Forbidden`.

### Get Profile Info {#get-profile}

This endpoint does not require authentication.

```http
GET /profiles/{id}?with_skin={bool}
```

- `with_skin`: Boolean. Whether to include skin data in the response.

Response:

```typescript
type Payload = {
    metadata: Profile;
    skin?: ProfileSkin;
}
```

Note that a profile may not have skin or cape set — all three fields in `skin` can be absent.

### Update Profile Metadata <Badge type="tip" text="Auth required" />

```http
PATCH /profiles/{id}
```

Request body:

```typescript
type Request = {
    name?: string
}
```

Response:

```typescript
type Payload = Profile;
```

Authentication for this endpoint is the same as the "Delete Profile" endpoint.

The `name` here is a Minecraft player name, subject to the same constraints as the official Minecraft: Java Edition player names (otherwise the game will report "Invalid characters" and refuse to enter the world):

- Length between 3–16 characters;
- Only letters, digits, and underscores allowed.

If the player name being modified does not meet these requirements, `400 Bad Request` is returned.

### Update Texture <Badge type="tip" text="Auth required" />

```http
PUT <aphanite_base_url>/api/yggdrasil/api/user/profile/{uuid}/{textureType}
DELETE <aphanite_base_url>/api/yggdrasil/api/user/profile/{uuid}/{textureType}
```

For implementation details and usage, refer to the [Authlib-injector documentation](https://yushijinhun.github.io/authlib-injector/en/yggdrasil-server-technical-specification.html#texture-upload).

All users in Aphanite can upload skins and capes for any of their profiles.
