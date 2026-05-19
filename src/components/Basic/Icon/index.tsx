import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import Icon from '@ant-design/icons';

import { SunSvg, MoonSvg, DesktopSvg } from './svg';

export const SunIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SunSvg} {...props} />
);

export const MoonIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MoonSvg} {...props} />
);

export const DesktopIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DesktopSvg} {...props} />
);
