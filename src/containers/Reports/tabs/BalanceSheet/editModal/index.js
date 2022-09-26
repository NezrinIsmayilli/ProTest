/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Modal, Form } from 'antd';
import moment from 'moment';
import { ProFormItem, ProDatePicker, AddButton } from 'components/Lib';
import {
  editBalance,
  fetchBalance,
  getBalanceSheet,
} from 'store/actions/reports/balance-sheet';
import { requiredRule, minLengthRule } from 'utils/rules';
import { dateFormat } from 'utils';
import styles from '../styles.module.scss';

const EditModal = props => {
  const {
    form,
    isVisible,
    setIsVisible,
    editBalance,
    fetchBalance,
    selectedItemForUpdate,
    row,
    type,
    date,
  } = props;

  const {
    getFieldDecorator,
    getFieldValue,
    getFieldError,
    validateFields,
    setFieldsValue,
    resetFields,
    setFields,
  } = form;

  const onSuccessCallback = () => {
    setIsVisible(false);
    fetchBalance({ filters: { types: [type], date } });
  };
  const addCatalog = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { date, amount, name } = values;
        const newBalance = {
          name,
          amount,
          date: date.format(dateFormat),
          type,
        };
        editBalance(selectedItemForUpdate, newBalance, onSuccessCallback);
      }
    });
  };
  const handleAmount = event => {
    const re = /^-?\d+\.?\d*$/;
    if (event.target.value === '-') {
      return event.target.value;
    }
    if (re.test(event.target.value)) return event.target.value;

    if (event.target.value === '') return null;
    return getFieldValue('amount');
  };
  useEffect(() => {
    setFieldsValue({
      date: moment(row?.date, 'DD-MM-YYYY'),
      name: row?.name,
      amount: Number(row?.amount),
    });
  }, [isVisible]);
  return (
    <Modal
      closable={false}
      confirmLoading
      footer={null}
      className={styles.customModal}
      style={{ marginTop: '100px' }}
      onCancel={() => setIsVisible(false)}
      visible={isVisible}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>

      <div className={styles.addCatalogModal}>
        <h2>Düzəliş et</h2>

        <Form onSubmit={event => addCatalog(event)}>
          <ProFormItem
            label="Tarix"
            customStyle={styles.formItem}
            help={getFieldError('date')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('date', {
              rules: [requiredRule],
            })(
              <ProDatePicker
                disabledDate={current =>
                  current && current > moment(date, 'DD-MM-YYYY')
                }
              />
            )}
          </ProFormItem>
          <ProFormItem
            label="Adı"
            customStyle={styles.formItem}
            help={getFieldError('name')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('name', {
              rules: [requiredRule, minLengthRule],
            })(<Input size="large" placeholder="Yazın" />)}
          </ProFormItem>
          <ProFormItem
            label="Dəyəri"
            customStyle={styles.formItem}
            help={getFieldError('amount')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('amount', {
              getValueFromEvent: event => handleAmount(event),
              rules: [requiredRule],
            })(<Input size="large" placeholder="Yazın" />)}
          </ProFormItem>
          <AddButton htmlType="submit" label="Təsdiq et" />
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {
    editBalance,
    fetchBalance,
    getBalanceSheet,
  }
)(Form.create({ name: 'EditForm' })(EditModal));
