# Contributing to ManaTuner Pro

Thank you for your interest in contributing to ManaTuner Pro! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/manatuner-pro.git
   cd manatuner-pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## 📋 Development Process

### 1. **Before You Start**
- Check existing [issues](https://github.com/gbordes77/manatuner-pro/issues) and [discussions](https://github.com/gbordes77/manatuner-pro/discussions)
- Create an issue for new features or bugs
- Discuss major changes before implementation

### 2. **Branch Naming**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring

### 3. **Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add new mana curve analysis
fix: resolve Web Workers compatibility issue
docs: update API documentation
refactor: simplify probability calculations
```

### 4. **Pull Request Process**
1. Create feature branch from `main`
2. Make your changes
3. Add/update tests if needed
4. Update documentation
5. Ensure all tests pass
6. Submit PR with clear description

## 🧪 Testing Guidelines

### Running Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- --testNamePattern="ManaCalculator"
```

### Test Requirements
- Unit tests for new functions/components
- Integration tests for major features
- Maintain >80% code coverage
- Test edge cases and error conditions

## 🎨 Code Style

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use Material-UI components consistently

### Code Formatting
```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🏗️ Architecture Guidelines

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   └── analyzer/       # Analyzer-specific components
├── pages/              # Main application pages
├── services/           # Business logic and API calls
├── store/              # Redux store and slices
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── theme/              # Material-UI theme
```

### Component Guidelines
- One component per file
- Use TypeScript interfaces for props
- Implement proper error handling
- Add JSDoc comments for complex functions

### State Management
- Use Redux Toolkit for global state
- Use React hooks for local state
- Keep state normalized and minimal
- Use selectors for derived data

## 🔍 MTG-Specific Guidelines

### Mana Cost Parsing
- Support all MTG mana symbols
- Handle hybrid costs correctly
- Parse X costs appropriately
- Consider Phyrexian mana

### Card Data
- Use Scryfall API format
- Handle missing/incomplete data gracefully
- Implement proper card type detection
- Support all land types

### Probability Calculations
- Use hypergeometric distribution
- Follow Frank Karsten's methodology
- Account for mulligans and card draw
- Handle edge cases (0-cost spells, etc.)

## 📚 Documentation

### Code Documentation
- Add JSDoc comments to public functions
- Document complex algorithms
- Include examples for utility functions
- Update type definitions

### User Documentation
- Update README for new features
- Add examples to documentation
- Include screenshots for UI changes
- Update API documentation

## 🐛 Bug Reports

### Before Reporting
- Search existing issues
- Test on latest version
- Reproduce the bug consistently

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 2.0.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other solutions considered

**MTG Context**
Relevant MTG rules or scenarios
```

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: [security contact]
- Include detailed description and reproduction steps
- Allow time for fix before public disclosure

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors graph

## 📞 Getting Help

- **Discussions**: [GitHub Discussions](https://github.com/gbordes77/manatuner-pro/discussions)
- **Issues**: [GitHub Issues](https://github.com/gbordes77/manatuner-pro/issues)
- **Documentation**: [Project Wiki](https://github.com/gbordes77/manatuner-pro/wiki)

---

Thank you for contributing to ManaTuner Pro! 🎯✨ 