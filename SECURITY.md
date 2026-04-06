# Security Policy

## Architecture Security Model

ManaTuner is a **100% client-side application**. There is no backend, no database, no server-side processing, and no user authentication. All calculations happen in your browser.

| Aspect                | Status                                    |
| --------------------- | ----------------------------------------- |
| **Backend**           | None - 100% client-side                   |
| **Database**          | None - localStorage only                  |
| **Authentication**    | None - no accounts                        |
| **Data transmission** | None - decklists never leave your browser |
| **External API**      | Scryfall (read-only, public card data)    |

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Use [GitHub Security Advisories](https://github.com/gbordes77/manatuner/security/advisories) (preferred)
3. Or email the maintainer directly via GitHub profile

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix**: Depends on severity

## Security Measures

### Content Security Policy (CSP)

Strict CSP headers configured in `vercel.json`:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
img-src 'self' data: https://cards.scryfall.io https://c1.scryfall.com;
connect-src 'self' https://api.scryfall.com;
frame-ancestors 'none';
```

### Additional Headers

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Strict-Transport-Security` - HTTPS enforced with preload
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Data Privacy

- All deck data stored in browser `localStorage` with AES-256 encryption
- No cookies, no tracking, no analytics
- Export/import feature for data portability
- One-click data deletion

### Dependencies

- Regular `npm audit` checks
- Dependabot enabled for automated security updates
- Minimal dependency footprint

## For Contributors

- Never commit secrets or API keys
- All PRs reviewed before merge
- Use `npm audit` before submitting changes
- Follow CSP restrictions when adding external resources

---

**Last Updated**: April 2026
**Version**: 2.2.0
