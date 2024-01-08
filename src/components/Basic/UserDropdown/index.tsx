import React, {useState} from "react";
import {history, useModel} from "umi";
import {Dropdown, Modal, notification, Spin} from "antd";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";
import Profile from "./Profile";
import {MenuInfo} from "rc-menu/lib/interface";
import {doBasicLogout} from "@/services/basic";
import Constants from "@/utils/Constants";
import {stringify} from "querystring";

export default function UserDropdown() {

  const {initialState, setInitialState} = useModel('@@initialState');
  
  if (!initialState || !initialState.account) {
    return (<Spin size='small'/>)
  }

  const [open, setOpen] = useState<COMBasicUserDropdown.Open>({});


  const toLogout = async () => {

    doBasicLogout()
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          setInitialState(s => ({
            ...s,
            account: undefined,
            key: undefined,
            modules: undefined,
            permissions: undefined
          }));

          localStorage.clear();

          if (location.pathname !== Constants.Login) {
            history.replace({
              pathname: '/login',
              search: stringify({
                redirect: location.pathname,
              }),
            });
          }
        }
      })
  };

  const onProfile = () => {
    setOpen({...open, profile: true})
  }

  const onCancel = () => {
    setOpen({})
  }

  const onLogout = () => {

    Modal.confirm({
      title: '退出登陆',
      content: '确定要退出该账号吗？',
      centered: true,
      onOk: toLogout,
    });
  }

  const onMenu = (item: MenuInfo) => {
    if (item.key == 'profile') {
      onProfile()
    } else if (item.key == 'logout') {
      onLogout();
    }
  }

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: 'profile',
              icon: <UserOutlined/>,
              label: '个人中心',
            },
            {
              type: 'divider' as const,
            },
            {
              key: 'logout',
              icon: <LogoutOutlined/>,
              label: '退出登录',
            },
          ],
          onClick: onMenu,
        }}
      >
        <span>{initialState?.account?.nickname}</span>
      </Dropdown>
      <Profile open={open.profile} onClose={onCancel}/>
    </>
  )
}
