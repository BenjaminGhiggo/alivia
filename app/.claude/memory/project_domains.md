---
name: alivia-domains
description: Alivia uses alivia.sbs in production and alivia.net for local development
type: project
---

- Production domain: alivia.sbs
- Local development domain: alivia.net (via /etc/hosts)

**Why:** alivia.net is not owned by the team (GoDaddy holds it), so it's only used locally via /etc/hosts entry.
**How to apply:** When writing install scripts or configs, default to http:// for local. SSL upgrade only happens in production.
