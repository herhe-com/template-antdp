import {useEffect, useState} from "react";
import {Alert, Button, Col, Divider, Form, Input, Row, Space, Tag, Typography} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {useModel, history} from "@umijs/max";
import Constants from '@/utils/Constants';
import Pattern from "@/utils/Pattern";
import leftLogin from '@/static/images/left-login.png';
import {doBasicModules, doBasicPermissions} from "@/services/basic";
import {doLogin} from "./service";

import styles from './index.less'

const Login = () => {

  const [former] = Form.useForm();
  const [loading, setLoading] = useState(false)
  const {initialState, setInitialState} = useModel('@@initialState');
  const [result, setResult] = useState<APIBasicLogin.Result>({});

  const toAccount = async () => {

    const account = await initialState?.toAccount?.();

    let module = '';
    let modules: any[] = [];
    let permissions: Record<string, string> = {}

    if (!account) {
      history.push(Constants.Forbidden)
    } else {

      const resOfModules = await doBasicModules();

      if (resOfModules.code != Constants.Success || resOfModules.data.length <= 0) {
        history.push(Constants.Forbidden)
      } else {

        module = resOfModules.data[0].code;
        modules = resOfModules.data;

        const resOfPermissions = await doBasicPermissions(module);

        if (resOfPermissions.code != Constants.Success || resOfPermissions.data.length <= 0) {
          history.push(Constants.Forbidden)
        } else {
          resOfPermissions?.data?.forEach(item => permissions[item] = item);
        }
      }
    }

    setInitialState(s => ({...s, account, module, modules, permissions}))
  }

  const toLogin = (data: APIBasicLogin.Request) => {

    localStorage.clear();

    setLoading(true)

    doLogin(data)
      .then(async response => {

        if (response.code != Constants.Success) {
          setResult({result: "error", message: response.message})
        } else {
          setResult({result: "success", message: "登陆成功，等待跳转"})

          localStorage.setItem(Constants.Authorization, response.data.token as string)

          await toAccount()
        }

      })
      .finally(() => setLoading(false))
  }

  const onSubmit = (values: APIBasicLogin.Former) => {

    const data: APIBasicLogin.Request = {
      username: values.username,
      password: values.password,
    }

    toLogin(data)
  }

  useEffect(() => {

    if (initialState?.account) {

      // const { query } = history.location;
      //
      // const { redirect } = query as {
      //   redirect: string;
      // };

      history.push("/")
    }

  }, [initialState?.account])

  return (
    <div className={styles.container}>
      <div className={styles.gridGlow}/>
      <Row justify="center" className={styles.stage}>
        <Col md={20} lg={18} xl={17} className={styles.box}>
          <Row className={styles.login}>
            <Col sm={0} md={0} lg={13} className={styles.left}>
              <div className={styles.leftPanel}>
                <div className={styles.leftBadge}>
                  <Tag color="processing">Pro V6 Shell</Tag>
                  <span>Admin Platform</span>
                </div>
                <Typography.Title level={2} className={styles.heroTitle}>
                  让后台入口更像一个完整的产品界面
                </Typography.Title>
                <Typography.Paragraph className={styles.heroCopy}>
                  统一的壳层、清晰的导航和稳定的权限模型，把常见管理后台该有的秩序感先搭起来。
                </Typography.Paragraph>
                <div className={styles.heroImageWrap}>
                  <img src={leftLogin} className={styles.image} alt=""/>
                </div>
                <div className={styles.heroStats}>
                  <div>
                    <strong>Shell</strong>
                    <span>布局已整理</span>
                  </div>
                  <Divider type="vertical" className={styles.heroDivider}/>
                  <div>
                    <strong>Access</strong>
                    <span>权限链路稳定</span>
                  </div>
                  <Divider type="vertical" className={styles.heroDivider}/>
                  <div>
                    <strong>Routes</strong>
                    <span>路径保持兼容</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={11} md={24} sm={24} className={styles.right}>
              <div className={styles.panel}>
                <Space direction="vertical" size={8} className={styles.headerBlock}>
                  <Tag className={styles.kicker}>后台管理系统</Tag>
                  <Typography.Title level={2} className={styles.title}>
                    登录
                  </Typography.Title>
                  <Typography.Paragraph className={styles.summary}>
                    综合后台管理系统
                  </Typography.Paragraph>
                </Space>
                {result.result ? (
                  <Alert className={styles.tips} type={result.result} message={result.message} showIcon/>
                ) : null}
                <Form form={former} onFinish={onSubmit} labelCol={{span: 0}} className={styles.form}>
                  <Form.Item
                    name="username"
                    validateFirst
                    rules={[
                      {required: true, message: '请输入您的用户名！'},
                      {
                        pattern: new RegExp(Pattern.ADMIN_USERNAME),
                        message: '用户名输入错误！',
                      },
                    ]}
                  >
                    <Input size="large" prefix={<UserOutlined/>} placeholder="Username" autoComplete="username"/>
                  </Form.Item>
                  <Form.Item
                    name="password"
                    validateFirst
                    rules={[
                      {required: true, message: '请输入您的登录密码！'},
                      {
                        pattern: new RegExp(Pattern.ADMIN_PASSWORD),
                        message: '密码输入错误！',
                      },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined/>}
                      placeholder="Password"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading} size="large" className={styles.submit}>
                    立即登录
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Login;
