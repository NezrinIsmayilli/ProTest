import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Tooltip } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from '../styles.module.scss';

const Chip = ({ color, label }) => (
  <span
    className={styles.chip}
    style={{
      color,
      backgroundToDownColor: `${color}24`,
    }}
  >
    {label}
  </span>
);
const WhatIsThis = ({ status }) => {
  if (status === 1) return <Chip color="#4E9CDF" label="Açıq" />;
  if (status === 2) return <Chip color="#55AB80" label="Qismən Ödənilib" />;
  if (status === 3) return <Chip color="#55AB80" label="Ödənilib" />;
};

function SalesReportDetails(props) {
  const componentRef = useRef();
  const {
    filters,
    row,
    fetchSalesInvoiceList,
    invoices,
    isLoading,
    mainCurrencyCode,
    type,
  } = props;
  const handleData = invoices => {
    if (invoices.length > 0) {
      return [
        ...invoices.map(invoice => ({
          ...invoice,
          paidInPercentage:
            (roundToDown(invoice.paidAmount || 0) * 100) /
            roundToDown(invoice.endPrice),
          mustPaid:
            roundToDown(invoice.endPrice) -
            roundToDown(invoice.paidAmount || 0),

        })),
      ];
    }
    return [];
  };

  const handleTotalData = invoices => {
    if (invoices.length > 0) {
      const totalendPriceInMainCurrency = invoices.reduce(
        (all, current) => all + roundToDown(current.endPriceInMainCurrency),
        0
      );
      return [
        {
          isTotal: true,
          endPriceInMainCurrency: totalendPriceInMainCurrency,
        },
      ];
    }
    return [];
  };
  useEffect(() => {
    if (
      row &&
      (row.salesman_id || row.client_id || row.stock_from_id || row.catalog_id)
    ) {
      fetchSalesInvoiceList({ filters });
    }
  }, [row, fetchSalesInvoiceList, filters]);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (_, { isTotal }, index) => (isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Müqavilə',
      dataIndex: 'contractNo',
      ellipsis: true,
      width: 100,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'counterparty',
      ellipsis: true,
      width: 100,
      render: (
        value,
        { invoiceTypeNumber, counterpartyName, isVat }
      ) =>
        invoiceTypeNumber === 10 && isVat ? (
            counterpartyName?.length > 10 ? (
                <Tooltip title={counterpartyName}>
                    {counterpartyName.substring(0, 10)}...
                </Tooltip>
            ) : (
                counterpartyName || '-'
            )
        ) : value?.length > 10 ? (
            <Tooltip title={value}>
                {value.substring(0, 10)}...
            </Tooltip>
        ) : (
            value || ''
      ),
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 120,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      width: 120,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Statusu',
      dataIndex: 'paymentStatus',
      width: 120,
      render: (value, { isTotal, endPrice }) =>
      isTotal ? '': (value === 3 && Number(endPrice) === 0) ? '-' : <WhatIsThis status={value} />,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'endPrice',
      width: 120,
      align: 'right',
      render: (value, { currencyCode, isTotal }) =>
        isTotal
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    {
      title: `Məbləğ (${mainCurrencyCode})`,
      dataIndex: 'endPriceInMainCurrency',
      width: 120,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode}`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      width: 120,
      align: 'right',
      render: (value, { currencyCode, isTotal }) =>
        isTotal
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value || 0)
            )} ${currencyCode}`,
    },
    {
      title: 'Ödənilib(%)',
      dataIndex: 'paidInPercentage',
      width: 100,
      align: 'right',
      render: (value, { isTotal }) =>
        isTotal ? '' : `${formatNumberToLocale(defaultNumberFormat(value || 0))}%`,
    },
    {
      title: 'Ödənilməlidir',
      dataIndex: 'mustPaid',
      width: ({ isTotal }) => (isTotal ? 0 : 120),
      align: 'right',
      render: (value, { currencyCode, isTotal }) =>
        isTotal
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 80,
      align: 'right',
      render: (id, row) =>
        row.isTotal ? null : (
          <RecievablesInvoiceAction row={row} invoiceId={id} />
        ),
    },
  ];
  return (
    <div
      ref={componentRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div
        id="recievablesActionDropDown"
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
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
              {type === 'sales-per-sales-managers'
                ? row.salesman_name
                : type === 'sales-per-buyers'
                ? row.client_name
                : row.name}
            </label>
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
          scroll={{ x: 'max-content',y:500 }}
          dataSource={handleData(invoices)}
          loading={isLoading}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
        {invoices.length > 0 && (
          <Table
            dataSource={handleTotalData(invoices)}
            loading={isLoading}
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
  invoices: state.salesAndBuysReducer.invoices,
  isLoading: state.salesAndBuysReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceList }
)(SalesReportDetails);
