---
outline: "deep"
---

# 配置

Aphanite 的配置文件是 TOML 格式的（类似 INI）。

默认配置文件的路径是当前目录下 `./config.toml`，也可以通过指定 `--config` 参数来修改。

下面详细讲述每个配置项的用途和使用方式。

## `service` 小节

这里可以配置 Aphanite 服务的基本设置。

### `listen`

Aphanite 监听的 IP 地址。

- 接受的内容：任意合法的 IP 地址，如 `127.0.0.1`、`fe80::1`。
- 默认值：`127.0.0.1`。
- 无特殊需求，使用 `127.0.0.1` 就好。

### `port`

Aphanite 监听的端口。

- 接受的内容：任意合法（≤65535）的端口号。
- 默认值：`3000`。
- 如果 Aphanite 启动时报错“port already in use”并退出，那么你很可能需要换一个数字。

### `domain`

Aphanite 部署到的域名。

- 接受的内容：任意合法的域名。
- 如果使用了反向代理或内网穿透工具，这里应该填写让你和玩家们能访问到 Aphanite 的那个域名（例如 `aphanite.example.com`）。

### `path`

Aphanite 的子目录。

- 接受的内容：任意以 `/` 开头的路径。
- 默认值：`/`。
- 如果 Aphanite 部署在域名下的子目录中（例如 `https://aphanite.example.com/aphanite/`）才需要修改。如果你不确定这是什么意思，那么大概率不需要修改。

### `data_path`

Aphanite 存放数据文件的目录，Aphanite 会在这个目录下存放临时文件和 SQLite 数据库。

- 接受的内容：任意文件系统路径（绝对或相对）。
- 默认值：`./data`。

### `tls`

> [!WARNING]
>
> 如果你想要实际在游戏上使用 Aphanite，**请勿修改这一项**。需要修改这一项的唯一情形是：你是开发者，正在调试 Aphanite。

是否在生成的资源链接中使用 `https` 前缀。此开关能让 Aphanite 知道外部流量正在使用 HTTPS，从而在生成的下载链接中使用 `https://` 而不是 `http://`。

- 接受的内容：`true` 或 `false`。
- 默认值：`true`。

### `client_ip`

> [!TIP]
>
> 这个功能是为 Minecraft Java 版服务器的“阻止代理连接”（见 [Minecraft Wiki](https://zh.minecraft.wiki/w/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)）功能准备的，如果你的服务器使用端口转发，那么不应该打开 Java 版服务端的这个功能。

从哪个 HTTP 头获取客户端的真实 IP。

- 接受的内容：
  - `disabled` - 完全关闭获取 IP 的功能，就算服务端启用了 `prevent-proxy-connections` 也不做任何检查。
  - `X-Forwarded-For` - [事实上](https://en.wikipedia.org/wiki/De_facto_standard)的通用标准，推荐使用。
  - `Forwarded` - RFC7239 定义的新标准。见 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Forwarded)。
  - `CF-Connecting-IP` - Cloudflare
  - `CloudFront-Viewer-Address` - AWS CloudFront
  - `Fly-Client-IP` - [Fly.io](https://fly.io/)
  - `True-Client-IP` - 非常古老或落后系统才是这个，通常不该用到。
  - `X-Envoy-External-Address` - [Envoy Proxy](https://www.envoyproxy.io/)
  - `X-Real-Ip` - Nginx
- 默认值：`X-Forwarded-For`。
- 这个值取决于你使用的反向代理服务。

大多数情况下都可以直接使用 `X-Forwarded-For`。**请不要轻易修改**。

### `public`

是否允许公开注册。

- 接受的内容：`true` 或 `false`。
- 默认值：`false`。
- 如果你的服务器仅限朋友使用，保持 `false` 即可。如果设置为 `true`，任何知道你的服务器地址的人都可以注册账号。建议同时开启 Cloudflare Turnstile 以防止滥用。

## `service.turnstile` 小节

> [!WARNING]
>
> 如果你决定公开你的 Aphanite 站点（比如说，作为公开通用的皮肤站），那么请**一定**要开启 Turnstile 功能。否则，新用户注册**不会有任何限制**，你的站点有短时间内被大量用户（大多是机器人自动注册）涌入瘫痪的可能性。

[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) 配置。Cloudflare Turnstile 是一个低门槛、强用户体验的验证码（CAPTCHA）替代方案。它通过用点选一个复选框替代传统的考试，来提供一个迅速、安全、可靠、（最重要地）免费的防滥用方案。

### `enabled`

是否启用 Turnstile 保护。

- 接受的内容：`true` 或 `false`。
- 默认值：`false`。
- 如果 `public` 为 `false`，可以保持关闭。

### `site_key`

Cloudflare Turnstile 站点密钥。

- 接受的内容：你的 Turnstile 站点密钥。
- 默认值为测试密钥，它会放行所有请求而不做实际验证。请前往 [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) 获取你自己的密钥。

### `secret_key`

Cloudflare Turnstile 秘密密钥。

- 接受的内容：你的 Turnstile 秘密密钥。
- 注意事项同上。

## `storage` 小节

配置 Aphanite 存储文件的方式。

### `type`

存储后端类型。

- 接受的内容：`local` 或 `s3`。
- 默认值：`local`。
- `local` 将文件存储在本地文件系统中；`s3` 使用兼容 S3 协议的对象存储服务。

### `storage.local`

仅当 `storage.type` 为 `local` 时生效。

#### `path`

本地文件系统中存放文件的目录路径。

- 接受的内容：任意文件系统路径（绝对或相对）。
- 默认值：`./data/assets`。

### `storage.s3` {#s3}

> [!TIP]
>
> Cloudflare 提供一个 10GB 内免费、无流量费的对象存储服务——[Cloudflare R2](https://www.cloudflare.com/products/r2/)。如果你的 SakuraFrp 流量或服务器存储空间捉襟见肘，可以考虑使用 R2。

仅当 `storage.type` 为 `s3` 时生效。可以使用任意兼容 S3 协议的对象存储服务，例如 Cloudflare R2。

#### `bucket_name`

S3 存储桶的名称。

- 接受的内容：你在 S3 服务中创建的存储桶名称。

#### `endpoint`

S3 服务的终端节点地址。

- 接受的内容：任意合法的 URL。
- 默认值：`https://s3.amazonaws.com`。

如果是 Cloudflare R2，那么这里应该填写 `https://<账号ID>.r2.cloudflarestorage.com`。这个 URL 可以在 Cloudflare 控制面板->R2 对象存储->右下角的“S3 API”找到。

#### `region`

S3 存储桶所在的区域。

- 接受的内容：取决于你的 S3 服务提供商。
- 默认值：`us-east-1`。

如果是 Cloudflare R2，这里应该填写 `auto` 或 `us-east-1`。

#### `access_key`

S3 访问密钥 ID。

- 接受的内容：你的 S3 访问密钥 ID。
- **该密钥必须拥有写入权限。**

如果是 Cloudflare R2，这可以通过以下步骤获取：

1. 点击左边菜单的“管理账户”。
2. 选择“账户 API 令牌”。
3. 点击右上角的“创建令牌”。
4. 选择合适的权限：“Workers R2 Storage”，将 Read 和 Edit 都勾上。
5. 选择过期时间->审核令牌->创建令牌。
6. 在新弹出的对话框里，会出现这两个密钥。尽快复制并保存它们！

#### `secret_key`

S3 秘密访问密钥。

- 接受的内容：你的 S3 秘密访问密钥。

#### `domains`

告诉 Minecraft，可以从哪些域名获取纹理。

- 接受的内容：一个字符串数组，每一项是一个域名。
- 如果是本地存储，那么可以留空。
- 如果是 S3 存储，那么通常应该填写这个 URL：`<你的存储桶名>.<上面的 API endpoint>`。*具体由存储提供商而异，不保证这里的正确性*。

## `database` 小节

配置 Aphanite 使用的数据库。

### `backend`

数据库后端类型。

- 接受的内容：`sqlite` 或 `postgres`。
- 默认值：`sqlite`。
- 除非有特殊需求，否则建议保持使用 `sqlite`。

### `postgres_url`

PostgreSQL 数据库的连接 URL。如果你上面设置的是 `sqlite` 的话请忽略。

- 接受的内容：PostgreSQL 连接字符串。
- 仅当 `backend` 设置为 `postgres` 时需要填写，例如：`postgresql://user:password@localhost:5432/database`。详细格式请参考 [Toasty 文档](https://tokio-rs.github.io/toasty/0.7.0/guide/postgresql.html)。

## `yggdrasil` 小节

配置 Yggdrasil 认证服务的相关信息。

### `private_key`

此 Yggdrasil 服务器的私钥。

- 接受的内容：PKCS#8 PEM 格式的私钥，以 `-----BEGIN PRIVATE KEY-----` 开头、以 `-----END PRIVATE KEY-----` 结尾。
- `aphanite init` 会自动生成私钥，通常不需要手动修改。但如果你已经有现成的私钥，可以填入此处。

### `server_name`

此 Yggdrasil 服务器的名称。

- 接受的内容：任意字符串。
- 默认值：`Aphanite`。
- 可选配置。此名称会展示在第四方[^fourth-party]启动器中，当玩家将你的 Aphanite 添加为"自定义 authlib-injector 服务器"时可见。

[^fourth-party]: 第四方启动器：我们发明的术语，指既不是官方启动器（第一方）又不是 [Phanerite](/zh/phanerite/)（第三方）的其他第三方启动器。

### `homepage`

此 Yggdrasil 服务器的主页地址。

- 接受的内容：任意合法的 URL。
- 可选配置。会展示在第四方[^fourth-party]启动器中。

### `register_page`

此 Yggdrasil 服务器的注册页面地址。

- 接受的内容：任意合法的 URL。
- 可选配置。展示在第四方[^fourth-party]启动器中，玩家可以通过此链接注册账号。

## 示例配置文件

> [!IMPORTANT]
>
> 本文是基于下面的示例配置文件编写的。然而，由于精力有限，如果 Aphanite 的配置文件格式发生了更新，本文有可能**无法**及时同步。因此，请总是视 `aphanite init` 生成的配置文件为**唯一权威依据**。如果本文描述的内容和命令生成的配置文件中的注释有冲突，请总以配置文件为主。你可以在[这里](https://github.com/feniota/aphanite/blob/main/src/assets/config.example.toml)查看 Aphanite 最新的示例配置文件。

下面是 Aphanite 内置的示例配置文件，本文也基于它编写。

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
postgres_url = "postgresql://user:pass@localhost:5432/mydb"

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
