import React, { useRef, useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';

const math = require('exact-math');

const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => (
  <div className={styles.columnDetailItem} style={{ marginLeft: 56 }}>
    <label
      style={{
        marginBottom: gutterBottom ? 12 : 0,
      }}
    >
      {name}
    </label>

    {secondary ? <span>{secondary}</span> : children}
  </div>
);

function OpFinOpInvoiceTab(props) {
  const componentRef = useRef();
  const {
    details,
    mainCurrencyCode,
    creditRow,
    isDeletedForLog,
    creditPayment,
    loading,
  } = props;

  const {
    invoiceType,
    counterparty,
    counterpartyName,
    invoiceNumber,
    statusOfOperation,
    endPrice,
    paidAmount,
    recieved,
  } = details;

  const getTotalValue = data =>
    data
      ? [
          ...data,
          {
            isTotal: true,
            totalMonthlyPaymentAmount: data.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.totalMonthlyPaymentAmount),
              0
            ),
            monthlyPaymentAmount: data.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.monthlyPaymentAmount),
              0
            ),
            monthlyCreditAmount: data.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.monthlyCreditAmount),
              0
            ),
            monthlyDepositAmount: data.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.monthlyDepositAmount),
              0
            ),
            totalRemainingMonthlyPaymentAmount: data.reduce(
              (totalValue, currentValue) =>
                totalValue +
                Number(currentValue.totalRemainingMonthlyPaymentAmount),
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
      render: (_value, row, index) => (row.isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Ödəniş tarixi',
      dataIndex: 'date',
      width: 200,
      render: (date, row) => (row.isTotal ? null : date),
    },
    {
      title: 'Ödənilməlidir',
      dataIndex: 'totalMonthlyPaymentAmount',
      width: 150,
      align: 'right',
      render: (value, row) =>
        row.isTotal
          ? null
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
              creditRow?.invoiceTenantCurrencyCode || ''
            }`,
    },
    {
      title: 'Əsas borc ödənişi',
      dataIndex: 'monthlyPaymentAmount',
      width: 150,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          creditRow?.invoiceTenantCurrencyCode || ''
        }`,
    },
    {
      title: 'Faiz ödənişi',
      dataIndex: 'monthlyCreditAmount',
      width: 150,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          creditRow?.invoiceTenantCurrencyCode || ''
        }`,
    },
    {
      title: 'Depozit ödənişi',
      dataIndex: 'monthlyDepositAmount',
      width: 150,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          creditRow?.invoiceTenantCurrencyCode || ''
        }`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'totalMonthlyPaymentAmount',
      width: 160,
      align: 'right',
      render: (value, row) =>
        `${formatNumberToLocale(
          defaultNumberFormat(
            math.sub(
              Number(value || 0),
              Number(row.totalRemainingMonthlyPaymentAmount || 0)
            )
          )
        )} ${creditRow?.invoiceTenantCurrencyCode || ''}`,
    },
    {
      title: 'Qalıq',
      dataIndex: 'totalRemainingMonthlyPaymentAmount',
      align: 'center',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value || 0))}
          ${creditRow?.invoiceTenantCurrencyCode || ''}`,
    },
    {
      title: 'Sənəd',
      width: 130,
      dataIndex: 'transactionMoneys',
      render: (value, row) =>
        row.isTotal ? null : value && value.length > 0 ? (
          value.length > 1 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className={styles.ellipsisDiv}>
                {value[0].documentNumber}
              </span>
              <Tooltip
                placement="right"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {value.map(structure => (
                      <span>{structure.documentNumber}</span>
                    ))}
                  </div>
                }
              >
                <span className={styles.serialNumberCount}>{value.length}</span>
              </Tooltip>
            </div>
          ) : (
            value[0].documentNumber
          )
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      key: 'status',
      render: (value, row) =>
        row.isTotal ? null : value ? (
          value === 1 ? (
            <span
              className={styles.chip}
              style={{
                color: '#55AB80',
                background: '#EBF5F0',
              }}
            >
              Bağlı
            </span>
          ) : value === 2 ? (
            <span
              className={styles.chip}
              style={{
                color: '#c0392b',
                background: '#F6EEFC',
              }}
            >
              Gecikir
            </span>
          ) : value === 3 ? (
            <span
              className={styles.chip}
              style={{
                color: '#4E9CDF',
                background: '#EAF3FB',
              }}
            >
              Qalır
            </span>
          ) : (
            <span
              className={styles.chip}
              style={{
                color: '#d35400',
                background: '#ffecdb',
              }}
            >
              Vaxtı çatıb
            </span>
          )
        ) : (
          '-'
        ),
    },
    {
      title: 'Gecikmə (gün)',
      dataIndex: 'latenessDays',
      align: 'center',
      width: 140,
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
  ];

  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          <div className={styles.columnDetailItem}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '24px',
                marginBottom: 10,
                color: '#373737',
              }}
            >
              {invoiceType === 10 ? counterpartyName : counterparty}
            </label>

            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',

                color: '#CBCBCB',
              }}
            >
              {invoiceType === 1
                ? 'Alış'
                : invoiceType === 2
                ? 'Satış'
                : invoiceType === 3
                ? 'Geri alma'
                : invoiceType === 4
                ? 'Geri qaytarma'
                : invoiceType === 5
                ? 'Transfer'
                : invoiceType === 6
                ? 'Silinmə'
                : invoiceType === 10
                ? 'İdxal alışı'
                : invoiceType === 12 || invoiceType === 13
                ? 'İlkin qalıq/Borc'
                : 'Qaralama'}
            </span>
          </div>
          <HeaderItem
            name="Sənəd"
            secondary={
              creditRow?.serialNumber ?
              `KC${moment(
                creditRow?.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                'YYYY'
              ).format('YYYY')}/${creditRow?.serialNumber}` : '-'
            }
          />
          <HeaderItem name="Qaimə" secondary={invoiceNumber || '-'} />
        </div>
      </div>

      <div
        className={styles.opInvTable}
        style={{
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
        }}
      >
        <Table
          loading={loading}
          pagination={false}
          className={styles.creditPaymentTable}
          columns={columns}
          rowKey={row => row.id}
          dataSource={getTotalValue(creditPayment)}
        />
      </div>
    </div>
  );
}

export default OpFinOpInvoiceTab;
