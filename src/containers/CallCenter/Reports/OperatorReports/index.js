/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { fetchOperatorReports } from 'store/actions/calls/reports';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can, ProModal } from 'components/Lib';
import { useFilterHandle } from 'hooks';
import { thisMonthStart, thisMonthEnd } from 'utils';
import OperatorSidebar from './Sidebar';
import Table from './Table';
import CallTabs from '../Tabs';
import { LoginLogoutModal } from './loginLogoutModal';
import { OfflineReason } from './offlineReason';

const OperatorReport = props => {
    const { fetchOperatorReports } = props;
    const [customFilter, setCustomFilter] = useState({
        incomingCallsFrom: null,
        incomingCallsTo: null,
        outgoingCallsFrom: null,
        outgoingCallsTo: null,
        missedCallFrom: null,
        missedCallTo: null,
        callTimeFrom: null,
        callTimeTo: null,
        idleFrom: null,
        idleTo: null,
        operator: null,
    });
    const [sortFilter, setSortFilter] = useState([]);
    const [operatorReports, setOperatorReports] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [loginData, setLoginData] = useState([]);
    const [isVisibleOfline, setIsVisibleOfline] = useState(false);
    const [oflineData, setOflineData] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});

    const [pageSize, setPageSize] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, onFilter] = useFilterHandle(
        {
            dateFrom: thisMonthStart,
            dateTo: thisMonthEnd,
            limit: 8,
            page: 1,
        },
        ({ filters }) => {
            fetchOperatorReports({
                filters,
                onSuccessCallback: response => {
                    setOperatorReports(Object.values(response.data));
                },
            });
        }
    );
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
            idleFrom,
            idleTo,
            operator,
        }
    ) => {
        if (
            !Object.values(customFilter).every(x => x === null || x === '') ||
            sortFilter?.length > 0
        ) {
            const newtableDatas = tableData.filter(
                ({ calls, talkTime, activityTime, id }) => {
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
                        (idleFrom !== null
                            ? Number(idleFrom) * 60 <= activityTime
                            : true) &&
                        (idleTo !== null
                            ? Number(idleTo) * 60 >= activityTime
                            : true) &&
                        (operator !== null && operator.length > 0
                            ? operator.includes(id)
                            : true)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
            if (sortFilter.length > 0) {
                if (sortFilter[0].order === 'asc') {
                    newtableDatas.sort(
                        (a, b) =>
                            a[sortFilter[0].orderBy] - b[sortFilter[0].orderBy]
                    );
                }
                if (sortFilter[0].order === 'desc') {
                    newtableDatas.sort(
                        (a, b) =>
                            b[sortFilter[0].orderBy] - a[sortFilter[0].orderBy]
                    );
                }
            }
            return newtableDatas;
        }
        return tableData;
    };

    return (
        <>
            <OperatorSidebar
                operatorReports={operatorReports}
                filters={filters}
                onFilter={onFilter}
                customFilter={customFilter}
                setCustomFilter={setCustomFilter}
            />
            <ProModal
                maskClosable
                padding
                centered
                width={600}
                isVisible={isVisible}
                handleModal={() => setIsVisible(false)}
            >
                <LoginLogoutModal
                    loginData={loginData}
                    selectedRow={selectedRow}
                />
            </ProModal>

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
                    filters={filters}
                    // onFilter={onFilter}
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
                    <Can
                        I={accessTypes.manage}
                        a={permissions.statistics_of_operators}
                    >
                        <ExcelButton
                        // loading={excelFileLoading}
                        // onClick={handleExportReports}
                        />
                    </Can>
                </CallTabs>
                <Table
                    sortFilter={sortFilter}
                    setSortFilter={setSortFilter}
                    filters={filters}
                    onFilter={onFilter}
                    operatorReports={getFilteredData(
                        operatorReports,
                        customFilter
                    )}
                    setIsVisible={setIsVisible}
                    setIsVisibleOfline={setIsVisibleOfline}
                    setLoginData={setLoginData}
                    setOflineData={setOflineData}
                    setSelectedRow={setSelectedRow}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onRow
                />
            </section>
        </>
    );
};

const mapStateToProps = state => ({
    selectedCallDetail: state.internalCallsReducer.selectedCall,
});

export const OperatorReports = connect(
    mapStateToProps,
    {
        fetchOperatorReports,
    }
)(OperatorReport);
