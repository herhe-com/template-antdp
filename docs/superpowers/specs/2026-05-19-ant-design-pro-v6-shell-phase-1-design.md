# Ant Design Pro V6 Shell Migration Phase 1 Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the first application route to a Pro V6-style path while preserving existing business pages, APIs, and access rules through explicit redirects and compatibility handling.

**Architecture:** This phase only changes the routing shell. The route table will be updated so the primary module path uses the new Pro-style naming, while the previous path remains available through redirects. Menu labels will follow the new path naming, but the backend-facing permission string will remain unchanged so existing access control continues to work. The underlying page components and service calls remain unchanged. The login flow, layout shell, header navigation, and access control logic continue to use the current data model.

**Tech Stack:** Umi Max, React, TypeScript, Ant Design, `@ant-design/pro-components`.

---

## Context

The repository already uses Umi Max with Pro components, but the shell still behaves like a custom Ant Design Pro starter rather than a Pro V6-style application. The current route table is split between `config/routes.ts` and the root `routes/site.ts`, and the top navigation performs module switching based on the first path segment. That means route renaming must be handled carefully so the active module, menu selection, and permission lookup continue to work after the first path changes.

This phase is intentionally narrow:

- Keep existing business pages and backend APIs untouched.
- Keep the login, account, permission, and module-fetch flows intact.
- Update only the first route path and the shell-level compatibility behavior around it.
- Stop after the first route change so the user can confirm whether later routes should also be standardized or left as-is.

## Scope

### In scope

- Rename the first route path in `routes/site.ts` to a Pro V6-style path.
- Update the corresponding route metadata so the menu label matches the new route naming while the permission key stays stable.
- Add a redirect from the old path to the new path.
- Ensure the top navigation still resolves the correct first page for the active module after the rename.
- Keep the page component references unchanged.

### Out of scope

- Refactoring business pages under `src/pages/`.
- Changing backend contracts or API payloads.
- Reworking the login UI.
- Replacing the access model or permission API.
- Renaming every route in the application during this phase.
- Moving the project to a different framework or component library.

## Proposed Route Change

The first route currently lives at `/site/users` and represents the user list page. In phase 1 it will become the new canonical route for the module entry page, using a more Pro V6-like naming style.

Planned behavior:

- New canonical path: `/site/user/list`
- Legacy path: `/site/users`
- Legacy path behavior: redirect to `/site/user/list`
- Menu label: keep the existing business meaning, but route metadata should follow the renamed path
- Permission key: keep the current backend permission string so the existing access contract is preserved

The implementation should avoid changing the page component itself. The same page should render regardless of whether the user arrives through the new path or the redirected old path.

## File-Level Design

### `routes/site.ts`

This file is the primary route definition for the business shell. It will be updated to:

- change the first route's `path`
- preserve the existing `component`
- preserve the existing `access` gate
- add or preserve a redirect entry for the old route path

### `config/routes.ts`

This file currently imports `routes/site` and appends the 404 route. It will be reviewed to make sure the route list still resolves correctly after the renamed path is introduced. If the redirect requires a separate route entry, this file may need a small ordering adjustment so the redirect wins before the catch-all `*` route.

### `src/components/Basic/Navigation/index.tsx`

The header navigation computes the first accessible route from the configured route table. It will need a small update so the new canonical path is selected when the active module changes and the old path is no longer the primary entry.

### `src/utils/Constants.ts`

If route constants or login/forbidden destinations need to reference the renamed route, they will be updated here. Otherwise this file should remain unchanged.

## Behavior Details

### Route matching

The renamed route must still participate in the existing permission check:

- the module code still comes from `initialState.module`
- the current module permissions still come from `doBasicPermissions`
- the route is considered valid only when its permission key is present in the permission map

### Redirect compatibility

The old path must redirect to the new one without triggering a 404 or bypassing access checks. Redirect behavior should be handled at the route configuration layer rather than in page code, so users landing on old bookmarks or old links are still routed correctly.

### Menu and navigation selection

The header menu should keep using module keys from `initialState.modules`, but when it resolves the first page for a module, it should prefer the new canonical path. This preserves the current “switch module, land on first accessible route” behavior while preventing the old route from becoming the default entry point.

## Error Handling

- If the user lands on the legacy path, they should be redirected before page rendering, not after a failed page load.
- If the user lacks permission for the new canonical route, the current 403 behavior should remain unchanged.
- If no accessible route exists for the active module, the existing forbidden fallback should remain unchanged.

## Testing Strategy

The phase should be verified with focused routing checks rather than broad business-page changes.

### Manual verification

- Start the app and sign in.
- Open the renamed canonical route and confirm the page renders.
- Open the legacy route and confirm it redirects to the canonical route.
- Switch modules from the header and confirm the first accessible route still opens.
- Confirm the 403 and login flows behave exactly as before.

### Automated checks

If the repository already has route or layout tests, add or update the smallest possible test coverage around:

- the route table resolving the new canonical path
- the legacy path redirecting to the new path
- the header navigation returning the canonical route for the active module

## Acceptance Criteria

- The first route now uses the new Pro V6-style canonical path.
- The old path still works through redirect.
- Business page components are unchanged.
- Backend API calls are unchanged.
- The shell still opens the correct first page after module switching.
- The user can review the result after this first route change before any further route standardization happens.

## Open Decision

After this phase is implemented, the next user confirmation point is whether the remaining routes should also be renamed to the new standard or left in their current form.
