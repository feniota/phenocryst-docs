---
outline: "deep"
---

# 安装

下面的内容会具体地讲述如何安装并运行 Aphanite。

> [!TIP]
>
> **不需要**服务器即可部署 Aphanite。相比本地 PC，服务器的优势是 7×24 开机，所以如果你并不已有正在运行的 VPS（如自己电脑开服或者面板服限制只能跑 Minecraft 服务器），无需单独为 Aphanite 购买服务器。如果你决定使用本地电脑部署，需要使用内网穿透服务。详见[运行§内网穿透](/zh/aphanite/deployment#port-forwarding)。

## 选择安装方式

Aphanite 自身是被设计为容易部署的。不过，我们也提供可以一键运行的 Docker 镜像。

- 如果你使用 Windows，且不想安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 或 [Podman Desktop](https://podman-desktop.io/)，那么请[直接使用二进制文件](#binary-usage)。
- 如果你使用 Windows，且电脑上已经有 Docker Desktop 或 Podman Desktop，可以试一试[Docker](#docker)。
- 如果你使用 Linux，但十分追求一行命令的安装体验，或出于沙箱需求想要容器化，那么请使用[Docker](#docker)。
- 否则，我们通常会推荐[直接运行二进制文件](#binary-usage)。
- 如果你对系统服务的运维已经比较熟悉了，想必你有自己的看法，那么可以直接跳到你想要的安装方法的小节里。

注意，Aphanite 默认情况下使用 SQLite 数据库，并且被设计为易于直接部署，使用 Docker 镜像通常来说**并不会方便多少**。除非你打算使用 PostgreSQL，那么可以组一个 Docker Compose，或者使用 Kubernetes 搭建你自己的 Aphanite 集群。不过这些不在本 Wiki 的讨论范围内。

## 直接运行二进制文件 {#binary-usage}

我们提供预编译的 Windows x64 和 Linux x64 二进制文件，以供下载。

如果你的操作系统或电脑架构不在上面两种之中，恐怕你只能考虑[从源码编译](#compile-from-source)了。

- [在 GitHub Releases 下载](https://github.com/feniota/aphanite/releases)
- 在 Cloudflare R2 下载（coming soon）

下载之后，直接双击 `.exe` 文件（Windows）或者 `chmod +x` 之后就可以运行。

### Linux: 选择哪个文件？

> [!TIP]
>
> Windows 用户请直接跳到下一小节。

对于 Linux 平台，我们提供两个文件。一个使用 `glibc` 并动态链接：它需要你系统的 glibc 版本**大于或等于 2.34**，且有运行所需的动态库，否则程序无法启动。另一个使用 musl libc 并静态链接，只要内核版本不太老旧就能在任意 Linux x64 系统上运行。

通常来说，如果系统 glibc 版本足够，我们推荐选择 glibc 版本，否则再考虑 musl 版本。

你可以运行以下的命令来查看你系统的 `glibc` 版本：

```bash
ldd --version
# 或者
/lib64/libc.so.6 # 仅 Red Hat 系（如 RHEL/Rocky/..., CentOS, Fedora）
/lib/x86_64-linux-gnu/libc.so.6 # 仅 Debian 系（如 Debian, Ubuntu）
```

如果你的系统是 Alpine 等轻量发行版，那么你的系统可能并没有使用 `glibc` libc。但不用担心，musl 版本是在所有 x64 Linux 发行版上通用的！

### 安装 {#init}

下载好之后，请将 Aphanite 可执行文件复制到一个**当前用户有读写权限**的空目录中，然后运行

```bash
./aphanite init # Linux
```

```powershell
& "./aphanite.exe" init # Windows
```

就安装好了。

## 使用 Docker 镜像 {#docker}

Coming soon!

## 从源码编译 {#compile-from-source}

Aphanite 本体是用 Rust 编写的，并且其中有前端（网页）部分，所以在开始之前，你需要安装：

- C/C++ 编译工具链。（由你使用的操作系统而定——比如说，如果你使用 macOS，需要[安装 Xcode 命令行工具](https://www.freecodecamp.org/chinese/news/install-xcode-command-line-tools/)。）
- [Rust 工具链](https://rustup.rs)。
- [Node.js](https://nodejs.org)。
- [pnpm](https://pnpm.io/)。

安装好之后，运行下面的命令来克隆 Aphanite：（你也可以直接下载 Release 中的“Source code (zip)”并解压。）

```bash
git clone https://github.com/feniota/aphanite.git --depth=1
```

然后，打开终端，运行下面的指令：

```bash
cd aphanite

cd web # 进入前端文件目录
pnpm i # 安装前端构建依赖
pnpm build # 构建前端资源

cd .. # 返回 Rust 项目目录
cargo build --release # 编译 Aphanite
```

稍等片刻。编译完成后，`aphanite` 二进制文件会出现在 `源代码目录/target/release` 下。

接下来，请看[安装](#init)。