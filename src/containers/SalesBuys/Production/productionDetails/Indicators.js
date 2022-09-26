import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';
import FooterRow from './FooterRow';

const math = require('exact-math');

function Indicators(props) {
  const componentRef = useRef();
  const { data, details, mainCurrencyCode } = props;

  const { clientId, clientName } = details;

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
      width: 80,
      render: (value, row, index) => (row.isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'productName',
      width: 150,
      align: 'left',
      render: (value, row) => (row.isTotal ? null : value),
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      align: 'center',
      width: 100,
      render: (value, row) => (row.isTotal ? null : Number(value)),
    },
    {
      title: 'Vahidin planlaşdırılmış maya dəyəri',
      dataIndex: 'planned_cost',
      align: 'center',
      width: 180,
      render: (value, row) =>
        row.isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value || 0)
            )} ${mainCurrencyCode}`,
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
            )} ${mainCurrencyCode}`,
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
            )} ${mainCurrencyCode}`
          : `${formatNumberToLocale(
              defaultNumberFormat(handlePlannedProfit(row))
            )} ${mainCurrencyCode}`,
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
            )} ${mainCurrencyCode}`
          : `${formatNumberToLocale(
              defaultNumberFormat(handleProfit(row))
            )} ${mainCurrencyCode}`,
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
            {mainCurrencyCode}
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
    const { cost, quantity, planned_price } = product;
    return math.sub(
      math.mul(Number(quantity) || 0, Number(planned_price) || 0) || 0,
      math.mul(Number(quantity) || 0, Number(cost) || 0) || 0
    );
  }; // Handle product's total cost
  const handlePlannedProfit = product => {
    const { planned_price, planned_cost, quantity } = product;
    return math.sub(
      math.mul(Number(quantity) || 0, Number(planned_price) || 0) || 0,
      math.mul(Number(quantity) || 0, Number(planned_cost) || 0) || 0
    );
  };
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
              {clientId ? clientName : 'Daxili sifariş'}
            </label>
          </div>
        </div>
      </div>

      <Table
        scroll={{ x: 'max-content', y: 750 }}
        dataSource={handleTotal(data)}
        className={styles.invoiceTable}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        rowClassName={styles.row}
      />
      {/* <FooterRow
        primary="Toplam"
        secondary={`${formatNumberToLocale(
          defaultNumberFormat()
        )} ${mainCurrencyCode}`}
      /> */}
    </div>
  );
}

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {}
)(Indicators);
