import React, { useState, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import { FaCaretUp, FaCaretDown, BsCheckCircle } from 'react-icons/all';
import { Row, Col, Button } from 'antd';
import {
  Table as ProTable,
  ProPagination,
  ProPageSelect,
  DetailButton,
} from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { getBalance, getPaymentsBalance } from 'store/actions/subscription';
import GetBalance from './GetBalance';
import DetailsModal from './DetailsModal';

import styles from './styles.module.scss';

const Table = props => {
  const {
    invoices,
    balance,
    paymentBalance,
    isLoading,
    filters,
    onFilter,
    getBalance,
    getPaymentsBalance,
  } = props;

  const [data, setData] = useState();
  const [balanceModal, setPaymentModal] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    getBalance();
    getPaymentsBalance();
  }, [getBalance, getPaymentsBalance]);

  // table Sort
  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };

  // on row click handle
  function onRowClickHandle(data) {
    return {
      onClick: () => {
        setData(data);
      },
    };
  }
  // Payment Status
  const getPaymentStatus = paymentStatus => {
    switch (paymentStatus) {
      case 1:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#4E9CDF',
              background: '#EAF3FB',
            }}
          >
            Açıq
          </span>
        );
      case 2:
        return (
          <span
            className={styles.chip}
            style={{
              background: '#fdf7ea',
              color: '#f3b753',
            }}
          >
            Qismən ödənilib
          </span>
        );
      case 3:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#55AB80',
              background: '#EBF5F0',
            }}
          >
            Ödənilib
          </span>
        );
      default:
        break;
    }
  };
  //  Status
  const getStatus = status => {
    switch (status) {
      case 1:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#55AB80',
              background: '#EBF5F0',
            }}
          >
            Bağlı
          </span>
        );
      case 2:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#4E9CDF',
              background: '#EAF3FB',
            }}
          >
            Qalır
          </span>
        );
      case 3:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#ee142f',
              background: '#ee142f1c',
            }}
          >
            Gecikir
          </span>
        );
      default:
        break;
    }
  };

  // Total Price
  const getInfoWithTotal = invoiceInfo =>
    invoiceInfo
      ? [
          ...invoiceInfo,
          {
            isLastRow: true,
            price: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.price),
              0
            ),
            balance: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.balance),
              0
            ),
            paidAmount: invoiceInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.paidAmount),
              0
            ),
          },
        ]
      : [];

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      render: (_value, row, index) => (row.isLastRow ? 'Toplam' : index + 1),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Ödəniş tarixi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              cursor="pointer"
              color={
                filters.orderBy === 'startsAt' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('startsAt', 'asc')}
            />
            <FaCaretDown
              cursor="pointer"
              color={
                filters.orderBy === 'startsAt' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('startsAt', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'startsAt',
      render: (value, row) => (row.isLastRow ? '' : value),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'tenantName',
      align: 'center',
      width: 180,
      render: (value, row) => (row.isLastRow ? '' : 'Prospect Cloud ERP'),
    },
    {
      title: 'Qaimə',
      dataIndex: 'serialNumber',
      align: 'center',
      render: (value, row) =>
        row.isLastRow ? '' : `${'ABS'}${new Date().getFullYear()}/${value}`,
    },
    {
      title: 'Ödəniş statusu',
      dataIndex: 'paymentStatus',
      align: 'center',
      width: 150,
      render: (value, row) =>
        row.isLastRow ? '' : getPaymentStatus(row.paymentStatus),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'price',
      align: 'center',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(row.price))} ${'AZN'}`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      align: 'center',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value) || 0)} ${'AZN'}`,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Qalıq</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              cursor="pointer"
              color={
                filters.orderBy === 'balance' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('balance', 'asc')}
            />
            <FaCaretDown
              cursor="pointer"
              color={
                filters.orderBy === 'balance' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('balance', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'balance',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${'AZN'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 150,
      render: (value, row) => (row.isLastRow ? '' : getStatus(row.status)),
    },
    {
      title: 'Seç',
      width: 100,
      align: 'center',
      render: (invoices, row) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DetailButton
            onClick={() => setDetails(true)}
            style={{ height: '30px' }}
          />

          {invoices?.paymentStatus === 3 ? (
            <Button className={styles.checkButton} disabled>
              <BsCheckCircle size={18} style={{ marginTop: '7px' }} />
            </Button>
          ) : (
            <Button
              className={styles.checkButton}
              disabled
              // onClick={() => setPaymentModal(true)}
            >
              <BsCheckCircle size={18} style={{ marginTop: '7px' }} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Fragment>
      <div>
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <div className={styles.Summary} style={{ margin: '20px 0' }}>
            <div className={styles.container}>
              <Row>
                <Col span={12} className={styles.label}>
                  Balans:
                </Col>
                <Col span={12} style={{ textAlign: 'end' }}>
                  <DetailButton
                    onClick={() => setPaymentModal(true)}
                    style={{ height: '30px' }}
                  />
                </Col>
              </Row>
              <span
                className={styles.value}
                style={
                  Number(balance) <= 0 ? { color: 'red' } : { color: 'green' }
                }
              >
                {formatNumberToLocale(defaultNumberFormat(balance))} AZN
              </span>
            </div>
          </div>
        </div>
        <ProTable
          loading={isLoading}
          dataSource={getInfoWithTotal(invoices)}
          columns={columns}
          scroll={{ x: false, y: false }}
          size="default"
          className={styles.invoiceTable}
          onRow={onRowClickHandle}
          rowKey={record => record.id}
        />
      </div>
      <DetailsModal
        data={data}
        visible={details}
        setIsVisible={setDetails}
        filters={filters}
        getPaymentStatus={getPaymentStatus}
        getStatus={getStatus}
      />
      <GetBalance
        data={data}
        invoices={invoices}
        paymentBalance={paymentBalance}
        visible={balanceModal}
        setIsVisible={setPaymentModal}
        filters={filters}
      />
    </Fragment>
  );
};
const mapStateToProps = state => ({
  balance: state.subscriptionReducer.balance,
  paymentBalance: state.subscriptionReducer.paymentBalance,
});

export default connect(
  mapStateToProps,
  {
    getBalance,
    getPaymentsBalance,
  }
)(Table);
