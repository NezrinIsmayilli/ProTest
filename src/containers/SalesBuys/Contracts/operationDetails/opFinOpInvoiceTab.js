/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table, Tooltip } from 'antd';
import { MdInfo } from 'react-icons/md';
import { connect } from 'react-redux';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import styles from '../AddContract/forms/#shared/styles.module.scss';
import OpFinOpInvoiceTableAction from './opFinOpInvoiceTableAction';

// const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => {
//   return (
//     <div className={styles.columnDetailItem} style={{ marginLeft: 56 }}>
//       <label
//         style={{
//           marginBottom: gutterBottom ? 12 : 0,
//         }}
//       >
//         {name}
//       </label>

//       {secondary ? <span>{secondary}</span> : children}
//     </div>
//   );
// };

function OpFinOpInvoiceTab(props) {
  const {
    filteredList = [],
    opFinExpenceData,
    fetchCurrencies,
    currencies,
    contractName,
    contractDirection,
    financeOperationsIsLoading,
    currencyCode,
  } = props;
  const componentRef = useRef();
  const [total, setTotal] = useState(0);
  const [, setMainCurrency] = useState('');
  const [flag] = useState(false);
  const columns = [
    {
      title: '№',
      width: 80,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
      width: 100,
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      key: 'dateOfTransaction',
      width: 100,
    },

    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
      width: 100,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 100,
      render: (value, row) => {
        const data = parseFloat(value).toFixed(2);
        return (
          <span>
            {row.operationDirectionName === 'Cash out'
              ? `-${data} ${row.currencyCode}`
              : `${data} ${row.currencyCode}`}
          </span>
        );
      },
    },
    {
      title: `Məbləğ(${opFinExpenceData[0]?.invoiceCurrencyCode ||
        currencyCode})`,
      dataIndex: 'invoicePaymentAmountConvertedToInvoiceCurrency',
      render: (value, row) => {
                const data = parseFloat(
                    opFinExpenceData[0]?.invoiceCurrencyCode ===
                        row.invoiceCurrencyCode ||
                        currencyCode === row.invoiceCurrencyCode
          ? value
          : row.amountConvertedToMainCurrency).toFixed(2);
        return (
          <span
            className={
              row.operationDirectionName === 'Cash out' ? styles.red : ''
            }
          >
            {row.operationDirectionName === 'Cash out'
              ? `${data} ${row.invoiceCurrencyCode}`
              : `${data} ${row.invoiceCurrencyCode}`}
            {/* {row.operationDirectionName === 'Cash out' ? `-${data}` : data} */}
          </span>
        );
      },
      align: 'right',
      width: 160,
    },
    {
      title: 'Ödəniş növü',
      dataIndex: 'paymentTypeName',
      width: 160,
      render: value => <span>{value ? `${value}` : 'Balans'}</span>,
    },
    {
      title: 'Əlavə məlumat',
      dataIndex: 'description',
      align: 'left',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: info => (
        <Tooltip placement="left" title={info}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {info !== null && (
              <MdInfo
                style={{ color: '#464A4B', position: 'absolute', left: 0 }}
                size={20}
              />
            )}
            <p style={{ paddingLeft: 28, marginBottom: 0 }}>{info}</p>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '',
      dataIndex: 'id',
      width: 64,
      align: 'right',
      render: (id, row) => (
        <OpFinOpInvoiceTableAction row={row} productId={id} />
      ),
    },
  ];

  useEffect(() => {
    if (currencies.length === 0) fetchCurrencies();
    else setMainCurrency(currencies.filter(({ isMain }) => isMain)[0].code);
  }, [currencies]);

  useEffect(() => {
    if (opFinExpenceData.length > 0) {
      let tmp = 0;
      opFinExpenceData.map(
        ({ invoicePaymentAmountConvertedToInvoiceCurrency }) =>
          (tmp = Number(invoicePaymentAmountConvertedToInvoiceCurrency) + tmp)
      );
      setTotal(tmp);
    } else {
      setTotal(0);
    }
  }, [opFinExpenceData]);
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
          dataSource={opFinExpenceData}
          className={styles.invoiceTable}
          loading={financeOperationsIsLoading}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>

      {filteredList.length === 0 ? (
        ''
      ) : (
        <div
          style={{
            width: 'calc(100% + 36px)',
            fontSize: 14,
            color: '#7c7c7c',
            lineHeight: '16px',
            display: 'flex',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <div style={{ width: 97 }} className={styles.tdPadding}>
            <strong>Toplam</strong>
          </div>
          <div style={{ width: 148 }} className={styles.tdPadding} />
          <div style={{ width: 148 }} className={styles.tdPadding} />
          <div style={{ width: 148 }} className={styles.tdPadding} />
          <div
            style={{ width: 200, textAlign: 'right' }}
            className={styles.tdPadding}
          >
            <strong>
              {flag
                ? `-${parseFloat(total).toFixed(2)} ${opFinExpenceData[0]
                    ?.invoiceCurrencyCode || currencyCode}`
                : `${parseFloat(total).toFixed(2)} ${opFinExpenceData[0]
                    ?.invoiceCurrencyCode || currencyCode}`}
            </strong>
          </div>
          <div style={{ width: 177 }} className={styles.tdPadding} />
          <div style={{ width: 120 }} className={styles.tdPadding} />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  financeOperationsIsLoading: state.loadings.financeOperations,
  currencies: state.kassaReducer.currencies,
});
export default connect(
  mapStateToProps,
  {
    fetchCurrencies,
  }
)(OpFinOpInvoiceTab);
