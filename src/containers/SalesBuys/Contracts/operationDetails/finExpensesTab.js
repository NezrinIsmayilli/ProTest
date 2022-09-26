/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table } from 'antd';
import { connect } from 'react-redux';
import { convertCurrency } from 'store/actions/settings/kassa';
import styles from '../AddContract/forms/#shared/styles.module.scss';
import OpFinOpInvoiceTableAction from './opFinOpInvoiceTableAction';
import CashboxInfoButton from './CashboxInfoButton';

function FinExpensesTab(props) {
  const {
    finExpenceData,
    opFinExpenceData,
    contractName,
    contractDirection,
    financeOperationsIsLoading,
    convertCurrency,
    contract,
  } = props;
  const componentRef = useRef();

  const columns = [
    {
      title: '№',
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
    },
    {
      title: 'Xərc maddəsi',
      dataIndex: 'transactionCatalogName',
    },
    {
      title: 'Xərcin adı',
      dataIndex: 'transactionItemName',
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'contactOrEmployee',
    },

    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'right',
      render: (value, row) => {
        const data = parseFloat(value).toFixed(2);
        return (
          <span style={{ color: '#FF716A' }}>
            {'-'}
            {data} {row.currencyCode}
          </span>
        );
      },
    },
    {
      title: `Məbləğ(${contract?.currency_code})`,
      dataIndex: 'amount',
      align: 'center',
      render: (value, row) => (
        <CashboxInfoButton
          fetchInfo={callback =>
            convertCurrency({
              params: {
                fromCurrencyId: row?.currencyId,
                toCurrencyId: contract?.currency_id,
                amount: value,
                dateTime: row?.dateOfTransaction,
              },

              onSuccessCallback: ({ data }) => {
                callback(data);
              },
            })
          }
        />
      ),
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 64,
      align: 'right',
      render: (id, row) => (
        <OpFinOpInvoiceTableAction row={row} productId={id} />
      ),
    },
  ];

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
              {contractName}
            </label>

            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',

                color: '#CBCBCB',
              }}
            >
              {contractDirection === 1 ? 'Alış' : 'Satış'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ReactToPrint
            trigger={() => (
              <Button
                className={styles.customSquareButton}
                style={{ marginRight: 10 }}
                shape="circle"
                icon="printer"
              />
            )}
            content={() => componentRef.current}
          />

          <Button
            className={styles.customSquareButton}
            shape="circle"
            icon="file-excel"
          />
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
          dataSource={finExpenceData}
          loading={financeOperationsIsLoading}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  financeOperationsIsLoading: state.loadings.financeOperationsForFin,
});
export default connect(
  mapStateToProps,
  {
    convertCurrency,
  }
)(FinExpensesTab);
