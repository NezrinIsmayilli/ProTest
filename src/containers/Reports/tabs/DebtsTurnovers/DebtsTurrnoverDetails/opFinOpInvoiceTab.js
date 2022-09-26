/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { MdInfo } from 'react-icons/md';
import styles from '../../styles.module.scss';
import { TableAction } from '../components/TableAction';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';

function OpFinOpInvoiceTab(props) {
  const {
    type,
    name,
    fetchCurrencies,
    currencies,
    financeOperationsIsLoading,
    operationsList,
    fetchBusinessUnitList,
    tenant,
    profile,
    productionInvoices,
  } = props;

  const componentRef = useRef();
  const [total, setTotal] = useState(0);
  const [mainCurrency, setMainCurrency] = useState('');
  const [flag] = useState(false);
  const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);

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
      title: `Məbləğ(${operationsList[0]?.invoiceCurrencyCode ||
        mainCurrency})`,
      dataIndex: 'invoicePaymentAmountConvertedToInvoiceCurrency',
      render: (value, row) => {
        const data = parseFloat(value).toFixed(2);
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
      title: 'Seç',
      dataIndex: 'id',
      align: 'left',
      width: 85,
      render: (value, row) => (
        <TableAction
          allBusinessUnits={allBusinessUnits}
          profile={profile}
          productionInvoices={productionInvoices}
          row={row}
          tenant={tenant}
        />
      ),
    },
  ];
  useEffect(() => {
    fetchBusinessUnitList({
      filters: {},
      onSuccess: res => {
        setAllBusinessUnits(res.data);
      },
    });
  }, []);

  useEffect(() => {
    if (currencies.length === 0) fetchCurrencies();
    else setMainCurrency(currencies.filter(({ isMain }) => isMain)[0]?.code);
  }, [currencies]);

  useEffect(() => {
    if (operationsList.length > 0) {
      let tmp = 0;
      operationsList.map(
        ({ invoicePaymentAmountConvertedToInvoiceCurrency }) =>
          (tmp = Number(invoicePaymentAmountConvertedToInvoiceCurrency) + tmp)
      );
      setTotal(tmp);
    } else {
      setTotal(0);
    }
  }, [operationsList]);
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
          dataSource={operationsList}
          className={styles.invoiceTable}
          loading={financeOperationsIsLoading}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>

      {operationsList.length === 0 ? (
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
          <div style={{ width: 183 }} className={styles.tdPadding} />
          <div style={{ width: 183 }} className={styles.tdPadding} />
          <div style={{ width: 183 }} className={styles.tdPadding} />
          <div
            style={{ width: 200, textAlign: 'right' }}
            className={styles.tdPadding}
          >
            <strong>
              {flag
                ? `-${parseFloat(total).toFixed(2)} ${operationsList[0]
                    ?.invoiceCurrencyCode || mainCurrency}`
                : `${parseFloat(total).toFixed(2)} ${operationsList[0]
                    ?.invoiceCurrencyCode || mainCurrency}`}
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
  tenant: state.tenantReducer.tenant,
  productionInvoices: state.salesAndBuysReducer.invoices,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  {
    fetchCurrencies,
    fetchBusinessUnitList,
  }
)(OpFinOpInvoiceTab);
