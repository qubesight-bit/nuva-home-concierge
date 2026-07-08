# End-to-end tests

Playwright scripts that drive the running dev server (http://localhost:8080).

## age-gate.e2e.py

Verifies that the signup route (`/auth`) will not create an account unless
the user confirms they are 18+.

Assertions:

1. The **Create account** button is disabled while the age checkbox is unchecked.
2. Clicking/forcing the button and calling `form.requestSubmit()` produces **no**
   Supabase signup or server-function network calls.
3. The browser stays on `/auth` (no navigation to `/dashboard`).
4. The button becomes enabled once the checkbox is checked.

Run:

```bash
python3 e2e/age-gate.e2e.py
```

Exits non-zero on failure.
