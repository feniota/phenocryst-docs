# 运行

理论上，只要你将 Aphanite 放在一个单独的文件夹并授予执行权限之后，双击就可以运行它。

然而，因为 Aphanite 自身并没有实现 TLS[^1]，同时 Minecraft 强制要求 Yggdrasil 服务器实现 TLS，因此需要借助反向代理服务来实现“外置”的 TLS。

[^1]: TLS，简单来说，就是让 HTTP 变成 HTTPS 的东西。这有篇[来自 Cloudflare 的文章](https://www.cloudflare.com/zh-cn/learning/ssl/transport-layer-security-tls/)简单讲述了这项技术。

同时，因为 Aphanite 需要所有玩家包括服主都能直接访问到，对于运行在本地电脑上的 Aphanite，这又需要配置内网穿透才能让外界访问。

本文详细介绍如何让 Aphanite 能正确运行。

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

```ini{11}
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

## 内网穿透 {#port-forwarding}

TBD
