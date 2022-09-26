/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
// import { loadSalesBuys } from 'Routes';
import { login, resetUserInfo } from 'store/actions/auth';

// utils
import { resetAbilities } from 'config/ability';
import { messages } from 'utils';
import { clearUserData } from 'utils/clearUserData';

// components
import { Button, Input, Form } from 'antd';
import { ProFormItem } from 'components/Lib';
import { FormLayout } from '../#shared';

// styles
import styles from '../styles.module.scss';

const { emailFormat, requiredText } = messages;

export const resetUserDetails = () => {
  clearUserData({ reload: false });
  // loadSalesBuys();
  resetAbilities();
};

// form validation rules
const requiredRule = {
  required: true,
  message: requiredText,
};

const emailRule = {
  type: 'email',
  message: emailFormat,
};

function Login(props) {
  const { login, resetUserInfo, isLoading, apiError, form } = props;
  const { getFieldDecorator, getFieldError, validateFields } = form;

  useEffect(() => () => resetUserInfo(), []);

  useLayoutEffect(() => {
    resetUserDetails();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        login({ ...values });
      }
    });
  }

  const { t } = useTranslation();
  return (
    <FormLayout>
      <h1 className={styles.header}>{t('loginIn')}</h1>
      <p className={styles.apiError} style={{ opacity: apiError ? 1 : 0 }}>
        {apiError || 'Email və ya şifrə səhv daxil edilib.'}
      </p>

      <Form onSubmit={handleSubmit} noValidate>
        {/* email */}
        <ProFormItem
          label="E-poçt ünvanı"
          help={getFieldError('email')?.[0]}
          style={{ marginBottom: '30px' }}
        >
          {getFieldDecorator('email', {
            rules: [requiredRule, emailRule],
          })(<Input placeholder="email@site.com" size="large" autoFocus />)}
        </ProFormItem>

        {/* password */}
        <ProFormItem label="Şifrə" help={getFieldError('password')?.[0]}>
          {getFieldDecorator('password', {
            rules: [requiredRule],
          })(<Input.Password size="large" />)}
        </ProFormItem>

        <Link className={styles.forget} to="/recovery">
          Şi̇frəni̇ unutmusunuz?
        </Link>

        {/* action buttons */}
        <Button
          htmlType="submit"
          className={styles.submitButton}
          type="primary"
          loading={isLoading}
          block
          size="large"
        >
          Daxil ol
        </Button>

        <Link to="/registration">
          <Button className={styles.grayColor} size="large" ghost block>
            Qeydiyyatdan keçin
          </Button>
        </Link>
      </Form>
    </FormLayout>
  );
}

const WrappedLogin = Form.create({ name: 'loginForm' })(Login);

const mapStateToProps = state => ({
  data: state.authReducer.data,
  isLoading: !!state.loadings.auth,
  apiError: state.authReducer.apiError,
});

export default connect(
  mapStateToProps,
  { login, resetUserInfo }
)(WrappedLogin);
