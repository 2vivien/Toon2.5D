# Future Studio

Studio is downstream from the engine.

## Purpose

Provide a visual interface for constructing a character definition while previewing the exact same runtime used by applications.

## Features

- category browser
- 3D preview
- part picker
- color picker
- expression preview
- camera controls
- animation preview
- randomize
- save/load
- definition export
- optional GLB and screenshot export

## Core rule

Studio calls public engine APIs. It must not modify avatar semantics by reaching into renderer internals.

## Persistence

A future backend may store users, avatars and asset catalogs. Exported character definitions remain portable.

## Asset metadata

Each asset can declare ID, type, version, compatibility, preview, dependencies, license and author.

Studio is intentionally not part of the first engine milestone.
