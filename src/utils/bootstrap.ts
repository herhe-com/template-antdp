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
