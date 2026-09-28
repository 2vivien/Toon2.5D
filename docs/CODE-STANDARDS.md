# Toon2.5D — Engineering Rules

These rules are mandatory for production source code.

## 1. TypeScript

Use strict TypeScript.

Required:

- strict;
- noImplicitAny;
- strictNullChecks;
- noUncheckedIndexedAccess;
- exactOptionalPropertyTypes;
- noImplicitOverride;
- useUnknownInCatchVariables is enabled by the compiler, but catch values must be narrowed before use.

Project rule: application source uses neither `any` nor `unknown`.

## 2. File size

Maximum source file: 150 lines.

This is a design constraint, not a formatting challenge.

When a file reaches the limit:

- extract a domain type;
- extract a validator;
- extract a pure function;
- split a controller;
- split an adapter.

Never create a 300-line file and compress it to satisfy the rule.

## 3. Component size

Maximum React component: 50 lines.

React components are adapters and presentation boundaries.

Complex logic belongs in hooks, controllers or core packages.

## 4. Method size

Target maximum: 50 lines per public method.

Long methods are split into named operations with one responsibility.

## 5. Forbidden patterns

Never use:

- `any`;
- `unknown`;
- `@ts-ignore`;
- `@ts-nocheck`;
- empty catch blocks;
- implicit global state;
- renderer calls from React render;
- direct DOM access inside core;
- direct Three.js imports inside core;
- dynamic code evaluation;
- string-to-code execution;
- hidden network requests;
- unbounded caches.

## 6. Type design

Prefer discriminated unions.

Example:

```
type Source =
  | { kind: "emotion"; id: string }
  | { kind: "blink"; id: string }
  | { kind: "lookAt"; id: string }
```

Never use broad object bags for domain state.

## 7. Runtime validation

External data is not trusted because TypeScript types say it is valid.

Validate:

- JSON;
- asset manifests;
- user configuration;
- expression identifiers;
- numeric ranges;
- asset URLs;
- schema versions.

Validation belongs at boundaries.

## 8. Errors

Errors must be actionable and typed.

Required information:

- error code;
- operation;
- resource id where relevant;
- human-readable message;
- safe metadata.

Do not expose secrets, signed URLs or internal credentials.

## 9. Immutability

Prefer immutable configuration.

Mutable state is allowed for:

- runtime state;
- animation clocks;
- controller state;
- renderer resources.

Mutations must have clear ownership.

## 10. Allocation discipline

Do not allocate inside hot loops unless benchmark evidence shows it is harmless.

Forbidden in the frame loop:

- new arrays for every parameter;
- new objects for every contribution;
- repeated string parsing;
- JSON parsing;
- DOM queries;
- asset loading.

Preallocate reusable buffers where useful.

## 11. Dependency rules

core:
- domain only.

assets:
- asset contracts and validation.

animation:
- animation mathematics and state.

renderer-three:
- Three.js.

react:
- React integration.

No reverse dependencies.

## 12. Public API

Every exported function/class must have:

- explicit types;
- documented lifecycle;
- documented ownership;
- deterministic behavior where applicable.

Do not export internal implementation details.

## 13. Security

Treat assets and external input as untrusted.

Rules:

- allowlist resource schemes;
- bound resource size;
- validate file signatures when practical;
- validate manifest schema;
- prevent path traversal in local/server resolvers;
- do not execute asset metadata;
- isolate CDN configuration;
- sanitize diagnostic output;
- keep secrets outside packages.

## 14. Tests

Every pure domain rule gets unit tests.

Every lifecycle rule gets integration tests.

Every important visual behavior gets a canonical visual test.

Expression tests must include mixed sources, not only isolated presets.

## 15. Review checklist

Before merge:

- file sizes checked;
- no forbidden types;
- dependency direction checked;
- tests added;
- failure cases tested;
- disposal tested;
- performance impact measured;
- public API documented;
- asset compatibility verified.

## 16. Architecture rule

If a feature requires breaking a core boundary, stop and create an ADR before coding.

No convenience import is worth corrupting the architecture.
