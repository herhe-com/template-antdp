import {useModel} from "umi";
import {Divider, Form, Input, Modal, notification, Space} from "antd";
import Pattern from "@/utils/Pattern";
import React, {useEffect, useState} from "react";
import {doUpdate} from "./service";
import Constants from "@/utils/Constants";

export default function Profile(props: COMBasicProfile.Props) {

  const {initialState, setInitialState} = useModel('@@initialState')

  const [former] = Form.useForm<COMBasicProfile.Former>();

  const [change, setChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = () => {
    setChange(true);
  }

  const toUpdate = (params: any) => {

    setLoading(true);

    doUpdate(params)
      .then(response => {

        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '修改成功'});

          setInitialState({
            ...initialState,
            account: {
              ...initialState?.account,
              mobile: params.mobile,
              email: params.email,
            },
          })
        }
      })
      .finally(() => {

        setLoading(false)
      });
  };

  const onSubmit = (values: COMBasicProfile.Former) => {

    const params: APISiteAdmin.Editor = {
      nickname: values.nickname,
      mobile: values.mobile,
      email: values.email,
      password: values.password,
    };

    toUpdate(params);
  };

  useEffect(() => {

    if (props.open) {

      setChange(false);

      former.setFieldsValue({
        username: initialState?.account?.username,
        nickname: initialState?.account?.nickname,
        mobile: initialState?.account?.mobile,
        email: initialState?.account?.email,
        password: undefined,
      })
    }

  }, [props.open, initialState?.account])

  return (
    <Modal
      title='个人中心'
      centered
      open={props.open}
      onCancel={props.onClose}
      maskClosable={false}
      confirmLoading={loading}
      onOk={former.submit}
      footer={change ? undefined : null}
    >
      <Divider/>
      <Form form={former} onFinish={onSubmit} onValuesChange={onChange}>
        <Form.Item label="账号" name="username">
          <Input disabled/>
        </Form.Item>
        <Form.Item label="昵称" name="nickname">
          <Input disabled/>
        </Form.Item>
        <Form.Item label='其他'>
          <Space.Compact block>
            <Form.Item label="手机号" name="mobile" rules={[{max: 20}]} noStyle>
              <Input placeholder='手机号'/>
            </Form.Item>
            <Form.Item label="邮箱" name="email" rules={[{max: 64}, {type: "email"}]} noStyle>
              <Input placeholder='邮箱'/>
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{pattern: RegExp(Pattern.ADMIN_PASSWORD)}]}
        >
          <Input.Password placeholder="留空不修改"/>
        </Form.Item>
      </Form>
    </Modal>
  )
}
