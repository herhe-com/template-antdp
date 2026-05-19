# AGENTS.md

This file provides guidance to AI coding agents (Claude, Copilot, Cursor, etc.) when working with code in this repository.

## Project Overview

This is an enterprise-level admin system built with **UmiJS v4/max** and **Ant Design Pro 6**. It uses TypeScript with strict mode enabled and follows Ant Design's component patterns.

## Development Commands

### Development Server

- `bun run dev` or `bun run start:dev` - Start development server (dev environment, no mock)
- `bun run start:test` - Start with test environment (no mock)
- `bun run start:pre` - Start with pre-production environment
- `bun run start:no-mock` - Start without mock data

### Build & Deploy

- `bun run build` - Production build
- `bun run preview` - Preview production build locally on port 8000
- `bun run analyze` - Build with bundle analysis

### Linting & Formatting

- `bun run lint` - Run all lint checks (ESLint + Prettier + TypeScript)
- `bun run lint:fix` - Auto-fix linting issues
- `bun run lint:js` - Run ESLint only
- `bun run tsc` - Run TypeScript type checking

### Testing

- `bun run test` or `bun run jest` - Run all tests
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:update` - Update test snapshots
- **Run single test**: `bunx jest path/to/file.test.ts`

### Code Generation

- `bun run openapi` - Generate API service files from OpenAPI specifications

## Architecture

### Directory Structure

- **`src/pages/`** - Page components (e.g., `Basic/Login`, `Site/User/Paginate`)
- **`src/services/`** - API request functions (generated or manual)
- **`src/components/`** - Reusable React components
- **`src/utils/`** - Utility functions (Constants, Pattern validators, etc.)
- **`config/`** - UmiJS configuration files
- **`routes/`** - Modular route definitions imported by `config/routes.ts`
- **`mock/`** - Mock data for local development
- **`tests/`** - Test files and setup

### Key Files

- **`src/app.tsx`** - Runtime configuration (initial state, request interceptors, layout)
- **`src/access.ts`** - Permission and access control definitions
- **`src/requestErrorConfig.ts`** - Global error handling for HTTP requests
- **`config/routes.ts`** - Centralized routing configuration
- **`config/defaultSettings.ts`** - UI layout and theme settings
- **`config/proxy.ts`** - Development proxy configuration

## Code Style Guidelines

### Import Order & Formatting

1. **React imports first**: `import { useState, useEffect } from 'react'`
2. **Third-party libraries**: Ant Design components, icons, utilities
3. **UmiJS/Max imports**: `import { history, useModel } from '@umijs/max'`
4. **Local imports with `@/` alias**:
   - `@/utils/*` for utilities
   - `@/services/*` for API services
   - `@/components/*` for components
5. **Relative imports**: `./service`, `./index.less`
6. **Use semicolons** consistently

### TypeScript Conventions

- **Strict mode enabled** - All type safety rules enforced
- **Use explicit types** for function parameters and return values
- **API Types**: Define in namespaces (e.g., `APIBasicLogin.Request`, `APISite.Role`)
- **Generic types**: `APIResponse.Response<T>` for API responses
- **Avoid `any`**: Use proper types or `unknown` when necessary
- **React types**: Use `React.FC` sparingly, prefer typed function components

### Naming Conventions

- **Components**: PascalCase (e.g., `Login`, `UserDropdown`, `TechBackground`)
- **Files**: Match component names - `index.tsx` for main exports
- **Functions**: camelCase with descriptive prefixes:
  - `do*` for API calls (e.g., `doLogin`, `doBasicAccount`, `doSitePermissions`)
  - `to*` for navigation/transformation (e.g., `toAccount`, `toLogin`)
  - `on*` for event handlers (e.g., `onSubmit`, `onCaptcha`)
- **Constants**: SCREAMING_SNAKE_CASE in `@/utils/Constants`
- **Hooks**: Standard React convention (e.g., `useState`, `useModel`, `useEffect`)

### Component Patterns

- **Functional components** with hooks (no class components)
- **Ant Design Form** with `Form.useForm()` hook
- **State management**: Use `useModel('@@initialState')` for global state
- **Routing**: Use `history` from `@umijs/max` for navigation
- **Styling**: CSS Modules with `.less` files, use `styles.className` pattern

### API & Data Fetching

- **Request function**: Use `request` from `umi` with typed responses
- **Pattern**: `request<APIResponse.Response<DataType>>(url, options)`
- **Error handling**: Check `response.code` against `Constants.Success`
- **Authorization**: Stored in `localStorage` with key from `Constants.Authorization`
- **Interceptors**: Configured in `src/app.tsx` (auth headers, token refresh, unauthorized)

### Error Handling

- **API responses**: Always check `response.code != Constants.Success`
- **Use try-catch** for async operations that might fail
- **User feedback**:
  - `message.error()` for error notifications
  - `message.success()` for success notifications
  - `Alert` component for persistent messages
- **Loading states**: Use state variables (`loading`, `load`) with Ant Design components

### State Management

- **Local state**: `useState` for component-specific state
- **Global state**: `useModel('@@initialState')` for app-wide state
- **Form state**: Ant Design `Form.useForm()` for form management
- **Refs**: `useRef<Type>(null)` for DOM references and mutable values

### Code Formatting (Prettier)

- **Single quotes** for strings
- **Trailing commas** in arrays and objects
- **Print width**: 100 characters
- **Line endings**: LF (Unix-style)
- **No prose wrap** in markdown

### Best Practices

- **Always await** API calls and handle responses properly
- **Clear localStorage** on logout
- **Redirect** to login on unauthorized (401) responses
- **Type all props** and state properly
- **Use constants** from `@/utils/Constants` for routes and codes
- **Validate forms** using Ant Design rules with `@/utils/Pattern` regex
- **Clean up effects** with proper dependencies
- **Avoid inline styles** - prefer CSS Modules or Ant Design props

## Common Patterns

### API Service Function

```typescript
export async function doSiteRoleOfInformation(id?: number) {
  return request<APIResponse.Response<APISite.Role>>(`/api-admin/site/roles/${id}`);
}
```

### Page Component Structure

```typescript
const PageName = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const onSubmit = async (values: FormType) => {
    setLoading(true);
    const response = await doApiCall(values);
    if (response.code !== Constants.Success) {
      message.error(response.message);
    } else {
      message.success('操作成功');
    }
    setLoading(false);
  };

  return (
    <Form form={form} onFinish={onSubmit}>
      ...
    </Form>
  );
};

export default PageName;
```

### Route Configuration

```typescript
{
  path: '/module/page',
  component: './Module/Page',
  name: 'pageName',
  icon: 'iconName',
}
```

## Testing

- Use **Jest** with `@testing-library/react` for component testing
- Test files should be colocated or in `tests/` directory
- Mock API calls when testing components with data fetching
- Setup file: `tests/setupTests.jsx`

## Notes for Agents

- This is a **Chinese-language application** - UI text and messages are in Chinese
- Always preserve existing code style and patterns
- Respect TypeScript strict mode - no implicit any
- Follow Ant Design Pro conventions for layouts and components
- Use the established service layer pattern for all API calls
