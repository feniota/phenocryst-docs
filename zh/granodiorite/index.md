---
description: "Granodiorite 是一个运行在 Cloudflare Workers 上的 Minecraft 资源镜像，将游戏资源缓存在 Cloudflare R2 中，加速国内玩家的下载体验。"
outline: "deep"
---

# Granodiorite

> 花岗闪长岩（Granodiorite），是一种中酸性的深成岩，是花岗岩类向闪长岩类过渡的中间类型岩石，是一种深成岩，粗粒状（[显晶质](/zh/phanerite/)），斜长石含量较多，碱性长石含量较少，二氧化硅含量在56%左右，石英含量在20%以上。
>
> _——[维基百科](https://zh.wikipedia.org/wiki/%E8%8A%B1%E5%B2%97%E9%97%AA%E9%95%BF%E5%B2%A9)_

[Granodiorite](https://github.com/feniota/granodiorite) 是一个 Minecraft 资源镜像，旨在让玩家更快地下载游戏文件。它是 Phenocryst 生态系统的一部分，主要为 [Phanerite](/zh/phanerite/) 用户提供服务。受 [BMCLAPI](https://bmclapidoc.bangbang93.com/) 启发，Granodiorite 运行在 Cloudflare Workers 上，将资源缓存在 Cloudflare R2 中。

## 为什么需要另一个镜像？

作为国内最流行的 Minecraft 镜像站，BMCLAPI 日均承载 **超过 1 亿次请求**，却完全依靠捐赠运营。这令人担忧——实际上 BMCLAPI 的表现在近期的确每况愈下。

基于此，加上 Phenocryst 项目需要一个可控的 Minecraft 镜像的现实需求，我们决定自建一个新的镜像。

## 架构

Granodiorite 由两层组成：

1. **路由层** — 运行在 `granodiorite.ferris.love` 的 Cloudflare Worker：
   - 检查请求的文件是否已缓存到 R2
   - 已缓存则返回 **302 重定向** 到公开 R2 桶
   - 未缓存则从 Mojang 源站代理拉取并写入 R2
   - 收到版本 JSON 请求时会后台预缓存客户端 JAR

2. **存储层** — 位于亚太地区的 Cloudflare R2 存储桶，通过 `r2.granodiorite.ferris.love` 公共访问。

## 覆盖范围

| 源站                                                   | 资源类型                      |
| ------------------------------------------------------ | ----------------------------- |
| `piston-meta.mojang.com`、`launchermeta.mojang.com`    | 版本清单、版本 JSON、资源索引 |
| `piston-data.mojang.com`、`launcher.mojang.com`        | 客户端 JAR                    |
| `resources.download.minecraft.net`                     | 游戏资源（声音、纹理等）      |
| `libraries.minecraft.net`                              | Minecraft 库文件（Maven）     |
| `maven.fabricmc.net`                                   | Fabric 加载器和安装器         |
| `maven.neoforged.net`                                  | NeoForge 安装器               |
| `maven.minecraftforge.net`、`files.minecraftforge.net` | Forge 安装器                  |
| `meta.fabricmc.net`                                    | Fabric Meta API               |

## 同步策略

三级同步系统：

- **高优先级**（cron `*/15 * * * *`）：1.7.10、1.8.9、1.12.2、1.16.5、1.18.2、1.20.1、1.21.1 以及最新稳定版 — 主动全量同步。
- **中优先级**（cron `*/15 * * * *`, 较慢）：其他正式版 — 每次同步一个。
- **低优先级**（懒同步）：快照、预发布、远古 Alpha/Beta — 仅当用户请求时开始同步。一旦被请求，Worker 会自动后台预缓存相关文件。

## 使用方法

### 通过 Phanerite

Granodiorite 已作为内置镜像选项集成在 [Phanerite](/zh/phanerite/) 中。在启动器的镜像设置中选择 "Granodiorite" 即可。

### API

路径规则与 BMCLAPI 基本保持一致：

```
# 版本清单
GET https://granodiorite.ferris.love/mc/game/version_manifest_v2.json

# 版本 JSON
GET https://granodiorite.ferris.love/v1/packages/<sha1>/<id>.json

# 游戏资源
GET https://granodiorite.ferris.love/assets/<前缀>/<哈希>

# Minecraft 库文件 (Maven)
GET https://granodiorite.ferris.love/libraries/<路径>

# 客户端 JAR
GET https://granodiorite.ferris.love/v1/objects/<sha1>/client.jar

# Fabric
GET https://granodiorite.ferris.love/maven/fabric/<路径>
GET https://granodiorite.ferris.love/fabric-meta/<路径>

# NeoForge
GET https://granodiorite.ferris.love/maven/neoforge/<路径>

# Forge
GET https://granodiorite.ferris.love/maven/forge/<路径>
GET https://granodiorite.ferris.love/maven/forge-legacy/<路径>
```

## 这个名字是什么意思？

1. 花岗闪长岩是[显晶岩](/zh/phanerite/)的一种。
2.

| ![Minecraft 花岗岩](/assets/granite.png) |  +  | ![Minecraft 闪长岩](/assets/diorite.png) |  =  | **Granodiorite** |
| :--------------------------------------: | :-: | :--------------------------------------: | :-: | :--------------: |

### 名字太复杂了！

你也可以叫它**几械动历**，因为安山岩不是显晶质， 而且不在“花岗闪长岩”的名字里。
