/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

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

function PaymentsTab(props) {
  const { data, invoiceData, getPaymentStatus } = props;

  const componentRef = useRef();

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
            amountUsed: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.amountUsed),
              0
            ),
          },
        ]
      : [];

  const getColumns = () => {
    const columns = [
      {
        title: '№',
        dataIndex: 'id',
        width: 90,
        render: (value, row, index) => (row.isLastRow ? 'Toplam' : index + 1),
      },
      {
        title: 'Tarix',
        dataIndex: 'createdAt',
        width: 100,
        align: 'center',
        render: (value, row) => (row.isLastRow ? '' : value),
      },
      {
        title: 'Sənəd',
        dataIndex: 'serialNumber',
        width: 100,
        align: 'center',
        render: (value, row) =>
          row.isLastRow ? '' : `${'KMD'}${new Date().getFullYear()}/ ${value}`,
      },
      {
        title: 'Məbləğ',
        dataIndex: 'amount',
        align: 'center',
        width: 150,
        render: (value, row) =>
          value
            ? `${formatNumberToLocale(defaultNumberFormat(value))} ${'AZN'}`
            : '-',
      },
      {
        title: 'Qaimə üzrə məbləğ',
        dataIndex: 'amountUsed',
        align: 'center',
        width: 150,
        render: (value, row) =>
          value
            ? `${formatNumberToLocale(defaultNumberFormat(value))} ${'AZN'}`
            : '-',
      },
      {
        title: 'Əməliyyatçı',
        dataIndex: 'createdByName',
        width: 100,
        align: 'center',
        render: (value, row) =>
          row.isLastRow
            ? ''
            : `${row.createdByName || '-'} ${row.createdByLastName || ''}`,
      },
      {
        title: 'Qeyd',
        dataIndex: 'description',
        width: 100,
        align: 'center',
        render: (value, row) => (row.isLastRow ? '' : value),
      },
    ];

    return columns;
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
              {/* {data.tenantName} */}
              Prospect Cloud ERP
            </label>
          </div>
          <HeaderItem
            name="Qaimə"
            secondary={`${'ABS'}${new Date().getFullYear()}/${
              data.serialNumber
            }`}
          />

          <HeaderItem name="Ödəniş tarixi" secondary={data.startsAt || '-'} />
          <HeaderItem
            name="Qalıq"
            secondary={
              `${formatNumberToLocale(
                defaultNumberFormat(data.balance)
              )} ${'AZN'}` || '0.00 AZN'
            }
          />
          <HeaderItem
            name="Ödəniş statusu"
            secondary={getPaymentStatus(data.paymentStatus)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}></div>
      </div>

      <div
        className={styles.opInvTable}
        style={{
          width: 'calc(100% + 30px)',
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
          marginRight: -16,
        }}
      >
        <Table
          scroll={{ x: 'max-content', y: 400 }}
          dataSource={getInfoWithTotal(invoiceData)}
          className={`${styles.invoiceTable} ${styles.footer}`}
          columns={getColumns()}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(PaymentsTab);
