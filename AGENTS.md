# AGENTS.md - Development Guide for Agentic Coding

This guide provides essential information for agentic coding agents operating in the Rebuildr monorepo.

## Repository Structure

Monorepo with three applications:
- **rebuildr-backend** - NestJS GraphQL API
- **rebuildr-app** - Expo React Native (web/iOS/Android)
- **rebuildr-admin** - Next.js 14 admin dashboard

## Build, Lint & Test Commands

### Backend (rebuildr-backend)
```bash
cd rebuildr-backend

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check

# Run tests
npm test                    # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests
npm run test:all           # Run unit + E2E tests

# Single test file
npm test -- src/path/to/file.spec.ts

# Watch single test
npm run test:watch -- src/path/to/file.spec.ts
```

### App (rebuildr-app)
```bash
cd rebuildr-app

# Lint
npm run lint

# Start dev server
npm start

# Format (via Prettier)
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"

# Generate GraphQL types
npm run codegen
```

### Admin (rebuildr-admin)
```bash
cd rebuildr-admin

# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev

# Format (via Prettier with Tailwind plugin)
npx prettier --write "**/*.{ts,tsx,js,jsx}"

# Generate GraphQL types
npm run codegen
```

## Code Style Guidelines

### Formatting (Prettier)

**Backend & App:**
- Single quotes: `true`
- Trailing commas: `all`
- Line width: default (80)

**Admin:**
- Single quotes: `false` (use double quotes)
- Trailing commas: `all`
- Tab width: 2 spaces
- Tailwind CSS class sorting enabled

### Imports

1. **Group and order imports:**
   - Third-party packages first (alphabetically)
   - Internal imports after blank line (alphabetically)
   - Use absolute paths with `src/` prefix when available

2. **Backend example:**
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { DataSource } from 'typeorm';

   import { MyService } from 'src/services/my.service';
   import { MyEntity } from 'src/entities/my.entity';
   ```

3. **Frontend example (Next.js/Expo):**
   ```typescript
   import React from 'react';
   import { View } from 'react-native';

   import MyComponent from '@/components/MyComponent';
   ```

### TypeScript Settings

**Backend:**
- `strict: true` mode enabled
- `skipLibCheck: true` (for compatibility)
- `strictNullChecks: false` (relaxed null checking)
- Target: ES2021

**Admin:**
- TypeScript 5.7.3
- Next.js type checking enabled

**App:**
- TypeScript 5.9.2
- Expo type checking

### Naming Conventions

1. **Files:**
   - Services: `*.service.ts`
   - Modules: `*.module.ts`
   - Controllers: `*.controller.ts`
   - Entities: `*.entity.ts`
   - Dtos: `*.dto.ts`
   - Interfaces: `*.interface.ts`
   - Tests: `*.spec.ts`

2. **Classes/Interfaces:**
   - PascalCase: `UserService`, `CreateUserDto`, `IUserRepository`

3. **Variables/Functions:**
   - camelCase: `getUser()`, `userId`, `isActive`

4. **Constants:**
   - UPPER_SNAKE_CASE: `MAX_RETRIES`, `DEFAULT_TIMEOUT`

5. **Private members:**
   - Prefix with underscore: `_internalState`, `_helper()`

### Error Handling

**Backend (GraphQL):**

Use provided exception functions in `src/exceptions.ts`:
```typescript
import {
  BadUserInputException,
  BadFieldsInputException,
  NotFoundException,
  ForbiddenException,
  InternalServerException,
} from 'src/exceptions';

// Single field validation error
throw BadUserInputException('Email is invalid');

// Multiple field validation errors
throw BadFieldsInputException([
  { name: 'email', message: 'Invalid email', type: 'BAD_VALUE' },
  { name: 'username', message: 'Already taken', type: 'VALUE_TAKEN' },
]);

// Resource not found
throw NotFoundException('User not found');

// Forbidden action
throw ForbiddenException('You cannot access this resource');
```

**Frontend:**
- Use try-catch for async operations
- Leverage Apollo Client error handling for GraphQL
- Display user-friendly error messages

### Type Safety

1. **Use strict types:**
   - Avoid `any` type (eslint rule enforces this)
   - Use `unknown` if type is truly unknown
   - Define interfaces/types for all data shapes

2. **Backend DTOs (Data Transfer Objects):**
   ```typescript
   export class CreateUserDto {
     email: string;
     username: string;
     password: string;
   }
   ```

3. **Frontend hooks/queries:**
   ```typescript
   interface User {
     id: string;
     email: string;
     username: string;
   }
   ```

### Linting Rules

**Backend ESLint:**
- Recommended TypeScript ESLint rules (strict & stylistic)
- Exception: `@typescript-eslint/no-extraneous-class` disabled

**App ESLint:**
- Expo preset (universe/native)
- Exceptions:
  - `react-hooks/exhaustive-deps`: disabled
  - `import/order`: disabled (manual ordering preferred)

**Admin ESLint:**
- Next.js core Web Vitals and TypeScript preset
- Exceptions:
  - `react-hooks/exhaustive-deps`: disabled
  - `@typescript-eslint/no-unused-vars`: disabled
- Ignored patterns: `src/components/ui/*`, `./gql/*`

## Authentication & Environment

- Use **1Password CLI** (`op run`) to load environment variables
- Backend dev: `op run --env-file=".env.local.1p" -- npm run start:dev`
- App web: `op run --env-file=".env.local.1p" -- expo start --web`
- Admin dev: `op run --env-file=".env.local.1p" -- next dev`

## Testing Standards

1. **Backend:**
   - Jest configuration in `test/jest.config.json`
   - Test files: `src/**/*.spec.ts`
   - Use `@nestjs/testing` for module testing
   - Use `supertest` for HTTP endpoint testing

2. **E2E Tests:**
   - Configuration: `test/jest-e2e.json`
   - Run with: `npm run test:e2e`

3. **Coverage:**
   - Run: `npm run test:cov`
   - Output: `coverage/` directory

## Database & Migrations

- ORM: TypeORM
- Database: PostgreSQL with PostGIS
- Config: `src/ormconfig-migrations.ts`

```bash
cd rebuildr-backend

# Run migrations
npm run migration:run

# Show pending migrations
npm run migration:show

# Revert last migration
npm run migration:revert

# Generate migration from entities
npm run migration:generate -- -n MigrationName

# Create empty migration
npm run migration:create -- -n MigrationName
```

## Code Quality Checklist

Before committing:
- [ ] Run formatter: `npm run format`
- [ ] Run linter: `npm run lint`
- [ ] Run type-check: `npm run type-check` (backend)
- [ ] Run tests: `npm test`
- [ ] Verify no ESLint warnings or errors

## Additional Resources

- Backend Framework: [NestJS Docs](https://docs.nestjs.com)
- Frontend: [Next.js Docs](https://nextjs.org/docs), [Expo Docs](https://docs.expo.dev)
- API: [GraphQL](https://graphql.org/), [Apollo Client](https://www.apollographql.com/docs/react/)
- Database: [TypeORM Docs](https://typeorm.io/), [PostgreSQL Docs](https://www.postgresql.org/docs/)
