# Ant Design Pro V6 Shell Cleanup Phase 1 Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the application shell so it matches a Pro V6-style structure while preserving the current route paths, business pages, APIs, and access rules.

**Architecture:** This phase only changes the shell layer. Route paths stay as they are, but the layout, navigation, login bootstrap, and shared shell utilities will be tightened so the app behaves like a Pro V6 application without disturbing business pages or backend contracts. The current permission model remains intact, and any helper extraction must preserve the existing routing behavior.

**Tech Stack:** Umi Max, React, TypeScript, Ant Design, `@ant-design/pro-components`.

---

## Context

The repository already uses Umi Max with Pro components, but the shell still behaves like a custom Ant Design Pro starter rather than a Pro V6-style application. The current route table is split between `config/routes.ts` and the root `routes/site.ts`, and the top navigation performs module switching based on the first path segment. This phase keeps the current route paths intact and instead focuses on making the shell code easier to reason about and more consistent with Pro V6 conventions.

This phase is intentionally narrow:

- Keep existing business pages and backend APIs untouched.
- Keep the login, account, permission, and module-fetch flows intact.
- Keep all current route paths unchanged.
- Improve the shell-level layout and navigation behavior without introducing breaking changes.

## Scope

### In scope

- Extract or simplify shell navigation logic so the active module still resolves to the first accessible route.
- Keep the top navigation, footer, and user dropdown aligned with the current layout model.
- Preserve the current route list and page component references.
- Keep any helper extraction behaviorally identical to the existing route selection logic.

### Out of scope

- Refactoring business pages under `src/pages/`.
- Changing backend contracts or API payloads.
- Reworking the login UI.
- Replacing the access model or permission API.
- Renaming any route paths during this phase.
- Moving the project to a different framework or component library.

## Proposed Shell Cleanup

The shell currently works, but the navigation and bootstrap logic is split across multiple files and is slightly harder to follow than a Pro V6-style layout flow. Phase 1 will keep route paths unchanged and focus on:

- preserving the current route-to-page mapping
- keeping module switching behavior stable
- reducing duplication in shell navigation logic
- making the login and layout entry points easier to maintain

No path rename or redirect is part of this phase.

## File-Level Design

### `routes/site.ts`

This file remains the primary business route definition. It should only be adjusted if a shell helper or ordering fix requires it, and any such change must preserve the current paths and component mappings.

### `config/routes.ts`

This file currently imports `routes/site` and appends the 404 route. It should remain functionally equivalent, with only minimal ordering changes if needed to preserve the existing routing behavior.

### `src/components/Basic/Navigation/index.tsx`

The header navigation computes the first accessible route from the configured route table. It will be simplified so that route lookup is isolated from rendering, while still returning the same path values it does today.

### `src/utils/route.ts`

A small helper may be added here to encapsulate route selection logic used by the header navigation. If introduced, it must be a pure function and must not alter the returned path set.

### `src/app.tsx`

This file currently owns shell bootstrap, permission lookup, and initial state setup. It will be reviewed for opportunities to reduce nested branching and make the login/forbidden flow easier to follow, while keeping the same outcomes.

### `src/utils/Constants.ts`

If shared shell constants or login/forbidden destinations need cleanup, they will be updated here. Otherwise this file should remain unchanged.

## Behavior Details

### Route matching

The current route mapping must still participate in the existing permission check:

- the module code still comes from `initialState.module`
- the current module permissions still come from `doBasicPermissions`
- the route is considered valid only when its permission key is present in the permission map

### Menu and navigation selection

The header menu should keep using module keys from `initialState.modules`, and when it resolves the first page for a module, it should behave exactly as it does today. If a helper is extracted, it must return the same route as the current inline logic.

## Error Handling

- If the user lacks permission for a route, the current 403 behavior should remain unchanged.
- If no accessible route exists for the active module, the existing forbidden fallback should remain unchanged.

## Testing Strategy

The phase should be verified with focused shell checks rather than broad business-page changes.

### Manual verification

- Start the app and sign in.
- Open the existing route paths and confirm they still render the same pages.
- Switch modules from the header and confirm the first accessible route still opens.
- Confirm the 403 and login flows behave exactly as before.

### Automated checks

If the repository already has route or layout tests, add or update the smallest possible test coverage around:

- the route table resolving the existing module path
- the header navigation returning the first accessible route for the active module

## Acceptance Criteria

- The existing route paths remain unchanged.
- Business page components are unchanged.
- Backend API calls are unchanged.
- The shell still opens the correct first page after module switching.
- The user can review the result before any later route standardization is considered.

## Open Decision

After this phase is implemented, the next user confirmation point is whether any route paths should be standardized or left in their current form.
