## TODO - FRONTEND (Review Findings)
1. [P0] Stop logging full API response bodies in `request()` (PII/base64 signatures) and gate logs for prod.
2. [P1] Guard `JSON.parse` of `auth_user` in localStorage to prevent app boot crashes.
3. [P2] `/signatures` uses default `limit=50`; add pagination or higher limit if data grows.
4. [P2] `/courses` list hard-limits to 50; add pagination or higher limit for busy days.
5. [P2] Heavy default includes on `/courses` list (signatures/students/groups) increase payload; consider lighter include or lazy load.
6. [P3] `refreshTokens()` calls `logout()` without `await` (minor race).
7. [P3] Remove leftover debug logs (e.g., roster log in `CalendrierDetail`, refresh success log in `auth`).
