# 0001 — License: Apache-2.0

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

The brief left the license open between GPL-3.0 and Apache-2.0 and asked for an early decision. Wayfind's growth model depends on (a) third parties writing language adapters, (b) companies allowing the tool — and its VS Code extension — inside their dev environments, and (c) traces/maps being attached to artifacts in arbitrary codebases.

## Decision

**Apache-2.0** for the entire monorepo, including format specs and adapters.

## Alternatives considered

- **GPL-3.0:** stronger copyleft would keep forks open (the Sourcetrail codebase was GPL). But it deters corporate adoption and contribution, complicates embedding the read-only map export in other tools, and adapter authors targeting our published spec shouldn't inherit copyleft obligations. Sourcetrail's GPL didn't save it; adoption might have.
- **Dual licensing / BSL:** premature — there is no commercial entity to protect, and it poisons the "successor to Sourcetrail, actually open" positioning.

## Consequences

- Frictionless adoption in corporate environments; adapters and integrations can be proprietary.
- A hostile closed fork is possible; we accept that and compete on velocity and community.
- Patent grant included, which matters for the tracer techniques.
