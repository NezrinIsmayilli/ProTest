import React, { useState } from 'react';
import { connect } from 'react-redux';
// components
import { Button, Modal, Input, Form } from 'antd';
import { ProFormItem } from 'components/Lib';
import { operationsDelete } from 'store/actions/operationsDelete';
import { messages } from 'utils';
import styles from './index.module.scss';

const { requiredText } = messages;

function Login(props) {
  const {
    form,
    operationsDelete,
    visible,
    toggleVisible,
    setPasswordModal,
    setIsOpenWarningModal,
    data,
    setData,
  } = props;
  const { getFieldDecorator, getFieldError, validateFields } = form;

  const [apiErrors, setApiErrors] = useState(undefined);
  // form validation rules
  const requiredRule = {
    required: true,
    message: requiredText,
  };

  console.log(apiErrors);
  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const { password } = values;

        const loginData = {
          password: password || null,
        };

        operationsDelete(
          loginData,

          res => {
            setApiErrors(undefined);

            setTimeout(
              () => setData(res),

              4500
            );
            toggleVisible(false);
            setPasswordModal(true);
          },
          res => {
            setApiErrors(res.error.response.data.error.message);
            toggleVisible(true);
            setPasswordModal(false);
          }
        );
      }
    });
  }

  const backFn = () => {
    setIsOpenWarningModal(true);
    toggleVisible(false);
    setApiErrors(undefined);
  };
  return (
    <Modal
      visible={visible}
      closable={false}
      centered
      width={500}
      footer={null}
      className={styles.customModal}
      destroyOnClose
    >
      <div className={styles.MoreDetails}>
        <div className={styles.formContent}>
          <p>
            Silinmə əməliyyatını icra etmək üçün şifrəni daxil edərək
            təsdiqləyin.
          </p>
          <p className={styles.apiError} style={{ opacity: apiErrors ? 1 : 0 }}>
            {apiErrors === 'Səhv şifrə.' ? 'Daxil edilən şifrə yanlışdır.' : ''}
          </p>
          <Form onSubmit={handleSubmit} noValidate>
            {/* password */}
            <ProFormItem label="Şifrə" help={getFieldError('password')?.[0]}>
              {getFieldDecorator('password', {
                rules: [requiredRule],
              })(<Input.Password size="large" />)}
            </ProFormItem>

            {/* action buttons */}

            <div className={styles.modalButtons}>
              <Button
                type="button"
                className={styles.deleteButton}
                htmlType="submit"
                // type="primary"
                block
                size="large"
              >
                <span>Davam</span>
              </Button>

              <Button
                type="button"
                className={styles.cancelButton}
                onClick={backFn}
              >
                <span>Geri</span>
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
}

const WrappedLogin = Form.create({ name: 'loginForm' })(Login);

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  { operationsDelete }
)(WrappedLogin);
