---
prev: 
  text: "Aphanite User Documentation"
  link: "/aphanite/"
---

# Aphanite Developer Documentation

This section covers technical details of Aphanite, intended for developers. If you're a regular user who doesn't want to dive into the technical side, you've likely clicked the wrong link. [Take me back!](/aphanite/)

Aphanite is open source software ([repository](https://github.com/feniota/aphanite)), licensed under the MIT License. This means you are free to copy, modify, distribute, and even sell Aphanite, as long as you retain the developers' attribution ("Feniota team", or "Tuxium and Enita"). However, please note that we are **not obligated** to provide any form of technical support, nor will we be **held responsible** for any consequences arising from the use of Aphanite.

## Basic Information

Aphanite is primarily developed in Rust.

[![Ferris.love badge](https://ferris.love/badge/feniota/aphanite?show=call_fn%2Ccall_method%2Cdef_fn%2Cdef_method%2Cdef_struct)](https://ferris.love/feniota/aphanite)

Key libraries used:

- Async runtime: [Tokio](https://tokio.rs/)
- HTTP routing: [axum](https://github.com/tokio-rs/axum)
- Database: [Toasty ORM](https://github.com/tokio-rs/toasty)

~~(Why are they all from Tokio?!)~~

Notable implementation details:

- For most use cases requiring random strings and unique identifiers, we prefer UUID v7.
- We use [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) for fast and secure file hashing.
- We hash passwords with Argon2, using [RustCrypto's implementation](https://docs.rs/argon2/latest/argon2/).
