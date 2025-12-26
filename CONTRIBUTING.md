# Contributing to ManaTuner Pro

Thank you for your interest in contributing to ManaTuner Pro! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/manatuner-pro.git
   cd manatuner-pro
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-commander-support`)
- `fix/` - Bug fixes (e.g., `fix/castability-calculation`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Commit Messages

We use conventional commits. Format:

```
type(scope): description

[optional body]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```
feat(mulligan): add archetype-specific thresholds
fix(parser): handle split cards correctly
docs(readme): update installation instructions
```

## Code Standards

### TypeScript

- Enable strict mode
- No `any` types (use `unknown` if needed)
- Export interfaces for public APIs

### React

- Functional components with hooks
- Use MUI components for UI
- Follow existing patterns in the codebase

### Testing

Run tests before submitting:

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests
npm test
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix
npm run lint:fix
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests as needed
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a PR with a clear description

### PR Checklist

- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention

## Project Structure

```
src/
├── components/     # React components
│   ├── analyzer/   # Analysis-specific components
│   ├── common/     # Shared components
│   └── layout/     # Layout components
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Page components
├── services/       # Business logic services
├── store/          # Redux store
└── types/          # TypeScript types
```

## Key Concepts

### Frank Karsten Mathematics

ManaTuner Pro uses Frank Karsten's research for mana calculations:
- Hypergeometric distribution for probability
- 90% threshold for reliable casting

### Monte Carlo Simulation

The mulligan simulator runs 3,000 hand simulations using:
- Fisher-Yates shuffle
- Bellman equation for optimal decisions

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
