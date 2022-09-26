import React, { Fragment } from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { Table as ProTable } from 'components/Lib';

import styles from '../styles.module.scss';

const PaymentsTab = props => {
  const {
    paymentBalance,

    isLoading,
  } = props;

  const userFullName = (value, row) => (
    <div>
      {row.isLastRow
        ? ''
        : `${row.createdByName || '-'}  ${row.createdByLastName || ''}`}
    </div>
  );

  // Total Price
  const getInfoWithTotal = invoiceInfo =>
    invoiceInfo
      ? [
          ...invoiceInfo,
          {
            isLastRow: true,
            amount: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.amount),
              0
            ),
          },
        ]
      : [];

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (_value, row, index) => (row.isLastRow ? 'Toplam' : index + 1),
    },
    {
      title: 'Tarix',
      width: 120,
      dataIndex: 'createdAt',
      render: (value, row) => (row.isLastRow ? '' : value),
    },
    {
      title: 'Qaimə',
      dataIndex: 'serialNumber',
      align: 'center',
      render: (value, row) =>
        row.isLastRow ? '' : `${'ABS'}${new Date().getFullYear()}/${value}`,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'center',
      width: 150,
      render: (value, row) => `${formatNumberToLocale(defaultNumberFormat(row.amount))} ${'AZN'}`,
    },
    {
      title: 'Əməliyyatçı',
      dataIndex: 'createdByLastName',
      align: 'center',
      render: userFullName,
    },
    {
      title: 'Qeyd',
      dataIndex: 'description',
      align: 'center',
      render: (value, row) => (row.isLastRow ? '' : value || '-'),
    },
  ];

  return (
    <Fragment>
      <div>
        <ProTable
          loading={isLoading}
          dataSource={getInfoWithTotal(paymentBalance)}
          columns={columns}
          scroll={{ x: true, y: false }}
          size="default"
          className={styles.invoiceTable}
          rowKey={record => record.id}
        />
      </div>
    </Fragment>
  );
};

export default PaymentsTab;
