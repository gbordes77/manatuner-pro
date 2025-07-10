# Security Policy

## 🔒 Supported Versions

We actively support the following versions of ManaTuner Pro with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.5.x   | ✅ Yes             |
| 1.4.x   | ❌ No              |
| < 1.4   | ❌ No              |

## 🚨 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in ManaTuner Pro, please follow these steps:

### 1. **DO NOT** Create Public Issues
- **Never** report security vulnerabilities through public GitHub issues
- **Never** discuss vulnerabilities in public forums or social media

### 2. **Contact Us Privately**
- **Email**: Send details to `security@manatuner-pro.com` (if available)
- **GitHub**: Use [GitHub Security Advisories](https://github.com/gbordes77/manatuner-pro/security/advisories) (preferred)
- **Subject**: Include "SECURITY VULNERABILITY" in the subject line

### 3. **Include These Details**
- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity assessment
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Browser, OS, version information
- **Proof of Concept**: If applicable (no exploitation)

### 4. **Response Timeline**
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)
- **Public Disclosure**: After fix is deployed

## ⚡ Severity Levels

### Critical (24-48 hours)
- Remote code execution
- Authentication bypass
- Data breach potential
- Privilege escalation

### High (1 week)
- Cross-site scripting (XSS)
- SQL injection
- Unauthorized data access
- Denial of service

### Medium (2-4 weeks)
- Information disclosure
- Cross-site request forgery (CSRF)
- Insecure direct object references
- Security misconfigurations

### Low (1-3 months)
- Security headers missing
- Weak cryptography
- Information leakage
- Minor security improvements

## 🛡️ Security Measures

### Frontend Security
- **Content Security Policy (CSP)**: Strict CSP headers implemented
- **XSS Protection**: Input sanitization and output encoding
- **HTTPS Only**: All communications encrypted
- **Secure Cookies**: HttpOnly and Secure flags
- **Dependency Scanning**: Regular security audits

### Backend Security
- **Authentication**: Secure authentication mechanisms
- **Authorization**: Proper access controls
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting and abuse prevention
- **Logging**: Security event logging and monitoring

### Infrastructure Security
- **Vercel Security**: Leveraging Vercel's security features
- **Environment Variables**: Secure secret management
- **Regular Updates**: Dependencies updated regularly
- **Monitoring**: Security monitoring and alerting

## 🔍 Security Best Practices

### For Users
- **Keep Updated**: Always use the latest version
- **Secure Environment**: Use updated browsers and operating systems
- **Report Issues**: Report suspicious behavior immediately
- **Privacy**: Be cautious with sensitive deck information

### For Contributors
- **Code Review**: All code changes reviewed for security
- **Dependencies**: Use only trusted dependencies
- **Secrets**: Never commit secrets or API keys
- **Testing**: Include security testing in development

## 📋 Security Checklist

### Development
- [ ] Input validation on all user inputs
- [ ] Output encoding to prevent XSS
- [ ] Secure authentication implementation
- [ ] Proper error handling (no information leakage)
- [ ] Dependency vulnerability scanning
- [ ] Security headers implementation

### Deployment
- [ ] HTTPS enforced everywhere
- [ ] Secure environment variable management
- [ ] CSP headers configured
- [ ] Security monitoring enabled
- [ ] Regular security updates scheduled

## 🚀 Automated Security

### GitHub Security Features
- **Dependabot**: Automated dependency updates
- **CodeQL**: Static code analysis
- **Secret Scanning**: Automatic secret detection
- **Security Advisories**: Vulnerability notifications

### CI/CD Security
- **Security Scans**: Automated security scanning in CI/CD
- **Dependency Audits**: Regular npm audit checks
- **SAST**: Static Application Security Testing
- **Container Scanning**: If using containerization

## 📞 Security Contact

### Primary Contact
- **GitHub Security**: [Security Advisories](https://github.com/gbordes77/manatuner-pro/security/advisories)
- **Email**: security@manatuner-pro.com (if available)

### Response Team
- **Guillaume Bordes** - Project Maintainer
- **Security Team** - External security consultants (if applicable)

## 🏆 Security Acknowledgments

We appreciate security researchers who help improve ManaTuner Pro's security:

### Hall of Fame
*Security researchers who have responsibly disclosed vulnerabilities will be listed here with their permission.*

### Recognition
- Public acknowledgment in release notes
- Recognition in security advisories
- Contributor status in the project

## 📚 Resources

### Security Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Guidelines](https://web.dev/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

### Tools and References
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [GitHub Security](https://github.com/features/security)

---

**Last Updated**: June 22, 2025  
**Version**: 2.0.0

Thank you for helping keep ManaTuner Pro secure! 🔒🎯 