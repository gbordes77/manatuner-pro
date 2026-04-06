# ManaTuner - Development Guide

## Prerequisites

| Requirement | Version   | Check Command    |
| ----------- | --------- | ---------------- |
| Node.js     | >= 18.0.0 | `node --version` |
| npm         | >= 8.0.0  | `npm --version`  |
| Git         | Latest    | `git --version`  |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

## Available Scripts

### Development

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite dev server (port 3000) |
| `npm run build`   | Build for production              |
| `npm run preview` | Preview production build          |

### Testing

| Command                   | Description                |
| ------------------------- | -------------------------- |
| `npm run test`            | Run all tests (unit + E2E) |
| `npm run test:unit`       | Run Vitest unit tests      |
| `npm run test:unit:watch` | Watch mode for unit tests  |
| `npm run test:coverage`   | Generate coverage report   |
| `npm run test:e2e`        | Run Playwright E2E tests   |
| `npm run test:e2e:ui`     | Playwright with UI mode    |
| `npm run test:e2e:headed` | E2E with visible browser   |

### Specialized Tests

| Command                      | Description              |
| ---------------------------- | ------------------------ |
| `npm run test:mtg-logic`     | MTG-specific logic tests |
| `npm run test:mana-calc`     | Mana calculation tests   |
| `npm run test:deck-parser`   | Deck parsing tests       |
| `npm run test:accessibility` | A11y tests               |
| `npm run test:mobile`        | Mobile viewport tests    |

### Code Quality

| Command                | Description          |
| ---------------------- | -------------------- |
| `npm run lint`         | Run ESLint           |
| `npm run lint:fix`     | Fix ESLint issues    |
| `npm run format`       | Format with Prettier |
| `npm run format:check` | Check formatting     |
| `npm run type-check`   | TypeScript check     |

### Deployment

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run deploy` | Build and deploy to Vercel |

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Route pages
├── services/       # Business logic
├── hooks/          # Custom hooks
├── store/          # Redux store
├── types/          # TypeScript types
├── utils/          # Utilities
├── contexts/       # React contexts
├── theme/          # MUI theme
└── styles/         # Global styles
```

## Environment Setup

### Environment Variables

Create a `.env` file (optional - app works without it):

```bash
# Optional: Supabase (disabled by default)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Feature flags
VITE_ENABLE_CLOUD_SYNC=false
```

### IDE Setup

#### VS Code (Recommended)

Extensions:

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense (if using Tailwind)

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ...

# Run tests
npm run test:unit

# Check types
npm run type-check

# Lint
npm run lint

# Commit
git add .
git commit -m "feat: your feature description"
```

### 2. Testing Locally

```bash
# Unit tests during development
npm run test:unit:watch

# E2E tests before PR
npm run test:e2e

# Full test suite
npm run test
```

### 3. Building for Production

```bash
# Build
npm run build

# Preview locally
npm run preview
```

## Code Conventions

### TypeScript

```typescript
// Use interfaces for objects
interface DeckCard {
  name: string
  quantity: number
  manaCost?: string
}

// Use type for unions/primitives
type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

// Explicit return types on functions
function analyzeDeck(cards: DeckCard[]): AnalysisResult {
  // ...
}
```

### React Components

```tsx
// Functional components with TypeScript
interface MyComponentProps {
  title: string
  onAction: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Box>
      <Typography>{title}</Typography>
      <Button onClick={onAction}>Action</Button>
    </Box>
  )
}
```

### Hooks

```typescript
// Custom hooks start with 'use'
export function useMyHook() {
  const [state, setState] = useState<MyState>(initialState)

  const action = useCallback(() => {
    // ...
  }, [])

  return { state, action }
}
```

### File Naming

| Type       | Convention   | Example                |
| ---------- | ------------ | ---------------------- |
| Components | PascalCase   | `MyComponent.tsx`      |
| Hooks      | camelCase    | `useMyHook.ts`         |
| Services   | camelCase    | `myService.ts`         |
| Types      | camelCase    | `myTypes.ts`           |
| Utils      | camelCase    | `myUtils.ts`           |
| Tests      | same + .test | `MyComponent.test.tsx` |

## Testing Guidelines

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toEqual(expected)
  })
})
```

### Component Tests (Testing Library)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const onAction = vi.fn()
    render(<MyComponent title="Test" onAction={onAction} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onAction).toHaveBeenCalled()
  })
})
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('analyzer flow', async ({ page }) => {
  await page.goto('/analyzer')
  await page.fill('[data-testid="deck-input"]', '4 Lightning Bolt')
  await page.click('[data-testid="analyze-btn"]')
  await expect(page.locator('.results')).toBeVisible()
})
```

## Troubleshooting

### Common Issues

#### Port 5173 in use

```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9
```

#### Node modules issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript errors after update

```bash
# Rebuild types
npm run type-check
```

#### Playwright browsers not installed

```bash
npm run playwright:install
```

## Performance Tips

1. **Use React.memo** for expensive components
2. **Memoize calculations** with useMemo
3. **Debounce inputs** for search/filter
4. **Lazy load pages** with React.lazy
5. **Virtualize long lists** with react-window

## Deployment

### Vercel (Recommended)

```bash
# Deploy to production
npm run deploy

# Or manually
vercel --prod
```

### Manual Build

```bash
# Build
npm run build

# Output in dist/
ls dist/
```

## Support

- **GitHub Issues**: [Report bugs](https://github.com/gbordes77/manatuner-pro/issues)
- **Documentation**: See `docs/` folder
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

_Generated by BMAD document-project workflow on 2026-01-06_
