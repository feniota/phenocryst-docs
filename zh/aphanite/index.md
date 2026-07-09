---
outline: "deep"
---

# 介绍

> 隐晶岩（英语：Aphanite）是指颗粒非常细的火成岩，肉眼看不到它们的组成矿物晶体。
>
> *——[维基百科](https://zh.wikipedia.org/wiki/%E9%9A%90%E6%99%B6%E5%B2%A9)*

Aphanite 是 Phenocryst 系统的中央服务器。它承担玩家信息管理、进行 Minecraft 身份验证、管理和下发整合包配置的职责。

## 功能

具体地说，Aphanite 主要有两个功能。

### Yggdrasil 服务器

> [!TIP]
>
> 如果不需要 Phenocryst 功能，Aphanite 完全可以作为一个[高性能、低占用、内存安全🚀🚀🚀](https://github.com/mTvare6/hello-world.rs)的通用皮肤站后端。

Aphanite 参考 [authlib-injector 提供的文档](https://yushijinhun.github.io/authlib-injector/zh/Yggdrasil-%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%8A%80%E6%9C%AF%E8%A7%84%E8%8C%83.html) 完整实现了 Yggdrasil 服务器的功能，包括 Authlib-injector 元数据接口。所以，Aphanite 可以担任 Mojang 验证服务器（或 [LittleSkin](https://littleskin.cn) 之类第三方皮肤站）的职责，承担 Minecraft 身份验证和玩家纹理（包括皮肤和披风）下发的功能。

考虑到国内多数玩家没有 Java 版正版的情况，Aphanite 的 Yggdrasil 功能对于私服场景是有实际意义的：

1. 作为外置、非侵入式的服务器白名单，可能比 `/whitelist` 更好用。
2. 可以让服务器更加安全。考虑一下：一个陌生玩家恰好 roll 到了离线服务器上 OP 的名字，那么他就成服务器管理员了。虽然传统上有登录插件来保护服务器，但是使用皮肤站登录显然是更可靠、更通用也更方便的方案。

### Phenocryst 服务器

Phenocryst 的核心是集群式管理玩家的游戏实例，即，玩家的电脑可以同步中央服务器上下发的整合包最新版本。由于这一过程十分像服务器集群的管理过程，我们将它称为“集群式”。

Aphanite 作为 Phenocryst 的中央服务器，在这一过程中执行下面的动作：

- 存储整合包文件。（不一定在 Aphanite 的主机上，也可以配置 S3 作为存储后端，具体见[配置](./configuration)）
- 将整合包文件的哈希分发给客户端进行比对。若云端整合包和本地整合包不匹配，则客户端应下载新的整合包文件。

除此之外，Aphanite 还有如用户管理的功能，这里就不展开了。

## 部署
