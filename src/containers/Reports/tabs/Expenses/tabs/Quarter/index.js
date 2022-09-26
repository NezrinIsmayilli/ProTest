/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  clearExpenses,
  clearProfitAndLoss,
  fetchProfitByQuarter,
  fetchProfitAndLossInvoices,
  fetchProfitAndLossExpenses,
  fetchProfitAndLossSalary,
} from 'store/actions/reports/expenses';
import { Expenses, ProModal } from 'components/Lib';

import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { quarters } from 'utils';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { filterQueryResolver} from 'utils';
import {fetchSalesReports,} from 'store/actions/reports/sales-report';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

const QuarterProfit = props => {
  const {
    expensesLoading,
    fetchProfitByQuarter,
    clearExpenses,
    tenant,
    clearProfitAndLoss,
    fetchProfitAndLossExpenses,
    fetchMainCurrency,
    expenses,
    mainCurrency,
    businessUnits,
    profile,
  } = props;
  const [modalTitle, setModalTitle] = useState('');

  const [expenseModalIsVisible, setExpenseModalIsVisible] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [tableDataSub, setTableDataSub] = useState([]);
  const [defaultExpand, setDefaultExpand] = useState([]);

  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});

  const [filters, onFilter] = useFilterHandle(
    {
      years: new Date(),
      groupByPeriod: 'quarter',
      groupBy: 'catalog',
      page:   params.page && !isNaN(params.page) ? parseInt(params.page) : 1,
      limit:   params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8,
      isDeleted: params.isDeleted ? params.isDeleted : 0,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
      ( businessUnits?.length === 1
         ? businessUnits[0]?.id !== null
           ? [businessUnits[0]?.id]
           : undefined
         : undefined),
   },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters, years: [filters.years.getFullYear()] });
      console.log(query)
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchSalesReports(filters.type, filters);
      fetchProfitByQuarter({
        filters: { ...filters, years: [filters.years.getFullYear()] },
        onSuccessCallback: response => {
          setTableData(
            response?.data.map(item =>
              item.id ? { ...item, children: [] } : item
            )
          );
        },
      });
    }
  );

  const getDateFrom = month => `01-${month}-${filters.years.getFullYear()}`;

  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(month))
      ? `31-${month}-${filters.years.getFullYear()}`
      : Number(month) === 2
      ? `28-${month}-${filters.years.getFullYear()}`
      : `30-${month}-${filters.years.getFullYear()}`;

  const toggleExpenseModal = () => {
    setExpenseModalIsVisible(prevValue => !prevValue);
  };

  const getFinanceExpenses = (label, id, name, months) => {
    setModalTitle(`${name || '-'} / ${label}`);
    //  eslint-disable-next-line no-unused-expressions
    filters.groupBy === 'catalog'
      ? fetchProfitAndLossExpenses({
          filters: {
            catalog: id,
            dateOfTransactionStart: getDateFrom(months[0]),
            dateOfTransactionEnd: getDateTo(months[months.length - 1]),
            transactionCatalogs: [id],
            bypass: 0,
            limit: 10000,
            businessUnitIds: filters.businessUnitIds,
            excludeProductionExpense: filters.includeProductionExpense
              ? undefined
              : 1,
          },
        })
      : fetchProfitAndLossExpenses({
          filters: {
            catalog: id,
            dateOfTransactionStart: getDateFrom(months[0]),
            dateOfTransactionEnd: getDateTo(months[months.length - 1]),
            transactionCatalogTypes: [id],
            bypass: 0,
            limit: 10000,
            businessUnitIds: filters.businessUnitIds,
            excludeProductionExpense: filters.includeProductionExpense
              ? undefined
              : 1,
          },
        });

    toggleExpenseModal();
  };

  const getFinanceExpensesSub = (label, id, name, months) => {
    setModalTitle(`${name || '-'} / ${label}`);
    //  eslint-disable-next-line no-unused-expressions
    fetchProfitAndLossExpenses({
      filters: {
        catalog: id,
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionItems: [id],
        bypass: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
        excludeProductionExpense: filters.includeProductionExpense
          ? undefined
          : 1,
      },
    });

    toggleExpenseModal();
  };

  const handleDetailClick = (row, selectedQuarter) => {
    const quarter = quarters.find(({ id }) => id === Number(selectedQuarter));
    const { label, months } = quarter;
    const { id, name } = row;
    if (id) {
      getFinanceExpenses(label, id, name, months, selectedQuarter);
    }
  };
  const handleDetailClickSub = (row, selectedQuarter) => {
    const quarter = quarters.find(({ id }) => id === Number(selectedQuarter));
    const { label, months } = quarter;
    const { id, name } = row;
    if (id) {
      getFinanceExpensesSub(label, id, name, months, selectedQuarter);
    }
  };

  useEffect(() => {
    fetchMainCurrency();

    return () => {
      clearProfitAndLoss();
    };
  }, []);
  useEffect(() => {
    if (expenseModalIsVisible === false) clearExpenses();
  }, [expenseModalIsVisible]);

  const collapseRowClick = id => {
    // eslint-disable-next-line no-unused-expressions
    filters.groupBy === 'catalog'
      ? fetchProfitByQuarter({
          filters: {
            catalog: id,
            years: [filters.years.getFullYear()],
            groupByPeriod: 'quarter',
            groupBy: 'item',
            limit: 10000,
            businessUnitIds: filters.businessUnitIds,
            includeProductionExpense: filters.includeProductionExpense
              ? filters.includeProductionExpense
              : undefined,
          },
          onSuccessCallback: response => {
            setTableDataSub(
              tableData.map(item =>
                item.id === id ? { ...item, children: response.data } : item
              )
            );
          },
        })
      : fetchProfitByQuarter({
          filters: {
            catalogType: id,
            years: [filters.years.getFullYear()],
            groupByPeriod: 'quarter',
            groupBy: 'item',
            limit: 10000,
            businessUnitIds: filters.businessUnitIds,
            includeProductionExpense: filters.includeProductionExpense
              ? filters.includeProductionExpense
              : undefined,
          },
          onSuccessCallback: response => {
            setTableDataSub(
              tableData.map(item =>
                item.id === id ? { ...item, children: response.data } : item
              )
            );
          },
        });
  };
  const collapseClick = row => {
    const { id } = row;
    if (id) {
      collapseRowClick(id);
    }
  };

  return (
    <>
      <Sidebar
        onFilter={onFilter}
        filters={filters}
        businessUnits={businessUnits}
        setDefaultExpand={setDefaultExpand}
        setTableDataSub={setTableDataSub}
        profile={profile}
      />

      <ProModal
        maskClosable
        width={1300}
        centered
        padding
        isVisible={expenseModalIsVisible}
        handleModal={toggleExpenseModal}
      >
        <Expenses
          data={expenses}
          tenant={tenant}
          dataLoading={expensesLoading}
          mainCurrency={mainCurrency}
          title={modalTitle}
        />
      </ProModal>

      <section
        id="container-area"
        className="aside scrollbar"
        style={{
          paddingBottom: 100,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 24,
          paddingRight: 32,
          paddingLeft: 32,
        }}
      >
        <Navigation />
        <Table
          defaultExpand={defaultExpand}
          setDefaultExpand={setDefaultExpand}
          tableData={tableData}
          tableDataSub={tableDataSub}
          handleDetailClick={handleDetailClick}
          handleDetailClickSub={handleDetailClickSub}
          collapseClick={collapseClick}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  salesInvoices: state.expenses.invoices,
  invoicesLoading: state.loadings.fetchProfitAndLossInvoices,
  expenses: state.expenses.expenses,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,
  salaryLoading: state.loadings.fetchProfitAndLossSalary,
  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  businessUnits: state.businessUnitReducer.businessUnits,
  profile: state.profileReducer.profile,
});

export const Quarter = connect(
  mapStateToProps,
  {
    clearExpenses,
    clearProfitAndLoss,
    fetchMainCurrency,
    fetchProfitByQuarter,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchProfitAndLossSalary,
  }
)(QuarterProfit);
