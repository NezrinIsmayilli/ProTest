import React, { useState, useEffect, Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
// components
import {
  DetailButton,
  Table,
  ProStage,
  ProTooltip,
  ProPageSelect,
  ProPagination,
} from 'components/Lib';
import { Button, Row, Col, Tooltip, Checkbox } from 'antd';
import { createSelector } from 'reselect';
import { ReactComponent as DownLoad } from 'assets/img/icons/downloadCv.svg';
import RenderAvatar from 'containers/Jobs/Shared/render-avatar';

// actions
import {
  resetAppealsData,
  setSelectedAppeal,
} from 'store/actions/jobs/appeals';
import {
  fetchInterviewById,
  resetInterview,
} from 'store/actions/jobs/interview';

// utils
import moment from 'moment';
import CvModal from 'containers/Jobs/Announcements/CvModal';
import { CgUserList } from 'react-icons/cg';
import { RiFileExcel2Line } from 'react-icons/ri';
import AppealsPermissionControl from 'containers/Jobs/Shared/AppealsPermissionControl';
import { useAppealsFilters } from '../../Sidebar/FiltersContext';

import MoreDetails from '../MoreDetails';
import InterviewCalendar from '../InterviewCalendar';
import RejectReason from '../RejectReason';
import RejectReasonAll from '../RejectReasonAll';
import styles from './styles.module.scss';

const ExportJsonExcel = require('js-export-excel');

const getAppealsCounts = createSelector(
  state => state.appealsCountsReducer,
  appealsCountsReducer => appealsCountsReducer.counts
);

function SharedTable(props) {
  const {
    type,
    // data
    appeals,
    appealsLoading,
    // actions
    resetAppealsData,
    setSelectedAppeal,
    fetchInterviewById,
    resetInterview,
    permissionsList,
  } = props;

  const { new: newCount = 0, wait = 0 } = useSelector(getAppealsCounts);

  const {
    onFilter,
    setPageSize,
    setCurrentPage,
    pageSize,
    currentPage,
  } = useAppealsFilters();

  const renderCvDetails = (person, row) => (
    <div className={styles.columnDetailsCv}>
      <DetailButton onClick={() => handleDetailClick(row)} />
      <AppealsPermissionControl>
        <Tooltip title="CV yüklə">
          <Button className={styles.button}>
            <DownLoad
              type={DownLoad}
              onClick={() => handleCvClick(row)}
              person={person}
              className={styles.jobsDownloadIcon}
            />
          </Button>
        </Tooltip>
      </AppealsPermissionControl>
    </div>
  );

  const visualStatusesNew = {
    0: { id: 'Yeni', name: 'delivery', label: 'aktiv', color: '#2980b9' },
  };

  const statusesNew = [
    { id: 0, name: 'new', label: 'Müsahibəyə dəvət', color: '#2980b9' },
    { id: 1, name: 'reject', label: 'İmtina', color: '#d35400' },
  ];

  const visualStatusesWait = {
    0: { id: 'Gözlənilir', name: 'going', label: 'aktiv', color: '#f39c12' },
  };

  const statusesWait = [
    { id: 0, name: 'new', label: 'Vaxtı dəyiş', color: '#f39c12' },
    { id: 1, name: 'reject', label: 'İmtina', color: '#d35400' },
  ];

  // Appeals/ New tab data
  const columnsNew = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (id, row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 120,
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
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
      ellipsis: true,
      width: 150,
      render: position => position.name,
    },
    {
      title: 'Əlaqə telefonu',
      dataIndex: 'person',
      align: 'left',
      width: 300,
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
      title: 'Email ',
      dataIndex: 'person',
      ellipsis: true,
      width: 200,
      render: person => person.username,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      align: 'center',
      render(row) {
        return (
          <ProStage
            visualStage={
              type === 'new' ? visualStatusesNew[0] : visualStatusesWait[0]
            }
            statuses={type === 'new' ? statusesNew : statusesWait}
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
      title: 'Seç',
      dataIndex: 'person.id',
      align: 'center',
      width: 120,
      render: renderCvDetails,
    },
  ];
  if (permissionsList.projobs_appeals.permission !== 1) {
    columnsNew.unshift({
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
  // Appeals/ Wait tab data
  const columnsWait = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (id, row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 120,
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
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
      title: 'Müsahibə tarixi ',
      dataIndex: 'interview',
      width: 120,
      render: interview =>
        moment(interview.meetAt).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Müsahibə ünvanı ',
      dataIndex: 'interview',
      ellipsis: true,
      width: 200,
      render: interview => interview.address,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      align: 'center',
      render(row) {
        return (
          <ProStage
            visualStage={
              type === 'new' ? visualStatusesNew[0] : visualStatusesWait[0]
            }
            statuses={type === 'new' ? statusesNew : statusesWait}
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
      title: 'Seç',
      dataIndex: 'person.id',
      align: 'center',
      width: 120,
      render: renderCvDetails,
    },
  ];

  if (permissionsList.projobs_appeals.permission !== 1) {
    columnsWait.unshift({
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
  const [isVisibleInterview, setIsVisibleInterview] = useState(false);
  const [isVisibleReject, setIsVisibleReject] = useState(false);
  const [isVisibleRejectAll, setIsVisibleRejectAll] = useState(false);
  const [isVisibleCvModal, setIsVisibleCvModal] = useState(false);
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

  // details modal
  const handleDetailClick = (row, data) => {
    setIsVisibleDetails(true);
    setSelectedRow(row);
    setSelectedAppeal(data);
  };
  // download Cv modal
  const handleCvClick = () => {
    setIsVisibleCvModal(true);
  };

  // Status Stage button
  const handleStageChange = newStageId => {
    if (newStageId === 0) {
      setIsVisibleInterview(true);
    } else if (newStageId === 1) {
      setIsVisibleReject(true);
    }
  };
  // reset all data on willunmount
  useEffect(
    () => () => {
      resetAppealsData();
      resetInterview();
    },
    [resetAppealsData, resetInterview]
  );

  // on row click handle
  function onRowClickHandle(data) {
    return {
      onClick: () => {
        setSelectedAppeal(data);
        if (data.type === 'interview' && type !== 'result') {
          fetchInterviewById(data.typeId);
        }
      },
    };
  }

  // Excel Export data
  function exportExcelAll() {
    const option = {};
    let num = 0;
    const dataTable =
      type === 'new'
        ? appeals.new
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
              Email: dataItem.person.username,
            }))
        : appeals.wait
            .filter(dataItem => checkList.checkedListAll.includes(dataItem.id))
            .map(dataItem => ({
              Nömrə: (num += 1),
              Tarix: moment(dataItem.interview.meetAt).format(
                'DD-MM-YYYY HH:mm:ss'
              ),
              Namizəd_adı: dataItem.person.detail.name,
              Namizəd_soyadı: dataItem.person.detail.surname,
              Namizəd_ataAdı: dataItem.person.detail.patronymic,
              Vəzifə: dataItem.position.name,
              Əlaqə_telefonu: dataItem.person.contact
                ? dataItem.person.contact.mobileNumber
                : '-',
              Email: dataItem.person.username,
            }));

    option.fileName =
      type === 'new' ? 'Yeni müraciətlər' : 'Gözlənilən müraciətlər';
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
          'Email',
        ],
        sheetHeader: [
          '№',
          'Tarix',
          'Namizədin adı',
          'Namizədin soyadı',
          'Namizədin ata adı',
          'Vəzifə',
          'Əlaqə telefonu',
          'Email',
        ],
        columnWidths: [5, 5, 10, 10, 10, 10, 20],
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
        <div className={styles.flexDisplay}>
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
        className={styles.row}
        loading={appealsLoading}
        dataSource={appeals[type]}
        columns={type === 'new' ? columnsNew : columnsWait}
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
            total={type === 'new' ? newCount : wait}
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <ProPageSelect
            pageSize={pageSize}
            onChange={e => handlePageSizeChange(currentPage, e)}
            total={type === 'new' ? newCount : wait}
          />
        </Col>
      </Row>
      <MoreDetails
        visible={isVisibleDetails}
        row={selectedRow}
        setIsVisible={setIsVisibleDetails}
      />
      <InterviewCalendar
        visible={isVisibleInterview}
        id={selectedRow}
        setIsVisible={setIsVisibleInterview}
        type={type}
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
      <CvModal visible={isVisibleCvModal} setIsVisible={setIsVisibleCvModal} />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  person: state.appealsReducer.person,
  appeals: state.appealsReducer.appeals,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    resetAppealsData,
    setSelectedAppeal,
    fetchInterviewById,
    resetInterview,
  }
)(SharedTable);
