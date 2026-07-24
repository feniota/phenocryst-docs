---
outline: "deep"
---

# Aphanite General API

Aphanite 系统中 Yggdrasil 和 Phenocryst 两者共享的部分称为 General。

这里定义了 Aphanite General API 的端点定义和实现细节，使用 TypeScript 类型描述 API 期待的请求体/返回的报文。

## 基本约定 {#basic-conventions}

若非特殊说明，Aphanite General API 和 Phenocryst API 都应遵循下面的约定。

1. 请求和返回的报文均应为 JSON 格式，并正确包含 `Content-Type: application/json` 头部。
2. 无论请求是否成功，服务器都以下面的格式响应：
    ```typescript
    type Response<Payload> = {
      success: boolean; // 该操作是否成功
      payload?: Payload; // 若操作成功，服务器响应的实际数据。
      reason?: string; // 若操作失败，人类可读的错误原因。
    };

    // 或者，更具体地
    type Response<Payload> = {
      success: true;
      payload: Payload;
    } | {
      success: false;
      reason: string;
    };
    ```
   若请求发生错误，应该正确指定 HTTP 状态码，但 `reason` 的内容应是引发错误的真实原因，不一定要和 Reason Phrase 契合。
   `payload` 的类型不做限制，可以是任何 JSON 可以表达的类型（具体由业务 API 而定），但不能为空。如果实在没有什么返回的可以使用
   `204 No Content`。下面所说的所有回复体类型都视为这里名为 `Payload` 的泛型参数的内容。
3. 下面提及的端点路径是 `<aphanite_base_url>/api` 下的子目录。

## 数据模型

这里定义一些通用的数据模型，可能会在下面的返回值中被引用。

```typescript
// 用户的元信息
type User = {
    id: string; // 用户的 UUID
    name: string; // 用户的名称，注意该字段非唯一
    email: string; // 用户的邮箱
    permissions: Permission[]; // 用户的权限
};

// 用户的权限。在内部是用数字的比特位存储的，但是序列化时会转换成枚举数组，
// 对于客户端来说只需要把这个枚举解析出来就可以了。
const enum Permission {
    Management = "management",
}

// 玩家角色的元数据
type Profile = {
    id: string; // 该玩家角色的 UUID；
    name: string; // 该玩家角色的游戏内名称。**只能为 ASCII 字符串**
    owner: string; // 该玩家角色所属的 Aphanite 用户的 UUID；
};

// 玩家皮肤的数据
type ProfileSkin = {
    skin?: string; // 皮肤的 URL
    model?: "default" | "slim"; // 手臂粗细
    cape?: string; // 披风的 URL
}
```

## 鉴权

Aphanite 使用基于令牌的鉴权机制。为了避免维护多个系统带来的复杂性，该令牌的颁发使用 Yggdrasil 的格式，和 Yggdrasil
服务共享同一个池。也就是，Phenocryst 客户端只需要登录一次，就可以同时请求 Phenocryst API 和 Yggdrasil API。

然而，虽然令牌和 Minecraft 验证服务共用同一个池，但由于 Aphanite 系统有独特的用户模型，针对 Aphanite 设计的客户端需要请求
Aphanite 自有的 API，以获取属于 Aphanite 内部的用户信息。

本文使用形如<Badge type="tip" text="需要鉴权" />的徽章来表示该端点需要[鉴权](#authorization)；使用形如<Badge type="danger" text="需要鉴权 (管理员)" />的徽章表示该端点需要[鉴权](#authorization)，且该端点需求当前用户具有 Management 权限。

### 登录

使用用户的邮箱和密码获取用户信息，并颁发一组验证令牌。

```http
POST /auth/login
```

请求体：

```typescript
type Request = {
    email: string; // 账户邮箱
    password?: string; // 账户密码（明文）
    otp_token?: string; // OTP 挑战结果
}
```

其中 `otp_token` 的值和获取方式见 [OTP 验证](#otp)。

此处引入 OTP 的意义在于，防止“一密通”用户由于 Aphanite 泄露密码。但是和传统的安全实践不同，Aphanite 系统中的 OTP 是
1FA，在使用上和密码具有相同的权威性——这也导致 Aphanite 没那么安全就是了。

客户端应该总是使用 OTP 来获取 Token，将密码当作二级的、备选的方案。

返回体：

```typescript
type Payload = {
    access_token: string;
    client_token: string;
    user: User;
}
```

注意，Client Token 仅在 Yggdrasil API 的特殊情形中使用。我们约定，在 Aphanite General 和 Phenocryst
中忽略它的存在。不过，启动器仍然应该存储它，以备不时之需。

### 刷新令牌 <Badge type="tip" text="需要鉴权" />

令牌的过期时间是 15 日，在有效期内都可以用来鉴权。但是原则上，Phanerite 应该每天刷新一次令牌。由于 Yggdrasil 的令牌刷新 API
涉及 Profile 选择等，这里设计一个更简单的自有 API。

```http
POST /auth/refresh
```

请求体为空。

返回体：

```typescript
type Payload = {
    access_token: string; // 新的 Access Token
    user: User; // 令牌对应的用户的信息；注意，启动器应该将这里返回的信息填入本地存储——如果用户有修改自己的信息就能派上用场
}
```

Client Token 在刷新令牌后保持不变；服务端就不再返回了。

### 检查令牌状态 <Badge type="tip" text="需要鉴权" />

```http
GET /auth/validate
```

如果令牌有效，则返回 `204 No Content`。

### API 鉴权 {#authorization}

在 Phenocryst 和其他 General API 中，鉴权通过将 Access Token 作为 Bearer token 放进 `Authorization` 头实现，如：

```http
POST /api/endpoint HTTP/1.1
Authorization: Bearer access_token
Content-Type: application/json; charset=utf-8
Content-Length: 18

{"request":"body"}
```

如果到<Badge type="tip" text="需要鉴权" />的端点的请求不包含鉴权信息，或者鉴权信息错误（如 token 已过期），则返回 `401 Unauthorized`。

## OTP 验证 {#otp}

### OTP 验证流程

这里的 OTP 机制主要是为了无密码登录或重置密码，所以不需要鉴权。

验证采用会话的形态。基本流程为：

- 客户端请求[创建 OTP 验证会话](#create-otp-session)。
- 客户端拿到会话 ID，等待验证码出现。（设计上，这里的验证码可以是管理员后台验证码、邮件验证码、TOTP；不过目前仅支持 TOTP。）
- 客户端使用会话 ID 和验证码请求[完成 OTP 验证](#validate-otp)。
- 客户端拿到 `otp_token`。这是一个一次性令牌，和密码具有同等效力，可以用来请求[登录 API](#login)。

#### TOTP

Phanerite 应在本地存储 TOTP 密钥，而不是储存明文密码，来让用户能不频繁输入密码的同时可以持久化登录，又不存储用户的密码。

要创建 TOTP 私钥，客户端应在已登录的情况下请求[颁发或旋转用户的 TOTP 私钥](#new-totp-privkey)，获得 TOTP 私钥。

要用 TOTP 登录，客户端应遵循上面的验证流程，将 `method` 设为 `totp`，并将当前时间点的 TOTP 验证码作为 OTP 验证码提交。

TOTP 使用符合 RFC 6238 的算法计算，时间步长设为 30 秒，长度为 6 位。

### 创建 OTP 验证会话 {#create-otp-session}

```http
POST /verification
```

请求体：

```typescript
type Request = {
    email: string;
    method: string;
}
```

截止 Aphanite v0.1.0，`method` 仅支持 `totp`。

返回体：

```typescript
type Payload = {
    id: string;
}
```

- 如果用户没有 [TOTP 私钥](#new-totp-privkey)，则返回 `400 Bad Request`。

### 完成 OTP 验证 {#validate-otp}

```http
POST /verification/{id}
```

请求体：

```typescript
type Request = {
    code: string; // OTP 验证码
}
```

返回体：

```typescript
type Payload = {
    otp_token: string;
}
```

- 如果指定的 OTP Session ID 不存在，则返回 `404 Not Found`。
- 如果指定的 OTP Session ID 存在，但是验证码错误，则返回 `401 Unauthorized`。

## 用户系统

下面的大部分 API 提供两个端点：

- 一个是 `/users/{id}` 路径下的，意为指定用户，其中 `id` 字段是目标用户的 UUID。
- 另一个是 `/users/me` 路径下的，代表当前用户，通常需要鉴权。

### 查询用户信息 <Badge type="tip" text="需要鉴权" />

```http
GET /users/{id}
GET /users/me
```

返回体：

```typescript
type Payload = User;
```

权限鉴定：

- 如果请求 `/user/me`，正常返回；
- 如果请求 `/users/{id}` 且 `id` 是当前用户的 ID，正常返回；
- 如果请求 `/users/{id}` 且 `id` 不是当前用户，则检查当前用户是否具有 Management 权限，有则正常返回；
- 如果请求不包含鉴权信息或鉴权错误，返回 `401 Unauthorized`。

### 修改用户元信息 <Badge type="tip" text="需要鉴权" />

```http
PATCH /users/{id}
PATCH /users/me
```

请求体：

```typescript
type Request = {
    name?: string;
    email?: string;
}
```

返回体：

```typescript
type Payload = User;
```

权限鉴定：同[查询用户信息](#查询用户信息)。

注意，Aphanite 用户的邮件地址**全局唯一**。如果要更改的邮箱已经被其他用户关联了，则返回 `409 Conflict`。

### 修改用户密码 <Badge type="info" text="部分需要鉴权" />

```http
PATCH /users/{id}/credentials/password
PATCH /users/me/credentials/password
```

请求体：

```typescript
type Request = {
    old_password?: string;
    otp_token?: string;
    new_password: string;
}
```

如果成功，返回 `204 No Content`。

权限鉴定：

- 如果未携带有效鉴权信息:
    - 不能请求省略 ID 的端点；
    - 应指定 `otp_token` 或 `old_password`。
- 如果携带了有效鉴权信息：
    - 可以省略 `otp_token` 和 `old_password`；
    - 其他限制和[查询用户信息](#查询用户信息)相同。

`otp_token` 的含义和获取方式见 [OTP 验证](#otp)。

### 颁发或旋转用户的 TOTP 私钥 <Badge type="tip" text="需要鉴权" /> {#new-totp-privkey} 

新颁发或刚刚旋转的 TOTP 密钥应该被用户妥善保存，创建后应该完成一次验证确保可用。

注意，考虑到用户的实际情况，我们不期望由用户自己管理 TOTP——这是 Phanerite 需要做的事情。

```http
POST /users/me/credentials/totp
```

请求体为空。

返回体：

```typescript
type Payload = {
    secret: string; // TOTP 私钥
    otpauth_url: string; // otpauth:// 格式的私钥 URL
}
```

请求成功后，原有的 TOTP 密钥立即失效，Phanerite 需要将新密钥存储下来。

注意，该端点不提供指定用户 ID 的版本，只在当前已登录的用户上生效。

### 关闭 TOTP <Badge type="tip" text="需要鉴权" />

```http
DELETE /users/me/credentials/totp
```

若关闭成功，则返回 `204 No Content`。

### 创建用户（管理员） <Badge type="danger" text="需要鉴权 (管理员)" />

这一端点是为管理员在后台创建用户设计的，一般注册流程不应使用此端点，见[下文](#register)。

```http
POST /user
```

请求体：

```typescript
type Request = {
    email: string;
    name?: string; // 未指定则使用邮箱
    permissions: Permission[];
}
```

返回体：

```typescript
type Payload = User & { password: string };
```

仅管理员用户可以请求，否则返回 `403 Forbidden`。

通过这一端点创建的用户，密码会随机生成。用户登录后应该第一时间修改密码。

## 注册 {#register}

因为这是一个相对复杂的功能，所以分一个单独的小标题。

### 对于公开实例

这里指 `config.service.public` 为 `true` 的情况——即，服主期望自己的 Aphanite 实例是一个通用的、公开的皮肤站，允许公开注册。

这种情况下，我们引入 Cloudflare Turnstile 系统，以防止滥用（即，以机器方式批量注册大量账号）。不过 Turnstile 功能是可以禁用的——虽然我们十分不建议这样做。

#### 获取 Turnstile 站点密钥

这是为了在客户端显示 Turnstile 组件，见 [Turnstile 文档](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)。

```http
GET /turnstile
```

返回体：

```typescript
type Payload={
  site_key:string;
}
```

- 如果服务器没有启用公开注册，返回 `403 Forbidden`；
- 如果服务器启用了公开注册，但服主没有启用 Turnstile，返回 `404 Not Found`。

### 对于私人实例

私人实例里用户创建的流程相对复杂一点，因为它需要管理员的许可。管理员会创建一个临时的、仅在注册端点可用的注册 Token，然后用户可以以此来请求注册端点。

> [!TIP]
>
> **建议的前端实现路径**：将该 token 作为查询参数附加到注册 URL 后，前端 JS 自动提取出它并用它来鉴权——这样就能达到用一个特殊 URL 注册的效果。

#### 创建注册用 Token <Badge type="danger" text="需要鉴权 (管理员)" />

```http
POST /register/session
```

请求体：

```typescript
type Payload = {
  expires_after: number; // 该注册 Token 的过期时间，单位为分钟，最大 10080min（7 天）
}
```

返回体：

```typescript
type Payload={
  token: string;
};
```

### 注册

私人实例注册和公开实例注册的端点相同，都是 `/register`。不过由注册类型、是否启用了 Turnstile 而定，`turnstile_token` 和 `register_token` 都是可选的。

```http
POST /register
```

请求体：

```typescript
type Request={
  register_token?:string;
  turnstile_token?:string;
  email:string;
  name?:string; // 如果没有指定，则设置为邮箱。应不超过 20 字符。
  password:string; // 应介于 8 字符和 128 字符之间。
}
```

返回体：

```typescript
type Payload=User;
```

- 若服务器启用了公开注册：
  - 若启用了 Turnstile：
    - 若注册 Token 和 Turnstile Token 均未提供，返回 `400 Bad Request`。
    - 若提供了 Turnstile Token，但验证失败，返回 `422 Unprocessable Content`。
    - 若提供了注册 Token，但验证失败，返回 `403 Forbidden`。
  - 若未启用 Turnstile：
    - 不会因为鉴权而失败。
- 若服务器没有启用公开注册：
  - 若没有提供注册 Token（忽略 Turnstile Token），返回 `400 Bad Request`。
  - 若提供了注册 Token，但验证失败，返回 `403 Forbidden`。
- 若邮箱与已有用户冲突，返回 `409 Conflict`。
- 若昵称和密码未通过长度检查，返回 `418 I'm a Teapot`。


## Profile 系统

Profile 是 Minecraft 中一个玩家实体对应的属性，包含玩家名、玩家 UUID 和玩家纹理等信息。

### 列出用户的 Profile <Badge type="tip" text="需要鉴权" />

列出当前用户或指定用户的所有玩家档案。

```http
GET /users/{id}/profiles?with_skin={bool}
GET /users/me/profiles?with_skin={bool}
```

返回体：

```typescript
type Payload = Array<{
  metadata: Profile;
  skin?: ProfileSkin;
}>;
```

- 如果鉴权信息错误，返回 `401 Unauthorized`。
- 如果请求省略 ID 的端点：
  - 成功。
- 如果指定了用户 ID：
  - 如果 ID 是当前用户，成功。
  - 否则，如果当前用户没有 Management 权限，返回 `403 Forbidden`。
  - 如果当前用户有 Management 权限，但目标用户不存在，返回 `404 Not Found`。
  - 如果当前用户有 Management 权限，且目标用户存在，成功。

同[下](#get-profile)，玩家档案有可能没有设置皮肤和披风，就算指定了 `with_skin=true`，返回的 `skin` 也有可能是个空对象。

### 创建 Profile <Badge type="tip" text="需要鉴权" />

```http
POST /profile
```

请求体：

```typescript
type Request = {
    name: string;
}
```

返回体：

```typescript
type Payload = Profile;
```

### 删除 Profile <Badge type="tip" text="需要鉴权" />

```http
DELETE /profiles/{id}
```

返回体：

```typescript
type Payload = Profile;
```

- 如果目标 Profile 不存在，返回 `404 Not Found`。
- 如果目标 Profile 存在，但不属于当前用户：
    - 若当前用户有 Management 权限，成功。
    - 否则，返回 `403 Forbidden`。

### 获取 Profile 信息 {#get-profile}

该端点不需要鉴权。

```http
GET /profiles/{id}?with_skin={bool}
```

- `with_skin`: 布尔值，是否在返回中提供皮肤数据。

返回体：

```typescript
type Payload = {
    metadata: Profile;
    skin?: ProfileSkin;
}
```

注意，Profile 不一定设置了皮肤，也不一定设置了披风，`skin` 的三个字段有可能均为空。


### 修改 Profile 元信息 <Badge type="tip" text="需要鉴权" />

```http
PATCH /profiles/{id}
```

请求体

```typescript
type Request = {
    name?: string
}
```

返回体

```typescript
type Payload = Profile;
```

该端点的鉴权和“删除 Profile”端点相同。

这里的 name 是 Minecraft 玩家名称，具有与官方的 Minecraft: Java Edition 玩家名相同的限制（否则游戏会报错“无效字符”并拒绝进入世界），即：

- 长度在 3-16 个字符之间；
- 仅包含字母、数字和下划线。

若要修改的玩家名称未能满足这些要求，返回 `400 Bad Request`。

### 修改皮肤  <Badge type="tip" text="需要鉴权" />

```http
PUT <aphanite_base_url>/api/yggdrasil/api/user/profile/{uuid}/{textureType}
DELETE <aphanite_base_url>/api/yggdrasil/api/user/profile/{uuid}/{textureType}
```

该接口的具体实现和使用方式请参见 [Authlib-injector 文档](https://yushijinhun.github.io/authlib-injector/zh/Yggdrasil-%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%8A%80%E6%9C%AF%E8%A7%84%E8%8C%83.html#%E6%9D%90%E8%B4%A8%E4%B8%8A%E4%BC%A0)。

Aphanite 中所有用户的所有玩家都可以上传皮肤和披风。
