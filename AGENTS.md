<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project lead notes

- Product roadmap and security constraints: `docs/development-plan.md`.
- Do not modify `src/app/dashboard/**` until Phase 0 of that plan is gated complete, unless the user explicitly asks to change a learning example.
- Closed/internal content is never protected by an unlisted URL alone. Invite token + session + Data Access Layer authorization are mandatory.
- Prefer server components by default. `'use client'` stays on interactive leaves, not on product layouts.
