/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Table, ProButton } from 'components/Lib';
import { connect } from 'react-redux';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import styles from './styles.module.scss';

const TransactionsModal = props => {
  const {
    header,
    label,
    financeOperations,
    financeOperationsIsLoading,
  } = props;

  const componentRef = useRef();
  const columns = [
    {
      title: '№',
      width: 60,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
      width: 160,
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
      width: 200,
    },
    {
      title: 'Kateqoriya',
      dataIndex: 'categoryName',
      align: 'center',
      width: 100,
    },
    {
      title: 'Alt kateqoriya',
      dataIndex: 'subCategoryName',
      align: 'center',
      width: 140,
    },
    {
      title: 'Məxaric',
      dataIndex: 'amount',
      key: 'cashOut',
      align: 'center',
      width: 160,
      render: (value, { currencyCode, cashInOrCashOut }) =>
        ` ${
          cashInOrCashOut === -1
            ? formatNumberToLocale(defaultNumberFormat(value))
            : '-'
        } ${cashInOrCashOut === -1 ? currencyCode : ''}`,
    },
    {
      title: `Mədaxil`,
      dataIndex: 'amount',
      key: 'cashIn',
      align: 'center',
      width: 160,
      render: (value, { currencyCode, cashInOrCashOut }) =>
        ` ${
          cashInOrCashOut === 1
            ? formatNumberToLocale(defaultNumberFormat(value))
            : '-'
        } ${cashInOrCashOut === 1 ? currencyCode : ''}`,
    },
    {
      title: 'Ödəniş növü',
      dataIndex: 'paymentTypeName',
      align: 'center',
      width: 150,
      render: value => value || 'Balans',
    },
  ];

  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <div className={styles.exportBox}>
        <div className={styles.columnDetailItem}>
          <label
            style={{
              fontWeight: 600,
              fontSize: 24,
              margin: '20px 0',
              color: '#373737',
            }}
          >
            {header}
          </label>

          <span
            style={{
              fontSize: 16,
              marginBottom: 20,
              color: '#CBCBCB',
            }}
          >
            {label}
          </span>
        </div>
        <ReactToPrint
          trigger={() => (
            <ProButton
              className={styles.customSquareButton}
              style={{ marginRight: 10 }}
              shape="circle"
              icon="printer"
            />
          )}
          content={() => componentRef.current}
        />
      </div>

      <Table
        scroll={{ x: 'max-content',y:500 }}
        dataSource={financeOperations}
        loading={financeOperationsIsLoading}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  financeOperationsIsLoading: state.loadings.fetchTransactions,
  currencies: state.kassaReducer.currencies,
});
export default connect(
  mapStateToProps,
  {
    fetchCurrencies,
  }
)(TransactionsModal);
