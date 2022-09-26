/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCurrencies } from 'store/actions/contact';
import { fetchCashboxBalanceReport } from 'store/actions/finance/reports';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks';

import ReportTabs from '../Tabs';
import Table from './Table';
import Sidebar from './Sidebar';

const CashboxBalance = props => {
  const {
    fetchCurrencies,
    currencies,
    fetchCashboxBalanceReport,
    profile,
    fetchBusinessUnitList,
  } = props;
  const [cashBox, setCashBox] = useState([]);
  const [cashBoxCurrencies, setCashBoxCurrencies] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [businessUnitLength, setBusinessUnitLength] = useState(2);

  useEffect(() => {
      fetchBusinessUnitList({
          filters: {
              limit: 10,
              page: 1,
              isDeleted: 0,
              businessUnitIds: profile.businessUnits?.map(({ id }) => id),
          },
          onSuccess: data => {
              setBusinessUnitLength(data.data?.length || 0);
          },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [filters, onFilter] = useFilterHandle(
    {
      cashboxTypes: [],
      cashboxName: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchCashboxBalanceReport({
        filters,
        onSuccessCallback: ({ data }) => {
          setCashBox(Object.values(data?.cashboxes));
          setCashBoxCurrencies(data?.currencies);
        },
      });
    }
  );

  useEffect(() => {
    fetchCurrencies();
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  return (
    <>
      <Sidebar
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
        ajaxBusinessUnitSelectRequest={ajaxBusinessUnitSelectRequest}
        profile={profile}
        businessUnitLength={businessUnitLength}
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
        <ReportTabs />
        <Table
          currencies={currencies}
          cashBox={cashBox}
          cashBoxCurrencies={cashBoxCurrencies}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  currencies: state.currenciesReducer.currencies,
  profile: state.profileReducer.profile,
});

export const CashboxBalanceReport = connect(
  mapStateToProps,
  { fetchCurrencies, fetchCashboxBalanceReport, fetchBusinessUnitList }
)(CashboxBalance);
