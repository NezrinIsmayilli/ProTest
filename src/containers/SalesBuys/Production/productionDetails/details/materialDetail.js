import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { setSelectedProductionMaterial } from 'store/actions/sales-operation';
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
    <strong style={{ marginRight: '7%' }}>{secondary}</strong>
  </div>
);

function MaterialDetail({
  mainCurrencyCode,
  selectedProductionMaterial,
  measurements,
}) {
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
      title: 'Məhsul adı',
      dataIndex: 'name',
      width: 150,
      align: 'left',
      render: value => value,
    },
    {
      title: 'Miqdar',
      dataIndex: 'quantity',
      width: 100,
      align: 'left',
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
          measurements.find(
            measurement => measurement.id === row?.unitOfMeasurementId
          ).name
        }`,
    },
    {
      title: `Məbləğ (${mainCurrencyCode})`,
      dataIndex: 'price',
      align: 'center',
      width: 130,
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value || 0)
        )} ${mainCurrencyCode}`,
    },
    {
      title: `Toplam`,
      dataIndex: 'price',
      align: 'center',
      width: 130,
      render: (value, row) =>
        `${formatNumberToLocale(
          defaultNumberFormat(
            Number(value) > 0 && Number(row.quantity) > 0
              ? math.mul(Number(value), Number(row.quantity)) || 0
              : 0
          )
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
          Materiallar
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
          dataSource={selectedProductionMaterial}
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
            selectedProductionMaterial.reduce(
              (total, { price, quantity }) =>
                math.add(total, math.mul(Number(price), Number(quantity)) || 0),
              0
            )
          )
        )} ${mainCurrencyCode} `}
      />
    </div>
  );
}
const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
});

export default connect(
  mapStateToProps,
  {
    setSelectedProductionMaterial,
  }
)(MaterialDetail);
