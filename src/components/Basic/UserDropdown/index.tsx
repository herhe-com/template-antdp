import React, { useState } from 'react';
import { history, useModel } from 'umi';
import { Dropdown, Modal, notification, Space, Typography } from 'antd';
import { CheckOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Profile from './Profile';
import { MenuInfo } from 'rc-menu/lib/interface';
import { doBasicLogout } from '@/services/basic';
import Constants from '@/utils/Constants';
import { stringify } from 'querystring';

import styles from './index.less';
import { DesktopIcon, MoonIcon, SunIcon } from '../Icon';

const cacheTheme = localStorage.getItem('theme');

export default function UserDropdown() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [open, setOpen] = useState<COMBasicUserDropdown.Open>({});
  const [mode, setMode] = useState(cacheTheme);

  const onTheme = (item: MenuInfo) => {
    if (item.key === 'realDark' || item.key === 'light') {
      // @ts-ignore
      setInitialState((s) => ({ ...s, theme: item.key }));
      localStorage.setItem('theme', item.key);
    } else {
      let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setInitialState((s) => ({ ...s, theme: isDarkMode ? 'realDark' : 'light' }));
      localStorage.removeItem('theme');
    }

    setMode(item.key);
  };

  const toLogout = async () => {
    doBasicLogout().then((response: APIResponse.Response<any>) => {
      if (response.code !== Constants.Success) {
        notification.error({ message: response.message });
      } else {
        setInitialState((s) => ({
          ...s,
          account: undefined,
          key: undefined,
          modules: undefined,
          permissions: undefined,
        }));

        localStorage.removeItem(Constants.Authorization);

        if (history.location.pathname !== Constants.Login) {
          history.replace({
            pathname: '/login',
            search: stringify({
              redirect: history.location.pathname,
            }),
          });
        }
      }
    });
  };

  const onProfile = () => {
    setOpen({ ...open, profile: true });
  };

  const onCancel = () => {
    setOpen({});
  };

  const onLogout = () => {
    Modal.confirm({
      title: '退出登陆',
      content: '确定要退出该账号吗？',
      centered: true,
      onOk: toLogout,
    });
  };

  const onMenu = (item: MenuInfo) => {
    if (item.key === 'profile') {
      onProfile();
    } else if (item.key === 'logout') {
      onLogout();
    }
  };

  const Theme = (theme?: string) => {
    let icon = <DesktopIcon />;

    if (theme === 'light') {
      icon = <SunIcon />;
    } else if (theme === 'realDark') {
      icon = <MoonIcon />;
    }

    return icon;
  };

  return (
    <Space size={[30, 0]} align="center">
      <Dropdown
        arrow
        menu={{
          items: [
            {
              key: 'system',
              icon: (
                <CheckOutlined
                  className={`${styles.icon_default} ${mode !== 'light' && mode !== 'realDark' && styles.icon_show}`}
                />
              ),
              label: '跟随系统',
            },
            {
              key: 'light',
              icon: (
                <CheckOutlined
                  className={`${styles.icon_default} ${mode === 'light' && styles.icon_show}`}
                />
              ),
              label: '亮色模式',
            },
            {
              key: 'realDark',
              icon: (
                <CheckOutlined
                  className={`${styles.icon_default} ${mode === 'realDark' && styles.icon_show}`}
                />
              ),
              label: '暗黑模式',
            },
          ],
          onClick: onTheme,
        }}
        placement="bottom"
      >
        <span className={styles.item}>{Theme(initialState?.theme)}</span>
      </Dropdown>
      {initialState?.account ? (
        <Dropdown
          arrow
          menu={{
            items: [
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: '个人中心',
              },
              {
                type: 'divider' as const,
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
              },
            ],
            onClick: onMenu,
          }}
        >
          <Typography.Text strong>{initialState?.account?.nickname}</Typography.Text>
        </Dropdown>
      ) : null}
      <Profile open={open.profile} onClose={onCancel} />
    </Space>
  );
}
