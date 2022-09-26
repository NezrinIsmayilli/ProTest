import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Table, Tooltip } from 'antd';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from './styles.module.scss';

const Invoices = ({
  visible,
  fetchMainCurrency,
  isLoading,
  invoices,
  selectedEmployeeBonuses,
  mainCurrency,
  setIsVisible,
}) => {
  const componentRef = useRef();
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
  useEffect(() => {
    fetchMainCurrency();
  }, []);
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
      width: 120,
      ellipsis: true,
      render: (value, { isTotal }) =>
        isTotal
          ? ''
          : (
              <Tooltip placement="topLeft" title={value || ''}>
                <span>{value || '-'}</span>
              </Tooltip>
            ) || '-',
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 100,
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
      width: 100,
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
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'endPriceInMainCurrency',
      width: 120,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 80,
      align: 'center',
      render: (id, row) =>
        row.isTotal ? null : (
          <RecievablesInvoiceAction row={row} invoiceId={id} />
        ),
    },
  ];
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
  return (
    <Modal
      visible={visible}
      footer={null}
      width={1200}
      closable={false}
      maskClosable
      className={styles.customBonusModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div
        ref={componentRef}
        className={styles.MoreDetails}
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
                Qaimələr
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
            scroll={{ x: 'max-content' }}
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
              scroll={{ x: 'max-content' }}
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
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.salesAndBuysReducer.isLoading,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  { fetchMainCurrency }
)(Invoices);
