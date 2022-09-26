/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { fetchSupervisorReports } from 'store/actions/calls/reports';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can, ProModal } from 'components/Lib';
// import MoreDetails from '../InternalCalls/internalCallDetail';
import Sidebar from './Sidebar';
import Table from './Table';
import CallTabs from '../Tabs';
import { OfflineReason } from './offlineReason';

const SupervisorReport = props => {
  const { fetchSupervisorReports } = props;
  const [supervisorReports, setSupervisorReports] = useState([]);
  const [sortFilter, setSortFilter] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [isVisibleOfline, setIsVisibleOfline] = useState(false);
  const [oflineData, setOflineData] = useState([]);
  const [customFilter, setCustomFilter] = useState({
    incomingCallsFrom: null,
    incomingCallsTo: null,
    outgoingCallsFrom: null,
    outgoingCallsTo: null,
    missedCallFrom: null,
    missedCallTo: null,
    callTimeFrom: null,
    callTimeTo: null,
    operator: null,
    statuses: null,
  });

  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSupervisorReports({
      onSuccessCallback: response => {
        setSupervisorReports(Object.values(response.data));
      },
    });
    const interval = setInterval(() => {
      fetchSupervisorReports({
        onSuccessCallback: response => {
          setSupervisorReports(Object.values(response.data));
        },
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const getFilteredData = (
    tableData,
    {
      incomingCallsFrom,
      incomingCallsTo,
      outgoingCallsFrom,
      outgoingCallsTo,
      missedCallFrom,
      missedCallTo,
      callTimeFrom,
      callTimeTo,
      operator,
      statuses,
    }
  ) => {
    if (
      !Object.values(customFilter).every(x => x === null || x === '') ||
      sortFilter?.length > 0
    ) {
      const newtableDatas = tableData.filter(
        ({ calls, talkTime, id, status }) => {
          if (
            (incomingCallsFrom !== null
              ? Number(incomingCallsFrom) <= calls.incoming.total
              : true) &&
            (incomingCallsTo !== null
              ? Number(incomingCallsTo) >= calls.incoming.total
              : true) &&
            (outgoingCallsFrom !== null
              ? Number(outgoingCallsFrom) <= calls.outgoing.total
              : true) &&
            (outgoingCallsTo !== null
              ? Number(outgoingCallsTo) >= calls.outgoing.total
              : true) &&
            (missedCallFrom !== null
              ? Number(missedCallFrom) <= calls.incoming.missed
              : true) &&
            (missedCallTo !== null
              ? Number(missedCallTo) >= calls.incoming.missed
              : true) &&
            (callTimeFrom !== null
              ? Number(callTimeFrom) * 60 <= talkTime.total
              : true) &&
            (callTimeTo !== null
              ? Number(callTimeTo) * 60 >= talkTime.total
              : true) &&
            (operator !== null && operator.length > 0
              ? operator.includes(id)
              : true) &&
            (statuses !== null && statuses.length > 0
              ? statuses.includes(status)
              : true)
          ) {
            return true;
          }
          return false;
        }
      );
      if (sortFilter?.length > 0) {
        if (sortFilter[0].order === 'asc') {
          newtableDatas.sort((a, b) =>
            sortFilter[0].orderBy === 'talkTime'
              ? a[sortFilter[0].orderBy]?.avg - b[sortFilter[0].orderBy]?.avg
              : a[sortFilter[0].orderBy] - b[sortFilter[0].orderBy]
          );
        }
        if (sortFilter[0].order === 'desc') {
          newtableDatas.sort((a, b) =>
            sortFilter[0].orderBy === 'talkTime'
              ? b[sortFilter[0].orderBy]?.avg - a[sortFilter[0].orderBy]?.avg
              : b[sortFilter[0].orderBy] - a[sortFilter[0].orderBy]
          );
        }
      }
      return newtableDatas;
    }
    return tableData;
  };
  return (
    <>
      <Sidebar
        operatorReports={supervisorReports}
        customFilter={customFilter}
        setCustomFilter={setCustomFilter}
      />
      <ProModal
        maskClosable
        padding
        centered
        width={1200}
        isVisible={isVisibleOfline}
        handleModal={() => setIsVisibleOfline(false)}
      >
        <OfflineReason
          oflineData={oflineData}
          selectedRow={selectedRow}
          pageSize={pageSize}
          setOflineData={setOflineData}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
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
        <CallTabs>
          <Can I={accessTypes.manage} a={permissions.supervisor_panel}>
            <ExcelButton
            // loading={excelFileLoading}
            // onClick={handleExportReports}
            />
          </Can>
        </CallTabs>
        <Table
          supervisorReports={getFilteredData(supervisorReports, customFilter)}
          setSortFilter={setSortFilter}
          sortFilter={sortFilter}
          setSelectedRow={setSelectedRow}
          setOflineData={setOflineData}
          setIsVisibleOfline={setIsVisibleOfline}
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  selectedCallDetail: state.internalCallsReducer.selectedCall,
});

export const SupervisorReports = connect(
  mapStateToProps,
  {
    fetchSupervisorReports,
  }
)(SupervisorReport);
