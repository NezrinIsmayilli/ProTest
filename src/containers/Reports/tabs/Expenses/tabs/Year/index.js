/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  clearExpenses,
  clearProfitAndLoss,
  fetchProfitByYear,
  fetchProfitAndLossInvoices,
  fetchProfitAndLossExpenses,
  fetchProfitAndLossSalary,
} from 'store/actions/reports/expenses';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { Expenses, ProModal } from 'components/Lib';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { filterQueryResolver} from 'utils';
import {fetchSalesReports,} from 'store/actions/reports/sales-report';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

const YearProfit = props => {
  const {
    expensesLoading,
    fetchProfitByYear,
    clearProfitAndLoss,
    clearExpenses,
    tenant,

    fetchProfitAndLossExpenses,
    fetchMainCurrency,
    expenses,
    mainCurrency,

    fetchBusinessUnitList,
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
      years: [new Date()],
      groupByPeriod: 'year',
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
      const query = filterQueryResolver({...filters,
        years: filters.years?.map(item => item.getFullYear())});
      console.log(query)
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchSalesReports(filters.type, filters);
      fetchProfitByYear({
        filters: {
          ...filters,
          years: filters.years?.map(item => item.getFullYear()),
        },
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

  const getDateFrom = year => `01-01-${year}`;
  const getDateTo = year => `31-12-${year}`;

  const toggleExpenseModal = () => {
    setExpenseModalIsVisible(prevValue => !prevValue);
  };

  const getFinanceExpenses = (id, name, year) => {
    setModalTitle(`${name} / ${year}`);
    // eslint-disable-next-line no-unused-expressions
    filters.groupBy === 'catalog'
      ? fetchProfitAndLossExpenses({
          filters: {
            dateOfTransactionStart: getDateFrom(year),
            dateOfTransactionEnd: getDateTo(year),
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
            dateOfTransactionStart: getDateFrom(year),
            dateOfTransactionEnd: getDateTo(year),
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

  const getFinanceExpensesSub = (id, name, year) => {
    setModalTitle(`${name} / ${year}`);
    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
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

  const collapseRowClick = id => {
    // eslint-disable-next-line no-unused-expressions
    filters.groupBy === 'catalog'
      ? fetchProfitByYear({
          filters: {
            catalog: id,
            years: filters.years?.map(item => item.getFullYear()),
            groupByPeriod: 'year',
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
      : fetchProfitByYear({
          filters: {
            catalogType: id,
            years: filters.years?.map(item => item.getFullYear()),
            groupByPeriod: 'year',
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
  const handleDetailClick = (row, selectedYear) => {
    const { id, name } = row;
    if (id) {
      getFinanceExpenses(id, name, selectedYear);
    }
  };

  const handleDetailClickSub = (row, selectedYear) => {
    const { id, name } = row;
    if (id) {
      getFinanceExpensesSub(id, name, selectedYear);
    }
  };

  useEffect(() => {
    fetchMainCurrency();
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
    return () => {
      clearProfitAndLoss();
    };
  }, []);


  useEffect(() => {
    if (expenseModalIsVisible === false) clearExpenses();
  }, [expenseModalIsVisible]);
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
          filters={filters}
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
  profitAndLossSalary: state.expenses.profitAndLossSalary,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,
  salaryLoading: state.loadings.fetchProfitAndLossSalary,
  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export const Year = connect(
  mapStateToProps,
  {
    clearExpenses,
    clearProfitAndLoss,
    fetchMainCurrency,
    fetchProfitByYear,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchProfitAndLossSalary,
    fetchBusinessUnitList,
  }
)(YearProfit);
