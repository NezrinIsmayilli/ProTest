/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { Row, Col, DatePicker } from 'antd';
import { ProSelect,ProAsyncSelect } from 'components/Lib';
import {
  fetchDashboardSummary,
  fetchRecentOperations,
} from 'store/actions/dashboard/finance';
import {
  fetchMainCurrency,
  fetchAllCashboxNames,
} from 'store/actions/settings/kassa';
import { useTranslation } from 'react-i18next';
import { useFilterHandle } from 'hooks';
import moment from 'moment';
import {
  dateFormat,
  thisMonthStart,
  thisMonthEnd,
  thisYearEnd,
  today,
  thisWeekStart,
  thisWeekEnd,
  thisYearStart,
} from 'utils';
// Icons
import { ReactComponent as SalesCost } from 'assets/img/icons/sales-cost.svg';
import { ReactComponent as SalesBenefit } from 'assets/img/icons/sales-benefit.svg';
import { ReactComponent as SalesMargin } from 'assets/img/icons/sales-margin.svg';
import { ReactComponent as DebtIncreasment } from 'assets/img/icons/debt-increasment.svg';
import { ReactComponent as DebtDecreasment } from 'assets/img/icons/debt-decreasment.svg';
import { ReactComponent as Dynamics } from 'assets/img/icons/dynamic.svg';
import { ReactComponent as Expenses } from 'assets/img/icons/expenses.svg';
import { ReactComponent as Income } from 'assets/img/icons/income.svg';
import { ReactComponent as Expenditure } from 'assets/img/icons/expenditure.svg';

import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import styles from './styles.module.scss';
import NavigationButtons from '../NavigationButtons';
import Summary from '../Summary';
import Indicators from '../Indicators';
import RecentOperations from '../RecentOperations';
import SalesFigures from '../SalesFigures';

const { RangePicker } = DatePicker;

const CommerceAndFinance = ({
  fetchDashboardSummary,
  fetchRecentOperations,
  isLoading,
  recentOperationsLoading,
  fetchMainCurrency,
  fetchAllCashboxNames,
  businessUnits,
  mainCurrency,
  profile,
  fetchBusinessUnitList,
}) => {
  const { t } = useTranslation();

  const defaultDates = [
    {
      label: t('dashboard:today'),
      id: 0,
    },
    {
      label: t('dashboard:thisWeek'),
      id: 1,
    },
    {
      label: t('dashboard:thisMonth'),
      id: 2,
    },
    {
      label: t('dashboard:thisYear'),
      id: 3,
    },
  ];
  const summary_types = [
    {
      label: 'dashboard:salesTurnover',
      key: 'salesTotalAmount',
    },
    {
      label: 'dashboard:accountsReceivable',
      key: 'receivablesTotalAmount',
    },
    {
      label: 'dashboard:lenderDebts',
      key: 'payablesTotalAmount',
    },
    {
      label: 'dashboard:expenses',
      key: 'totalExpenses',
    },
  ];

  const summary_details = [
    {
      label: 'dashboard:tradeIndicators',
      data: [
        {
          label: 'dashboard:cost',
          key: 'salesTotalCost',
          icon: <SalesCost width={50} height={50} />,
        },
        {
          label: 'dashboard:profit',
          key: 'salesTotalProfit',
          icon: <SalesBenefit width={50} height={50} />,
        },
        {
          label: 'dashboard:margin',
          key: 'salesTotalMarginPercent',
          icon: <SalesMargin width={50} height={50} />,
        },
      ],
    },
    {
      label: 'dashboard:receivablesDebtIndicators',
      data: [
        {
          label: 'dashboard:receivablesDebtReduction',
          key: 'receivablesDebtReduction',
          icon: <DebtDecreasment width={50} height={50} />,
        },
        {
          label: 'dashboard:receivablesDebtIncreasment',
          key: 'receivablesDebtIncreasment',
          icon: <DebtIncreasment width={50} height={50} />,
        },
        {
          label: 'dashboard:receivablesDynamics',
          key: 'receivablesDynamics',
          icon: <Dynamics width={50} height={50} />,
        },
      ],
    },
    {
      label: 'dashboard:payablesDebtIndicators',
      data: [
        {
          label: 'dashboard:payablesDebtReduction',
          key: 'payablesDebtReduction',
          icon: <DebtDecreasment width={50} height={50} />,
        },
        {
          label: 'dashboard:payablesDebtIncreasment',
          key: 'payablesDebtIncreasment',
          icon: <DebtIncreasment width={50} height={50} />,
        },
        {
          label: 'dashboard:payablesDynamics',
          key: 'payablesDynamics',
          icon: <Dynamics width={50} height={50} />,
        },
      ],
    },
    {
      label: 'dashboard:financialIndicators',
      key: 'finance',
      data: [
        {
          label: 'dashboard:totalCashboxBalance',
          key: 'totalCashboxBalance',
          icon: <Expenses width={50} height={50} />,
        },
        {
          label: 'dashboard:totalCashIn',
          key: 'totalCashIn',
          icon: <Income width={50} height={50} />,
        },
        {
          label: 'dashboard:totalCashOut',
          key: 'totalCashOut',
          icon: <Expenditure width={50} height={50} />,
        },
      ],
    },
  ];
  const [summaries, setSummaries] = useState(summary_types);
  const [defaultDate, setDefaultDate] = useState(2);
  const [summaryDetails, setSummaryDetails] = useState(summary_details);
  const [recentOperations, setRecentOperations] = useState([]);
  const [businessUnitDs, setBusinessUnitDs] = useState([]);
  const [allCashBoxNames, setAllCashBoxNames] = useState([]);
  const [filter, setFilter] = useState({});
  const [filters, onFilter] = useFilterHandle(
    {
      dateFrom: thisMonthStart,
      dateTo: thisMonthEnd,
      cashboxIds: [],
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      updateDashboard(filters);
      fetchRecentOperations({
        filters: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          invoiceTypes: [2],
          isDeleted: 0,
          limit: 1000,
          businessUnitIds: filters.businessUnitIds,
        },
        onSuccessCallback: ({ data }) => {
          setRecentOperations(data);
        },
      });
    }
  );
  const ajaxAllCashboxSelectRequest =(
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
) => {
    const defaultFilters = { limit, page, name: search, types: [1, 2, 3]};
    fetchAllCashboxNames(defaultFilters, data => {
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
            setAllCashBoxNames(appendList);
        } else {
          setAllCashBoxNames(allCashBoxNames.concat(appendList));
        }
    });
};

  const getSummaryDetails = (summaryDetails, allCashBoxNames) =>
    summaryDetails.map(({ label, key, data }) => (
      <Col span={6}>
        <Indicators
          label={t(label)}
          data={data}
          loading={isLoading}
          mainCurrency={mainCurrency}
        >
          {key === 'finance' && (
            <ProAsyncSelect
            selectRequest={ajaxAllCashboxSelectRequest}
              mode="multiple"
              size="middle"
              allowClear
              data={allCashBoxNames}
              valueOnChange={handleFinanceAccountChange}
              style={{
                marginBottom: '0px',
              }}
            />
          )}
        </Indicators>
      </Col>
    ));
  const handleDateRangeChange = data => {
    const [dateFrom, dateTo] = data;
    onFilter('dateFrom', dateFrom.format('DD-MM-YYYY'));
    onFilter('dateTo', dateTo.format('DD-MM-YYYY'));
  };
  const handleDefaultDateChange = defaultDate => {
    setDefaultDate(defaultDate);
    switch (defaultDate) {
      case 0:
        onFilter('dateFrom', today);
        onFilter('dateTo', today);
        break;
      case 1:
        onFilter('dateFrom', thisWeekStart);
        onFilter('dateTo', thisWeekEnd);
        break;
      case 2:
        onFilter('dateFrom', thisMonthStart);
        onFilter('dateTo', thisMonthEnd);
        break;
      case 3:
        onFilter('dateFrom', thisYearStart);
        onFilter('dateTo', thisYearEnd);
        break;
      default:
        break;
    }
  };

  const handleFinanceAccountChange = accountId => {
    onFilter('cashboxIds', accountId);
  };

  useEffect(() => {
    if (filter.dateFrom) {
      fetchRecentOperations({
        filters: filter,
        onSuccessCallback: ({ data }) => {
          setRecentOperations(data);
        },
      });
    }
  }, [filter]);

  const updateDashboard = filters => {
    const { dateFrom, dateTo, cashboxIds, businessUnitIds } = filters;
    fetchDashboardSummary({
      filters: {
        dateFrom,
        dateTo,
        cashboxIds,
        businessUnitIds,
      },
      onSuccessCallback: ({ data }) => {
        const totals = [];
        const summaryDetails = [];
        summary_types.forEach(({ label, key }) =>
          totals.push({
            label,
            value: data[key] || 0,
          })
        );
        summary_details.forEach(({ label, data: fields, key, options }) =>
          summaryDetails.push({
            label,
            options,
            key,
            data: fields.map(({ label, key, icon }) => ({
              label,
              value: data[key] === null ? '0' : data[key],
              icon,
            })),
          })
        );
        setSummaries(totals);
        setSummaryDetails(summaryDetails);
      },
    });
  };

  useEffect(() => {
    fetchMainCurrency();
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);
  useEffect(() => {
    fetchAllCashboxNames({
      types: [1, 2, 3],
      businessUnitIds: filters.businessUnitIds,
    });
  }, [filters.businessUnitIds]);

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
              setBusinessUnitDs(appendList);
            } else {
              setBusinessUnitDs(businessUnitDs.concat(appendList));
            }
        },
    });
  };

  const SalesFigure=useMemo(()=>
  <SalesFigures dateFrom={filters.dateFrom}
  dateTo={filters.dateTo}
  businessUnitIds={filters.businessUnitIds}
  data={[]}
  setFilter={setFilter}
  />,[filters.businessUnitIds,filters.dateTo,filters.dateFrom]);


  return (
    <div className={styles.Commerce}>
      <NavigationButtons>
        <Row gutter={32} type="flex" align="bottom">
          <Col span={9}>
            {businessUnits?.length === 1 &&
              profile.businessUnits.length === 0 ? null : (
              <div className={styles.sidebarItem}>
                <span className={styles.sectionName}>Biznes blok</span>
                <ProAsyncSelect
                  maxTagCount={2}
                  mode="multiple"
                  selectRequest={ajaxBusinessUnitSelectRequest}
                  size="middle"
                  valueOnChange={values => onFilter('businessUnitIds', values)}
                  value={
                    businessUnits?.length === 1
                      ? businessUnits[0]?.id === null
                        ? businessUnits[0]?.name
                        : businessUnits[0]?.id
                      : filters.businessUnitIds
                  }
                  disabled={businessUnits?.length === 1}
                  data={businessUnitDs?.map(item =>
                    item.id === null ? { ...item, id: 0 } : item
                  )}
                  disabledBusinessUnit={businessUnits?.length === 1}
                />
              </div>
            )}
          </Col>
          <Col span={10}>
            <RangePicker
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginBottom: '5px',
              }}
              placeholder={['Başlağınc tarix', 'Son tarix']}
              allowClear={false}
              value={[
                moment(filters.dateFrom, dateFormat),
                moment(filters.dateTo, dateFormat),
              ]}
              format={dateFormat}
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col span={5}>
            <ProSelect
              size="middle"
              allowClear={false}
              value={defaultDate}
              data={defaultDates}
              keys={['label']}
              onChange={handleDefaultDateChange}
            />
          </Col>
        </Row>
      </NavigationButtons>
      <Row gutter={32} type="flex" align="middle">
        {summaries.map(({ label, value }) => (
          <Col span={6}>
            <Summary
              label={t(label)}
              value={value}
              loading={isLoading}
              mainCurrency={mainCurrency}
            />
          </Col>
        ))}
      </Row>
      <Row gutter={32} type="flex" align="middle">
        {getSummaryDetails(summaryDetails, allCashBoxNames)}
      </Row>
      <Row gutter={32} type="flex">
        <Col span={16}>
          <RecentOperations
            data={recentOperations}
            dataLoading={recentOperationsLoading}
            mainCurrency={mainCurrency}
          />
        </Col>
        <Col span={8}>
         
       {SalesFigure}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchDashboardSummary,
  recentOperationsLoading: state.loadings.fetchRecentOperations,
  mainCurrency: state.kassaReducer.mainCurrency,
  allCashBoxNames: state.kassaReducer.allCashBoxNames,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    fetchDashboardSummary,
    fetchRecentOperations,
    fetchMainCurrency,
    fetchAllCashboxNames,
    fetchBusinessUnitList,
  }
)(CommerceAndFinance);
