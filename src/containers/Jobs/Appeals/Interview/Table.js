import React, { useState, useEffect, Fragment } from 'react';
import { connect, useSelector } from 'react-redux';

// components
import {
  Table,
  DetailButton,
  ProStage,
  ProTooltip,
  ProPageSelect,
  ProPagination,
} from 'components/Lib';
import RenderAvatar from 'containers/Jobs/Shared/render-avatar';
// actions
import {
  resetAppealsData,
  setSelectedAppeal,
} from 'store/actions/jobs/appeals';
import { fetchInterviewById } from 'store/actions/jobs/interview';

import { CgUserList } from 'react-icons/cg';
import { RiFileExcel2Line } from 'react-icons/ri';
import { createSelector } from 'reselect';
import moment from 'moment';
import { Button, Row, Col, Tooltip, Checkbox } from 'antd';
import AppealsPermissionControl from 'containers/Jobs/Shared/AppealsPermissionControl';
import { useAppealsFilters } from '../Sidebar/FiltersContext';
import MoreDetails from '../Shared/MoreDetails';
import InterviewResult from './InterviewResult';
import RejectReason from '../Shared/RejectReason';
import InterviewCalendar from '../Shared/InterviewCalendar';
import RejectReasonAll from '../Shared/RejectReasonAll';

const ExportJsonExcel = require('js-export-excel');

const getAppealsCounts = createSelector(
  state => state.appealsCountsReducer,
  appealsCountsReducer => appealsCountsReducer.counts
);

function InterviewTable(props) {
  const {
    type,
    // actions
    resetAppealsData,
    setSelectedAppeal,
    fetchInterviewById,
    openInterviewResultDrawer,
    // data
    appeals,
    appealsLoading,
    permissionsList,
  } = props;

  const { interview = 0 } = useSelector(getAppealsCounts);

  const {
    onFilter,
    setPageSize,
    setCurrentPage,
    pageSize,
    currentPage,
  } = useAppealsFilters();

  const visualStatuses = {
    0: { id: 'Müsahibə', name: 'new', label: 'Müsahibə', color: '#3b4557' },
  };
  const statuses = [
    { id: 0, name: 'result', label: 'Nəticə', color: '#3b4557' },
    { id: 1, name: 'new', label: 'Vaxtı dəyiş', color: '#f39c12' },
    { id: 2, name: 'reject', label: 'İmtina', color: '#d35400' },
  ];

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 10,
      render: (_value, _row, index) => index + 1,
    },
    {
      title: 'Müsahibə tarixi ',
      dataIndex: 'interview',
      width: 120,
      render: interview =>
        moment(interview.meetAt).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Namizəd ',
      dataIndex: 'person',
      ellipsis: true,
      width: 300,
      render: person => <RenderAvatar person={person} />,
    },

    {
      title: 'Vəzifə',
      dataIndex: 'position',
      key: 'position',
      ellipsis: true,
      width: 150,
      render: position => position.name,
    },
    {
      title: 'Əlaqə telefonu',
      dataIndex: 'person',
      align: 'left',
      width: 200,
      render: person => (
        <div>
          {person.contact ? (
            <>
              {person.contact ? person.contact.mobileNumber : '-'}

              {person.contact.phoneNumber ? (
                <ProTooltip
                  title={
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>
                        {person.contact ? person.contact.phoneNumber : '-'}
                      </span>
                      <span>
                        {person.contact ? person.contact.mobileNumber : '-'}
                      </span>
                    </div>
                  }
                  align="right"
                />
              ) : (
                ' '
              )}
            </>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      title: 'Müsahibə ünvanı ',
      dataIndex: 'interview',
      ellipsis: true,
      width: 200,
      render: interview => interview.address,
    },
    {
      title: 'Şəhər',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: city => city?.name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      align: 'center',
      render(row) {
        return (
          <ProStage
            visualStage={visualStatuses[0]}
            statuses={statuses}
            onChange={newStageId => handleStageChange(newStageId, row)}
            disabled={
              checkList.ItemsChecked ||
              checkList.checkedListAll.length > 0 ||
              permissionsList.projobs_appeals.permission !== 2
            }
          />
        );
      },
    },
    {
      title: 'Ətraflı',
      dataIndex: 'person.id',
      width: 85,
      align: 'center',
      render: row => <DetailButton onClick={() => handleDetailClick(row)} />,
    },
  ];

  if (permissionsList.projobs_appeals.permission !== 1) {
    columns.unshift({
      title: '',
      width: 60,
      dataIndex: 'id',
      render(text, record) {
        return {
          props: {
            style: {
              background: record.isArchived ? 'rgb(240, 240, 240)' : '',
            },
          },
          children:
            record.id === 'isFooter' ? null : (
              <Checkbox
                checked={checkList.checkedListAll.includes(text)}
                onChange={event => handleCheckboxes(record, event)}
              />
            ),
        };
      },
    });
  }
  const [isVisibleDetails, setIsVisibleDetails] = useState(false);
  const [isVisibleResult, setIsVisibleResult] = useState(false);
  const [isVisibleReject, setIsVisibleReject] = useState(false);
  const [isVisibleRejectAll, setIsVisibleRejectAll] = useState(false);
  const [isVisibleInterview, setIsVisibleInterview] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

  const [allArchive, setAllArchive] = useState(true);
  const [checkList, setCheckList] = useState({
    checkedListAll: [],
    ItemsChecked: false,
  });

  // checkbox All checked
  const handleCheckbox = checked => {
    setAllArchive(true);
    let collection = [];
    if (checked) {
      setAllArchive(false);
      collection = getAllItems();
    }
    setCheckList({
      checkedListAll: collection,
      ItemsChecked: checked,
    });
  };
  const getAllItems = () => {
    const collection = [];

    for (const item of appeals[type]) {
      if (item.id !== 'isFooter') collection.push(item.id);
    }

    return collection;
  };
  // checkbox item checked
  const handleCheckboxes = (row, e) => {
    const { checked } = e.target;
    setAllArchive(true);
    if (checked) {
      setAllArchive(false);
      const collection = appeals[type];
      setCheckList(prevState => ({
        checkedListAll: [...prevState.checkedListAll, row.id * 1],
        ItemsChecked: collection.length === prevState.checkedListAll.length + 1,
      }));
    } else {
      setAllArchive(true);
      setCheckList(prevState => ({
        checkedListAll: prevState.checkedListAll.filter(
          item => item !== row.id
        ),
        ItemsChecked: false,
      }));
    }
  };

  // Pagination Change
  const handlePaginationChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  // Pagination Selectbox
  const handlePageSizeChange = (_, size) => {
    setCurrentPage(1);
    setPageSize(size);
    onFilter('page', 1);
    onFilter('limit', size);
  };

  const handleDetailClick = (row, data) => {
    setIsVisibleDetails(true);
    setSelectedRow(row);
    setSelectedAppeal(data);
  };

  const handleStageChange = newStageId => {
    if (newStageId === 0) {
      setIsVisibleResult(true);
    } else if (newStageId === 1) {
      setIsVisibleInterview(true);
    } else if (newStageId === 2) {
      setIsVisibleReject(true);
    }
  };

  // reset all data on willunmount
  useEffect(() => () => resetAppealsData(), [resetAppealsData]);

  // on row click handle

  function onRowClickHandle(data) {
    return {
      onClick: () => {
        setSelectedAppeal(data);

        if (data.type === type && data.typeId) {
          fetchInterviewById(data.typeId, () => {
            openInterviewResultDrawer();
          });
        }
      },
    };
  }

  // Excel Export data
  function exportExcelAll() {
    const option = {};
    let num = 0;
    const dataTable = appeals.interview
      .filter(dataItem => checkList.checkedListAll.includes(dataItem.id))
      .map(dataItem => ({
        Nömrə: (num += 1),
        Tarix: moment(dataItem.createdAt).format('L'),
        Namizəd_adı: dataItem.person.detail.name,
        Namizəd_soyadı: dataItem.person.detail.surname,
        Namizəd_ataAdı: dataItem.person.detail.patronymic,
        Vəzifə: dataItem.position.name,
        Əlaqə_telefonu: dataItem.person.contact
          ? dataItem.person.contact.mobileNumber
          : '-',
        Müsahibə_tarixi: moment(dataItem.interview.meetAt).format(
          'DD-MM-YYYY HH:mm:ss'
        ),
        Müsahibə_ünvanı: dataItem.interview.address,
      }));

    option.fileName = 'Müsahibə';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Nömrə',
          'Tarix',
          'Namizəd_adı',
          'Namizəd_soyadı',
          'Namizəd_ataAdı',
          'Vəzifə',
          'Əlaqə_telefonu',
          'Müsahibə_tarixi',
          'Müsahibə_ünvanı',
        ],
        sheetHeader: [
          '№',
          'Tarix',
          'Namizədin adı',
          'Namizədin soyadı',
          'Namizədin ata adı',
          'Vəzifə',
          'Əlaqə telefonu',
          'Müsahibə tarixi',
          'Müsahibə ünvanı',
        ],
        columnWidths: [5, 5, 10, 10, 10, 10, 10, 20],
      },
    ];

    const toExcel = new ExportJsonExcel(option);

    toExcel.saveExcel();
    setCheckList({
      checkedListAll: [],
      ItemsChecked: false,
    });
    setAllArchive(true);
  }

  return (
    <Fragment>
      <AppealsPermissionControl>
        <div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              margin: '0 20px',
              alignItems: 'center',
            }}
          >
            <Checkbox
              onChange={event => handleCheckbox(event.target.checked)}
              checked={checkList.ItemsChecked}
            />

            <Button
              onClick={() => setIsVisibleRejectAll(true)}
              style={{
                border: 'none',
                background: 'none',
              }}
              disabled={allArchive}
            >
              <Tooltip
                placement="bottom"
                title={`${'Toplu imtina'}${' '}(${
                  checkList.checkedListAll.length
                })`}
              >
                <CgUserList
                  size="30px"
                  style={{
                    marginTop: '-4px',
                  }}
                />
              </Tooltip>
            </Button>
            <Button
              onClick={exportExcelAll}
              style={{
                border: 'none',
                background: 'none',
                paddingLeft: '0',
              }}
              disabled={allArchive}
            >
              <Tooltip
                placement="bottom"
                title={`${'İxrac'}${' '}(${checkList.checkedListAll.length})`}
              >
                <RiFileExcel2Line
                  size="25px"
                  style={{
                    marginTop: '-4px',
                  }}
                />
              </Tooltip>
            </Button>
          </div>
        </div>
      </AppealsPermissionControl>
      <Table
        loading={appealsLoading}
        dataSource={appeals[type]}
        columns={columns}
        rowKey={record => record.id}
        onRow={onRowClickHandle}
      />
      <Row
        style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Col span={8}>
          <ProPagination
            isLoading={appealsLoading}
            current={currentPage}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            total={interview}
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <ProPageSelect
            pageSize={pageSize}
            onChange={e => handlePageSizeChange(currentPage, e)}
            total={interview}
          />
        </Col>
      </Row>
      <MoreDetails
        visible={isVisibleDetails}
        row={selectedRow}
        setIsVisible={setIsVisibleDetails}
      />
      <InterviewResult
        visible={isVisibleResult}
        id={selectedRow}
        setIsVisible={setIsVisibleResult}
      />
      <RejectReason
        visible={isVisibleReject}
        id={selectedRow}
        setIsVisible={setIsVisibleReject}
        type={type}
      />
      <RejectReasonAll
        visible={isVisibleRejectAll}
        id={selectedRow}
        setIsVisible={setIsVisibleRejectAll}
        isCheck={checkList.checkedListAll}
      />
      <InterviewCalendar
        visible={isVisibleInterview}
        id={selectedRow}
        setIsVisible={setIsVisibleInterview}
        type={type}
      />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  appeals: state.appealsReducer.appeals,
  appealsLoading: !!state.loadings.fetchAppeals,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { resetAppealsData, setSelectedAppeal, fetchInterviewById }
)(InterviewTable);
