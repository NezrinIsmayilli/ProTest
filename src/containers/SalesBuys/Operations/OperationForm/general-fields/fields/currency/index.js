/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { convertCurrency } from 'store/actions/settings/kassa';
import { ProSelect, ProFormItem } from 'components/Lib';
import {
  updateInvoiceCurrencyCode,
  updateContractDetails,
  updatePaymentDetails,
  setInvoiceExpenseRate,
} from 'store/actions/sales-operation';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond, roundToDown } from 'utils';
import moment from 'moment';
import styles from '../../../styles.module.scss';

const CurrencyField = props => {
  const {
    form,
    field,
    currencies,
    expenseCurrency,
    convertCurrency,
    currenciesLoading,
    updatePaymentDetails,
    updateContractDetails,
    updateInvoiceCurrencyCode,
    setInvoiceExpenseRate,
    invoiceInfo,
  } = props;
  const { getFieldError, getFieldDecorator } = form;
  const { label, placeholder, name } = field;

  const { setFieldsValue } = form;

  useEffect(() => {
    if (currencies.length > 0) {
      const { id, code } = currencies[0];
      setFieldsValue({
        // currency: id,
        vatPaymentCurrency: id,
        invoicePaymentCurrency: id,
      });
      updatePaymentDetails({ currencyCode: code }, 'vat');
      updatePaymentDetails({ currencyCode: code }, 'invoice');
      // updateInvoiceCurrencyCode(code);
    }
  }, [currencies]);
  return (
    <div className={styles.field}>
      <ProFormItem label={label} help={getFieldError(name)?.[0]}>
        {getFieldDecorator(name, {
          getValueFromEvent: currencyId => {
            const selectedCurrency = currencies.find(
              currency => currency.id === currencyId
            );
            const { code } = selectedCurrency;
            updateInvoiceCurrencyCode(code);

            // Reset contract field
            setFieldsValue({ contract: undefined });
            updateContractDetails();
            return currencyId;
          },
          rules: [requiredRule],
        })(
          <ProSelect
            allowClear={false}
            loading={currenciesLoading}
            disabled={currenciesLoading || invoiceInfo?.hasAnyPayments || invoiceInfo?.hasAnyTaxPayments}
            placeholder={placeholder}
            data={currencies}
            keys={['code']}
          />
        )}
      </ProFormItem>
    </div>
  );
};

const mapStateToProps = state => ({
  currenciesLoading: state.loadings.fetchCurrencies,
  currencies: state.kassaReducer.currencies,
  expenseCurrency: state.salesOperation.expenseCurrency,
});

export const Currency = connect(
  mapStateToProps,
  {
    updateContractDetails,
    updatePaymentDetails,
    updateInvoiceCurrencyCode,
    convertCurrency,
    setInvoiceExpenseRate,
  }
)(CurrencyField);
