import {describe, expect, it} from '@jest/globals';
import {buildPermissionMap, resolveModuleFromPathname} from '../../src/utils/bootstrap';

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
        {code: 'site'},
        {code: 'basic'},
      ]),
    ).toBe('site');
  });
});
