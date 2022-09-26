import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { setSelectedProductionExpense } from 'store/actions/sales-operation';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

const math = require('exact-math');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong></strong>
    <strong></strong>
    <strong></strong>
    <strong>{quantity}</strong>
    <strong style={{ marginRight: '9%' }}>{secondary}</strong>
  </div>
);
function ExpenseDetail({ mainCurrencyCode, selectedProductionExpense }) {
  const componentRef = useRef();

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 50,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'date',
      width: 120,
    },
    {
      title: 'adı',
      dataIndex: 'name',
      width: 200,
      align: 'left',
      render: value => value,
    },
    {
      title: `Məbləğ (${mainCurrencyCode})`,
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value || 0)
        )} ${mainCurrencyCode}`,
    },
  ];

  return (
    <div ref={componentRef} style={{ width: '100%', padding: '20px' }}>
      <div className={styles.exportBox}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '50px',
          }}
        >
          Xərclər
        </span>
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
          scroll={{ x: 'max-content' }}
          dataSource={selectedProductionExpense}
          className={styles.opInvoiceContentTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
      <FooterRow
        primary="Toplam"
        secondary={`${formatNumberToLocale(
          defaultNumberFormat(
            selectedProductionExpense.reduce(
              (total, { price }) => math.add(total, Number(price) || 0),
              0
            )
          )
        )} ${mainCurrencyCode} `}
      />
    </div>
  );
}
const mapStateToProps = state => ({
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
});

export default connect(
  mapStateToProps,
  {
    setSelectedProductionExpense,
  }
)(ExpenseDetail);
