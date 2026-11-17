# Security & Threat Modeling Audit Rules

## SEC-01: Authentication & Session Management
- All protected endpoints must require explicit authorization verification.
- Tokens must not be stored in unencrypted local storage if carrying sensitive elevated claims.
- Session invalidation must be enforced server-side upon logout or credential rotation.

## SEC-02: Injection & Input Sanitization
- All external input must be strictly typed, sanitized, and validated using schema boundaries.
- No dynamic string interpolation into SQL queries, command executors, or HTML templates.

## SEC-03: Zero Trust & Network Boundaries
- Services must authenticate each other mutually (mTLS or signed internal tokens).
- Secret keys and API credentials must never be committed to repository code or emitted in client bundles.

## SEC-04: Error Handling & Observability
- Security error responses must return generic status codes without exposing database structures or internal trace dumps.
- Audit trails must record authentication failures, privilege escalations, and sensitive record mutations.
