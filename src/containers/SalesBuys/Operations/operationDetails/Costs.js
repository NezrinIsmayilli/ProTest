import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table } from 'antd';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import styles from './styles.module.scss';
import FooterRow from './FooterRow';

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

function Costs({ details, isLoading, data, totalPay }) {
  const componentRef = useRef();

  const {
    endPrice,
    invoiceType,
    counterparty,
    invoiceNumber,
    invoiceProducts,
    taxCurrencyCode,
    taxAmount,
    currencyCode,
  } = details;

  const [total, setTotal] = useState(0);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'productName',
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'pricePerUnit',
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Əlavə xərc (%)',
      dataIndex: 'increase_percentage',
      align: 'right',
      render: (_, { pricePerUnit, cost, currencyCode }) => {
        const increase_amount = math.sub(Number(cost), Number(pricePerUnit));
        const increase_per = math.div(
          math.mul(Number(increase_amount), 100),
          pricePerUnit
        );
        return `${formatNumberToLocale(
          defaultNumberFormat(defaultNumberFormat(increase_per))
        )}%`;
      },
    },
    {
      title: 'Artan Məbləğ',
      dataIndex: 'increase_amount',
      align: 'right',
      render: (_, { pricePerUnit, cost, currencyCode }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(math.sub(Number(cost), Number(pricePerUnit)))
        )} ${currencyCode}`,
    },
    {
      title: 'Maya dəyəri',
      dataIndex: 'cost',
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Say ',
      dataIndex: 'quantity',
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },

    {
      title: 'Toplam',
      dataIndex: 'quantity',
      key: 'total_amount',
      align: 'right',
      render: (value, { cost, currencyCode }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(math.mul(Number(value), Number(cost)))
        )} ${currencyCode} `,
    },
  ];

  useEffect(() => {
    if (data?.length > 0) {
      const total_price = data.reduce(
        (total_amount, { quantity, cost }) =>
          math.add(total_amount, math.mul(Number(quantity), Number(cost))),
        0
      );
      setTotal(total_price);
    }
  }, [data]);

  return (
    <div ref={componentRef} style={{ width: '100%' }}>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          {counterparty ? (
            <div
              className={styles.columnDetailItem}
              style={{ marginBottom: 6 }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: '24px',
                  marginBottom: 10,
                  color: '#373737',
                }}
              >
                {counterparty}
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
                  : invoiceType === 11
                  ? 'İstehsalat'
                  : 'Qaralama'}
              </span>
            </div>
          ) : (
            ''
          )}
          <HeaderItem name="Qaimə" secondary={invoiceNumber || '-'} />
          <HeaderItem
            name="Qaimə məbləği"
            secondary={
              endPrice
                ? `${formatNumberToLocale(
                    defaultNumberFormat(endPrice)
                  )} ${currencyCode}`
                : 0
            }
          />
          <HeaderItem
            name="Əlavə xərc"
            secondary={
              totalPay
                ? `${formatNumberToLocale(
                    defaultNumberFormat(totalPay)
                  )} ${currencyCode}`
                : 0
            }
          />
          <HeaderItem
            name="Toplam"
            secondary={` ${formatNumberToLocale(
              defaultNumberFormat(total)
            )} ${currencyCode}`}
          />
        </div>
        <ReactToPrint
          trigger={() => (
            <Button
              className={styles.customSquareButton}
              style={{ marginRight: 10, marginTop: 10 }}
              shape="circle"
              icon="printer"
            />
          )}
          content={() => componentRef.current}
        />
      </div>
      <Table
        scroll={{ x: 'max-content' }}
        dataSource={data}
        loading={isLoading}
        className={styles.opInvoiceContentTable}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        rowClassName={styles.row}
      />

      <FooterRow
        primary="Toplam:"
        secondary={` ${formatNumberToLocale(
          defaultNumberFormat(total)
        )} ${currencyCode}`}
      />
      <FooterRow
        primary={`Vergi(${formatNumberToLocale(
          defaultNumberFormat(
            roundToDown(
              math.div(math.mul(Number(taxAmount || 0) || 0, 100), total || 0),
              4
            )
          )
        ) || ''}%)`}
        secondary={`${formatNumberToLocale(
          defaultNumberFormat(taxAmount || 0)
        )} ${taxAmount ? taxCurrencyCode : ''}`}
        color="#0E65EB"
      />
    </div>
  );
}

export default Costs;
