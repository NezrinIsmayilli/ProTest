/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  fetchInternalCalls,
  fetchSelectedCall,
  getTotalCallCount,
} from 'store/actions/calls/internalCalls';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can } from 'components/Lib';
import { useFilterHandle } from 'hooks';
import MoreDetails from '../InternalCalls/internalCallDetail';
import CallSidebar from './Sidebar';
import Table from './Table';
import CallTabs from '../Tabs';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
const Missed = props => {
  const {
    fetchInternalCalls,
    fetchSelectedCall,
    selectedCallDetail,
    getTotalCallCount,
  } = props;

  const history = useHistory();
  const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
  const [excelFileLoading, setExcelFileLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(undefined);
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [missedCallData, setMissedCallData] = useState([]);
  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      directions:params.directions ? params.directions : [1],
      statuses:params.statuses ? params.statuses : [2],
      dateFrom: params.dateFrom ? params.dateFrom :undefined,
      dateTo: params.dateTo ? params.dateTo : undefined,
      fromNumber:  params.fromNumber ? params.fromNumber :undefined,
      toNumber: params.toNumber ? params.toNumber : undefined,
      fromOperators:params.fromOperators ? params.fromOperators :  [],
      toOperators:params.toOperators ? params.toOperators :  [],
      callbackStatuses:params.callbackStatuses ? params.callbackStatuses :undefined,
      isWorkingTime:params.isWorkingTime ? params.isWorkingTime :undefined,
      prospectContacts:params.prospectContacts ? params.prospectContacts :undefined,
      waitTimeFrom:params.waitTimeFrom ? params.waitTimeFrom :  null,
      waitTimeTo:params.waitTimeTo ? params.waitTimeTo :  null,
      ivrs:params.ivrs ? params.ivrs :undefined,
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
      fetchInternalCalls({
        filters,
        onSuccessCallback: response => {
          setMissedCallData(response.data);
          getTotalCallCount({ filters });
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
  useEffect(() => {
    if (selectedCall) {
      setDetailIsVisible(true);
      fetchSelectedCall({ id: selectedCall?.id });
    }
  }, [selectedCall]);
  return (
    <>
      <CallSidebar 
      filters={filters}
       onFilter={onFilter}
       handleChange={handleChange}
        />
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
          <Can I={accessTypes.manage} a={permissions.missed_calls}>
            <ExcelButton
            // loading={excelFileLoading}
            // onClick={handleExportReports}
            />
          </Can>
        </CallTabs>
        <Table
          handleChange={handleChange}
          setPageSize={setPageSize}
          currentPage={currentPage}
          pageSize={pageSize}
          filters={filters}
          onFilter={onFilter}
          setSelectedCall={setSelectedCall}
          missedCallData={missedCallData}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  selectedCallDetail: state.internalCallsReducer.selectedCall,
});

export const MissedCalls = connect(
  mapStateToProps,
  {
    fetchInternalCalls,
    fetchSelectedCall,
    getTotalCallCount,
  }
)(Missed);
