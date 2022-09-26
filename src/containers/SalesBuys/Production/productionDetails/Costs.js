import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table } from 'antd';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import styles from './styles.module.scss';
import FooterRow from './FooterRow';

const math = require('exact-math');

function Costs({ details, isLoading, data, allExpenses }) {
  const componentRef = useRef();

  const { clientName, clientId, currencyCode } = details;

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
      width: 280,
      dataIndex: 'productName',
    },
    {
      title: 'Say ',
      dataIndex: 'quantity',
      width: 150,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },
    {
      title: 'Vahidə düşən xərc bölgüsü, (%)',
      dataIndex: 'cost',
      width: 220,
      align: 'center',
      render: (value, row) => {
        if (allExpenses > 0 || total > 0) {
          return `${formatNumberToLocale(
            defaultNumberFormat(
              math.mul(
                math.div(Number(value) || 0, Number(total) || 1) || 0,
                100
              )
            )
          )} %`;
        }
        return 0.0;
      },
    },
    {
      title: 'Vahidin faktiki maya dəyəri',
      dataIndex: 'cost',
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Toplam',
      dataIndex: 'quantity',
      key: 'total_amount',
      width: 200,
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
          <div className={styles.columnDetailItem} style={{ marginBottom: 6 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '24px',
                marginBottom: 10,
                color: '#373737',
              }}
            >
              {clientId ? clientName : 'Daxili sifariş'}
            </label>
          </div>
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
        scroll={{ x: 'max-content', y: 740 }}
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
    </div>
  );
}

export default Costs;
