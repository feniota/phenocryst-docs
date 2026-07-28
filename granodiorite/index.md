---
description: "Granodiorite is a Minecraft resource mirror running on Cloudflare Workers, caching game assets in Cloudflare R2 for accelerated downloads."
outline: "deep"
---

# Granodiorite

> Granodiorite is a coarse-grained ([phaneritic](/phanerite/)) intrusive igneous rock similar to granite, but containing more plagioclase feldspar than orthoclase feldspar.
>
> _— [Wikipedia](https://en.wikipedia.org/wiki/Granodiorite)_

[Granodiorite](https://github.com/feniota/granodiorite) is a Minecraft resource mirror that helps players download game files faster. It is part of the Phenocryst ecosystem, primarily serving [Phanerite](/phanerite/) users. Inspired by [BMCLAPI](https://bmclapidoc.bangbang93.com/), Granodiorite runs on Cloudflare Workers and caches assets in Cloudflare R2, with servers located in the Asia-Pacific region.

## Why another mirror?

As the most popular Minecraft mirror in China, BMCLAPI serves **over 100M requests per day** while operating purely on donations. This is very concerning — and indeed, BMCLAPI's performance has increasingly degraded in recent days.

Based on this condition and the pratical need of a controllable Minecraft mirror owned by Phenocryst Project itself, this is why we make a new mirror.

## Architecture

Granodiorite consists of two layers:

1. **Router** — A Cloudflare Worker at `granodiorite.ferris.love` that:
   - Checks if a requested file is cached in R2
   - Returns a **302 redirect** to the public R2 bucket if cached
   - Proxies from the Mojang origin and caches to R2 on miss
   - Pre-caches client JARs in the background when a version JSON is requested

2. **Storage** — Cloudflare R2 bucket in the Asia-Pacific region, publicly accessible via `r2.granodiorite.ferris.love`.

## Coverage

Granodiorite mirrors resources from the following sources:

| Source                                                 | Resources                                       |
| ------------------------------------------------------ | ----------------------------------------------- |
| `piston-meta.mojang.com`, `launchermeta.mojang.com`    | Version manifests, version JSONs, asset indexes |
| `piston-data.mojang.com`, `launcher.mojang.com`        | Client JARs                                     |
| `resources.download.minecraft.net`                     | Game assets (sounds, textures, etc.)            |
| `libraries.minecraft.net`                              | Minecraft libraries (Maven)                     |
| `maven.fabricmc.net`                                   | Fabric loader & installer                       |
| `maven.neoforged.net`                                  | NeoForge installer                              |
| `maven.minecraftforge.net`, `files.minecraftforge.net` | Forge installer                                 |
| `meta.fabricmc.net`                                    | Fabric Meta API                                 |

## Sync strategy

Granodiorite uses a three-tier sync system:

- **High priority** (cron `*/15 * * * *`): Versions 1.7.10, 1.8.9, 1.12.2, 1.16.5, 1.18.2, 1.20.1, 1.21.1, and the latest stable release — proactively synced in full.
- **Medium priority** (cron `*/15 * * * *`, slower): Other release versions — synced one at a time.
- **Low priority** (lazy): Snapshots, pre-releases, old alpha/beta — synced only when a user requests them. Once requested, the Worker pre-caches related files in the background.

## Usage

### Via Phanerite

Granodiorite is built-in as a mirror option in [Phanerite](/phanerite/). Select "Granodiorite" in the launcher's mirror settings.

### API

All paths mirror BMCLAPI's layout:

```
# Version manifest
GET https://granodiorite.ferris.love/mc/game/version_manifest_v2.json

# Version JSON
GET https://granodiorite.ferris.love/v1/packages/<sha1>/<id>.json

# Game assets
GET https://granodiorite.ferris.love/assets/<prefix>/<hash>

# Minecraft libraries (Maven)
GET https://granodiorite.ferris.love/libraries/<path>

# Client JAR
GET https://granodiorite.ferris.love/v1/objects/<sha1>/client.jar

# Fabric
GET https://granodiorite.ferris.love/maven/fabric/<path>
GET https://granodiorite.ferris.love/fabric-meta/<path>

# NeoForge
GET https://granodiorite.ferris.love/maven/neoforge/<path>

# Forge
GET https://granodiorite.ferris.love/maven/forge/<path>
GET https://granodiorite.ferris.love/maven/forge-legacy/<path>
```

## Why the name?

1. Granodiorite is [Phaneritic](/phanerite/).

2.

| ![Minecraft granite block](/assets/granite.png) |  +  | ![Minecraft diorite block](/assets/diorite.png) |  =  | **Granodiorite** |
| :---------------------------------------------: | :-: | :---------------------------------------------: | :-: | :--------------: |

### This name is too complex!

You can also call it **Dreate**, because andesite is not phaneritic, nor does it appear in the name.
