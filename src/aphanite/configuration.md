---
outline: "deep"
description: "Aphanite configuration file reference, written in TOML format."
---

<script setup>
import { data as aphanite_config } from "../components/aphanite-config-toml.data.ts";
import toml from "@shikijs/langs/toml";
import github_dark from "@shikijs/themes/github-dark";
import github_light from "@shikijs/themes/github-light";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const shiki = createHighlighterCoreSync({
  themes: [github_dark, github_light],
  langs: [toml],
  engine: createJavaScriptRegexEngine(),
});

const highlighted_toml = shiki
  .codeToHtml(aphanite_config.content, {
    lang: "toml",
    themes: { dark: "github-dark", light: "github-light" },
    defaultColor: false,
  })
  // to override the default background color
  .replace(/style=".*?"/, "");

const snapshot_time = new Date(aphanite_config.fetched_at)
  .toLocaleString("en-US", {
    timeZone: "UTC", 
    hour12: false
  });
</script>

# Configuration

Aphanite's configuration file is in TOML format (similar to INI).

The default config file path is `./config.toml` in the current directory. You can override it with
the `--config` flag.

Below is a detailed explanation of each configuration option.

## `service` Section

Basic settings for the Aphanite service.

### `listen`

The IP address Aphanite listens on.

- Accepts: Any valid IP address, e.g. `127.0.0.1`, `fe80::1`.
- Default: `127.0.0.1`.
- Unless you have special requirements, stick with `127.0.0.1`.
- The official Docker image ignores this setting by explicitly passing `--listen 0.0.0.0`, which
  listens on all network interfaces.

### `port`

The port Aphanite listens on.

- Accepts: Any valid port number (≤65535).
- Default: `3000`.
- If Aphanite exits with "port already in use", you likely need to change this number.
- When deploying with the Docker image, do not change this setting to use a different host port.
  Instead, change the mapping in the startup arguments, such as `-p <host-port>:3000`.

### `domain`

The domain Aphanite is deployed to.

- Accepts: Any valid domain name.
- If you're using a reverse proxy or tunneling service, set this to the domain through which you and
  your players can reach Aphanite (e.g., `aphanite.example.com`).

### `path`

A subdirectory path for Aphanite.

- Accepts: Any path starting with `/`.
- Default: `/`.
- Only change this if Aphanite is deployed under a subdirectory (e.g.,
  `https://aphanite.example.com/aphanite/`). If you're not sure what this means, you likely don't
  need to change it.

### `data_path`

The directory where Aphanite stores its data files. Aphanite puts temporary files and the Turso
database here.

- Accepts: Any filesystem path (absolute or relative).
- Default: `./data`.
- When using the Docker image, do not change this unless you have a strong reason. Aphanite stores
  data in `/app/data` inside the container by default; instead, mount a host directory to
  `/app/data` with the `-v` option to change where the data is actually stored.

### `tls`

> [!WARNING]
>
> If you intend to use Aphanite in production, **do not modify this**. The only scenario where this
> should be changed is if you are a developer debugging Aphanite.

Whether to use the `https` prefix in generated resource URLs. This switch tells Aphanite that
external traffic is using HTTPS, so download links are generated with `https://` instead of
`http://`.

- Accepts: `true` or `false`.
- Default: `true`.

### `client_ip`

> [!TIP]
>
> This feature is designed for Minecraft Java Edition's "prevent proxy connections" feature (see
> [Minecraft Wiki](https://minecraft.wiki/w/Server.properties)). If you're using port forwarding on
> your game server, you should not enable `prevent-proxy-connections` on the Java server side.

Which HTTP header to use for obtaining the client's real IP.

- Accepts:
  - `disabled` - Turn off IP retrieval entirely; no checks are performed even if the server has
    `prevent-proxy-connections` enabled.
  - `X-Forwarded-For` - The [de facto](https://en.wikipedia.org/wiki/De_facto_standard) standard.
    Recommended.
  - `Forwarded` - The new standard defined by RFC7239. See
    [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Forwarded).
  - `CF-Connecting-IP` - Cloudflare
  - `CloudFront-Viewer-Address` - AWS CloudFront
  - `Fly-Client-IP` - [Fly.io](https://fly.io/)
  - `True-Client-IP` - Very old or legacy systems; typically should not be used.
  - `X-Envoy-External-Address` - [Envoy Proxy](https://www.envoyproxy.io/)
  - `X-Real-Ip` - Nginx
- Default: `X-Forwarded-For`.
- The value depends on which reverse proxy service you're using.

In most cases, `X-Forwarded-For` or `disabled` works fine. **Do not change this lightly**.

### `public`

Whether to allow public registration.

- Accepts: `true` or `false`.
- Default: `false`.
- If your server is for friends only, keep it `false`. If set to `true`, anyone who knows your
  server address can register. It is strongly recommended to enable Cloudflare Turnstile as well to
  prevent abuse.

## `service.turnstile` Section

> [!WARNING]
>
> If you decide to make your Aphanite instance public (e.g., as a general-purpose skin server), you
> **must** enable Turnstile. Otherwise, new user registration will have **no restrictions** — your
> site could be overwhelmed by a flood of (mostly bot) registrations.

[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) configuration. Cloudflare
Turnstile is a low-friction, high-UX CAPTCHA alternative. Instead of traditional exams, it uses a
simple checkbox to provide a fast, secure, reliable, and (importantly) free anti-abuse solution.

### `enabled`

Whether to enable Turnstile protection.

- Accepts: `true` or `false`.
- Default: `false`.
- If `public` is `false`, you can leave this disabled.

### `site_key`

Your Cloudflare Turnstile site key.

- Accepts: Your Turnstile site key.
- The default value is a test key that passes all requests without actual verification. Get your own
  keys at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).

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
- As with the setting above, do not change this lightly when using a Docker container.

### `storage.s3` {#s3}

> [!TIP]
>
> Cloudflare offers [Cloudflare R2](https://www.cloudflare.com/products/r2/), an S3-compatible
> object storage service with 10 GB free and no egress fees. If you're looking to save bandwidth on
> modpack distribution, consider using R2.

Only applies when `storage.type` is `s3`. Any S3-compatible object storage service can be used,
e.g., Cloudflare R2.

#### `bucket_name`

The name of your S3 bucket.

- Accepts: The bucket name you created in your S3 service.

#### `endpoint`

The endpoint URL of your S3 service.

- Accepts: Any valid URL.
- Default: `https://s3.amazonaws.com`.

For Cloudflare R2, set this to `https://<account-id>.r2.cloudflarestorage.com`. You can find this
URL in the Cloudflare dashboard under R2 Object Storage → "S3 API" in the bottom right.

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
- For S3 storage, this should typically be `<your-bucket-name>.<api-endpoint>`. _This varies by
  provider, no guarantee of correctness_.

## `database` Section

Configures the database Aphanite uses.

### `backend`

The database backend type.

- Accepts: `turso` or `postgres`.
- Default: `turso`.
- Unless you have specific needs, it's recommended to stick with `turso`.

> [!WARNING]
>
> Aphanite no longer supports the legacy SQLite backend. If you are upgrading an existing
> installation, please manually run
>
> ```sql
> PRAGMA journal_mode = "wal";
> PRAGMA wal_checkpoint(truncate);
> ```
>
> against the database (e.g. with the `sqlite3` CLI: `sqlite3 path/to/data.db`), then set
> `backend = "turso"`.

### `postgres_url`

The PostgreSQL connection URL. Ignore this if you set `backend` to `turso`.

- Accepts: A PostgreSQL connection string.
- Only required when `backend` is set to `postgres`, e.g.,
  `postgresql://user:password@localhost:5432/database`. See
  [Toasty documentation](https://tokio-rs.github.io/toasty/0.7.0/guide/postgresql.html) for details.
- When deploying with the Docker image, make sure the database backend is accessible from the
  Aphanite container.

## `yggdrasil` Section

Configuration related to the Yggdrasil authentication service.

### `private_key`

The private key for this Yggdrasil server.

- Accepts: A PKCS#8 PEM-formatted private key, starting with `-----BEGIN PRIVATE KEY-----` and
  ending with `-----END PRIVATE KEY-----`.
- `aphanite init` generates a key automatically, so you usually don't need to change this. But if
  you have an existing key, you can paste it here.

### `server_name`

The name of this Yggdrasil server.

- Accepts: Any string.
- Default: `Aphanite`.
- Optional. This name appears in fourth-party[^fourth-party] launchers when players add your
  Aphanite as a "custom authlib-injector server".

[^fourth-party]:
    Fourth-party launcher: a term we coined referring to third-party launchers that are neither the
    official launcher (first-party) nor [Phanerite](/phanerite/) (third-party).

### `homepage`

The homepage URL of this Yggdrasil server.

- Accepts: Any valid URL.
- Optional. Displayed in fourth-party[^fourth-party] launchers.

### `register_page`

The registration page URL of this Yggdrasil server.

- Accepts: Any valid URL.
- Optional. Displayed in fourth-party[^fourth-party] launchers, allowing players to click through
  and register an account.

## Example Configuration

> [!IMPORTANT]
>
> This article is based on the example configuration below. However, the content below only reflects
> the snapshot fetched when this documentation site was last built
> (<span v-once>{{ snapshot_time }}</span> UTC). If the Aphanite configuration format changes, this
> article may **not** be updated in sync. Therefore, always treat the configuration file generated
> by `aphanite init` as the **sole authoritative source**. If the content of this article conflicts
> with comments in the generated config file, defer to the config file. You can view the latest
> example configuration
> [here](https://git.feniota.org/feniota/aphanite/src/branch/main/src/assets/config.example.toml).

Below is the built-in example configuration file that this article is based on.

Commit:
<a :href="aphanite_config.url"><Badge type="tip" :text="aphanite_config.commit_sha.substr(0, 7)" /></a>

<details>
    <summary>Click to expand the example configuration file</summary>
    <div class="language-toml vp-code" v-html="highlighted_toml"></div>
</details>
