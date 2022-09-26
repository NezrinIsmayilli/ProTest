/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState,useEffect } from 'react';
import { connect } from 'react-redux';

import {
  fetchStatusHistoryReports,
  getStatusHistoryCount,
} from 'store/actions/calls/reports';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can } from 'components/Lib';
import { useFilterHandle } from 'hooks';
import { thisMonthStart, thisMonthEnd } from 'utils';
import CallSidebar from './Sidebar';
import Table from './Table';
import CallTabs from '../Tabs';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
const StatusHistoryReport = props => {
  const {
    //   data
    statusHistoryReports,
    // action
    fetchStatusHistoryReports,
    isLoading,
    getStatusHistoryCount,
  } = props;

  const history = useHistory();
  const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

    const [pageSize, setPageSize] = useState(
      params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
      params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );

  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      dateFrom: params.dateFrom? params.dateFrom : thisMonthStart,
      dateTo:params.dateTo? params.dateTo :  thisMonthEnd,
      operators:params.operators ? params.operators :  undefined,
      statuses:params.statuses ? params.statuses :  undefined,
      limit: pageSize,
      page: currentPage,
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if (typeof filters.history === 'undefined') {
          history.push({
              search: query,
          });
      }
      fetchStatusHistoryReports({
        filters,
        onSuccessCallback: response => {
          getStatusHistoryCount({ filters });
        },
      });
    }
  );

  const [rerender, setRerender] = useState(0);
  const popstateEvent = () => {
      setRerender(rerender + 1);
  };

  useEffect(() => {
      window.addEventListener('popstate', popstateEvent);
      return () => window.removeEventListener('popstate', popstateEvent);
  }, [rerender]);

  useEffect(() => {
      const parmas = queryString.parse(location.search, {
          arrayFormat: 'bracket',
      });

      if (rerender > 0) {
          parmas.history = 1;

          if (parmas.page && !isNaN(parmas.page)) {
              setCurrentPage(parseInt(parmas.page));
          }
          setFilters({ ...parmas });
      }
  }, [rerender]);

  const handleChange = value => {
    onFilter('page', value);
		return (() => setCurrentPage(value))();
  };
  return (
    <>
      <CallSidebar
        filters={filters}
        onFilter={onFilter} 
        handleChange={handleChange}
        thisMonthStart={thisMonthStart}
        thisMonthEnd={thisMonthEnd}
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
        <CallTabs>
          <Can I={accessTypes.manage} a={permissions.procall_status_history}>
            <ExcelButton
            // loading={excelFileLoading}
            // onClick={handleExportReports}
            />
          </Can>
        </CallTabs>
        <Table
          filters={filters}
          onFilter={onFilter}
          handleChange={handleChange}
          setPageSize={setPageSize}
          isLoading={isLoading}
          statusHistoryReports={statusHistoryReports}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchStatusHistoryReports,
  statusHistoryReports: state.callReportsReducer.statusHistoryReports,
});

export const StatusHistoryReports = connect(
  mapStateToProps,
  {
    fetchStatusHistoryReports,

    getStatusHistoryCount,
  }
)(StatusHistoryReport);
