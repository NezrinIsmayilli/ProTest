/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import { Table } from 'antd';
import { connect } from 'react-redux';
import { formatNumberToLocale } from 'utils';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from '../../styles.module.scss';

function OpInvoiceContentTab({
  isLoading,
  invoices,
  name,
  type,
  currencyCode,
}) {
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => !row.isTotal && index + 1,
    },
    {
      title: 'Müqavilə',
      dataIndex: 'contractNo',
      render: (value, row) => !row.isTotal && value,
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 140,
      render: (value, row) => !row.isTotal && value,
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      width: 140,
      align: 'left',
      render: (value, row) => !row.isTotal && value,
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      width: 150,
      render: (value, row) =>
        !row.isTotal ?
        value === 3 && Number(row.endPrice) === 0
        ? "-"
        : (
          <span
            className={styles.chip}
            style={
              value === 3
                ? {
                    color: '#55AB80',
                    background: '#EBF5F0',
                  }
                : value === 1
                ? {
                    color: '#4E9CDF',
                    background: '#EAF3FB',
                  }
                : {
                    color: '#F3B753',
                    background: '#FDF7EA',
                  }
            }
          >
            {value === 3 && Number(row.endPrice) > 0
              ? 'Ödənilib'
              : value === 2
              ? 'Qismən ödənilib'
              : ' Açıq'}
          </span>
        ) : null,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'endPrice',
      align: 'right',
      width: 130,
      render: value =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${currencyCode}`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      align: 'right',
      width: 130,
      render: value =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${currencyCode}`,
    },
    {
      title: 'Ödənilib(%)',
      align: 'right',
      width: 130,
      render: ({ endPrice, paidAmount }) =>
      Number(endPrice) ? `${(
          (Number(paidAmount).toFixed(2) * 100) /
          Number(endPrice).toFixed(2)
        ).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'Ödənilməlidir',
      align: 'right',
      width: 130,
      render: ({ endPrice, paidAmount }) =>
        `${formatNumberToLocale(
          (Number(endPrice).toFixed(2) - Number(paidAmount).toFixed(2)).toFixed(
            2
          )
        )} ${currencyCode}`,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 80,
      align: 'right',
      render: (id, row) =>
        row.isTotal ? null : (
            <RecievablesInvoiceAction row={row} type={type} invoiceId={id} />
        ),
    },
  ];
  const componentRef = useRef();
  const getTotalAmounts = invoices => {
    const totalEndPrices = invoices.reduce(
      (all, current) => all + Number(current.endPrice),
      0
    );

    const totalPaidAmount = invoices.reduce(
      (all, current) => all + Number(current.paidAmount),
      0
    );

    return [
      {
        isTotal: true,
        endPrice: totalEndPrices,
        paidAmount: totalPaidAmount,
      },
    ];
  };

  return (
    <div
      ref={componentRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        id="recievablesActionDropDown"
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
              {name}
            </label>

            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',
                color: '#CBCBCB',
              }}
            >
              {type === 'payables-turnover'
                ? 'Kreditor borclar'
                : 'Debitor borclar'}
            </span>
          </div>
        </div>
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
          loading={isLoading}
          scroll={{ x: 'max-content',y:500 }}
          dataSource={invoices}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
        {invoices?.length > 0 && (
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={getTotalAmounts(invoices)}
            className={styles.totalTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.salesAndBuysReducer.isLoading,
});
export default connect(
  mapStateToProps,
  {}
)(OpInvoiceContentTab);
