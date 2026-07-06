# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or email the maintainers at capzark@gmail.com.

We'll acknowledge within 72 hours and keep you informed as we work on a fix.
Pre-1.0, only the latest release receives security fixes.

## Wayfind's security model

**Everything is local.** Wayfind performs static analysis and runtime tracing
entirely on your machine. There is no telemetry, no cloud sync, and no network
access by default. Optional AI annotation (post-MVP) is bring-your-own-key,
off by default, and clearly marked when active.

## Trace data sensitivity — read this

A `.wayfind-trace` bundle records a real execution of your program: function
calls, control flow, **and captured variable values**. That means a trace may
contain:

- secrets read at runtime (API keys, tokens, connection strings),
- personal data flowing through your code,
- file paths and environment details of your machine.

Treat trace files like log files with payloads:

- **Never attach a trace from a production run to a public issue or PR**
  unless you have inspected and redacted it.
- Use the redaction filters (`wayfind record --redact <pattern>` and the
  config-file equivalent) to drop or mask values by variable name, type, or
  regex at capture time — redacted values never touch disk.
- Value capture is sampled and size-capped by default, which limits but does
  not eliminate exposure.

Index files (`.wayfind` graph bundles) contain code structure only — symbol
names, spans, and relationships — no runtime values, but they do reveal your
code's architecture and identifiers. Share them with the same care you'd share
source code.

## Scope notes for researchers

Areas we consider especially security-relevant:

- The tracer attaches to running processes via inspector/debug protocols —
  bugs that let a traced process escape user-code filtering or execute
  attacker-controlled code are in scope.
- Trace and index files are parsed inputs: malformed-file vulnerabilities
  (a shared trace should never be able to run code on the viewer's machine)
  are in scope and high priority, since sharing traces is a core feature.
