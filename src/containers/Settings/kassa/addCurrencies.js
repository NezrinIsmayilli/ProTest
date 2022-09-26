import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { requiredRule, numberRule } from 'utils/rules';
import { Button, Input, Form, Row, Col, InputNumber } from 'antd';
import { fullDateTimeWithSecond, defaultNumberFormat } from 'utils';
import moment from 'moment';
import {
  createCurrenciesRate,
  fetchGeneralCurrencies,
} from 'store/actions/settings/kassa';
import { ProFormItem, ProSelect, ProDatePicker } from 'components/Lib';
import styles from 'containers/Warehouse/styles.module.scss';

const AddCurrencies = props => {
  const {
    form,
    generalCurrencies,
    mainCurrency,
    createCurrenciesRate,
    fetchGeneralCurrencies,
    onCancel,
  } = props;
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
    resetFields,
  } = form;
  const componentRef = useRef();
  function disabledDate(current) {
    return current && current >= moment().endOf('day');
  }

  const handleCurrencyFormSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { currency, rate, startAt } = values;

        const currencyData = {
          currency: getFieldValue(`${generalCurrencies?.id}`) || null,
          rate: defaultNumberFormat(rate) || null,
          startsAt: startAt.format(fullDateTimeWithSecond) || null,
        };

        return createCurrenciesRate(currencyData, () => {
          onCancel();
          resetFields();
          fetchGeneralCurrencies({ new: 1 });
          setFieldsValue({
            startAt: moment().subtract(5, 'years'),
          });
        });
      }
    });
  };
  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions

    setFieldsValue({
      currency: undefined,
      rate: undefined,
      startAt: moment().subtract(5, 'years'),
    });
  }, []);

  const currencyCode = [];
  generalCurrencies.forEach(element => {
    if (element.id === getFieldValue(`${generalCurrencies?.id}`)) {
      return currencyCode.push(element.code);
    }
  });

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div ref={componentRef} style={{ padding: 16 }}>
        <span className={styles.modalTitle}>Yeni valyuta</span>
      </div>
      <Form
        onSubmit={handleCurrencyFormSubmit}
        className={styles.form}
        noValidate
      >
        <ProFormItem
          label="Valyuta"
          name="currency"
          help={getFieldError(`${generalCurrencies?.id}`)?.[0]}
          customStyle={styles.formItem}
        >
          {getFieldDecorator(`${generalCurrencies?.id}`, {
            rules: [requiredRule],
          })(<ProSelect data={generalCurrencies} />)}
        </ProFormItem>
        <Row gutter={6}>
          <Col span={8}>
            <ProFormItem label=" " customStyle={styles.formItem}>
              <Input
                readOnly
                value={`${
                  // eslint-disable-next-line no-constant-condition
                  [getFieldValue(`${generalCurrencies?.id}`)]
                    ? currencyCode
                    : ''
                }/${mainCurrency.code}`}
                size="large"
                className={styles.select}
                style={{ width: '100%' }}
              />
            </ProFormItem>
          </Col>
          <Col span={16}>
            <ProFormItem
              label="Məzənnə"
              name="rate"
              help={getFieldError('rate')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('rate', {
                rules: [requiredRule, numberRule],
              })(
                <InputNumber
                  size="large"
                  className={styles.select}
                  placeholder="Yazın"
                  style={{ width: '100%' }}
                />
              )}
            </ProFormItem>
          </Col>
        </Row>
        <ProFormItem
          label="Başlama tarixi"
          help={getFieldError('startAt')?.[0]}
          customStyle={styles.formItem}
        >
          {getFieldDecorator('startAt', {
            rules: [requiredRule],
          })(
            <ProDatePicker
              showTime
              style={{ width: '100%' }}
              format={fullDateTimeWithSecond}
              disabledDate={disabledDate}
            />
          )}
        </ProFormItem>
        <Button
          size="large"
          className={styles.button}
          style={{ fontSize: '14px' }}
          htmlType="submit"
        >
          {'Təsdiq et'}
        </Button>
      </Form>
    </div>
  );
};
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  { createCurrenciesRate, fetchGeneralCurrencies }
)(Form.create({ name: 'AddCurrencies' })(AddCurrencies));
