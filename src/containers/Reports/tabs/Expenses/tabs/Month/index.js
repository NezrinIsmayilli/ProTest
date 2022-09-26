/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  fetchProfitByMonth,
  fetchProfitAndLossInvoices,
  fetchProfitAndLossExpenses,
  clearProfitAndLoss,
  clearExpenses,
} from 'store/actions/reports/expenses';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { Expenses, ProModal } from 'components/Lib';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';

import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { months } from 'utils';
import { currentMonth } from 'utils/constants';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { filterQueryResolver} from 'utils';
import {fetchSalesReports,} from 'store/actions/reports/sales-report';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

const MonthProfit = props => {
  const {
    expensesLoading,
    fetchProfitByMonth,
    clearProfitAndLoss,
    clearExpenses,
    tenant,
    fetchMainCurrency,
    fetchProfitAndLossExpenses,
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
      years: new Date(),
      months: [currentMonth],
      groupByPeriod: 'month',
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
      const query = filterQueryResolver( { ...filters, years: [filters.years.getFullYear()] });
      console.log(query)
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchSalesReports(filters.type, filters);

      fetchProfitByMonth({
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

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);


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

  const getFinanceExpenses = (label, id, name, month) => {
    setModalTitle(`${name || '-'} / ${label}`);
    // eslint-disable-next-line no-unused-expressions
    filters.groupBy === 'catalog'
      ? fetchProfitAndLossExpenses({
          filters: {
            dateOfTransactionStart: getDateFrom(month),
            dateOfTransactionEnd: getDateTo(month),
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
            dateOfTransactionStart: getDateFrom(month),
            dateOfTransactionEnd: getDateTo(month),
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

  const getFinanceExpensesSub = (label, id, name, month) => {
    setModalTitle(`${name || '-'} / ${label}`);
    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
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
      ? fetchProfitByMonth({
          filters: {
            catalog: id,
            years: [filters?.years.getFullYear()],
            months: filters.months,
            groupByPeriod: 'month',
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
      : fetchProfitByMonth({
          filters: {
            catalogType: id,
            years: [filters?.years.getFullYear()],
            months: filters.months,
            groupByPeriod: 'month',
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

  const handleDetailClick = (row, selectedMonth) => {
    const month = months.find(({ id }) => id === Number(selectedMonth));
    const { label } = month;
    const { id, name } = row;
    if (id) {
      getFinanceExpenses(label, id, name, selectedMonth);
    }
  };
  const handleDetailClickSub = (row, selectedMonth) => {
    const month = months.find(({ id }) => id === Number(selectedMonth));
    const { label } = month;
    const { id, name } = row;
    if (id) {
      getFinanceExpensesSub(label, id, name, selectedMonth);
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

  return (
    <>
      <Sidebar
        setDefaultExpand={setDefaultExpand}
        setTableDataSub={setTableDataSub}
        onFilter={onFilter}
        filters={filters}
        businessUnits={businessUnits}
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
          dataLoading={expensesLoading}
          tenant={tenant}
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
  profitAndLossReport: state.expenses.profitByMonth,
  expenses: state.expenses.expenses,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,

  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  businessUnits: state.businessUnitReducer.businessUnits,
  profile: state.profileReducer.profile,
});

export const Month = connect(
  mapStateToProps,
  {
    clearProfitAndLoss,
    clearExpenses,
    fetchProfitByMonth,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchMainCurrency,
    fetchBusinessUnitList,
  }
)(MonthProfit);
