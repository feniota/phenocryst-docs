---
outline: "deep"
---

# Introduction

> Aphanites are igneous rocks that are so fine-grained that their component mineral crystals are not visible to the naked eye.
>
> *— [Wikipedia](https://en.wikipedia.org/wiki/Aphanite)*

[Aphanite](https://github.com/feniota/aphanite) is the central server of a Phenocryst system. It handles player information management, Minecraft authentication, and distribution of modpack configurations.

## Features

Specifically, Aphanite has two main features.

### Yggdrasil Server

> [!TIP]
>
> If you don't need Phenocryst features, Aphanite can serve perfectly well as a [high-performance, low-footprint, memory-safe🚀🚀🚀](https://github.com/mTvare6/hello-world.rs) general-purpose skin server backend.

> [!WARNING]
>
> Before using Aphanite as a Yggdrasil server to log into Minecraft, players should ensure they have purchased Minecraft: Java Edition and have the legal right to play the game. The developers of Aphanite are not responsible for any consequences arising from the use of this software.

Aphanite fully implements the Yggdrasil server specification (including the [authlib-injector metadata interface](https://yushijinhun.github.io/authlib-injector/en/yggdrasil-server-technical-specification.html#api-metadata-retrieval)), so it can serve as a drop-in replacement for Mojang's authentication servers or third-party skin services like [Ely.by](https://ely.by). It handles Minecraft authentication and distribution of player textures (skins and capes).

A Yggdrasil server has practical value for private servers:

1. **Security**: Skin-server authentication makes your server more secure. Consider: a random player could roll an offline-mode server OP name and become an admin. While login plugins do exist, skin-server authentication is more reliable, universal, and convenient — it does the same job as Mojang's premium authentication, just not operated by Mojang.
2. **Whitelisting**: For private servers, using a private skin server with restricted registration provides a non-intrusive, external whitelist mechanism, which may be more convenient than `/whitelist`.

### Phenocryst Server

The core of Phenocryst is cluster-ish management of players' game instances — that is, players' computers automatically sync the latest modpack version from the central server. Since it resembles the workflow of some server cluster management products, we call it "cluster-ish."

As the central server of Phenocryst, Aphanite:

- Stores modpack files (not necessarily on Aphanite's own host — S3 can be configured as the storage backend; see [Configuration](./configuration)).
- Distributes modpack file hashes to clients for comparison. If the cloud modpack differs from the local one, the client downloads the new version.

Beyond that, Aphanite also has the usual features like user management that most server software has — we won't go into detail here.

