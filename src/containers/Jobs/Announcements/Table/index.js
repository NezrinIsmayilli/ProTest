import React, { useState, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';

// components
import {
  Table,
  DetailButton,
  ProPagination,
  ProPageSelect,
} from 'components/Lib';
import Can from 'components/Lib/Can';
import { Avatar, Button, Col, Row, Tooltip } from 'antd';
import { ReactComponent as DownLoad } from 'assets/img/icons/downloadCv.svg';

// actions
import {
  resetAnnouncementsData,
  setSelectedAnnouncement,
} from 'store/actions/jobs/announcements';

// utils
import { permissions, accessTypes } from 'config/permissions';
import Star from './Star';

import { useFilters } from '../FiltersContext';

import styles from './styles.module.scss';
import MoreDetails from '../MoreDetails';
import InterviewCreated from './InterviewCreated';
import CvModal from '../CvModal';

function renderAvatarAndFullName(value, row, id) {
  return (
    <Fragment>
      <Avatar icon="user" src={row.image} className={styles.image} />
      <span title={`${value || ''} ${row.surname || ''}`}>
        {' '}
        {`${value || ''} ${row.surname || ''}`}
      </span>
    </Fragment>
  );
}

function renderInterviewCreated(value, row, id) {
  return (
    <Fragment>
      <InterviewCreated id={id} interviewCreated={row.interviewCreated} />
    </Fragment>
  );
}

const renderSalary = (value, row) => (
  <div className={styles.columnDetailsCv}>
    <>
      {row.minSalary || ''}{' '}
      {!row.minSalary && !row.maxSalary ? '-' : !row.maxSalary ? ' ' : '-'}{' '}
      {row.maxSalary || ''}{' '}
      {row.minSalary && row.maxSalary && row.currency
        ? row.currency.name
        : !row.minSalary && !row.maxSalary
        ? ''
        : 'AZN'}
    </>
  </div>
);

function TableApplicantsFavorites(props) {
  const {
    // data
    announcementsLoading,
    announcements,
    counts,
    // actions
    resetAnnouncementsData,
    setSelectedAnnouncement,
  } = props;

  const {
    onFilter,
    setPageSize,
    setCurrentPage,
    pageSize,
    currentPage,
  } = useFilters();

  const currentURL = window.location.pathname === '/recruitment/announcements';

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleCvModal, setIsVisibleCvModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

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
    setSelectedAnnouncement(data);
  };
  // download Cv modal
  const handleCvClick = (row, data) => {
    setIsVisibleCvModal(true);
  };

  const renderCvDetails = (personData, row) => (
    <div className={styles.columnDetailsCv}>
      <DetailButton onClick={() => handleDetailClick(row)} />
      <Can
        I={accessTypes.manage}
        a={
          currentURL
            ? permissions.projobs_job_seekers
            : permissions.projobs_advertisements
        }
      >
        <Tooltip title="CV yüklə">
          <Button className={styles.button}>
            <DownLoad
              type={DownLoad}
              onClick={() => handleCvClick(row)}
              className={styles.jobsDownloadIcon}
            />
          </Button>
        </Tooltip>
      </Can>
    </div>
  );

  const columns = [
    {
      title: ' ',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id, row) => <Star id={id} bookmarked={row.bookmarked} />,
    },
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_value, _row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Namizəd',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 300,
      align: 'left',
      render: renderAvatarAndFullName,
    },
    {
      title: 'İş elanı',
      dataIndex: 'announcementName',
      key: 'announcementName',
      align: 'left',
      width: 200,
    },
    {
      title: 'Vəzifə',
      dataIndex: 'position.name',
      key: 'position.name',
      align: 'left',
      width: 200,
    },
    {
      title: 'Əməkhaqqı',
      dataIndex: 'salary',
      width: 150,
      align: 'left',
      render: renderSalary,
    },
    {
      title: 'Email',
      dataIndex: 'person.username',
      key: 'person.username',
      align: 'left',
      width: 200,
    },
    {
      title: 'Şəhər',
      dataIndex: 'city.name',
      key: 'city.id',
      align: 'left',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      align: 'center',
      render: renderInterviewCreated,
    },
    {
      title: 'Seç',
      dataIndex: 'person.id',
      align: 'center',
      width: 120,
      render: renderCvDetails,
    },
  ];

  // reset all data on willunmount
  useEffect(() => () => resetAnnouncementsData(), [resetAnnouncementsData]);

  function onRowClickHandle(data) {
    return {
      onClick: () => setSelectedAnnouncement(data),
    };
  }

  return (
    <Fragment>
      <Table
        size="middle"
        loading={announcementsLoading}
        dataSource={announcements}
        className={styles.tableAnnouncements}
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
            isLoading={announcementsLoading}
            current={currentPage}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            total={counts}
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <ProPageSelect
            pageSize={pageSize}
            onChange={e => handlePageSizeChange(currentPage, e)}
            total={counts}
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
  person: state.appealsReducer.person,
  announcements: state.announcementsReducer.announcements,
  announcementLoading: !!state.loadings.fetchAnnouncementById,
  counts: state.announcementsReducer.counts,
});

export default connect(
  mapStateToProps,
  { resetAnnouncementsData, setSelectedAnnouncement }
)(TableApplicantsFavorites);
