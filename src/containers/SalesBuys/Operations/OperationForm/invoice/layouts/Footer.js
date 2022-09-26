/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { ProFormItem, ProInput, ProSelect } from 'components/Lib';
import { connect } from 'react-redux';
import {
  setTotalPrice,
  setEndPrice,
  setVat,
  setDiscount,
  setActivePayments,
  setVatCurrencyCode,
  updatePaymentDetails,
} from 'store/actions/sales-operation';
import {
  re_percent,
  re_amount,
  formatNumberToLocale,
  defaultNumberFormat,
  roundToDown,
  customRound,
} from 'utils';
import { Checkbox } from 'antd';
import { requiredRule, numberRule } from 'utils/rules';
import styles from '../../styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const FooterLayout = props => {
  const {
    form,
    type,
    activePayments,
    setActivePayments,
    updatePaymentDetails,
    totalPrice,
    endPrice,
    vatCurrencyCode,
    setVatCurrencyCode,
    discount,
    vat,
    currencies,
    setVat,
    setTotalPrice,
    setEndPrice,
    setDiscount,
    selectedProducts,
    invoiceCurrencyCode,
    invoiceInfoLoading
  } = props;

  const newTotalPriceRef = useRef(null);
  const newRef = useRef(null);
  const newVatRef = useRef(null);

  // const { activePayments = [], currencyCode, useVat } = generalInformation;
  const [useVat, setUseVat] = useState(false);
  const {
    setFieldsValue,
    getFieldDecorator,
    getFieldError,
    getFieldValue,
  } = form;
  const handleTotalPriceChange = selectedProducts => {
    let newTotalPrice = 0;
    if (selectedProducts?.length > 0) {
      newTotalPrice = selectedProducts.reduce(
        (totalPrice, { invoiceQuantity, invoicePrice }) =>
          math.add(
            totalPrice,
            math.mul(Number(invoiceQuantity) || 0, Number(invoicePrice) || 0)
          ),
        0
      );
    }
    setTotalPrice({ newTotalPrice: roundToDown(newTotalPrice) });
  };

  const handleDiscountChange = (value, type) => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;

    if (Number(value) === 100) {
      setVat({
        newPercentage: undefined,
        newAmount: undefined,
      });
      setUseVat(false);
    }
    if (type === 'percentage' && re_percent.test(value) && value <= 100) {
      const AMOUNT = roundTo(
        math.div(math.mul(Number(value), Number(totalPrice || 0)), 100),
        2
      );
      setDiscount({
        newPercentage: value || undefined,
        newAmount: AMOUNT || undefined,
      });
    }
    if (
      type === 'amount' &&
      re.test(value) &&
      Number(value) <= Number(totalPrice)
    ) {
      const PERCENTAGE = roundTo(
        math.div(math.mul(Number(value || 0), 100), Number(totalPrice || 0)),
        4
      );
      setDiscount({
        newPercentage: PERCENTAGE || undefined,
        newAmount: value || undefined,
      });
    }
    if (value === '') {
      setDiscount({
        newPercentage: null,
        newAmount: null,
      });
    }
  };
  const handleVatChange = (value, type) => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;

    if (type === 'percentage' && re_percent.test(value) && value <= 100) {
      const AMOUNT = roundTo(
        math.div(math.mul(Number(value), Number(endPrice || 0)), 100),
        2
      );
      setVat({
        newPercentage: value || undefined,
        newAmount: AMOUNT || undefined,
      });
    }
    if (
      type === 'amount' &&
      re.test(value) &&
      Number(value) <= Number(100000)
    ) {
      const PERCENTAGE = roundTo(
        math.div(math.mul(Number(value), 100), Number(endPrice || 0)),
        4
      );
      setVat({
        newPercentage: PERCENTAGE || undefined,
        newAmount: value || undefined,
      });
    }
    if (value === '') {
      setVat({
        newPercentage: null,
        newAmount: null,
      });
    }
  };

  const handleUseVat = event => {
    setVat({
      newPercentage: undefined,
      newAmount: undefined,
    });
    setUseVat(event.target.checked);
    if (event.target.checked) {
      return;
    }
    if (!event.target.checked) {
      // setFieldsValue({
      //   taxCurrency: undefined,
      // });
    }
    if (activePayments?.length === 2) {
      setFieldsValue({ vatPaymentAmount: undefined });
      setActivePayments({
        newActivePayments: ['1'],
      });
    }
  };
  const handleTaxPercentage = event => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    if (re.test(event.target.value) && event.target.value <= 100)
      return event.target.value;
    if (event.target.value === '') return null;
    return getFieldValue('taxPercentage');
  };

  const handleAmount = event => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    if (re.test(event.target.value) && event.target.value <= 1000000)
      return event.target.value;
    if (event.target.value === '') return null;
    return getFieldValue('taxAmount');
  };

  useEffect(() => {
    clearTimeout(newTotalPriceRef.current);
    newTotalPriceRef.current = setTimeout(
      () => handleTotalPriceChange(selectedProducts),
      600
    );
  }, [selectedProducts]);

  useEffect(() => {
    updatePaymentDetails({
      isVat: useVat,
    });
  }, [useVat]);

  useEffect(() => {
    if(!invoiceInfoLoading)
    {
      clearTimeout(newRef.current);
      if(totalPrice === 0){
        newRef.current = setTimeout(
          () => {if (type !== 'import-purchase') {
            if (discount.percentage && totalPrice) {
              handleDiscountChange(Number(discount.percentage) || 0, 'percentage');
            } else {
              setDiscount({
                percentage: undefined,
                amount: undefined,
              });
            }
          }},
          5000
        );
      } else {
        if (type !== 'import-purchase') {
          if (discount.percentage && totalPrice) {
            handleDiscountChange(Number(discount.percentage) || 0, 'percentage');
          } else {
            setDiscount({
              percentage: undefined,
              amount: undefined,
            });
          }
        }
      }
    }
  }, [totalPrice, invoiceInfoLoading]);

  useEffect(() => {
      if (discount.percentage && Number(discount.percentage) === 100) {
        setActivePayments({
          newActivePayments: [],
        });
        updatePaymentDetails(
          {
              accountBalance: [],
          }
        );
        updatePaymentDetails(
          {
              accountBalance: [],
          }, 'invoice'
        );
      } 
    
  }, [discount.percentage]);

  useEffect(() => {
    if (type !== 'import-purchase') {
      let newEndPrice = totalPrice;
      if (totalPrice && discount.amount) {
        newEndPrice = roundTo(
          math.sub(Number(totalPrice) || 0, Number(discount.amount || 0)),
          4
        );
      } else if (discount.amount) {
        newEndPrice = 0;
      }

      setEndPrice({ newEndPrice });
    }
  }, [totalPrice, discount.amount]);

  useEffect(() => {
    if(!invoiceInfoLoading)
      {
        clearTimeout(newVatRef.current);
        if(totalPrice === 0){
          newVatRef.current = setTimeout(
            () => {
              if (type !== 'import-purchase') {
                if (endPrice && vat.percentage) {
                  handleVatChange(Number(vat.percentage), 'percentage');
                } else {
                  setVat({
                    percentage: 0,
                    amount: 0,
                  });
                }
              }},
            5000
          );
        } else {
          if (type !== 'import-purchase') {
            if (endPrice && vat.percentage) {
              handleVatChange(Number(vat.percentage), 'percentage');
            } else {
              setVat({
                percentage: 0,
                amount: 0,
              });
            }
          }
        }
        if (type !== 'import-purchase') {
          if (activePayments.includes('1')) {
            setFieldsValue({
              invoicePaymentAmount: endPrice
                ? customRound(endPrice, 1, 2)
                : undefined,
            });
          }
        }
      }
  }, [endPrice, invoiceInfoLoading]);

  useEffect(() => {
    if (type !== 'import-purchase') {
      if (!useVat && vat.amount) setUseVat(true);
      if (activePayments.includes('2')) {
        setFieldsValue({
          vatPaymentAmount: vat.amount
            ? customRound(vat.amount, 1, 2)
            : undefined,
        });
      }
    }
  }, [vat.amount]);
  useEffect(() => {
    if (useVat) {
      setVatCurrencyCode(invoiceCurrencyCode);
    } else {
      setVatCurrencyCode(undefined);
    }
  }, [invoiceCurrencyCode, useVat]);
  useEffect(() => {
    setFieldsValue({ taxPercentage: vat.percentage, taxAmount: vat.amount });
  }, [vat]);
  return (
    <div className={styles.Footer}>
      <div className={styles.row}>
        <span className={styles.label}>Toplam qiymət:</span>
        <span className={styles.subtitleStyle}>
          {formatNumberToLocale(defaultNumberFormat(totalPrice))}{' '}
          {invoiceCurrencyCode}
        </span>
      </div>

      {type !== 'import-purchase' ? (
        <>
          <div className={styles.row}>
            <span className={`${styles.label} ${styles.discountLabel}`}>
              Endirim:
            </span>
            <div className={styles.inputGroup}>
              <ProInput
                value={discount.percentage}
                onChange={event =>
                  handleDiscountChange(event.target.value, 'percentage')
                }
                className={styles.input}
                size="middle"
                suffix="%"
              />
              <ProInput
                value={discount.amount}
                onChange={event =>
                  handleDiscountChange(event.target.value, 'amount')
                }
                className={styles.input}
                size="middle"
                style={{ marginLeft: 10 }}
                suffix={invoiceCurrencyCode}
              />
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Son qiymət:</span>
            <span className={styles.subtitleStyle}>
              {formatNumberToLocale(defaultNumberFormat(endPrice))}{' '}
              {invoiceCurrencyCode}
            </span>
          </div>
          <div className={styles.row}>
            <div>
              <Checkbox
                checked={useVat}
                disabled={Number(discount.percentage) === 100}
                onChange={handleUseVat}
                style={{ marginRight: '10px' }}
              />
              <span className={`${styles.label} ${styles.vatLabel}`}>ƏDV:</span>
            </div>
            <div className={styles.inputGroup}>
              <ProFormItem
                style={{ marginBottom: 0 }}
                help={getFieldError('taxPercentage')?.[0]}
              >
                {getFieldDecorator('taxPercentage', {
                  getValueFromEvent: event => handleTaxPercentage(event),
                  rules: useVat ? [requiredRule] : [],
                })(
                  <ProInput
                    value={vat.percentage}
                    onChange={event =>
                      handleVatChange(event.target.value, 'percentage')
                    }
                    disabled={!useVat}
                    className={styles.input}
                    size="middle"
                    suffix="%"
                  />
                )}
              </ProFormItem>
              <ProFormItem
                style={{ marginBottom: 0 }}
                help={getFieldError('taxAmount')?.[0]}
              >
                {getFieldDecorator('taxAmount', {
                  getValueFromEvent: event => handleAmount(event),
                  rules: useVat ? [requiredRule] : [],
                })(
                  <ProInput
                    value={vat.amount}
                    disabled={!useVat}
                    onChange={event =>
                      handleVatChange(event.target.value, 'amount')
                    }
                    className={styles.input}
                    size="middle"
                    style={{ marginLeft: 10 }}
                    suffix={vatCurrencyCode}
                  />
                )}
              </ProFormItem>
            </div>
          </div>
          {useVat ? (
            <div className={styles.row}>
              <span className={styles.label}>Yekun (ƏDV ilə):</span>
              <span className={styles.subtitleStyle}>
                {formatNumberToLocale(
                  defaultNumberFormat(
                    math.add(Number(endPrice || 0), Number(vat.amount || 0))
                  )
                )}{' '}
                {invoiceCurrencyCode}
              </span>
            </div>
          ) : null}

          {/* <div className={styles.row} style={{ justifyContent: 'flex-end' }}>
            <ProFormItem
              label="Ədv valyutası"
              help={getFieldError('taxCurrency')?.[0]}
            >
              {getFieldDecorator('taxCurrency', {
                getValueFromEvent: currencyId => {
                  const selectedCurrency = currencies.find(
                    ({ id }) => currencyId === id
                  );
                  if (selectedCurrency) {
                    setVatCurrencyCode(selectedCurrency.code);
                  }
                  return currencyId;
                },
                rules: useVat ? [requiredRule] : [],
              })(
                <ProSelect
                  allowClear={false}
                  className={styles.input}
                  disabled={!useVat}
                  data={currencies}
                  keys={['code']}
                />
              )}
            </ProFormItem>
          </div> */}
        </>
      ) : null}
    </div>
  );
};

const mapStateToProps = state => ({
  activePayments: state.salesOperation.activePayments,
  currencies: state.kassaReducer.currencies,
  totalPrice: state.salesOperation.totalPrice,
  endPrice: state.salesOperation.endPrice,
  discount: state.salesOperation.discount,
  vat: state.salesOperation.vat,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  selectedProducts: state.salesOperation.selectedProducts,
  vatCurrencyCode: state.salesOperation.vatCurrencyCode,
});
export const Footer = connect(
  mapStateToProps,
  {
    setTotalPrice,
    setEndPrice,
    setVat,
    setDiscount,
    setActivePayments,
    setVatCurrencyCode,
    updatePaymentDetails,
  }
)(FooterLayout);
