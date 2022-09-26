import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

// components
import {
  DetailButton,
  ProPageSelect,
  ProPagination,
  ProTooltip,
  Table,
} from 'components/Lib';
import RenderAvatar from 'containers/Jobs/Shared/render-avatar';

import { ReactComponent as DownLoad } from 'assets/img/icons/downloadCv.svg';
import { Button, Checkbox, Col, Row, Tooltip } from 'antd';

// actions
import {
  resetAppealsData,
  setSelectedAppeal,
} from 'store/actions/jobs/appeals';

// utils
import moment from 'moment';
import { RiFileExcel2Line } from 'react-icons/ri';
import CvModal from 'containers/Jobs/Announcements/CvModal';
import AppealsPermissionControl from 'containers/Jobs/Shared/AppealsPermissionControl';
import { useAppealsFilters } from '../Sidebar/FiltersContext';
import MoreDetails from '../Shared/MoreDetails';

import styles from './styles.module.scss';

const ExportJsonExcel = require('js-export-excel');

const getAppealsCounts = createSelector(
  state => state.appealsCountsReducer,
  appealsCountsReducer => appealsCountsReducer.counts
);

function ResultTable(props) {
  const {
    type,
    // actions
    resetAppealsData,
    setSelectedAppeal,
    // data
    appeals,
    appealsLoading,
    permissionsList,
  } = props;

  const { result = 0 } = useSelector(getAppealsCounts);

  const {
    onFilter,
    setPageSize,
    setCurrentPage,
    pageSize,
    currentPage,
  } = useAppealsFilters();

  const [isVisible, setIsVisible] = useState(false);
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
    setIsVisible(true);
    setSelectedRow(row);
    setSelectedAppeal(data);
  };

  // download Cv modal
  const handleCvClick = () => {
    setIsVisibleCvModal(true);
  };
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
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_value, _row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
      title: 'Nəticə',
      dataIndex: 'note',
      width: 200,
      render: note => note[0].description,
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
  // reset all data on willunmount
  useEffect(() => () => resetAppealsData(), [resetAppealsData]);

  // on row click handle
  const onRowClickHandle = useCallback(
    data => ({
      onClick: () => setSelectedAppeal(data),
    }),
    [setSelectedAppeal]
  );

  // Excel Export data
  function exportExcelAll() {
    const option = {};
    let num = 0;
    const dataTable = appeals.result
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
      }));

    option.fileName = 'Nəticə';
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
              onClick={exportExcelAll}
              style={{
                border: 'none',
                background: 'none',
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
            total={result}
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <ProPageSelect
            pageSize={pageSize}
            onChange={e => handlePageSizeChange(currentPage, e)}
            total={result}
          />
        </Col>
      </Row>
      <MoreDetails
        visible={isVisible}
        row={selectedRow}
        setIsVisible={setIsVisible}
      />
      <CvModal visible={isVisibleCvModal} setIsVisible={setIsVisibleCvModal} />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  appeals: state.appealsReducer.appeals,
  canLoadMore: state.appealsReducer.canLoadMore,
  appealsLoading: !!state.loadings.fetchAppeals,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { resetAppealsData, setSelectedAppeal }
)(ResultTable);
