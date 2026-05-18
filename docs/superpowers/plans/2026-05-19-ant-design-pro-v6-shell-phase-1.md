# Ant Design Pro V6 Shell Cleanup Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the application shell so it follows a clearer Pro V6-style structure while keeping all current route paths, business pages, APIs, and access rules unchanged.

**Architecture:** Phase 1 stays entirely in the shell layer. The current route list remains intact, but shared shell behavior will be extracted into small pure helpers so navigation and bootstrap logic are easier to reason about and test. The user-facing outcome must remain unchanged: the same module still lands on the same route, and the same permissions still gate the same pages.

**Tech Stack:** Umi Max, React, TypeScript, Ant Design, Jest.

---

## Task 1: Extract shell route resolution and keep header navigation behavior stable

**Files:**
- Create: `src/utils/route.ts`
- Modify: `src/components/Basic/Navigation/index.tsx`
- Test: `tests/utils/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/utils/route.test.ts`:

```ts
import { resolveModuleLandingRoute } from '../../src/utils/route';

describe('resolveModuleLandingRoute', () => {
  it('returns the same accessible route as the current header logic', () => {
    const routes = [
      {
        name: '用户',
        path: '/site/users',
        access: 'route',
        permission: 'site.user.paginate',
      },
      {
        name: '角色',
        path: '/site/roles',
        access: 'route',
        permission: 'site.role.paginate',
      },
    ];

    expect(
      resolveModuleLandingRoute(routes, 'site', {
        'site.user.paginate': 'site.user.paginate',
      }),
    ).toBe('/site/users');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
bun run jest -- tests/utils/route.test.ts --runInBand
```

Expected: FAIL because `resolveModuleLandingRoute` does not exist yet.

- [ ] **Step 3: Implement the helper and wire navigation to it**

Create `src/utils/route.ts`:

```ts
type RouteItem = {
  path?: string;
  access?: string;
  permission?: string;
  routes?: RouteItem[];
};

export const resolveModuleLandingRoute = (
  items: RouteItem[],
  module: string,
  permissions: Record<string, string>,
): string => {
  for (const item of items) {
    if (item.routes) {
      const nested = resolveModuleLandingRoute(item.routes, module, permissions);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (!item.path || !item.path.startsWith(`/${module}`)) {
      continue;
    }

    for (const permissionKey in permissions) {
      if ((!item.access && !item.permission) || (item.access === 'route' && item.permission === permissionKey)) {
        return item.path;
      }
    }
  }

  return '';
};
```

Update `src/components/Basic/Navigation/index.tsx` so the navigation effect uses the helper instead of the inline recursion:

```tsx
import { useEffect, useState } from 'react';
import { Menu } from 'antd';
import { useLocation, useModel, history } from 'umi';
import { doBasicPermissions } from '@/services/basic';
import Constants from '@/utils/Constants';
import routes from '../../../../config/routes';
import { resolveModuleLandingRoute } from '@/utils/route';

const Header = () => {
  const location = useLocation();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [click, setClick] = useState(false);

  useEffect(() => {
    if (initialState?.module && !location.pathname.startsWith(`/${initialState.module}`)) {
      const route = initialState?.permissions
        ? resolveModuleLandingRoute(routes, initialState.module, initialState.permissions)
        : '';

      if (route) {
        history.push({ pathname: route });
      }
    }
  }, [location, initialState?.module, initialState?.permissions]);

  // keep the existing module switch and permission refresh logic unchanged
};

export default Header;
```

- [ ] **Step 4: Re-run the helper test**

Run:

```bash
bun run jest -- tests/utils/route.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/route.ts src/components/Basic/Navigation/index.tsx tests/utils/route.test.ts
git commit -m "feat: extract stable shell route resolution"
```

## Task 2: Extract bootstrap helpers from `src/app.tsx`

**Files:**
- Create: `src/utils/bootstrap.ts`
- Modify: `src/app.tsx`
- Test: `tests/utils/bootstrap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/utils/bootstrap.test.ts`:

```ts
import { buildPermissionMap, resolveModuleFromPathname } from '../../src/utils/bootstrap';

describe('shell bootstrap helpers', () => {
  it('builds a permission map from the API list', () => {
    expect(buildPermissionMap(['site.user.paginate', 'site.role.paginate'])).toEqual({
      'site.user.paginate': 'site.user.paginate',
      'site.role.paginate': 'site.role.paginate',
    });
  });

  it('resolves the current module from the pathname when possible', () => {
    expect(
      resolveModuleFromPathname('/site/users', [
        { code: 'site' },
        { code: 'basic' },
      ]),
    ).toBe('site');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
bun run jest -- tests/utils/bootstrap.test.ts --runInBand
```

Expected: FAIL because the helper module does not exist yet.

- [ ] **Step 3: Implement the helpers and simplify `src/app.tsx`**

Create `src/utils/bootstrap.ts`:

```ts
type ModuleItem = {
  code: string;
};

export const buildPermissionMap = (permissions: string[]): Record<string, string> =>
  permissions.reduce<Record<string, string>>((acc, item) => {
    acc[item] = item;
    return acc;
  }, {});

export const resolveModuleFromPathname = (pathname: string, modules: ModuleItem[]): string => {
  const paths = pathname.split('/');
  const target = paths.length >= 2 ? paths[1] : '';

  if (!target) {
    return modules[0]?.code || '';
  }

  const matched = modules.find((item) => item.code === target);
  return matched?.code || modules[0]?.code || '';
};
```

Refactor `src/app.tsx` so it keeps the current behavior but delegates the repeated shell decisions to these helpers:

```tsx
import React from 'react';
import { Settings as LayoutSettings } from '@ant-design/pro-components';
import { history, RunTimeLayoutConfig } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { RequestOptionsInit } from 'umi-request';
import Navigation from '@/components/Basic/Navigation';
import UserDropdown from '@/components/Basic/UserDropdown';
import Footer from '@/components/Basic/Footer';
import { doBasicAccount, doBasicModules, doBasicPermissions } from '@/services/basic';
import Constants from '@/utils/Constants';
import { buildPermissionMap, resolveModuleFromPathname } from '@/utils/bootstrap';
import 'dayjs/locale/zh-cn';

export async function getInitialState(): Promise<{
  module?: string;
  modules?: APIBasic.doBasicModules[];
  account?: APIBasic.doBasicAccount;
  permissions?: Record<string, string>;
  toAccount?: () => Promise<APIBasic.doBasicAccount | undefined>;
  settings?: Partial<LayoutSettings>;
}> {
  const toAccount = async () => {
    try {
      const response = await doBasicAccount();
      if (response.code == Constants.Success) return response.data;
    } catch (error) {
      history.push(Constants.Login);
    }
    return undefined;
  };

  const pathname = history.location.pathname;

  if (pathname !== Constants.Login) {
    const account = await toAccount();

    if (!account) {
      history.push(Constants.Forbidden);
    } else {
      const modules = await doBasicModules();

      if (modules.code != Constants.Success || modules.data.length <= 0) {
        history.push(Constants.Forbidden);
      } else {
        const module = resolveModuleFromPathname(pathname, modules.data);
        const permissions = await doBasicPermissions(module);

        if (permissions.code != Constants.Success || permissions.data.length <= 0) {
          history.push(Constants.Forbidden);
        } else {
          return {
            toAccount,
            module,
            modules: modules.data,
            account,
            permissions: buildPermissionMap(permissions.data),
            settings: defaultSettings,
          };
        }
      }
    }

    return { toAccount, account, settings: defaultSettings };
  }

  return {
    toAccount,
    settings: defaultSettings,
  };
}
```

- [ ] **Step 4: Re-run the bootstrap test**

Run:

```bash
bun run jest -- tests/utils/bootstrap.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/bootstrap.ts src/app.tsx tests/utils/bootstrap.test.ts
git commit -m "feat: simplify shell bootstrap helpers"
```

## Task 3: Verify the shell remains behaviorally unchanged

**Files:**
- Test: `tests/utils/route.test.ts`
- Test: `tests/utils/bootstrap.test.ts`

- [ ] **Step 1: Run the targeted tests together**

Run:

```bash
bun run jest -- tests/utils/route.test.ts tests/utils/bootstrap.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run the app and confirm the shell still behaves the same**

Run:

```bash
bun run dev
```

Then confirm:

- the existing route paths still open the same business pages
- switching modules still lands on the first accessible route
- login and forbidden behavior remain unchanged

- [ ] **Step 3: Stop and ask the user whether route paths should be standardized later**

If the shell cleanup is stable, stop here and wait for the user to decide whether any route path standardization should happen in a later phase.
