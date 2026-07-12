---
prev: 
  text: "Aphanite 用户文档"
  link: "/zh/aphanite/"
---

# Aphanite 开发者文档

这里的文档讲述了 Aphanite 的部分技术细节，是给开发者查阅的。如果你是普通用户，且不希望了解 Aphanite 的技术细节，那么你大概率是点错了。[带我回去！](/zh/aphanite/)

Aphanite 是开源软件，仓库[在此](https://github.com/feniota/aphanite)，使用 MIT 协议授权。这意味着，只要保留开发者的署名（“Feniota 团队”，或“Tuxium 和 Enita”），您就可以自由复制、修改、分发甚至出售 Aphanite。但请注意，我们**没有义务**为 Aphanite 提供任何形式的技术支持，也**不会**为任何人使用 Aphanite 造成的后果负责。

## 基本信息

Aphanite 主要是使用 Rust 开发的。

[![Ferris.love badge](https://ferris.love/badge/feniota/aphanite?show=call_fn%2Ccall_method%2Cdef_fn%2Cdef_method%2Cdef_struct)](https://ferris.love/feniota/aphanite)

主要使用到的库有：

- 异步运行时：[Tokio](https://tokio.rs/)
- HTTP 路由：[axum](https://github.com/tokio-rs/axum)
- 数据库：[Toasty ORM](https://github.com/tokio-rs/toasty)

~~（为什么全是来自 Tokio 的？？）~~

以及一些值得注意的细节：

- 在大部分需要随机字符串以及唯一标识的地方，我们会偏向于 UUID v7。
- 我们使用 [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) 对文件做安全迅速的哈希。
- 我们使用 Argon2 对密码进行哈希，使用的是 [RustCrypto 的实现](https://docs.rs/argon2/latest/argon2/)。