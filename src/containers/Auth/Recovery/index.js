/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendRecoveryReguest, resetUserInfo } from 'store/actions/auth';

// utils
import { messages, apiErrorMessageResolver } from 'utils';

// components
import { Button, Input, Form } from 'antd';
import { ProFormItem } from 'components/Lib';
import { FormLayout } from '../#shared';

// styles
import styles from '../styles.module.scss';

const { emailFormat, requiredText } = messages;

// form validation rules
const requiredRule = {
  required: true,
  message: requiredText,
};

const emailRule = {
  type: 'email',
  message: emailFormat,
};

function Recovery(props) {
  const { sendRecoveryReguest, resetUserInfo, isLoading, form } = props;

  const {
    getFieldDecorator,
    getFieldError,
    getFieldValue,
    validateFields,
    setFields,
  } = form;

  const [isSuccess, setSuccess] = useState(false);

  useEffect(() => () => resetUserInfo(), []);

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        sendRecoveryReguest(values, successCallback, failureCallback);
      }
    });
  }

  function successCallback() {
    setSuccess(true);
  }

  function setError(message) {
    setFields({
      email: {
        value: getFieldValue('email'),
        errors: [Error(message)],
      },
    });
  }

  function failureCallback(data) {
    if (data?.error?.response?.status === 404) {
      setError('Bu e-poçt ünvanı qeydiyyatdan keçməyib.');
    } else {
      setError(apiErrorMessageResolver(data?.error));
    }
  }

  return (
    <FormLayout>
      <h1 className={styles.header}>Şi̇frəni̇n bərpası</h1>

      <Form onSubmit={handleSubmit} hideRequiredMark noValidate>
        {/* email */}
        {isSuccess ? (
          <p style={{ color: '#FF716A', fontSize: '14px' }}>
            Şifrə bərpası üçün məktub qeyd edilən email ünvanına göndərildi.
          </p>
        ) : (
          <>
            <ProFormItem
              label="E-poçt ünvanı"
              help={getFieldError('email')?.[0]}
            >
              {getFieldDecorator('email', {
                rules: [requiredRule, emailRule],
              })(<Input placeholder="email@site.com" size="large" autoFocus />)}
            </ProFormItem>

            <Button
              htmlType="submit"
              className={styles.submitButton}
              style={{ margin: '12px 0' }}
              type="primary"
              loading={isLoading}
              disabled={isSuccess}
              block
              size="large"
            >
              {isSuccess ? 'Göndərildi' : 'Təsdiq et'}
            </Button>
          </>
        )}

        <Link to="/registration">
          <Button className={styles.grayColor} size="large" block>
            Qeydiyyatdan keçin
          </Button>
        </Link>

        <Link to="/login">
          <Button className={styles.grayColor} size="large" block>
            Daxil olun
          </Button>
        </Link>
      </Form>
    </FormLayout>
  );
}

const WrappedRecovery = Form.create({ name: 'recoveryForm' })(Recovery);

const mapStateToProps = state => ({
  isLoading: !!state.loadings.auth,
});

export default connect(
  mapStateToProps,
  { sendRecoveryReguest, resetUserInfo }
)(WrappedRecovery);
