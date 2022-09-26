import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchOperationsList } from 'store/actions/finance/operations';
import styles from '../../styles.module.scss';
import OpFinOpInvoiceTab from './opFinOpInvoiceTab';
import OpInvoiceContentTab from './opInvoiceContentTab';

function DebtsTurnoverDetails(props) {
  const {
    type,
    filters,
    row,
    selectedCurrency,
    operationsList,
    fetchOperationsList,
    fetchSalesInvoiceList,
    invoices,
    visible,
  } = props;
  const [activeTab, setActiveTab] = useState(0);
  const handleChangeTab = value => setActiveTab(value);
  useEffect(() => {
    if (visible) {
      if (row.id) {
        fetchOperationsList({
          filters: {
            contacts: [row.id],
            transactionTypes: [9],
            currencyId: filters.currencyId,
            vat: 0,
            typeOfOperations: type === 'payables-turnover' ? [-1, 2] : [1, 2],
            dateOfTransactionStart: filters.operationDateStart,
            dateOfTransactionEnd: filters.operationDateEnd,
            businessUnitIds: filters.businessUnitIds,
            excludeZeroAmount: 1,
          },
        });
        fetchSalesInvoiceList({
          filters: {
            contacts: [row.id],
            invoiceTypes: type === 'payables-turnover' ? [1, 3, 10, 12] : [2, 4, 13],
            isDeleted: 0,
            currencyId: filters.currencyId,
            dateFrom: filters.operationDateStart,
            dateTo: filters.operationDateEnd,
            businessUnitIds: filters.businessUnitIds,
            excludeZeroAmount: 1,
          },
        });
      }
    }
  }, [visible]);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpFinOpInvoiceTab
            type={type}
            name={row.contrpartyFullName}
            contractId={row.id}
            operationsList={operationsList}
          />
        );
      case 1:
        return (
          <OpInvoiceContentTab
            type={type}
            name={row.contrpartyFullName}
            currencyCode={selectedCurrency?.code}
            invoices={invoices}
          />
        );
      default:
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
        >
          Borcun azalması ({operationsList.length})
        </Button>
        <Button
          size="large"
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
        >
          Borcun artması ({invoices.length})
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
}
const mapStateToProps = state => ({
  operationsList: state.financeOperationsReducer.operationsList,
  invoices: state.salesAndBuysReducer.invoices,
});

export default connect(
  mapStateToProps,
  { fetchOperationsList, fetchSalesInvoiceList }
)(DebtsTurnoverDetails);
