import React, { Fragment } from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { Table as ProTable } from 'components/Lib';

import styles from '../styles.module.scss';

const InvoiceTab = props => {
  const { invoices, isLoading } = props;

  // Payment Status
  const getPaymentStatus = paymentStatus => {
    switch (paymentStatus) {
      case 1:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#4E9CDF',
              background: '#EAF3FB',
            }}
          >
            Açıq
          </span>
        );
      case 2:
        return (
          <span
            className={styles.chip}
            style={{
              background: '#fdf7ea',
              color: '#f3b753',
            }}
          >
            Qismən ödənilib
          </span>
        );
      case 3:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#55AB80',
              background: '#EBF5F0',
            }}
          >
            Ödənilib
          </span>
        );
      default:
        break;
    }
  };
  //  Status
  const getStatus = status => {
    switch (status) {
      case 1:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#55AB80',
              background: '#EBF5F0',
            }}
          >
            Bağlı
          </span>
        );
      case 2:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#4E9CDF',
              background: '#EAF3FB',
            }}
          >
            Qalır
          </span>
        );
      case 3:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#ee142f',
              background: '#ee142f1c',
            }}
          >
            Gecikir
          </span>
        );
      default:
        break;
    }
  };

  // Total Price
  const getInfoWithTotal = invoiceInfo =>
    invoiceInfo
      ? [
          ...invoiceInfo,
          {
            isLastRow: true,
            price: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.price),
              0
            ),
            balance: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.balance),
              0
            ),
            paidAmount: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.paidAmount),
              0
            ),
          },
        ]
      : [];

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      render: (_value, row, index) => (row.isLastRow ? 'Toplam' : index + 1),
    },
    {
      title: 'Ödəniş tarixi',
      dataIndex: 'startsAt',
      render: (value, row) => (row.isLastRow ? '' : value),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'tenantName',
      align: 'center',
      width: 150,
      render: (value, row) => (row.isLastRow ? '' : 'Prospect Cloud ERP'),
    },
    {
      title: 'Qaimə',
      dataIndex: 'serialNumber',
      align: 'center',
      render: (value, row) =>
        row.isLastRow ? '' : `${'ABS'}${new Date().getFullYear()}/${value}`,
    },
    {
      title: 'Ödəniş statusu',
      dataIndex: 'paymentStatus',
      align: 'center',
      width: 150,
      render: (value, row) =>
        row.isLastRow ? '' : getPaymentStatus(row.paymentStatus),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'price',
      align: 'center',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(row.price))} ${'AZN'}`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      align: 'center',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value) || 0)} ${'AZN'}`,
    },
    {
      title: 'Qalıq',
      dataIndex: 'balance',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value) || 0)} ${'AZN'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 150,
      render: (value, row) => (row.isLastRow ? '' : getStatus(row.status)),
    },
  ];

  return (
    <Fragment>
      <div>
        <ProTable
          loading={isLoading}
          dataSource={getInfoWithTotal(invoices)}
          columns={columns}
          scroll={{ x: false, y: false }}
          size="default"
          className={styles.invoiceTable}
          rowKey={record => record.id}
        />
      </div>
    </Fragment>
  );
};

export default InvoiceTab;
