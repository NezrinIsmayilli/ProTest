import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
// components
import { Button, Input, Form, Modal } from 'antd';
import { ProFormItem } from 'components/Lib';
import { createLoginProjobs } from 'store/actions/auth';
import { messages } from 'utils';
import styles from './index.module.sass';

const { emailFormat, requiredText } = messages;

function Login(props) {
  const {
    createLoginProjobs,
    form,
    actionLoading,
    visible,
    toggleVisible,
  } = props;
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
            toggleVisible(false);
            setApiErrors(undefined);
          },
          res => {
            setApiErrors(res.error.response.data.error.message);
          }
        );
      }
    });
  }
  const closeModal = () => {
    toggleVisible(false);
    setApiErrors(undefined);
  };

  return (
    <Modal
      visible={visible}
      onCancel={closeModal}
      closable={false}
      centered
      footer={null}
      className={styles.customModal}
      destroyOnClose
      // maskClosable={false}
    >
      <Button className={styles.closeButton} size="large" onClick={closeModal}>
        <img
          id="warehouse"
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.formContent}>
        <h1 className={styles.header}>Giriş</h1>
        <p className={styles.apiError} style={{ opacity: apiErrors ? 1 : 0 }}>
          {apiErrors === 'Invalid credentials: not a company type.'
            ? 'Namizəd tipli hesablar daxil ola bilməz!'
            : 'Email və ya şifrə səhv daxil edilib.'}
        </p>
        <Form onSubmit={handleSubmit} noValidate>
          {/* email */}
          <ProFormItem label="E-poçt ünvanı" help={getFieldError('email')?.[0]}>
            {getFieldDecorator('email', {
              rules: [requiredRule, emailRule],
            })(<Input placeholder="email@site.com" size="large" autoFocus />)}
          </ProFormItem>

          {/* password */}
          <ProFormItem label="Şifrə" help={getFieldError('password')?.[0]}>
            {getFieldDecorator('password', {
              rules: [requiredRule],
            })(<Input.Password size="large" placeholder="Yazın" />)}
          </ProFormItem>

          {/* action buttons */}
          <Button
            htmlType="submit"
            loading={actionLoading}
            className={styles.submitButton}
            type="primary"
            block
            size="large"
          >
            Daxil ol
          </Button>
        </Form>
      </div>
    </Modal>
  );
}

const WrappedLogin = Form.create({ name: 'loginForm' })(Login);

const mapStateToProps = state => ({
  actionLoading: state.authReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  { createLoginProjobs }
)(WrappedLogin);
