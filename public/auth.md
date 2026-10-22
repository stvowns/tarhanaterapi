# auth.md — TarhanaTerapi Agent Authentication

## Agent audience

This document is for AI shopping, research, and answer agents that read public
product, price, shipping, guide, and review content from TarhanaTerapi.

## Registration and provisioning

TarhanaTerapi does not run a self-service agent registry or a public OAuth
authorization server. A legitimate agent operator can request human-reviewed
access to non-public integration details:

- Registration endpoint: `mailto:satis@tarhanaterapi.com?subject=Agent%20Access%20Request`
- Provisioning method: manual review by the site operator
- Supported identity method: out-of-band operator approval
- Credentials: no credentials are issued for public catalog browsing; any
  future integration credential is scoped and delivered only to the approved
  operator.

```yaml
agent_auth:
  registration: manual
  register_uri: "mailto:satis@tarhanaterapi.com?subject=Agent%20Access%20Request"
  methods_supported:
    - human_approval
  credentials: none_for_public_content
```

## Public, no-auth resources

Reading these resources does not require registration or authentication:

- `https://tarhanaterapi.com/llms.txt` — concise site and product summary
- `https://tarhanaterapi.com/llms-full.txt` — full product, FAQ, and policy text
- `https://tarhanaterapi.com/sitemap.xml` — canonical page list
- `https://tarhanaterapi.com/robots.txt` — crawler rules and Content Signals
- Product pages and their `.md` versions

## Authenticated or human-only actions

- Checkout and order creation require a human customer and explicit confirmation.
- Newsletter subscription requires the visitor's own e-mail address and consent.
- Review submission is moderated before publication.
- Admin endpoints under `/api/` are private and require server-side secrets.

Agents must not submit personal data, place orders, or send e-mail on a person's
behalf without that person's explicit approval.

## Contact

- E-mail: satis@tarhanaterapi.com
- Security reports: satis@tarhanaterapi.com (subject: Security)
