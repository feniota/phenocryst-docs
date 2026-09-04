---
outline: "deep"
description: "Aphanite changelog"
---

# Changelog

## v0.1.0 (2026-09-04)

This is the first official release of Aphanite.

- Basic functionality (as a general Yggdrasil server) is available.
- Integration with Phanerite is not currently supported. This feature is still planned.
- Yggdrasil Connect is not supported.

### Migrating from Older Versions

Migration from older versions (development versions from before [PR #17](https://github.com/feniota/aphanite/pull/17) was merged) primarily involves migrating the default database backend from SQLite to Turso. Follow these steps:

1. Connect to the database using `sqlite3` or another tool:
```bash
sqlite3 path/to/db.sqlite
```
2. Enable WAL mode:
```sql
PRAGMA journal_mode = "wal";
PRAGMA wal_checkpoint(truncate);
```
3. Exit `sqlite3` or the other tool:
```
.exit
```
4. Check whether the files `db.sqlite.wal` and `db.sqlite.shm` appear in the same directory as the database. If they do, the database format migration is complete.
5. Update the configuration file by changing the `database.backend` field from `sqlite` to `turso`.
6. Replace the Aphanite binary to complete the migration.
