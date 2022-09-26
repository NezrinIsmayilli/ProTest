import React from 'react';
import { Table, CustomTag } from 'components/Lib';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import { Tooltip } from 'antd';
import math from 'exact-math';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function RecentOperations(props) {
  const { data, dataLoading, mainCurrency } = props;
  const { t } = useTranslation()

  const getStatusLabel = invoiceType =>
    invoiceType === 1
      ? t('dashboard:recentOperations:statusOpen')
      : invoiceType === 2
      ? t('dashboard:recentOperations:statusPartiallyPaid')
      : t('dashboard:recentOperations:statusPaid');

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 100,
      render: (value, row, index) => (row.summaryRow ? t('dashboard:recentOperations:sum') : index + 1),
    },
    {
      title: t('dashboard:recentOperations:contract'),
      dataIndex: 'contractNo',
      align: 'center',
      width: 100,
      render: (value, row) => (row.summaryRow ? '' : value || '-'),
    },
    {
      title: t('dashboard:recentOperations:invoiceNumber'),
      dataIndex: 'invoiceNumber',
      align: 'left',
      width: 120,
      render: (value, row) => (row.summaryRow ? '' : `${value}`),
    },
    {
      title: t('dashboard:recentOperations:counterParty'),
      dataIndex: 'counterparty',
      align: 'left',
      width: 120,
      ellipsis: true,
      render: (value, row) =>
        row.summaryRow ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={value}>
            <span>{value}</span>
          </Tooltip>
        ),
    },
    {
      title: t('dashboard:recentOperations:operationDate'),
      dataIndex: 'operationDate',
      align: 'left',
      width: 150,
      render: (value, row) =>
        row.summaryRow ? '' : `${value?.split(' ')[0]} ${value?.split(' ')[1]}`,
    },
    {
      title: t('dashboard:recentOperations:paymentStatus'),
      dataIndex: 'paymentStatus',
      align: 'left',
      width: 120,
      render: (value, row) =>
        row.summaryRow ? '' : <CustomTag label={getStatusLabel(value)} />,
    },
    {
      title: t('dashboard:recentOperations:endPrice'),
      dataIndex: 'endPrice',
      align: 'right',
      width: 120,
      render: (value, { currencyCode, summaryRow }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode} `,
    },
    {
      title: `${t('dashboard:recentOperations:endPriceInMainCurrency')} (${mainCurrency?.code})`,
      dataIndex: 'endPriceInMainCurrency',
      width: 200,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        } `,
    },
    {
      title: t('dashboard:recentOperations:paidAmount'),
      dataIndex: 'paidAmount',
      align: 'right',
      width: 120,
      render: (value, { summaryRow, currencyCode }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    {
      title: t('dashboard:recentOperations:paidInPercentage'),
      dataIndex: 'endPrice',
      key: 'paidInPercentage',
      align: 'center',
      width: 120,
      render: (value, { summaryRow, paidAmount }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(
                math.div(
                  math.mul(Number(paidAmount || 0), 100),
                  Number(value || 0)
                )
              )
            )}%`,
    },
    {
      title: t('dashboard:recentOperations:toBePaid'),
      dataIndex: 'endPrice',
      key: 'toBePaid',
      align: 'right',
      width: 120,
      render: (value, { summaryRow, paidAmount, currencyCode }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(
                math.sub(Number(value || 0), Number(paidAmount || 0))
              )
            )} ${currencyCode}`,
    },
  ];

  const getInvoiceList = data => {
    let invoices = [];

    if (data.length > 0) {
      const endPriceInMainCurrency = data.reduce(
        (total, current) =>
          math.add(Number(total), Number(current.endPriceInMainCurrency)),
        0
      );
      invoices = [
        ...data,
        {
          summaryRow: true,
          endPriceInMainCurrency,
        },
      ];
    }
    return invoices;
  };

  return (
    <div className={styles.RecentOperations}>
      <div className={styles.label}>
        <label>{t('dashboard:recentOperations:recentOperations')}</label>
      </div>
      <Table
        dataSource={getInvoiceList(data)}
        loading={dataLoading}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content', y: 355 }}
        rowKey={record => record.id}
      />
    </div>
  );
}
