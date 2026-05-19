import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Input, Row, Space, Tag, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useModel, history } from '@umijs/max';
import Constants from '@/utils/Constants';
import Pattern from '@/utils/Pattern';
import leftLogin from '@/static/images/left-login.png';
import { doBasicModules, doBasicPermissions } from '@/services/basic';
import { doLogin } from './service';

import styles from './index.less';

const Login = () => {
  const [former] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [result, setResult] = useState<APIBasicLogin.Result>({});

  const toAccount = async () => {
    const account = await initialState?.toAccount?.();

    let module = '';
    let modules: any[] = [];
    let permissions: Record<string, string> = {};

    if (!account) {
      history.push(Constants.Forbidden);
    } else {
      const resOfModules = await doBasicModules();

      if (resOfModules.code !== Constants.Success || resOfModules.data.length <= 0) {
        history.push(Constants.Forbidden);
      } else {
        module = resOfModules.data[0].code;
        modules = resOfModules.data;

        const resOfPermissions = await doBasicPermissions(module);

        if (resOfPermissions.code !== Constants.Success || resOfPermissions.data.length <= 0) {
          history.push(Constants.Forbidden);
        } else {
          resOfPermissions?.data?.forEach((item) => (permissions[item] = item));
        }
      }
    }

    setInitialState((s) => ({ ...s, account, module, modules, permissions }));
  };

  const toLogin = (data: APIBasicLogin.Request) => {
    localStorage.removeItem(Constants.Authorization);

    setLoading(true);

    doLogin(data)
      .then(async (response) => {
        if (response.code !== Constants.Success) {
          setResult({ result: 'error', message: response.message });
        } else {
          setResult({ result: 'success', message: '登陆成功，等待跳转' });

          localStorage.setItem(Constants.Authorization, response.data.token as string);

          await toAccount();
        }
      })
      .finally(() => setLoading(false));
  };

  const onSubmit = (values: APIBasicLogin.Former) => {
    const data: APIBasicLogin.Request = {
      username: values.username,
      password: values.password,
    };

    toLogin(data);
  };

  useEffect(() => {
    if (initialState?.account) {
      // const { query } = history.location;
      //
      // const { redirect } = query as {
      //   redirect: string;
      // };

      history.push('/');
    }
  }, [initialState?.account]);

  return (
    <div className={styles.container}>
      <div className={styles.gridGlow} />
      <Row justify="center" className={styles.stage}>
        <Col md={10} lg={10} xl={12} xxl={8} className={styles.box}>
          <Row className={styles.login}>
            <Col sm={0} md={0} lg={12} className={styles.left}>
              <img src={leftLogin} className={styles.image} alt="" />
            </Col>
            <Col lg={12} md={24} sm={24} className={styles.right}>
              <div className={styles.panel}>
                <Space orientation="vertical" size={8} className={styles.headerBlock}>
                  <Tag className={styles.kicker}>后台管理系统</Tag>
                  <Typography.Title level={2} className={styles.title}>
                    欢迎回来
                  </Typography.Title>
                  <Typography.Paragraph className={styles.summary}>
                    请输入账号信息
                  </Typography.Paragraph>
                </Space>
                {result.result ? (
                  <Alert
                    className={styles.tips}
                    type={result.result}
                    title={result.message}
                    showIcon
                  />
                ) : null}
                <Form
                  form={former}
                  onFinish={onSubmit}
                  labelCol={{ span: 0 }}
                  className={styles.form}
                >
                  <Form.Item
                    name="username"
                    validateFirst
                    rules={[
                      { required: true, message: '请输入您的用户名！' },
                      {
                        pattern: new RegExp(Pattern.ADMIN_USERNAME),
                        message: '用户名输入错误！',
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入用户名"
                      autoComplete="username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    validateFirst
                    rules={[
                      { required: true, message: '请输入您的登录密码！' },
                      {
                        pattern: new RegExp(Pattern.ADMIN_PASSWORD),
                        message: '密码输入错误！',
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    立即登录
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
