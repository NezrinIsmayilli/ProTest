/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can, NewButton } from 'components/Lib';
import { Tooltip } from 'antd';
import { useFilterHandle } from 'hooks';
import {
  fetchInternalCalls,
  fetchInternalCallsRecording,
  fetchSelectedCall,
  fetchSelectedCallParticipant,
  getTotalCallCount,
} from 'store/actions/calls/internalCalls';
import {
  VscCallIncoming,
  VscCallOutgoing,
  FcMissedCall,
} from 'react-icons/all';
import { cookies } from 'utils/cookies';
import CallSidebar from './Sidebar';
import MoreDetails from './internalCallDetail';
import Table from './Table';
import AddCall from './AddCall';
import CallTabs from '../Tabs';
import styles from '../styles.module.scss';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
const token = cookies.get('_TKN_CALL_');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
const Internal = props => {
  const {
    fetchInternalCalls,
    fetchSelectedCallParticipant,
    getTotalCallCount,
    fetchSelectedCall,
    selectedCallDetail,
    selectedCallParticipant,
    credential,
  } = props;

  const history = useHistory();
  const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

  const [excelFileLoading, setExcelFileLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(undefined);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const [internalCallData, setInternalCallData] = useState([]);
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [data, setData] = useState([
    {
      id: null,
      record: null,
    },
  ]);
  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      directions:params.directions ? params.directions :  [3],
      dateFrom: params.dateFrom ? params.dateFrom :undefined,
      dateTo: params.dateTo ? params.dateTo : undefined,
      fromNumber:params.fromNumber ? params.fromNumber : undefined,
			toNumber:params.toNumber ? params.toNumber : undefined,
      statusDriection:params.statusDriection ? params.statusDriection : undefined,
      fromOperators:params.fromOperators ? params.fromOperators : [],
			toOperators:params.toOperators ? params.toOperators : [],
      statuses:params.statuses ? params.statuses : [],
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
          setInternalCallData(response.data);
          getTotalCallCount({ filters });
          response.data.map(index =>
            index.recording
              ? fetch(`${url}/recordings/${index.recording?.id}/download`, {
                  method: 'GET',
                  headers: {
                    'X-AUTH-PROTOKEN': token,
                  },
                })
                  .then(response => response.blob())
                  .then(blob => {
                    const objectUrl = window.URL.createObjectURL(blob);
                    setData(prevState => [
                      ...prevState,
                      {
                        id: index.recording?.id,
                        record: objectUrl,
                      },
                    ]);
                  })
              : null
          );
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
      fetchSelectedCallParticipant({ id: selectedCall?.id });
    }
  }, [selectedCall]);
  const getStatus = (value, row) => {
    if (row.status === 1) {
      if (credential?.number == value) {
        return (
          <Tooltip title="Cavablandırılmış">
            <VscCallOutgoing style={{ fontSize: 25, color: '#55ab80' }} />
          </Tooltip>
        );
      }
      return (
        <Tooltip title="Cavablandırılmış">
          <VscCallIncoming style={{ fontSize: 25, color: '#55ab80' }} />
        </Tooltip>
      );
    }
    if (row.status === 2) {
      if (credential?.number == value) {
        if (row.missedReason === 1) {
          return (
            <Tooltip title="Ləğv edilmiş">
              <VscCallOutgoing style={{ fontSize: 25, color: '#55ab80' }} />
            </Tooltip>
          );
        }
        if (row.missedReason === 2) {
          return (
            <Tooltip title="Rədd edilmiş">
              <VscCallOutgoing style={{ fontSize: 25, color: 'red' }} />
            </Tooltip>
          );
        }
        if (row.missedReason === 3) {
          return (
            <Tooltip title="Cavablandırılmamış">
              <VscCallOutgoing style={{ fontSize: 25, color: '#55ab80' }} />
            </Tooltip>
          );
        }
      } else {
        if (row.missedReason === 2) {
          return (
            <Tooltip title="Buraxılmış">
              <FcMissedCall
                className={styles.missedCall}
                style={{ fontSize: 25, color: 'red' }}
              />
            </Tooltip>
          );
        }
        if (row.missedReason !== 2) {
          return (
            <Tooltip title="Buraxılmış">
              <FcMissedCall
                className={styles.missedCall}
                style={{ fontSize: 25, color: 'red' }}
              />
            </Tooltip>
          );
        }
      }
    }
  };
  return (
    <>
      <AddCall visible={modalIsVisible} toggleVisible={setModalIsVisible} />
      <CallSidebar filters={filters} onFilter={onFilter} handleChange={handleChange}/>
      {detailIsVisible && (
        <MoreDetails
          data={data}
          visible={detailIsVisible}
          setIsVisible={setDetailIsVisible}
          selectedCall={selectedCall}
          selectedCallDetail={selectedCallDetail}
          selectedCallParticipant={selectedCallParticipant}
          setSelectedCall={setSelectedCall}
          getStatus={getStatus}
          filter={filters}
          isView="internal"
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
          <div>
            <Can I={accessTypes.manage} a={permissions.internal_calls}>
              <ExcelButton
                style={{ marginRight: '10px' }}
                loading={excelFileLoading}
                // onClick={handleExportReports}
              />
              {/* <NewButton
                onClick={() => setModalIsVisible(true)}
                label="Zəng et"
              /> */}
            </Can>
          </div>
        </CallTabs>
        <Table
          filters={filters}
          onFilter={onFilter}
          getStatus={getStatus}
          handleChange={handleChange}
          currentPage={currentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          internalCallData={internalCallData}
          data={data}
          setSelectedCall={setSelectedCall}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  selectedCallDetail: state.internalCallsReducer.selectedCall,
  selectedCallParticipant: state.internalCallsReducer.selectedCallParticipant,
  credential: state.profileReducer.credential,
});

export const InternalCalls = connect(
  mapStateToProps,
  {
    fetchInternalCalls,
    fetchInternalCallsRecording,
    fetchSelectedCall,
    getTotalCallCount,
    fetchSelectedCallParticipant,
  }
)(Internal);
