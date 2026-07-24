---
outline: "deep"
---

# Installation

This page details how to install and run Aphanite.

> [!TIP]
>
> You do **not** need a server to deploy Aphanite. Compared to a local PC, the advantage of a server is 24/7 uptime. If you don't have a running VPS (e.g., you're hosting your Minecraft server on your own computer or using a panel-limited host), there's no need to buy a separate server just for Aphanite. If you decide to deploy on a local machine, you'll need to use a tunneling service. See [Deployment > Tunneling](/aphanite/deployment#port-forwarding) for details.

## Choose an Installation Method

Aphanite is designed to be easy to deploy. However, we also provide a Docker image for one-command setup.

- If you're on Windows and don't want to install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Podman Desktop](https://podman-desktop.io/), use the [standalone binary](#binary-usage).
- If you're on Windows and already have Docker Desktop or Podman Desktop, you can try [Docker](#docker).
- If you're on Linux and want a one-command installation, or need containerization for sandboxing, use [Docker](#docker).
- Otherwise, we generally recommend [running the binary directly](#binary-usage).
- If you're already familiar with system service management, you probably have your own preferences — skip to the section that fits.

Note that Aphanite uses SQLite by default and is designed for straightforward deployment. Using Docker usually **won't be much more convenient**. Unless you plan to use PostgreSQL, in which case you might set up a Docker Compose stack or use Kubernetes to cluster Aphanite — but those are beyond the scope of this wiki.

## Standalone Binary {#binary-usage}

We provide pre-compiled binaries for Windows x64 and Linux x64.

If your operating system or CPU architecture isn't listed above, you'll likely need to [compile from source](#compile-from-source).

- [Download from GitHub Releases](https://github.com/feniota/aphanite/releases)
- Download from Cloudflare R2 (coming soon)

After downloading, just double-click the `.exe` file (Windows) or `chmod +x` and run it.

### Linux: Which File Should You Choose?

> [!TIP]
>
> Windows users can skip to the [next section](#init).

For Linux, we provide two variants. One uses `glibc` with dynamic linking: it requires your system glibc to be **version 2.34 or newer** and have the necessary dynamic libraries available, otherwise it won't start. The other uses musl libc with static linking — it runs on any Linux x64 system as long as the kernel isn't too old.

Generally, if your system glibc is recent enough, we recommend the glibc version. Otherwise, use the musl version.

You can check your `glibc` version with:

```bash
ldd --version
# Or
/lib64/libc.so.6 # Red Hat derivatives (RHEL/Rocky/..., CentOS, Fedora)
/lib/x86_64-linux-gnu/libc.so.6 # Debian derivatives (Debian, Ubuntu)
```

If you're using a lightweight distro like Alpine, your system may not use `glibc` at all. Don't worry — the musl version works on all x64 Linux distributions!

### Initialize Configuration {#init}

After downloading, copy the Aphanite executable to an **empty directory where your current user has read and write permissions**, then run:

::: code-group
```bash [Linux or macOS]
./aphanite init
```
```powershell [Windows]
& "./aphanite.exe" init
```
:::

Congratulations — your Aphanite is now ready to start!

#### What's Next?

Check out [Running Aphanite](/aphanite/running).

## Compile from Source {#compile-from-source}

Aphanite is written in Rust and it has a frontend (web) part, so you'll need:

- C/C++ build toolchain (depends on your OS — e.g., on macOS you'll need to [install Xcode Command Line Tools](https://www.freecodecamp.org/news/install-xcode-command-line-tools/))
- [Rust toolchain](https://rustup.rs)
- [Deno](https://deno.com)

Once installed, clone Aphanite (or download "Source code (zip)" from Releases and extract it):

```bash
git clone https://github.com/feniota/aphanite.git --depth=1
```

Then open a terminal and run:

```bash
cd aphanite
deno install
deno task build
```

Wait a moment. After compilation, the `aphanite` binary will be at `source_dir/target/release`.

Next, head to [Initialize Configuration](#init).

## Using Docker {#docker}

Coming soon!
