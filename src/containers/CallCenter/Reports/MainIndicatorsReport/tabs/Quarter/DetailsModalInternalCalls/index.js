/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can } from 'components/Lib';
import { useFilterHandle } from 'hooks';
import moment from 'moment';
import 'moment-timezone';
import {
  getTotalCallInternalCount,
  fetchCallsInternal,
} from 'store/actions/calls/reports';
import { fetchSelectedCall } from 'store/actions/calls/internalCalls';
import MoreDetails from './internalCallDetail';
// import CallSidebar from './Sidebar';
import Table from './Table';
// import CallTabs from '../Tabs';

const InternalCalls = props => {
  const {
    calls,
    title,
    filters,
    modalName,
    selectedCallDetail,
    fetchCallsInternal,
    fetchSelectedCall,
    getTotalCallInternalCount,
    monthState,
  } = props;
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState(undefined);
  const [detailIsVisible, setDetailIsVisible] = useState(false);

  const getDateFrom = month => `01-${month}-${filters.years.getFullYear()}`;
  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(month))
      ? `31-${month}-${filters.years.getFullYear()}`
      : Number(month) === 2
      ? `28-${month}-${filters.years.getFullYear()}`
      : `30-${month}-${filters.years.getFullYear()}`;

  const [filterss, onFilter] = useFilterHandle(
    {
      dateFrom: moment().format('DD-MM-YYYY'),
      dateTo: moment().format('DD-MM-YYYY'),
      limit: pageSize,
      page: currentPage,
    },
    ({ filterss }) => {
      // eslint-disable-next-line no-unused-expressions
      modalName === '60 saniyə içərisində cavablandırılmış zənglər'
        ? fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [1],
              queueTimeFrom: 0,
              queueTimeTo: 60,
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [1],
                  queueTimeFrom: 0,
                  queueTimeTo: 60,
                },
              });
            },
          })
        : modalName === '30 saniyə içərisində cavablandırılmış zənglər'
        ? fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [1],
              queueTimeFrom: 0,
              queueTimeTo: 30,
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [1],
                  queueTimeFrom: 0,
                  queueTimeTo: 30,
                },
              });
            },
          })
        : modalName === 'Cavablandırılmış zənglər'
        ? fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [1],
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [1],
                },
              });
            },
          })
        : modalName === 'Buraxılmış zənglər'
        ? fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [1],
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [1],
                },
              });
            },
          })
        : modalName === 'İtirilmiş zənglər'
        ? fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,

              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              callbackStatuses: [1],
              statuses: [2],
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  callbackStatuses: [1],
                  statuses: [2],
                },
              });
            },
          })
        : fetchCallsInternal({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(monthState),
              dateFromTo: getDateTo(monthState),
              groupBy: 'contact',
              statuses: [2],
              callbackStatuses: [2, 3],
            },
            onSuccessCallback: response => {
              getTotalCallInternalCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(monthState),
                  dateFromTo: getDateTo(monthState),
                  groupBy: 'contact',
                  statuses: [2],
                  callbackStatuses: [2, 3],
                },
              });
            },
          });
    }
  );

  useEffect(() => {
    if (selectedCall) {
      setDetailIsVisible(true);
      fetchSelectedCall({ id: selectedCall?.id });
    }
  }, [selectedCall]);

  return (
    <>
      {detailIsVisible && (
        <MoreDetails
          visible={detailIsVisible}
          setIsVisible={setDetailIsVisible}
          selectedCall={selectedCall}
          selectedCallDetail={selectedCallDetail}
          setSelectedCall={setSelectedCall}
          filter={filters}
          isView="missed"
        />
      )}
      <div>
        <h3>{title}</h3>
      </div>
      <Table
        filters={filters}
        onFilter={onFilter}
        calls={calls}
        pageSize={pageSize}
        currentPage={currentPage}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        setSelectedCall={setSelectedCall}
      />
    </>
  );
};

const mapStateToProps = state => ({
  selectedCallDetail: state.internalCallsReducer.selectedCall,
});

export default connect(
  mapStateToProps,
  {
    getTotalCallInternalCount,
    fetchCallsInternal,
    fetchSelectedCall,
  }
)(InternalCalls);
