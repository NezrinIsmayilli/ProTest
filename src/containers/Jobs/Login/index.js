import React, { useState } from 'react';
import { connect } from 'react-redux';
// components
import { Button, Input, Form, Spin } from 'antd';
import { ProFormItem } from 'components/Lib';
import { createLoginProjobs } from 'store/actions/auth';
import { messages } from 'utils';
import logo from 'assets/img/logo-red.svg';
import styles from './styles.module.scss';

const { emailFormat, requiredText } = messages;

function Login(props) {
  const { form, actionLoading, createLoginProjobs } = props;
  const { getFieldDecorator, getFieldError, validateFields } = form;

  const [apiErrors, setApiErrors] = useState(undefined);
  // form validation rules
  const requiredRule = {
    required: true,
    message: requiredText,
  };

  const emailRule = {
    type: 'email',
    message: emailFormat,
  };

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const { email, password } = values;

        const loginData = {
          email: email || null,
          password: password || null,
        };
        createLoginProjobs(
          loginData,
          () => {
            setApiErrors(undefined);
          },
          res => {
            setApiErrors(res.error.response.data.error.message);
          }
        );
      }
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
        <Spin spinning={actionLoading}>
          <div className={styles.loginContent}>
            <a
              href="https://projobs.az/"
              target="blank"
              className={styles.logo}
            >
              <img src={logo} alt="ProJobs" />
            </a>
            <div className={styles.formContent}>
              <h1 className={styles.header}>Giriş</h1>
              <p
                className={styles.apiError}
                style={{ opacity: apiErrors ? 1 : 0 }}
              >
                {apiErrors === 'Invalid credentials: not a company type.'
                  ? 'Namizəd tipli hesablar daxil ola bilməz!'
                  : 'Email və ya şifrə səhv daxil edilib.'}
              </p>
              <Form onSubmit={handleSubmit} noValidate>
                {/* email */}
                <ProFormItem
                  label="E-poçt ünvanı"
                  help={getFieldError('email')?.[0]}
                >
                  {getFieldDecorator('email', {
                    rules: [requiredRule, emailRule],
                  })(
                    <Input
                      placeholder="email@site.com"
                      size="large"
                      autoFocus
                    />
                  )}
                </ProFormItem>

                {/* password */}
                <ProFormItem
                  label="Şifrə"
                  help={getFieldError('password')?.[0]}
                >
                  {getFieldDecorator('password', {
                    rules: [requiredRule],
                  })(<Input.Password size="large" />)}
                </ProFormItem>

                {/* action buttons */}
                <Button
                  htmlType="submit"
                  className={styles.submitButton}
                  type="primary"
                  block
                  size="large"
                >
                  Daxil ol
                </Button>
              </Form>
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
}

const WrappedLogin = Form.create({ name: 'loginForm' })(Login);

const mapStateToProps = state => ({
  loginProJobsData: state.authReducer.loginProJobsData,
});

export default connect(
  mapStateToProps,
  { createLoginProjobs }
)(WrappedLogin);
