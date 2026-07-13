---
outline: "deep"
next: false
---

# 部署

理论上，只要你将 Aphanite 放在一个单独的文件夹并授予执行权限之后，双击就可以运行它。

然而，因为 Aphanite 自身并没有实现 TLS[^1]，同时 Minecraft 强制要求 Yggdrasil 服务器实现 TLS，因此需要借助反向代理[^2]来实现“外置”的 TLS。

[^1]: TLS，简单来说，就是让 HTTP 变成 HTTPS 的东西。这有篇[来自 Cloudflare 的文章](https://www.cloudflare.com/zh-cn/learning/ssl/transport-layer-security-tls/)简单讲述了这项技术。
[^2]: 这里有一篇[来自 Cloudflare 的文章](https://www.cloudflare.com/zh-cn/learning/cdn/glossary/reverse-proxy/)简单讲解了什么是反向代理。

同时，因为 Aphanite 需要所有玩家包括服主都能直接访问到，对于运行在本地电脑上的 Aphanite，这又需要配置内网穿透[^3]才能让外界访问。

[^3]: 这里有一篇[来自 SakuraFrp 的文章](https://doc.natfrp.com/basics.html)简单讲述了什么是内网穿透和端口。

本文详细介绍如何让 Aphanite 能正确运行。

## 我需要反向代理和/或内网穿透吗？

> [!TIP]
>
> <details><summary>如果你不确定/读不懂这里的内容，可以询问 AI。这里是我们为你编写好的提示词，只需复制给 AI 就可以了。</summary>
> 我是一个对计算机技术不太了解的人。我正在配置 Aphanite，这是一个为 Minecraft 私服设计的服务器程序。它不自带 SSL 功能，并且需要我和我的玩家们都能直接在网络上访问到它。为此，我需要为它配置反向代理（来实现 SSL），我可能还要为它配置内网穿透服务。它的文档地址在 <a href="https://phenocryst.ferris.love/zh/aphanite/deployment">https://phenocryst.ferris.love/zh/aphanite/deployment</a>。Aphanite 的开发者们给了我下面三个部署方案：方案一，使用 SakuraFrp 来内网穿透，可以使用它提供的“自动 HTTPS”功能实现 SSL，还能利用 SakuraFrp 提供的二级域名功能，这样即使我没有自己的域名也能让朋友们访问到，但缺点是有流量限制，且需要签到，并非一劳永逸的免费。方案二，使用 Cloudflare Tunnels 来内网穿透，优点是同样有自动 SSL，且基本是毫无限制的免费，但缺点是我需要一个在 Cloudflare 上的域名（文档提到我可以通过 DigitalPlat 获取免费域名，所以这不太是问题）。方案三，使用 Nginx 单独反向代理，不配置内网穿透，这需要我有服务器，且服务器有公网 IP 或公网端口转发，但配置 Nginx 反向代理可能需要一些技术——不过市面上的服务器面板产品可以简化这一过程。现在，请你查阅那个链接里的文档，并询问我几个问题，以决定我应该用哪一个方案（或提出你自己的新方案）。请开始问我：1.我把 Aphanite 部署在哪里？（你可以自己思考一下我部署的地方会不会有公网IP；如果缺失细节，请继续询问我。）2.我有自己的域名吗？3.（如果我有服务器）我的服务器上安装管理面板了吗？是什么面板？4.（如果我有服务器，但没安装面板）我熟悉命令行吗？如果我不熟悉命令行，我愿意跟着步骤一步一步操作吗？问完这些问题之后，如果还有缺失的细节，请继续事无巨细地询问我。最后，请给出你的建议，并手把手一步一步地教我如何完成配置。我可能不理解部分专有名词，请你顺便用简单易懂的方式解释。
> </details>

**TL;DR: 反向代理：YES；内网穿透：按需。**

值得注意的是，大部分内网穿透工具本身就提供了反向代理的功能。因此，这里将两个名词的指代范围限定为：

- **内网穿透工具**：任意可以将端口转发到云端的工具。
- **反向代理工具**：只能在本机上监听端口的反向代理工具。

反向代理和内网穿透工具在 Aphanite 中扮演不同的角色：

- 反向代理：给 Aphanite 的“裸”HTTP 流量包装上 TLS，让它变成 HTTPS。
  - TLS 层是必须的，因为 Minecraft 不接受“裸” HTTP 的 Yggdrasil 服务器。从安全角度来看，裸 HTTP 意味着你的通信容易被篡改，因此也不能接受。
- 内网穿透：让 Aphanite 能够在公网上被访问。
  - 这是可选的。请问：你运行 Aphanite 的机器上是否有独立公网 IP，或有将本地端口映射出去的功能（这通常由服务器提供商提供）？如果你的回答是“是”，那么你就不需要内网穿透。

因此，问题就很明晰了——反向代理是必须的；内网穿透是可选的。

## 如何配置反向代理/内网穿透 {#port-forwarding}

下面提出三种实现思路，你可以按需选择。

### SakuraFrp 自动 HTTPS（反向代理+内网穿透一体，不需要域名） {#natfrp}

> [!TIP]
>
> SakuraFrp 虽然基础使用上免费，但是需要每天签到获得流量。签到获得的流量对 Aphanite 来说是绰绰有余的，但是总归需要一些额外操作。如果你自己有域名，那么更建议考虑 [Cloudflare 方案](#cloudflare-tunnel)。

在[SakuraFrp 文档](https://doc.natfrp.com/)上有详细的操作教程。只需要仔细阅读这两章：

- [Web 应用穿透指南](https://doc.natfrp.com/app/http.html)。
- [配置子域绑定功能](https://doc.natfrp.com/bestpractice/domain-bind.html)。（请尤其注意其中的《创建 CNAME 记录并获取 SSL 证书进行建站》这一小节）

**一定要在你的隧道上启动“自动 HTTPS”**。

如果你决定在 Aphanite 上放一些整合包，那么 SakuraFrp 的免费流量大概率不够你使用。不过，你可以[配置 S3](/zh/aphanite/configuration#s3)，这样玩家下载整合包就不会花费你的流量了。

### Cloudflare Tunnel（反向代理+内网穿透一体，需要域名） {#cloudflare-tunnel}

[Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/) 是由知名 CDN 服务商、网络基础设施提供商、~~赛博活菩萨~~ Cloudflare 提供的**免费**反向代理+内网穿透服务。

**前提条件**：有一个托管到 Cloudflare 的域名。如果你没有，[DigitalPlat](https://www.cnblogs.com/jsonhc/p/19631511) 或许是个解决方案。你也可以尝试用 Cloudflare Quick Tunnels 试一试（下面会讲），不过这样每次启动你的 Aphanite 服务器地址都会变化。

#### 操作步骤（已有域名）

1. 登录你的 Cloudflare 账号。
2. 点击侧边栏->联网->Tunnels。
3. 点击右上角的“创建隧道”。
4. 随便输入一个名称。
5. 按照页面上所标识的步骤安装并启动 `cloudflared`。
6. 点击“添加路由”。
7. 选择“已发布的应用程序”。
8. 输入你想部署到的域名以及 Aphanite 的链接（相对于运行 `cloudflared` 的主机。一般来说是 `http://127.0.0.1:<端口>`。这里的`<端口>`见[配置](/zh/aphanite/configuration)）。
9. Well done！你的 Aphanite 现在应该在你的新域名上可用了。

#### 操作步骤（没有域名）

下面的操作使用 Cloudflare Quick Tunnels。它会在每次启动时给你的服务新分配一个随机的域名，所以不推荐使用。没有域名的情况下，建议使用 [SakuraFrp 提供的二级域名](#natfrp)。

1. [下载并安装 `cloudflared`](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)。
2. 运行：
  ```bash
  cloudflared tunnel --url http://localhost:3000
  ```
3. 复制输出的域名。
4. 将输出的域名填入配置文件中 `service.domain` 里。（具体见[配置](/zh/aphanite/configuration)）
5. 启动 Aphanite。
6. 你的 Aphanite 现在应该在 `xxx.trycloudflare.com` 上可用了。

### Nginx（仅反向代理，需要公网 IP/公网端口转发，需要域名）

> [!NOTE]
>
> 这一方案的配置步骤相对困难。如果你没有特殊的需求（如，你认为 SSL 证书必须掌握在自己的手里），建议使用 [Cloudflare Tunnel](#cloudflare-tunnel)。

这一章是给有经验的运维人员准备的。简单来说：

1. 获取 SSL 证书。可以使用 [Certbot](https://certbot.eff.org/) 或 [acme.sh](https://github.com/acmesh-official/acme.sh)。
2. 配置反向代理。下面是示例的 Nginx 反向代理配置块，以供参考。
```nginx {24}
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  listen 443 quic;
  listen [::]:443 quic;
  http3 on;
  
  server_name aphanite.yourdomain.com;

  ssl_certificate "/etc/letsencrypt/live/yourdomain.com/fullchain.pem";
  ssl_certificate_key "/etc/letsencrypt/live/yourdomain.com/privkey.pem";
  ssl_session_cache shared:SSL:1m;
  ssl_session_timeout 10m;
  ssl_ciphers PROFILE=SYSTEM;
  ssl_prefer_server_ciphers on;
  add_header Alt-Svc 'h3=":443"; ma=86400';
  ssl_early_data on;

  # Load configuration files for the default server block.
  include /etc/nginx/default.d/*.conf;
  
  location / {
    proxy_pass http://127.0.0.1:3000/; # 记得将这个修改成 Aphanite 的本地监听地址。
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 1024M;
  }
}
```
3. `nginx -t && nginx -s reload`。

或者，如[宝塔面板](https://www.bt.cn/new/index.html)之类的服务器管理软件提供了一键配置反向代理的功能，如果你安装了，可以参考它们的文档。

## 持久化运行

> [!NOTE]
>
> 下面的内容仅适用于 Linux。

如果你在服务器上跑 Aphanite，你或许会想让它持久化运行，以避免退出 ssh 之后就关掉了。下面的教程可以让你创建 Systemd 单元文件来管理 Aphanite。

下面的步骤只适用于纯 ssh 管理的情况，如果你在桌面/面板上运行它，那么大概率是不需要往下看的。

下面假定你将 `aphanite` 二进制文件放在 `/opt/aphanite` 下，并且名为 `aphanite`。请根据实际情况替换。

### 创建用户

如果你想让 Aphanite 持久化运行，那么最好给它创建一个单独的用户，来隔离 Aphanite 可以访问的目录，防止意外的发生。

```bash
sudo useradd -U -d /opt/aphanite -s /sbin/nologin aphanite
sudo chown -R aphanite:aphanite /opt/aphanite
```

### 编写 Systemd 单元文件

下面提供一个示例的单元文件，可以按需修改，注意服务的启动指令。

```ini {11}
[Unit]
Description=Aphanite Yggdrasil server
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
User=aphanite
ExecStart=/opt/aphanite/aphanite --config /opt/aphanite/config.toml --verbose
WorkingDirectory=/opt/aphanite
Restart=on-failure
```

接下来，把你编写的单元文件放在 `/etc/systemd/system/aphanite.service`，然后运行

```bash
sudo systemctl daemon-reload
```

就可以让 Systemd 看到你编写的单元文件了。

### SELinux 策略

> [!NOTE]
>
> 下面的内容可能不适用于你的发行版。如果出错了，建议询问 AI。

如果你的发行版默认开启 SELinux，且 SELinux 策略比较激进，可能需要额外配置，即给 Aphanite 二进制文件标上 `bin_t`，才能让 Systemd 正常启动它。

你可以运行以下命令来查看 SELinux 状态：

```bash
getenforce
```

如果命令输出是 Enforcing，很遗憾，你可能需要遵循以下步骤来让 SELinux 认可 Aphanite。

```bash
# 记得把 /opt/aphanite/aphanite 替换成你服务器上 Aphanite 的**绝对**路径。
sudo semanage fcontext -a -t bin_t /opt/aphanite/aphanite
sudo restorecon -Rv /opt/aphanite/aphanite
```

### 启动服务

最后，你可以运行下面的命令管理 Aphanite：

```bash
sudo systemctl start aphanite # 启动 Aphanite 服务
sudo systemctl enable aphanite # 让 Aphanite 会开机自启动
sudo systemctl enable --now aphanite # 让 Aphanite 会开机自启动；并启动 Aphanite。
sudo systemctl stop aphanite # 停止 Aphanite
sudo systemctl disable aphanite # 让 Aphanite 不再开机自启动

systemctl status aphanite # 查看当前的状态
journalctl -u aphanite # 阅读 Aphanite 过往产生的日志
```
