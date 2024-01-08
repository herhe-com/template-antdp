import {Settings as LayoutSettings} from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  siderWidth: number;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  siderWidth: 140,
  colorWeak: false,
  title: 'SaaS',
  pwa: false,
  iconfontUrl: '',
};

export default Settings;
