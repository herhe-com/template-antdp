import {describe, expect, it} from '@jest/globals';
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
