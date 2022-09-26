/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Input, Button, Modal, Form, Row, Col } from 'antd';
import moment from 'moment';
import {
  ProFormItem,
  ProDatePicker,
  AddButton,
  ProInput,
  ProSelect,
} from 'components/Lib';
import { setSelectedProductionMaterial } from 'store/actions/sales-operation';
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
    selectedProductionMaterial,
    setSelectedProductionMaterial,
    selectedItemForUpdate,
    measurements,
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
        const { date, amount, name, quantity, measurement } = values;
        const newSelectedProductionMaterial = selectedProductionMaterial.map(
          (item, index) => {
            if (index === selectedItemForUpdate) {
              return {
                ...item,
                name,
                date: date.format(dateFormat),
                price: Number(amount),
                quantity,
                unitOfMeasurementId: measurement,
              };
            }
            return item;
          }
        );
        dispatch(
          setSelectedProductionMaterial({ newSelectedProductionMaterial })
        );
        setIsVisible(false);
        changeCost({
          price: math.sub(
            math.mul(Number(amount), Number(quantity) || 0),
            math.mul(
              Number(
                selectedProductionMaterial.find(
                  (item, index) => index === selectedItemForUpdate
                ).price
              ),
              Number(
                selectedProductionMaterial.find(
                  (item, index) => index === selectedItemForUpdate
                ).quantity
              ) || 0
            )
          ),
        });
      }
    });
  };
  const handleAmount = (event, field) => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
    if (re.test(event.target.value)) return event.target.value;

    if (event.target.value === '') return null;
    return getFieldValue(field);
  };
  useEffect(() => {
    setFieldsValue({
      date: moment(row?.date, 'DD-MM-YYYY'),
      name: row?.name,
      amount: Number(row?.price),
      quantity: Number(row?.quantity),
      measurement: row?.unitOfMeasurementId,
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
          <Row>
            <Col span={14}>
              <ProFormItem
                label="Miqdar"
                help={getFieldError('quantity')?.[0]}
                style={{ marginRight: '10px' }}
              >
                {getFieldDecorator('quantity', {
                  getValueFromEvent: event => handleAmount(event, 'quantity'),
                  rules: [requiredRule],
                })(
                  <ProInput
                  // disabled={isEditDisabled}
                  />
                )}
              </ProFormItem>{' '}
            </Col>
            <Col span={10}>
              <ProFormItem
                label="Ölçü vahidi"
                help={getFieldError('measurement')?.[0]}
              >
                {getFieldDecorator('measurement', {
                  rules: [requiredRule],
                })(<ProSelect data={measurements} />)}
              </ProFormItem>
            </Col>
          </Row>

          <ProFormItem
            label={`Məbləğ ${currencyCode}`}
            customStyle={styles.formItem}
            help={getFieldError('amount')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('amount', {
              getValueFromEvent: event => handleAmount(event, 'amount'),
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
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
});

export default connect(
  mapStateToProps,
  {
    setSelectedProductionMaterial,
  }
)(Form.create({ name: 'EditForm' })(EditModal));
