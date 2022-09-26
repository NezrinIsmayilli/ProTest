/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
  setOperationsList,
  fetchOperationsList,
} from 'store/actions/finance/operations';
import { Button } from 'antd';
import { convertCurrency } from 'store/actions/settings/kassa';
import { roundToDown } from 'utils';
import styles from './styles.module.scss';
import OpDetailTab from './writeOffDetails/opDetailTab';
import OpFinOpInvoiceTab from './writeOffDetails/opFinOpInvoiceTab';
import OpInvoiceContentTab from './writeOffDetails/opInvoiceContentTab';

const math = require('exact-math');

function OperationsDetails(props) {
  const {
    activeTab,
    setActiveTab,
    visible,
    convertCurrency,
    row,
    fetchSalesInvoiceInfo,
    fetchOperationsList,
    isLoading,
    filteredList,
    mainCurrencyCode,
    setOperationsList,
    tenant,
  } = props;
  const dispatch = useDispatch();
  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoiceLength, setInvoiceLength] = useState(undefined);
  const [rate, setRate] = useState(1);
  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpDetailTab
            isLoading={isLoading}
            details={detailsData}
            tenant={tenant}
          />
        );
      case 1:
        return (
          <OpFinOpInvoiceTab
            row={row}
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
            filteredList={filteredList}
          />
        );
      case 2:
        return (
          <OpInvoiceContentTab
            setInvoiceLength={setInvoiceLength}
            details={detailsData}
            visible={visible}
            isLoading={isLoading}
            tableDatas={tableDatas}
          />
        );
      default:
    }
  };

  useEffect(() => {
    if (detailsData.currencyId && expenses.length > 0) {
      convertCurrency({
        params: {
          fromCurrencyId: expenses[0]?.currencyId,
          toCurrencyId: detailsData.currencyId,
          amount: 1,
          dateTime: detailsData.operationDate,
        },
        onSuccessCallback: ({ data }) => {
          const { rate } = data;
          setRate(roundToDown(Number(rate)) || 1);
        },
      });
    }
  }, [detailsData.currencyId, expenses]);
  useEffect(() => {
    if (!visible) {
      setDetailsData([]);
      setInvoiceLength(undefined);
      dispatch(setOperationsList({ data: [] }));
    }
  }, [visible]);

  useEffect(() => {
    setActiveTab(0);
    if (row.id) {
      fetchSalesInvoiceInfo({
        id: row.id,
        onSuccess: res => {
          if (res.data.invoiceProducts && res.data.invoiceProducts.content)
            setTableDatas([
              ...Object.keys(res.data.invoiceProducts.content).map(
                index => res.data.invoiceProducts.content[index]
              ),
            ]);
          setDetailsData(res.data);
        },
      });
      fetchOperationsList({
        filters: {
          importPurchaseInvoices: [row.id],
        },
        setOperations: false,
        onSuccessCallback: ({ data }) => {
          setExpenses(data);
        },
      });
      if (row.isVat) {
        fetchOperationsList({
          filters: { invoices: [row.id], vat: 1, transactionTypes: [9] },
        });
      } else {
        fetchOperationsList({
          filters: { invoices: [row.id], vat: 0, transactionTypes: [9] },
        });
      }
    }
  }, [row.id, row.isVat]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        // padding: '24px',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
          disabled={isLoading}
        >
          Əlavə məlumat
        </Button>
        {Number(row.endPrice) > 0 ? (
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
            disabled={isLoading}
          >
            Ödəniş əməliyyatları ({filteredList.length})
          </Button>
        ) : null}
        <Button
          size="large"
          type={activeTab === 2 ? 'primary' : ''}
          onClick={() => handleChangeTab(2)}
          disabled={isLoading}
            style={
                !Number(row?.endPrice)
                    ? { border: '1px solid #d9d9d9' }
                    : { borderRadius: 0 }
            }
        >
          Qaimənin tərkibi (
          {invoiceLength ||
            tableDatas.reduce(
              (total, { quantity }) => total + Number(quantity),
              0
            )}
          )
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.financeOperationsReducer.isLoading,
  filteredList: state.financeOperationsReducer.filteredList,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceInfo,
    fetchOperationsList,
    setOperationsList,
    convertCurrency,
  }
)(OperationsDetails);
