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
