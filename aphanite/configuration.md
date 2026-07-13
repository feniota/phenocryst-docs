---
outline: "deep"
---

# Configuration

Aphanite's configuration file is in TOML format (similar to INI).

The default config file path is `./config.toml` in the current directory. You can override it with the `--config` flag.

Below is a detailed explanation of each configuration option.

## `service` Section

Basic settings for the Aphanite service.

### `listen`

The IP address Aphanite listens on.

- Accepts: Any valid IP address, e.g. `127.0.0.1`, `fe80::1`.
- Default: `127.0.0.1`.
- Unless you have special requirements, stick with `127.0.0.1`.

### `port`

The port Aphanite listens on.

- Accepts: Any valid port number (≤65535).
- Default: `3000`.
- If Aphanite exits with "port already in use", you likely need to change this number.

### `domain`

The domain Aphanite is deployed to.

- Accepts: Any valid domain name.
- If you're using a reverse proxy or tunneling service, set this to the domain through which you and your players can reach Aphanite (e.g., `aphanite.example.com`).

### `path`

A subdirectory path for Aphanite.

- Accepts: Any path starting with `/`.
- Default: `/`.
- Only change this if Aphanite is deployed under a subdirectory (e.g., `https://aphanite.example.com/aphanite/`). If you're not sure what this means, you likely don't need to change it.

### `data_path`

The directory where Aphanite stores its data files. Aphanite puts temporary files and the SQLite database here.

- Accepts: Any filesystem path (absolute or relative).
- Default: `./data`.

### `tls`

> [!WARNING]
>
> If you intend to use Aphanite in production, **do not modify this**. The only scenario where this should be changed is if you are a developer debugging Aphanite.

Whether to use the `https` prefix in generated resource URLs. This switch tells Aphanite that external traffic is using HTTPS, so download links are generated with `https://` instead of `http://`.

- Accepts: `true` or `false`.
- Default: `true`.

### `client_ip`

> [!TIP]
>
> This feature is designed for Minecraft Java Edition's "prevent proxy connections" feature (see [Minecraft Wiki](https://minecraft.wiki/w/Server.properties)). If you're using port forwarding on your game server, you should not enable `prevent-proxy-connections` on the Java server side.

Which HTTP header to use for obtaining the client's real IP.

- Accepts:
  - `disabled` - Turn off IP retrieval entirely; no checks are performed even if the server has `prevent-proxy-connections` enabled.
  - `X-Forwarded-For` - The [de facto](https://en.wikipedia.org/wiki/De_facto_standard) standard. Recommended.
  - `Forwarded` - The new standard defined by RFC7239. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Forwarded).
  - `CF-Connecting-IP` - Cloudflare
  - `CloudFront-Viewer-Address` - AWS CloudFront
  - `Fly-Client-IP` - [Fly.io](https://fly.io/)
  - `True-Client-IP` - Very old or legacy systems; typically should not be used.
  - `X-Envoy-External-Address` - [Envoy Proxy](https://www.envoyproxy.io/)
  - `X-Real-Ip` - Nginx
- Default: `X-Forwarded-For`.
- The value depends on which reverse proxy service you're using.

In most cases, `X-Forwarded-For` works fine. **Do not change this lightly**.

### `public`

Whether to allow public registration.

- Accepts: `true` or `false`.
- Default: `false`.
- If your server is for friends only, keep it `false`. If set to `true`, anyone who knows your server address can register. It is strongly recommended to enable Cloudflare Turnstile as well to prevent abuse.

## `service.turnstile` Section

> [!WARNING]
>
> If you decide to make your Aphanite instance public (e.g., as a general-purpose skin server), you **must** enable Turnstile. Otherwise, new user registration will have **no restrictions** — your site could be overwhelmed by a flood of (mostly bot) registrations.

[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) configuration. Cloudflare Turnstile is a low-friction, high-UX CAPTCHA alternative. Instead of traditional exams, it uses a simple checkbox to provide a fast, secure, reliable, and (importantly) free anti-abuse solution.

### `enabled`

Whether to enable Turnstile protection.

- Accepts: `true` or `false`.
- Default: `false`.
- If `public` is `false`, you can leave this disabled.

### `site_key`

Your Cloudflare Turnstile site key.

- Accepts: Your Turnstile site key.
- The default value is a test key that passes all requests without actual verification. Get your own keys at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).

### `secret_key`

Your Cloudflare Turnstile secret key.

- Accepts: Your Turnstile secret key.
- Same caveats as above.

## `storage` Section

Configures how Aphanite stores files.

### `type`

The storage backend type.

- Accepts: `local` or `s3`.
- Default: `local`.
- `local` stores files on the local filesystem; `s3` uses an S3-compatible object storage service.

### `storage.local`

Only applies when `storage.type` is `local`.

#### `path`

The filesystem path for storing files.

- Accepts: Any filesystem path (absolute or relative).
- Default: `./data/assets`.

### `storage.s3` {#s3}

> [!TIP]
>
> Cloudflare offers [Cloudflare R2](https://www.cloudflare.com/products/r2/), an S3-compatible object storage service with 10 GB free and no egress fees. If you're looking to save bandwidth on modpack distribution, consider using R2.

Only applies when `storage.type` is `s3`. Any S3-compatible object storage service can be used, e.g., Cloudflare R2.

#### `bucket_name`

The name of your S3 bucket.

- Accepts: The bucket name you created in your S3 service.

#### `endpoint`

The endpoint URL of your S3 service.

- Accepts: Any valid URL.
- Default: `https://s3.amazonaws.com`.

For Cloudflare R2, set this to `https://<account-id>.r2.cloudflarestorage.com`. You can find this URL in the Cloudflare dashboard under R2 Object Storage → "S3 API" in the bottom right.

#### `region`

The region of your S3 bucket.

- Accepts: Depends on your S3 provider.
- Default: `us-east-1`.

For Cloudflare R2, set this to `auto` or `us-east-1`.

#### `access_key`

Your S3 access key ID.

- Accepts: Your S3 access key ID.
- **This credential must have write access.**

For Cloudflare R2, you can obtain one as follows:

1. Click "Manage Account" in the left sidebar.
2. Select "Account API Tokens".
3. Click "Create Token" in the top right.
4. Choose the appropriate permissions: "Workers R2 Storage", check both Read and Edit.
5. Set an expiration time → Review token → Create token.
6. In the popup dialog, you'll see both keys. Copy and save them promptly!

#### `secret_key`

Your S3 secret access key.

- Accepts: Your S3 secret access key.

#### `domains`

Tells Minecraft from which domains textures can be obtained.

- Accepts: An array of strings, each entry is a domain name.
- For local storage, this can be left empty.
- For S3 storage, this should typically be `<your-bucket-name>.<api-endpoint>`. *This varies by provider, no guarantee of correctness*.

## `database` Section

Configures the database Aphanite uses.

### `backend`

The database backend type.

- Accepts: `sqlite` or `postgres`.
- Default: `sqlite`.
- Unless you have specific needs, it's recommended to stick with `sqlite`.

### `postgres_url`

The PostgreSQL connection URL. Ignore this if you set `backend` to `sqlite`.

- Accepts: A PostgreSQL connection string.
- Only required when `backend` is set to `postgres`, e.g., `postgresql://user:password@localhost:5432/database`. See [Toasty documentation](https://tokio-rs.github.io/toasty/0.7.0/guide/postgresql.html) for details.

## `yggdrasil` Section

Configuration related to the Yggdrasil authentication service.

### `private_key`

The private key for this Yggdrasil server.

- Accepts: A PKCS#8 PEM-formatted private key, starting with `-----BEGIN PRIVATE KEY-----` and ending with `-----END PRIVATE KEY-----`.
- `aphanite init` generates a key automatically, so you usually don't need to change this. But if you have an existing key, you can paste it here.

### `server_name`

The name of this Yggdrasil server.

- Accepts: Any string.
- Default: `Aphanite`.
- Optional. This name appears in fourth-party[^fourth-party] launchers when players add your Aphanite as a "custom authlib-injector server".

[^fourth-party]: Fourth-party launcher: a term we coined referring to third-party launchers that are neither the official launcher (first-party) nor [Phanerite](/phanerite/) (third-party).

### `homepage`

The homepage URL of this Yggdrasil server.

- Accepts: Any valid URL.
- Optional. Displayed in fourth-party[^fourth-party] launchers.

### `register_page`

The registration page URL of this Yggdrasil server.

- Accepts: Any valid URL.
- Optional. Displayed in fourth-party[^fourth-party] launchers, allowing players to click through and register an account.

## Example Configuration

> [!IMPORTANT]
>
> This article is based on the example configuration below. However, due to limited energy, if the Aphanite configuration format changes, this article may **not** be updated in sync. Therefore, always treat the configuration file generated by `aphanite init` as the **sole authoritative source**. If the content of this article conflicts with comments in the generated config file, defer to the config file. You can view the latest example configuration [here](https://github.com/feniota/aphanite/blob/main/src/assets/config.example.toml).

Below is the built-in example configuration file that this article is based on.

Commit: <a href="https://github.com/feniota/aphanite/commit/8ddd42a1738ca6d0b74763eca3fd0f53602c0ca8"><Badge type="tip" text="8ddd42a" /></a>

```toml
# Aphanite configuration file
# Generated by Aphanite v{APHANITE_VERSION}

# Configuration related to the general Aphanite service
[service]

# IP to listen on
listen = "{APHANITE_CONFIG_LISTEN}"

# Port to listen on
port = {APHANITE_CONFIG_PORT}

# Domain of this server
domain = "aphanite.example.com"

# Subdirectory of this server
#
# If your server is under a subdirectory, change this.
# For example setting `path = "/aphanite"` would make Aphanite listen on
# "https://aphanite.example.com/aphanite/". If you don't know what this means,
# it's likely unnecessary to change this.
#
# path = "/"

# Internal data path.
#
# Aphanite will put some files here, notably temporary files and the SQLite database
data_path = './data'

# Whether HTTPS is enabled for Aphanite
#
# Aphanite itself does NOT provide TLS functionality. One should use a reverse proxy
# to implement that, otherwise Minecraft would NOT trust the server. Still, this is
# good for testing. Aphanite uses this to indicate if `https` should be used in
# generated file URLs.
tls = {APHANITE_CONFIG_TLS_ENABLED}

# How could Aphanite get the actual client IP
#
# This is used to prevent proxy connections to the game server. See
# https://minecraft.wiki/w/Server.properties#prevent-proxy-connections for more details
# about this feature. Since Aphanite does not support TLS on its own, it is designed to
# be deployed behind a reverse proxy service so we only support finding the IP from HTTP
# headers.
#
# Possible values: disabled, CF-Connecting-IP, CloudFront-Viewer-Address, Fly-Client-IP,
#                  Forwarded, X-Forwarded-For, True-Client-IP, X-Envoy-External-Address,
#                  X-Real-Ip
#
# This value depends on the specific reverse proxy service behind which Aphanite lives,
# but "X-Forwarded-For" should work in most circumstances. See the wiki for more details.
client_ip = "X-Forwarded-For"

# Whether this server is considered public
#
# If this is set to true, Aphanite will allow public registration.
# NOTE: If you decided to make your server public, you might want to enable Cloudflare
#       Turnstile to protect your site from abuse.
public = false

# Cloudflare Turnstile configuration
[service.turnstile]

# Whether to protect your server with Cloudflare Turnstile
#
# If your server is private(public = false), just don't mind Turnstile settings;
# If your server is public, then it is STRONGLY recommended to turn on Turnstile.
enabled = false

# Cloudflare Turnstile API Keys
#
# These values are for testing. They allow ALL requests without actual verification.
# Get your own keys at https://dash.cloudflare.com/?to=/:account/turnstile
site_key = "1x00000000000000000000AA"
secret_key = "1x0000000000000000000000000000000AA"


# Configuration related to the storage
[storage]

# Where to store the files
#
# Possible values: "local", "s3"
type = "local"

# Configuration related to the "local" storage type
[storage.local]

# The path on filesystem to put the files
# When storage.type is set to s3 this directory is not touched
path = './data/assets'

# Configuration related to the "s3" storage type
#
# Any S3-compatible object storage service could be used, e.g. Cloudflare R2.
# Be careful: the meaning of the configuration fields may vary between providers.
[storage.s3]

# Name of the S3 bucket
bucket_name = "your-bucket"

# Region of the S3 bucket
endpoint = "https://s3.amazonaws.com"
region = "us-east-1"

# Credentials used to access the S3 bucket
# This credential MUST have write access
# Unfortunately we do not support reading from ~/.aws/credentials
access_key = "AKIA1234567890ABCDEF"
secret_key = "xxx"

# Possible domains from which objects may be obtained
#
# Please take care of this parameter, or Minecraft may consider textures on your
# server invalid.
domains = ["your-bucket.s3.amazonaws.com"]


# Configuration related to the database
[database]

# Database backend
#
# Don't change this unless you know what you are doing.
#
# Possible values: "sqlite", "postgres"
backend = "sqlite"

# URL to connect your PostgreSQL database
#
# See https://tokio-rs.github.io/toasty/0.7.0/guide/postgresql.html for more details.
postgres_url = "******localhost:5432/mydb"

# Configuration related to the Yggdrasil service
[yggdrasil]

# Private key of this Yggdrasil server
#
# This is used in signing and encryption to ensure your game's communications with the server safe.
# `aphanite init` generates a new private key so you likely should not change this.
# If you already have a private key, you can fill it here. This should be in PKCS#8 PEM format
# starting with "-----BEGIN PRIVATE KEY-----" and ending with "-----END PRIVATE KEY-----"
private_key = '''{APHANITE_CONFIG_PRIVATE_KEY}'''

# The following three items are shown in fourth-party launchers when you add Aphanite as a
# "custom authlib-injector server"

# Name of this Yggdrasil server
# server_name = "Aphanite"

# Homepage of this Yggdrasil server
# homepage = "..."

# Registration page of this Yggdrasil server
# register_page = "..."
```
