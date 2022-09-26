import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Affix, Spin } from 'antd';
import { InfoBox, InfoBoxItem } from 'components/Lib';

// actions
import { resetExpenseReport } from 'store/actions/expenseReport';
import {
  fetchOperationsList,
  resetOperationsList,
} from 'store/actions/finance/operations';
// actions
import { fetchInvoiceList } from 'store/actions/operations';
// utils
import { filterQueryResolver } from 'utils';

function Details(props) {
  const {
    // actions
    resetExpenseReport,
    fetchOperationsList,
    resetOperationsList,
    fetchInvoiceList,
    // data
    invoiceList,
    operationsList,
    selectedExpenseItem,
    filters,
    // Affix helper ref
    isLoading,
    invoiceListLoading,
  } = props;

  // reset on will unmount
  useEffect(
    () => () => {
      resetExpenseReport();
      resetOperationsList();
    },
    [resetExpenseReport, resetOperationsList]
  );

  const { expenseItemId, expenseItemName } = selectedExpenseItem || {};

  useEffect(() => {
    if (expenseItemId) {
      let tab = 3;
      let query = expenseItemId;

      if (expenseItemId === 'removedInvoice') {
        tab = 6;
        query = filterQueryResolver(filters);
        fetchInvoiceList({ attribute: { invoiceType: tab, query } });
        return;
      }

      if (expenseItemId === 'salaryPayment') {
        tab = 6;
        query = '';
      }

      fetchOperationsList({
        filters: { tab, expenseItemId: query, ...filters },
      });
    }
  }, [filters, fetchOperationsList, expenseItemId, fetchInvoiceList]);

  let content = null;

  if (!selectedExpenseItem) {
    content = null;
  }

  if (
    expenseItemId === 'removedInvoice' &&
    invoiceList.length &&
    !invoiceListLoading
  ) {
    content = invoiceList.map(item => {
      const text = `${item.invoiceNumber} - ${Number(item.amount).toFixed(
        2
      )} ${item.currencyCode || ''}`;

      return (
        <InfoBoxItem
          key={item.id}
          label={String(item.createdAt).substring(0, 10)}
          text={text}
        />
      );
    });
  }

  if (
    expenseItemId !== 'removedInvoice' &&
    operationsList.length &&
    !isLoading
  ) {
    content = operationsList.map(item => {
      const text = `${item.serialNumber} - ${item.amount} ${item.currencyCode}`;

      return (
        <InfoBoxItem
          key={item.id}
          label={String(item.createdAt).substring(0, 10)}
          text={text}
        />
      );
    });
  }

  return (
    <Affix
      offsetTop={15}
      target={() => document.getElementById('container-area')}
    >
      <div className="infoContainer scrollbar">
        <Spin spinning={isLoading || invoiceListLoading}>
          {selectedExpenseItem && (
            <InfoBox title={expenseItemName}>{content}</InfoBox>
          )}
        </Spin>
      </div>
    </Affix>
  );
}

const mapStateToProps = state => ({
  selectedExpenseItem: state.expenseReportReducer.selectedExpenseItem,
  filters: state.expenseReportReducer.filters,
  operationsList: state.financeOperationsReducer.operationsList,
  isLoading: state.financeOperationsReducer.isLoading,
  invoiceListLoading: !!state.loadings.invoiceList,
  invoiceList: state.salesOperationsReducer.invoiceListNotFiltered[6],
});

export default connect(
  mapStateToProps,
  {
    resetExpenseReport,
    fetchOperationsList,
    resetOperationsList,
    fetchInvoiceList,
  }
)(Details);
