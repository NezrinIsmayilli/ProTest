/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Input, Button, Modal, Form } from 'antd';
import moment from 'moment';
import { ProFormItem, ProDatePicker, AddButton } from 'components/Lib';
import { setSelectedProductionExpense } from 'store/actions/sales-operation';
import { requiredRule, minLengthRule } from 'utils/rules';
import { dateFormat } from 'utils';
import styles from '../../../styles.module.scss';

const math = require('exact-math');

const EditModal = props => {
  const {
    form,
    isVisible,
    setIsVisible,
    row,
    selectedProductionExpense,
    setSelectedProductionExpense,
    selectedItemForUpdate,
    currencyCode,
    changeCost,
  } = props;

  const {
    getFieldDecorator,
    getFieldValue,
    getFieldError,
    validateFields,
    setFieldsValue,
  } = form;

  const dispatch = useDispatch();

  const addCatalog = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { date, amount, name } = values;
        const newSelectedProductionExpense = selectedProductionExpense.map(
          (item, index) => {
            if (index === selectedItemForUpdate) {
              return {
                ...item,
                name,
                date: date.format(dateFormat),
                price: Number(amount),
              };
            }
            return item;
          }
        );
        dispatch(
          setSelectedProductionExpense({ newSelectedProductionExpense })
        );
        setIsVisible(false);
        changeCost({
          price: math.sub(
            Number(amount),
            selectedProductionExpense.find(
              (item, index) => index === selectedItemForUpdate
            ).price
          ),
        });
      }
    });
  };
  const handleAmount = event => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
    if (re.test(event.target.value)) return event.target.value;

    if (event.target.value === '') return null;
    return getFieldValue('amount');
  };
  useEffect(() => {
    setFieldsValue({
      date: moment(row?.date, 'DD-MM-YYYY'),
      name: row?.name,
      amount: Number(row?.price),
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
            })(<ProDatePicker />)}
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
            label={`Məbləğ ${currencyCode}`}
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

const mapStateToProps = state => ({
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
});

export default connect(
  mapStateToProps,
  {
    setSelectedProductionExpense,
  }
)(Form.create({ name: 'EditForm' })(EditModal));
