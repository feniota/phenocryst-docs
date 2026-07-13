# 运行

你需要在终端中才能运行 Aphanite。

Aphanite 可以接受下面的命令行参数：

```
Usage: aphanite [OPTIONS] [COMMAND]

Commands:
  init          Generate and write a configuration file
  create-admin  Create an admin user
  help          Print this message or the help of the given subcommand(s)

Options:
  -v, --verbose          Enable verbose output
      --debug            Enable debug output
  -l, --listen <LISTEN>  The IP address to listen on
  -p, --port <PORT>      The port to listen on
  -c, --config <CONFIG>  Path to configuration file [default: ./config.toml]
  -h, --help             Print help
```

这里讲述其中几个值得注意的子命令。

## 初始化配置文件

使用方法：

```bash
./aphanite init --config <配置文件的路径>
```

通过运行这个命令，Aphanite 会在指定路径（可省略）生成一个新的配置文件。[安装](/zh/aphanite/installation#init)中已经让你做过这一步了。

使用 Aphanite 的下一步是[配置](/zh/aphanite/configuration)。你可以在这里生成的配置文件上修改。

## 创建管理员用户

使用方法：

```bash
./aphanite create-admin --email <管理员的邮箱> --password <管理员的密码>
```

通过运行这个命令，Aphanite 会创建一个新的管理员用户。

一般来说，如果你新安装了 Aphanite，还没有用户，才应该用这个命令创建用户。否则，管理后台中有更便捷的创建用户的方法。
