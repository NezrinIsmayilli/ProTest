import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

// components
import {
  Table,
  DetailButton,
  ProPageSelect,
  ProPagination,
} from 'components/Lib';

// actions
import {
  resetTrainingsData,
  setSelectedTraining,
} from 'store/actions/jobs/training';

// utils
import moment from 'moment';
import { Col, Row } from 'antd';
import TrainingsPermissionControl from 'containers/Jobs/Shared/TrainingsPermissionControl';
import { useTrainingsFilters } from '../Sidebar/FiltersContext';
import TrainingsDetailsModal from '../TrainingsDetailsModal';
import { PopContent } from './PopContent';

const renderPrice = (value, row) => (
  <div>
    <>
      {row.minPrice || ''}{' '}
      {!row.minPrice && !row.maxPrice
        ? 'Ödənişsız'
        : row.minPrice && row.maxPrice === null
        ? ' '
        : row.minPrice === null && row.maxPrice
        ? ' '
        : '-'}{' '}
      {row.maxPrice || ''}{' '}
      {row.minPrice && row.maxPrice && row.currency
        ? row.currency.name
        : !row.minPrice && !row.maxPrice
        ? ''
        : 'AZN'}
    </>
  </div>
);

function TrainingsTable(props) {
  const {
    // actions
    resetTrainingsData,
    setSelectedTraining,
    // data
    trainingsLoading,
    changeVacancyStatusLoading,
    deleteVacancyByIdLoading,
    trainings,
    counts,
  } = props;

  const { filters } = useTrainingsFilters();
  const { status } = filters;

  const isActive = status;

  // Free Paket column
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 66,
      render: (_value, _row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 120,
      align: 'left',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Təlimin adı',
      width: 300,
      align: 'left',
      dataIndex: 'name',
    },
    {
      title: 'Təlimin qiyməti',
      dataIndex: 'free',
      width: 180,
      align: 'center',
      render: renderPrice,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: row => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DetailButton onClick={() => handleDetailClick(row)} />
          <TrainingsPermissionControl>
            <PopContent id={row} />
          </TrainingsPermissionControl>
        </div>
      ),
    },
  ];

  // Standart paket column
  const columnsViewCountYes = [
    {
      title: '№',
      dataIndex: 'id',
      width: 66,
      render: (_value, _row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 120,
      align: 'left',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Təlimin adı',
      width: 300,
      align: 'left',
      dataIndex: 'name',
    },
    {
      title: 'Baxış sayı',
      width: 120,
      align: 'center',
      dataIndex: 'viewsCount',
    },
    {
      title: 'Təlimin qiyməti',
      dataIndex: 'free',
      width: 180,
      align: 'center',
      render: renderPrice,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: row => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DetailButton onClick={() => handleDetailClick(row)} />
          <TrainingsPermissionControl>
            <PopContent id={row} />
          </TrainingsPermissionControl>
        </div>
      ),
    },
  ];
  // Business & Pro Paket column
  const columnsViewAppealsCountYes = [
    {
      title: '№',
      dataIndex: 'id',
      width: 66,
      render: (_value, _row, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 120,
      align: 'left',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Təlimin adı',
      width: 300,
      align: 'left',
      dataIndex: 'name',
    },
    {
      title: 'Baxış sayı',
      width: 120,
      align: 'center',
      dataIndex: 'viewsCount',
    },
    {
      title: 'Müraciət sayı',
      width: 120,
      align: 'center',
      dataIndex: 'appealsCount',
    },
    {
      title: 'Təlimin qiyməti',
      dataIndex: 'free',
      width: 180,
      align: 'center',
      render: renderPrice,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: row => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DetailButton onClick={() => handleDetailClick(row)} />
          <TrainingsPermissionControl>
            <PopContent id={row} />
          </TrainingsPermissionControl>
        </div>
      ),
    },
  ];

  const {
    onFilter,
    setPageSize,
    setCurrentPage,
    pageSize,
    currentPage,
  } = useTrainingsFilters();

  const [isVisible, setIsVisible] = useState(false);
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

  const handleDetailClick = (row, data) => {
    setIsVisible(true);
    setSelectedRow(row);
    setSelectedTraining(data);
  };

  // reset all data on willunmount
  useEffect(() => () => resetTrainingsData(), [resetTrainingsData]);

  // on row click handle
  const onRowClickHandle = useCallback(
    data => ({
      onClick: () => setSelectedTraining(data),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const loading =
    trainingsLoading || changeVacancyStatusLoading || deleteVacancyByIdLoading;

  return (
    <Fragment>
      <Table
        loading={loading}
        dataSource={trainings}
        columns={
          columns[0]?.viewsCount === null || isActive === 3
            ? columns
            : columns[0]?.appealsCount === null
            ? columnsViewCountYes
            : columnsViewAppealsCountYes
        }
        onRow={onRowClickHandle}
        rowKey={record => record.id}
        scroll={{ y: window.innerHeight - 300 }}
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
            isLoading={loading}
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
      <TrainingsDetailsModal
        visible={isVisible}
        row={selectedRow}
        setIsVisible={setIsVisible}
      />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  trainings: state.trainingsReducer.trainings,
  counts: state.trainingsReducer.counts,
  trainingsLoading: !!state.loadings.fetchTrainings,
  changeVacancyStatusLoading: !!state.loadings.changeVacancyStatus,
  deleteVacancyByIdLoading: !!state.loadings.deleteVacancyById,
});

export default connect(
  mapStateToProps,
  { resetTrainingsData, setSelectedTraining }
)(TrainingsTable);
