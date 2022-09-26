/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  fetchCurrencies,
  fetchMainCurrency,
} from 'store/actions/settings/kassa';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import {
  clearProductsByName,
  handleResetInvoiceFields,
  updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import { Table } from 'components/Lib';
import styles from '../../styles.module.scss';

const math = require('exact-math');

const Indicators = props => {
  const {
    // States
    handleResetInvoiceFields,
    selectedProducts,
    invoiceCurrencyCode,

    // DATA
    mainCurrency,

    // API
    fetchMainCurrency,
    updateInvoiceCurrencyCode,
    fetchCurrencies,
  } = props;
  const handleTotal = (data = []) => {
    const totalCost = data.reduce(
      (total, current) => total + handleProfit(current),
      0
    );
    const totalPlannedCost = data.reduce(
      (total, current) => total + handlePlannedProfit(current),
      0
    );
    return [
      ...data,
      {
        isTotal: true,
        id: 'Total count',
        totalCost,
        totalPlannedCost,
      },
    ];
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (value, row, index) => (row.isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'name',
      width: 150,
      align: 'left',
      render: (value, row) => (row.isTotal ? null : value),
    },
    {
      title: 'Say',
      dataIndex: 'invoiceQuantity',
      align: 'center',
      width: 100,
      render: (value, row) => (row.isTotal ? null : value),
    },
    {
      title: 'Vahidin planlaşdırılmış maya dəyəri',
      dataIndex: 'plannedCost',
      align: 'center',
      width: 190,
      render: (value, row) =>
        row.isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value || 0)
            )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Vahidin faktiki maya dəyəri',
      dataIndex: 'cost',
      align: 'center',
      width: 170,
      render: (value, row) =>
        row.isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value || 0)
            )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Cəmi planlaşdırılmış mənfəət',
      dataIndex: 'totalPlannedCost',
      width: 170,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${invoiceCurrencyCode}`
          : `${formatNumberToLocale(
              defaultNumberFormat(handlePlannedProfit(row))
            )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Cəmi faktiki mənfəət',
      dataIndex: 'totalCost',
      width: 120,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${invoiceCurrencyCode}`
          : `${formatNumberToLocale(
              defaultNumberFormat(handleProfit(row))
            )} ${invoiceCurrencyCode}`,
    },
    {
      title: 'Yayınma',
      dataIndex: 'total',
      align: 'center',
      width: 120,
      render: (_, row) =>
        row.isTotal ? null : (
          <span
            style={
              math.sub(handleProfit(row) || 0, handlePlannedProfit(row) || 0) >
              0
                ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                : { color: 'red', fontSize: '15px', fontWeight: 700 }
            }
          >
            {formatNumberToLocale(
              defaultNumberFormat(
                math.sub(handleProfit(row) || 0, handlePlannedProfit(row) || 0)
              )
            )}{' '}
            {invoiceCurrencyCode}
          </span>
        ),
    },
    {
      title: 'Yayınma, %',
      dataIndex: 'total',
      align: 'center',
      width: 120,
      render: (_, row) =>
        row.isTotal ? null : handlePlannedProfit(row) > 0 ? (
          math.div(
            math.sub(handleProfit(row) || 0, handlePlannedProfit(row) || 0),
            handlePlannedProfit(row)
          ) > 0 ? (
            <span style={{ color: 'green', fontSize: '15px', fontWeight: 700 }}>
              {formatNumberToLocale(
                defaultNumberFormat(
                  math.mul(
                    math.div(
                      math.sub(
                        handleProfit(row) || 0,
                        handlePlannedProfit(row) || 0
                      ),
                      handlePlannedProfit(row)
                    ),
                    100
                  )
                )
              )}{' '}
              %
            </span>
          ) : (
            <span style={{ color: 'red', fontSize: '15px', fontWeight: 700 }}>
              {formatNumberToLocale(
                defaultNumberFormat(
                  math.mul(
                    math.div(
                      math.sub(
                        handleProfit(row) || 0,
                        handlePlannedProfit(row) || 0
                      ),
                      handlePlannedProfit(row)
                    ),
                    -100
                  )
                )
              )}{' '}
              %
            </span>
          )
        ) : (
          <span style={{ color: 'red', fontSize: '15px', fontWeight: 700 }}>
            0.00 %
          </span>
        ),
    },
  ];

  // Handle product's total price
  const handleProfit = product => {
    const { cost, invoiceQuantity, plannedPrice } = product;
    return math.sub(
      math.mul(Number(invoiceQuantity) || 0, Number(plannedPrice) || 0) || 0,
      math.mul(Number(invoiceQuantity) || 0, Number(cost) || 0) || 0
    );
  }; // Handle product's total cost
  const handlePlannedProfit = product => {
    const { plannedPrice, plannedCost, invoiceQuantity } = product;
    return math.sub(
      math.mul(Number(invoiceQuantity) || 0, Number(plannedPrice) || 0) || 0,
      math.mul(Number(invoiceQuantity) || 0, Number(plannedCost) || 0) || 0
    );
  };

  useEffect(() => {
    fetchCurrencies();
    fetchMainCurrency();
    return () => {
      handleResetInvoiceFields();
    };
  }, []);

  useEffect(() => {
    updateInvoiceCurrencyCode(mainCurrency?.code);
  }, [mainCurrency]);
  return (
    <>
      <div className={styles.parentBox}>
        <div className={styles.paper}>
          <div className={styles.Header}>
            <span className={styles.newOperationTitle}>Əsas göstəricilər</span>
          </div>
          <Table
            columns={columns}
            rowKey={row => row.id}
            dataSource={handleTotal(selectedProducts)}
            className={styles.tableFooter}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedProducts: state.salesOperation.selectedProducts,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export const ProductionIndicators = connect(
  mapStateToProps,
  {
    clearProductsByName,
    // API
    fetchCurrencies,
    updateInvoiceCurrencyCode,
    fetchMainCurrency,
    handleResetInvoiceFields,
  }
)(Indicators);
