# Security

Toon3D is primarily a client-side rendering engine, but its asset pipeline must treat external data as untrusted.

## Asset security

- Do not execute downloaded content.
- Validate manifests before use.
- Restrict remote asset origins in host applications.
- Apply file-size limits.
- Reject unsupported formats.
- Avoid unbounded recursion in asset graphs.
- Do not trust asset metadata to allocate arbitrary memory.

## URLs

Character definitions use logical asset IDs. URL resolution is controlled by the configured asset resolver.

## Denial-of-service concerns

Protect against:

- huge textures
- enormous meshes
- excessive animation tracks
- deeply nested scene graphs
- malformed manifests
- repeated failed loading loops

## Browser isolation

The engine must not require privileged browser APIs.

## Data privacy

Avatar definitions may contain user customization data. The engine must not send avatar data anywhere by default.

No analytics or network telemetry belongs in the core runtime.

## Supply chain

- lock dependencies
- audit dependencies
- pin CI tooling appropriately
- publish provenance/signatures when the release pipeline supports them
- keep package permissions minimal

## Studio

If a future Studio allows user-generated asset uploads, validation must happen before assets enter shared storage or the runtime catalog.
