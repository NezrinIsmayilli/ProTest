/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { accessTypes, permissions } from 'config/permissions';
import axios from 'axios';
import {
  filterQueryResolver,
  thisMonthStart,
  thisMonthEnd,
  groupByKey,
} from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchAllCashboxNames } from 'store/actions/settings/kassa';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchCurrencies, convertCurrency } from 'store/actions/contact';
import {
  fetchReportCashFlow,
  fetchCashBoxBalanceForPeriod,
} from 'store/actions/finance/reports';
import { fetchAccountBalance } from 'store/actions/finance/operations';
// content
import { Spin } from 'antd';
import { ExcelButton, Can } from 'components/Lib';
import ReportsSidebar from './ReportsSidebar';
import styles from './styles.module.scss';
import SummaryReport from './SummaryReport/summaryReport';
import CashIn from './CashIn/cashIn';
import CashOut from './CashOut/cashOut';
import ReportTabs from '../Tabs';

// eslint-disable-next-line no-unused-vars
function Expenses(props) {
  const {
    allCashBoxNames,
    cashboxLoading,
    fetchCurrencies,
    fetchReportCashFlow,
    fetchCashBoxBalanceForPeriod,
    fetchAllCashboxNames,
    profile,
    fetchBusinessUnitList,
  } = props;

  const endPoint = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_DEV_API_URL;

  // get static data from msk
  useEffect(() => {
    if (currencyId === undefined)
      fetchCurrencies({}, data => {
        onFetchCurrencies(data);
      });
  }, []);
  const [filteredList, setFilteredList] = useState([]);
  const [currency, setCurrency] = useState(undefined);
  const [currencyId, setCurrencyId] = useState(undefined);
  const [loader, setLoader] = useState(false);
  const [sum, setSum] = useState({});
  const [bop, setBop] = useState(undefined);
  const [rop, setRop] = useState(undefined);
  const [eop, setEop] = useState(undefined);
  const [businessUnits, setBusinessUnits] = useState([]);

  const ajaxBusinessUnitSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
      const filters = {
          limit,
          page,
          name: search,
          isDeleted: 0,
          businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      };
      fetchBusinessUnitList({
          filters,
          onSuccess: data => {
              const appendList = [];
              if (data.data) {
                  data.data.forEach(element => {
                      appendList.push({
                          id: element.id,
                          name: element.name,
                          ...element,
                      });
                  });
              }
              if (onSuccessCallback !== undefined) {
                  onSuccessCallback(!appendList.length);
              }
              if (stateReset) {
                  setBusinessUnits(appendList);
              } else {
                  setBusinessUnits(businessUnits.concat(appendList));
              }
          },
      });
  };

  useEffect(() => {
    if (businessUnits) {
        if (businessUnits?.length === 1 && businessUnits[0]?.id !== null) {
            onFilter('businessUnitIds', [businessUnits[0]?.id]);
        }
    }
  }, [businessUnits]);

  // Filters handle
  const [filters, onFilter] = useFilterHandle(
    {
      cashboxId: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
      dateFrom: thisMonthStart,
      dateTo: thisMonthEnd,
    },
    ({ filters }) => {
      if (filters) {
        setLoader(true);
        fetchReportCashFlow({ filters }, onFetchReport);
        fetchCashBoxBalanceForPeriod(
          {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            filters: {
              cashboxId: filters.cashboxId,
              businessUnitIds: filters.businessUnitIds,
            },
          },
          onFetchCashBoxReport
        );
      }
    }
  );
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchAllCashboxNames({ businessUnitIds: filters?.businessUnitIds });
    } else {
      fetchAllCashboxNames();
    }
  }, [filters.businessUnitIds]);
  const onFetchCashBoxReport = data => {
    const tmpData = data.data;
    setBop(tmpData.balanceForBeginningOfThePeriod);
    setRop(tmpData.resultOfThePeriod);
    setEop(tmpData.balanceForTheEndOfPeriod);
    setLoader(false);
  };

  const onFetchReport = data => {
    setFilteredList(data.data);
    calculations.handleCalculation(data.data);
  };

  const onFetchCurrencies = data => {
    const currencies = data.data;
    if (currencies.length !== 0) {
      currencies.forEach(item => {
        if (item.isMain === true) {
          setCurrency(item.code);
          setCurrencyId(item.id);
        }
      });
    }
  };

  const calculations = {
    handleCalculation: reports => {
      let injectSum = {};
      for (let i in reports) {
        injectSum[i] = { sum: 0 };
        const item = reports[i];
        for (let j in item) {
          injectSum[i][j] = { sum: 0 };
          const cashIn = item[j];
          for (let z in cashIn) {
            injectSum[i][j][z] = { sum: 0 };
            if (cashIn[z].items) {
              for (let y of cashIn[z].items) {
                injectSum[i].sum += Number(y.amount);
                injectSum[i][j].sum += Number(y.amount);
                injectSum[i][j][z].sum += Number(y.amount);
              }
            } else {
              injectSum[i][j].sum += Number(cashIn[z].amount);
              injectSum[i].sum += Number(cashIn[z].amount);
            }
          }
        }
      }
      setSum(injectSum);
    },
  };

  // group by type all cashboxnames and memoize
  const groupedByTypeCashboxNames = useMemo(
    () => groupByKey(allCashBoxNames, 'type'),
    [allCashBoxNames]
  );

  const handleExportReports = () => {
    const query = filterQueryResolver(filters);
    axios({
      url: `${endPoint}/transaction/report/cash-flow/export?${query}`,
      method: 'GET',
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cash-flow-report-2020.xlsx');
      document.body.appendChild(link);
      link.click();
    });
  };
  return (
    <>
      <ReportsSidebar
        {...{
          onFilter,
          cashboxLoading,
          groupedByTypeCashboxNames,
          filters,
          businessUnits,
          ajaxBusinessUnitSelectRequest,
          profile,
        }}
      />
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
        <ReportTabs>
          <Can I={accessTypes.manage} a={permissions.expense_report}>
            <ExcelButton onClick={handleExportReports} />
          </Can>
        </ReportTabs>
        <SummaryReport
          loading={loader}
          setRop={setRop}
          setEop={setEop}
          eop={eop}
          rop={rop}
          bop={bop}
          sum={sum}
          currency={currency}
        />
        <div className={styles.cashInOutParent}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Spin spinning={loader}>
              <CashIn
                loading={loader}
                sum={sum}
                currency={currency}
                filteredList={filteredList}
                {...props}
              />
              <CashOut
                loading={loader}
                sum={sum}
                currency={currency}
                filteredList={filteredList}
                {...props}
              />
            </Spin>
          </div>
        </div>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  allCashBoxNames: state.kassaReducer.allCashBoxNames,
  cashboxLoading: state.kassaReducer.isLoading,
  profile: state.profileReducer.profile,
});
export const ExpenseReport = connect(
  mapStateToProps,
  {
    fetchCashBoxBalanceForPeriod,
    fetchCurrencies,
    fetchReportCashFlow,
    fetchAllCashboxNames,
    convertCurrency,
    fetchAccountBalance,
    fetchBusinessUnitList,
  }
)(Expenses);
