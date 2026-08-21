# AGENTS.md - Development Guide for Agentic Coding

This guide provides essential information for agentic coding agents operating in the Rebuildr monorepo.

## Repository Structure

Monorepo with three applications:

- **rebuildr-backend** - NestJS GraphQL API
- **rebuildr-app** - Expo React Native (web/iOS/Android)
- **rebuildr-admin** - Next.js 14 admin dashboard (runs on port 3002)

## Build, Lint & Test Commands

### Backend (rebuildr-backend)

```bash
cd rebuildr-backend

npm run build           # Compile TypeScript
npm run lint            # ESLint
npm run format          # Prettier (src + test)
npm run type-check      # tsc --noEmit

npm test                          # Unit tests (uses test/jest.config.json, rootDir: .)
npm run test:watch                # Watch mode
npm run test:cov                  # Coverage (uses package.json jest block, rootDir: src)
npm run test:e2e                  # E2E tests (test/jest-e2e.json)
npm run test:all                  # Unit + E2E

# Run a single test file
npm test -- src/path/to/file.spec.ts

# Watch a single test file
npm run test:watch -- --testPathPattern=src/path/to/file.spec.ts
```

### App (rebuildr-app)

```bash
cd rebuildr-app

npm run lint            # ESLint
npm start               # Expo dev server
npm run codegen         # Generate GraphQL types from ../rebuildr-backend/src/schema.gql
```

### Admin (rebuildr-admin)

```bash
cd rebuildr-admin

npm run build           # Next.js production build
npm run lint            # Next.js ESLint
npm run dev             # Dev server on port 3002
npm run codegen         # Generate GraphQL types (requires backend running at localhost:3000)
```

## Authentication & Environment

All apps use **1Password CLI** (`op run`) to load env vars:

```bash
op run --env-file=".env.local.1p" -- npm run start:dev   # backend
op run --env-file=".env.local.1p" -- expo start --web    # app
op run --env-file=".env.local.1p" -- next dev            # admin
```

## Code Style Guidelines

### Formatting (Prettier)

| App         | Quotes | Trailing commas            | Notes                                                    |
| ----------- | ------ | --------------------------- | -------------------------------------------------------- |
| **backend** | Single | `all`                      |                                                          |
| **app**     | Double | `all`                      |                                                          |
| **admin**   | Double | `all` (Prettier 3 default) | Tailwind class sorting via `prettier-plugin-tailwindcss` |

### Imports

Group and order: **third-party first (alphabetical), then internal (alphabetical), separated by a blank line.**

**Backend** — use absolute `src/` paths for internal imports:

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "src/entities/user.entity";
import { BadUserInputException } from "src/exceptions";
import { FileService } from "src/services/file.service";
```

**App** — use path aliases (defined in `tsconfig.json`):

```typescript
import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";

import { isLoggedInVar } from "@/apollo/config";
import MyComponent from "@components/MyComponent";
import { useUser } from "@hooks/useUser";
```

**Admin** — use `@/` alias for `src/`:

```typescript
import axios from "axios";
import { PropsWithChildren } from "react";

import { refreshToken } from "@/actions/auth";
import AntdProvider from "@/provider/antd-provider";
import { fetchSession } from "@lib/session";
```

### Path Aliases

**App** (`rebuildr-app/tsconfig.json`):

- `@/*` → `./*`
- `@components/*` → `components/*`
- `@hooks/*` → `hooks/*`
- `@context/*` → `contexts/*`
- `@icons/*` → `components/icons/*`
- `@pictograms/*` → `components/pictograms/*`
- `@text/*` → `components/typography/*`
- `@assets/*` → `assets/*`
- `@constants/*` → `constants/*`

**Admin** (`rebuildr-admin/tsconfig.json`):

- `@/*` → `./src/*`
- `@lib/*` → `./src/lib/*`
- `@utils/*` → `./src/utils/*`
- `@components/*` → `./src/components/*`
- `@actions/*` → `./src/actions/*`
- `@gql/*` → `./src/gql/*`

### TypeScript Settings

**Backend** (`strict: true` with selective overrides):

- `strictNullChecks: false` — null checks are relaxed
- `noImplicitAny: false` — implicit any is allowed
- `target: ES2021`, `module: commonjs`

**Admin**: `strict: true`, `target: ES2017`, `moduleResolution: bundler`

**App**: `strict: true`, extends `expo/tsconfig.base`

### Naming Conventions

| Thing                 | Convention                                                                               | Example                        |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| Files (backend)       | `*.service.ts`, `*.module.ts`, `*.controller.ts`, `*.entity.ts`, `*.dto.ts`, `*.spec.ts` | `user.service.ts`              |
| Classes/Interfaces    | PascalCase                                                                                | `UserService`, `CreateUserDto` |
| Variables/functions   | camelCase                                                                                 | `getUser()`, `userId`          |
| Constants             | UPPER_SNAKE_CASE                                                                          | `MAX_RETRIES`                  |
| Private class members | Underscore prefix                                                                         | `_helper()`                    |

### Comments

- Only comment the non-obvious **why** — a hidden constraint, a workaround, a subtle invariant. Never restate what the code does.
- Do not reference specific files, services, or paths from another part of the codebase (e.g. a frontend comment should not point at a backend file). One side's implementation changing shouldn't make the other side's comment wrong or stale.
- Do not write comments as if answering a prompt or explaining a change to a reviewer (e.g. "added this to fix X" or "changed to support Y"). A comment should read as a fact about the code, not a narration of how it came to be.
- Do not justify a choice by contrasting it with an alternative or rejected implementation (e.g. "one continuous fill rather than one segment per step", "X, not Y"). This only makes sense to a reader who already knows what it's being compared against, which is the same problem as narrating a change. If the code is self-explanatory from its own names and types, delete the comment rather than softening it into comparative language.

### Error Handling

**Backend** — always use the factory functions from `src/exceptions.ts`, never throw raw errors:

```typescript
import {
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from "src/exceptions";

throw BadUserInputException("Email is invalid");
throw BadFieldsInputException([
  { name: "email", message: "Invalid email", type: "BAD_VALUE" },
  { name: "username", message: "Already taken", type: "VALUE_TAKEN" },
]);
throw NotFoundException("User not found");
throw ForbiddenException("You cannot access this resource");
```

**Frontend** — try-catch for async ops; use Apollo Client error handling for GraphQL mutations/queries.

### Backend Patterns

**Entity** — TypeORM and GraphQL decorators on the same class:

```typescript
@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, unique: true })
  username?: string;
}
```

**Resolver** — `@InputType` and `@ObjectType` classes are co-located in the same resolver file, not in separate DTO files:

```typescript
@InputType()
export class RegisterUserInput {
  @Field(() => String)
  email: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async registerUser(@Args("input") input: RegisterUserInput) {
    return await this.authService.registerUser(input);
  }
}
```

**Validation** — Zod schemas applied via `ZodValidationPipe` on resolvers, or inline `.parse()` / `.safeParse()` inside services.

### Frontend Patterns

**App (Expo)** — hooks use Apollo Client with generated typed query/mutation hooks:

```typescript
export const useUser = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data, loading } = useQuery<GetMeQuery, GetMeQueryVariables>(GET_ME, {
    skip: !isLoggedIn,
  });
  return { isLoggedIn, me: data?.me, loading };
};
```

**Admin (Next.js)** — UI stack: Ant Design 5 + Tailwind CSS + TanStack Query + React Hook Form + Zod. Data fetching uses plain async query functions (not hooks) via an Axios client with JWT refresh interceptors (`src/lib/api-client.ts`).

### Linting Rules

**Backend** — ESLint flat config (`eslint.config.mjs`), typescript-eslint recommended + strict + stylistic. Only `@typescript-eslint/no-extraneous-class` is disabled (required for NestJS modules/controllers).

**App** — `eslint-config-universe/native` (Expo preset). Disabled: `react-hooks/exhaustive-deps`, `import/order`.

**Admin** — `next/core-web-vitals` + `next/typescript`. Disabled: `react-hooks/exhaustive-deps`, `@typescript-eslint/no-unused-vars`. Ignored: `src/components/ui/*`, `./gql/*`.

## Testing Standards

- Test files: `src/**/*.spec.ts` (unit), `test/*.e2e-spec.ts` (E2E)
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests
- Mock repositories as plain objects with `jest.fn()` methods
- Shared mocks live in `test/mocks/` (e.g. `StripeMock`, `PostnordMock`, `S3Mock`)
- Use `describe` / `it` blocks with `beforeEach` / `afterEach`
- Define test fixtures in a `getFixtures()` helper at the bottom of the spec file

## Database & Migrations

- ORM: TypeORM | Database: PostgreSQL with PostGIS | Config: `src/ormconfig-migrations.ts`

```bash
cd rebuildr-backend

npm run migration:run                              # Apply pending migrations
npm run migration:show                             # List pending migrations
npm run migration:revert                           # Revert last migration
npm run migration:generate -- -n MigrationName    # Generate from entity changes
npm run migration:create -- -n MigrationName      # Create empty migration
```

## Code Quality Checklist

Before committing (run from the relevant app directory):

- [ ] `npm run format` — auto-format
- [ ] `npm run lint` — no warnings or errors
- [ ] `npm run type-check` — backend only
- [ ] `npm test` — all tests pass

Never add Co-Authored-By trailers to commits.
