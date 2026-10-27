---
outline: "deep"
description: "Aphanite changelog"
---

# Changelog

## v0.1.1 (2026-10-27)

- Switched the global allocator to [mimalloc](https://github.com/microsoft/mimalloc).
- Frontend toolchain: moved from Deno to Node.js, and introduced ESLint for the Svelte code.
- Fixed [GH-20](https://github.com/feniota/aphanite/issues/20): toast notifications now have
  built-in localization.
- OCI container images are now built on `scratch` with musl static linking instead of
  `fedora-minimal:45`, greatly reducing their size.
- Added the `APHANITE_AUTO_INIT` environment variable; when set, a missing configuration file is
  created automatically.
- Releases are now built, uploaded, and published automatically by GitHub Actions.

## v0.1.0 (2026-09-04)

This is the first official release of Aphanite.

- Basic functionality (as a general Yggdrasil server) is available.
- Integration with Phanerite is not currently supported. This feature is still planned.
- Yggdrasil Connect is not supported.

### Migrating from Older Versions

Migration from older versions (development versions from before
[PR #17](https://github.com/feniota/aphanite/pull/17) was merged) primarily involves migrating the
default database backend from SQLite to Turso. Follow these steps:

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

4. Update the configuration file by changing the `database.backend` field from `sqlite` to `turso`.
5. Replace the Aphanite binary to complete the migration.
