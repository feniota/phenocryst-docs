# phenocryst-docs

[网站](https://phenocryst.ferris.love)

## 编写

需要 Node.js 和 pnpm。

开始之前：

```
pnpm i
```

运行预览服务器：

```
pnpm run docs:dev
```

## 构建

本地测试构建：

```
pnpm run docs:build
```

注意，在推送前，应该运行一遍上述构建指令来检查（构建有可能不成功，导致 CI 失败。）

至于云端构建，Cloudflare Pages 会在主线推送后自动拉取并构建；这里不用操心了。
