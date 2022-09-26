/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Checkbox, Collapse, Button } from 'antd';
import { connect } from 'react-redux';
import {
  setActivePayments,
  updatePaymentDetails,
} from 'store/actions/sales-operation';
import { formatNumberToLocale, defaultNumberFormat, customRound } from 'utils';
import { PaymentForm } from './index';
import { ActionButtons, Rate } from '../invoice';
import styles from '../styles.module.scss';

const math = require('exact-math');

const { Panel } = Collapse;
const PaymentPaper = props => {
  const {
    form,
    invoiceInfo,
    id,
    endPrice,
    isDraft,
    vat,
    activePayments,
    invoicePaymentDetails,
    invoiceCurrencyCode,
    vatCurrencyCode,
    setActivePayments,
    updatePaymentDetails,
    vatPaymentDetails,
    handleNewInvoice,
    handleDraftInvoice,
    currencies,
  } = props;
  const { getFieldValue, setFieldsValue } = form;
  const [rate, setRate] = useState(1);
  const [vatRate, setVatRate] = useState(1);

  const columns = [
    {
      title: 'Sənəd üzrə borc',
      dataIndex: 'debtOnTheDocument',
      align: 'right',
      width: 180,
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Silinəcək borc',
      dataIndex: 'amountPaid',
      key: 'decresedDebt',
      align: 'right',
      width: 160,
      render: (value, { rate }) => 
        Number(rate) === 0? 0 :
        `${formatNumberToLocale(
          defaultNumberFormat(math.mul(Number(value || 0), Number(rate || 1)))
        )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Ödəniş məbləği',
      dataIndex: 'amountPaid',
      width: 160,
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Məzənnə',
      dataIndex: 'rate',
      width: 130,
      align: 'right',
      render: (value, row) => (
        <Rate
          value={value}
          updatePaymentDetails={updatePaymentDetails}
          type={row.type}
        />
      ),
    },
    {
      title: 'Avans',
      dataIndex: 'amountPaid',
      key: 'advance',
      width: 160,
      align: 'right',
      render: (value, { debtOnTheDocument, rate, currencyCode }) => {
        const advance = Number(rate) === 0 ? 0 : math.sub(
          math.mul(Number(value || 0), Number(rate || 1)),
          Number(debtOnTheDocument || 0)
        );

        return `${formatNumberToLocale(
          defaultNumberFormat(
            Math.abs(Number(advance) > 0 ? Number(advance) : 0)
          )
        )} ${currencyCode}`;
      },
    },
    {
      title: 'Qalıq borc',
      dataIndex: 'amountPaid',
      key: 'debt',
      width: 160,
      align: 'right',
      render: (value, { debtOnTheDocument, rate, currencyCode }) => {
        const debt = Number(rate) === 0? 0 : math.sub(
          Number(debtOnTheDocument || 0),
          math.mul(Number(value || 0), Number(rate || 1))
        );

        return `${formatNumberToLocale(
          defaultNumberFormat(Math.abs(Number(debt) > 0 ? Number(debt) : 0))
        )} ${currencyCode}`;
      },
    },
  ];

  const handleActivePayments = activeKeys => {
    if (activeKeys.includes('1')) {
      setActivePayments({ newActivePayments: activeKeys });
    }
  };
  const handleCancelPayment = () => {
    setActivePayments({ newActivePayments: [] });
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
  };

  useEffect(() => {
    if (activePayments.length > 0) {
      if (activePayments.length === 1) {
        setFieldsValue({
          invoicePaymentAmount: customRound(endPrice, rate, 2),
          invoicePaymentCurrency: getFieldValue('currency'),
        });
        setRate(1);
        updatePaymentDetails(
            {
                rate: 1,
            },
            'invoice'
        );
      } else if (activePayments.length === 2) {
        setFieldsValue({
          invoicePaymentAmount: customRound(endPrice, vatRate, 2),
          invoicePaymentCurrency: getFieldValue('currency'),
          vatPaymentCurrency: getFieldValue('currency'),
          vatPaymentAmount: customRound(vat.amount || 0, 1, 2),
        });
        setRate(1);
        updatePaymentDetails(
            {
                rate: 1,
            },
            'vat'
        );
      }
    }
  }, [activePayments, getFieldValue('currency')]);
  return (
    <div className={styles.parentBox}>
      <div className={styles.paper}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span className={styles.newOperationTitle}>Ödəniş et</span>
          <Button type="danger" onClick={handleCancelPayment}>
            Ödənişi ləğv et
          </Button>
        </div>

        <Collapse
          bordered={false}
          activeKey={activePayments}
          className={styles.customCollapse}
          onChange={handleActivePayments}
          expandIcon={data => (
            <Checkbox
              className={styles.panelCheckbox}
              checked={data.isActive}
            />
          )}
        >
          <Panel header="Əsas ödəniş" key="1" style={{ marginBottom: '20px' }}>
            <PaymentForm
              id={id}
              invoiceInfo={invoiceInfo}
              columns={columns}
              type="invoice"
              form={form}
              debt={endPrice || 0}
              paymentDetails={invoicePaymentDetails}
              amountPaid={getFieldValue('invoicePaymentAmount') || 0}
              updatePaymentDetails={updatePaymentDetails}
              setRate={setRate}
              invoiceCurrencyId={currencies.find(
                currency =>
                    currency.code === invoiceCurrencyCode
              )}
            />
          </Panel>
          <Panel key="2" header="Vergi ödənişi" disabled={!vatPaymentDetails.isVat}>
            <PaymentForm
              id={id}
              invoiceInfo={invoiceInfo}
              columns={columns}
              type="vat"
              form={form}
              debt={vat.amount || 0}
              paymentDetails={vatPaymentDetails}
              amountPaid={getFieldValue('vatPaymentAmount') || 0}
              setRate={setVatRate}
              invoiceCurrencyId={currencies.find(
                currency =>
                    currency.code === vatCurrencyCode
              )}
            />
          </Panel>
        </Collapse>
        {activePayments.length > 0 ? (
          <ActionButtons
            form={form}
            isDraft={isDraft}
            handleNewInvoice={handleNewInvoice}
            handleDraftInvoice={handleDraftInvoice}
          />
        ) : null}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  endPrice: state.salesOperation.endPrice,
  vat: state.salesOperation.vat,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  activePayments: state.salesOperation.activePayments,
  invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
  vatPaymentDetails: state.salesOperation.vatPaymentDetails,
  vatCurrencyCode: state.salesOperation.vatCurrencyCode,
  currencies: state.kassaReducer.currencies,
});

export const Payment = connect(
  mapStateToProps,
  {
    setActivePayments,
    updatePaymentDetails,
  }
)(PaymentPaper);
