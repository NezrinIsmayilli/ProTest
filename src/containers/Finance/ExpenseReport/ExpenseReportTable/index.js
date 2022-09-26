import React, { useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';

import { Table, TableFooter } from 'components/Lib';

// actions
import { setSelectedExpenseItem } from 'store/actions/expenseReport';
import { fetchActiveCurrencies } from 'store/actions/settings/kassa';

function ExpenseReportTable(props) {
  const {
    expenses,
    isLoading,
    fetchActiveCurrencies,
    mainCurrency,
    setSelectedExpenseItem,
  } = props;

  useEffect(() => {
    // get main curency
    if (!mainCurrency.code) {
      fetchActiveCurrencies();
    }
  }, [fetchActiveCurrencies, mainCurrency]);

  const mainCurrencyCode = (mainCurrency && mainCurrency.code) || '';

  // table columns
  const columns = [
    {
      title: '№',
      key: 'expenseItemId',
      render: (_, __, index) => index + 1,
      width: 10,
    },
    {
      title: 'Xərc maddəsi',
      dataIndex: 'expenseItemName',
      key: 'expenseItemName',
    },
    {
      title: `Məbləğ, ${mainCurrencyCode}`,
      dataIndex: 'amount',
      key: 'amount',
      render: value => Number(value).toFixed(2),
    },
  ];

  const overAll = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses]
  );

  // on row click handle
  const onRowClickHandle = useCallback(
    data => ({
      onClick: () => setSelectedExpenseItem(data),
    }),
    [setSelectedExpenseItem]
  );

  return (
    <Table
      loading={isLoading}
      dataSource={expenses}
      columns={columns}
      rowKey={record => record.expenseItemId}
      onRow={onRowClickHandle}
      footer={
        <TableFooter
          mebleg={`${Number(overAll).toFixed(2)} ${mainCurrencyCode}`}
        />
      }
    />
  );
}

const mapStateToProps = state => ({
  isLoading: !!state.loadings.expenseReport,
  expenses: state.expenseReportReducer.expenses,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  {
    fetchActiveCurrencies,
    setSelectedExpenseItem,
  }
)(ExpenseReportTable);
