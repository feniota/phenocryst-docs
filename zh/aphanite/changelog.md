---
outline: "deep"
description: "Aphanite 的变更日志"
---

# 变更日志

## v0.1.0 （2026-09-04）

这是 Aphanite 的首个正式版。

- 基础功能（Yggdrasil 服务器）可用。
- 暂不支持与 Phanerite 集成。该功能仍在计划中。
- 不支持 Yggdrasil Connect。

### 从旧版本迁移

从旧版本（[PR #17](https://github.com/feniota/aphanite/pull/17) 合并前的开发版）迁移主要涉及默认数据库后端从 SQLite 到 Turso 的迁移。迁移步骤如下：

1. 使用 `sqlite3` 或其他工具连接到数据库：
```bash
sqlite3 path/to/db.sqlite
```
2. 启用 WAL 模式：
```sql
PRAGMA journal_mode = "wal";
PRAGMA wal_checkpoint(truncate);
```
3. 退出 `sqlite3` 或其他工具：
```
.exit
```
4. 更改配置文件，将 `database.backend` 字段从 `sqlite` 改为 `turso`。
5. 替换 Aphanite 二进制文件，完成迁移。
