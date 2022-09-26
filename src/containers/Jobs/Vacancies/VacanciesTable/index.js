import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

// components
import {
  Table,
  DetailButton,
  ProPageSelect,
  ProPagination,
} from 'components/Lib';

// actions
import {
  resetVacanciesData,
  setSelectedVacancy,
} from 'store/actions/jobs/vacancies';

// utils
import moment from 'moment';
import { Col, Row } from 'antd';
import VacancyPermissionControl from 'containers/Jobs/Shared/VacancyPermissionControl';
import { useVacanciesFilters } from '../Sidebar/FiltersContext';

import VacancyDetailsModal from '../VacancyDetailsModal';
// styles
import styles from '../vacancies.module.scss';
import { PopContent } from './PopContent';

const getVacancyCounts = createSelector(
  state => state.vacancyCountsReducer,
  vacancyCountsReducer => vacancyCountsReducer.counts
);

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
function VacanciesTable(props) {
  const {
    // actions
    resetVacanciesData,
    setSelectedVacancy,
    // data
    vacanciesLoading,
    changeVacancyStatusLoading,
    deleteVacancyByIdLoading,
    vacancies,
  } = props;

  const { waiting = 0, active = 0, disabled = 0 } = useSelector(
    getVacancyCounts
  );

  const { filters } = useVacanciesFilters();
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
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Vakansiya adı',
      width: 300,
      dataIndex: 'name',
    },
    {
      title: 'Vəzifə',
      width: 300,
      dataIndex: 'position.name',
    },
    {
      title: 'Əməkhaqqı',
      dataIndex: 'salary',
      width: 180,
      align: 'left',
      render: renderSalary,
    },
    {
      title: 'Şəhər',
      width: 150,
      dataIndex: 'city.name',
    },
    {
      title: 'Son müraciət tarixi',
      dataIndex: 'expiredAt',
      width: 200,
      align: 'center',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
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
          <VacancyPermissionControl>
            <PopContent id={row} />{' '}
          </VacancyPermissionControl>
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
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Vakansiya adı',
      width: 300,
      dataIndex: 'name',
    },
    {
      title: 'Vəzifə',
      width: 300,
      dataIndex: 'position.name',
    },
    {
      title: 'Əməkhaqqı',
      dataIndex: 'salary',
      width: 180,
      align: 'center',
      render: renderSalary,
    },
    {
      title: 'Şəhər',
      width: 150,
      dataIndex: 'city.name',
    },
    {
      title: 'Son müraciət tarixi',
      dataIndex: 'expiredAt',
      width: 200,
      align: 'center',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Baxış sayı',
      width: 120,
      align: 'center',
      dataIndex: 'viewsCount',
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
          <VacancyPermissionControl>
            <PopContent id={row} />{' '}
          </VacancyPermissionControl>
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
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Vakansiya adı',
      width: 300,
      dataIndex: 'name',
    },
    {
      title: 'Vəzifə',
      width: 300,
      dataIndex: 'position.name',
    },
    {
      title: 'Əməkhaqqı',
      dataIndex: 'salary',
      width: 180,
      align: 'center',
      render: renderSalary,
    },
    {
      title: 'Şəhər',
      width: 150,
      dataIndex: 'city.name',
    },
    {
      title: 'Son müraciət tarixi',
      dataIndex: 'expiredAt',
      width: 200,
      align: 'center',
      render: value => moment(value).format('DD-MM-YYYY HH:mm:ss'),
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
          <VacancyPermissionControl>
            <PopContent id={row} />
          </VacancyPermissionControl>
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
  } = useVacanciesFilters();

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
    setSelectedVacancy(data);
  };
  // reset all data on willunmount
  useEffect(() => () => resetVacanciesData(), [resetVacanciesData]);

  // on row click handle
  const onRowClickHandle = useCallback(
    data => ({
      onClick: () => setSelectedVacancy(data),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loading =
    vacanciesLoading || changeVacancyStatusLoading || deleteVacancyByIdLoading;

  return (
    <Fragment>
      <Table
        loading={loading}
        dataSource={vacancies}
        columns={
          vacancies[0]?.viewsCount === null || isActive === 3
            ? columns
            : vacancies[0]?.appealsCount === null
            ? columnsViewCountYes
            : columnsViewAppealsCountYes
        }
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
            isLoading={loading}
            current={currentPage}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            total={status === 3 ? waiting : status === 1 ? active : disabled}
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <ProPageSelect
            pageSize={pageSize}
            onChange={e => handlePageSizeChange(currentPage, e)}
            total={status === 3 ? waiting : status === 1 ? active : disabled}
          />
        </Col>
      </Row>
      <VacancyDetailsModal
        visible={isVisible}
        row={selectedRow}
        setIsVisible={setIsVisible}
      />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  vacancies: state.vacanciesReducer.vacancies,
  vacanciesLoading: !!state.loadings.fetchVacancies,
  changeVacancyStatusLoading: !!state.loadings.changeVacancyStatus,
  deleteVacancyByIdLoading: !!state.loadings.deleteVacancyById,
});

export default connect(
  mapStateToProps,
  { resetVacanciesData, setSelectedVacancy }
)(VacanciesTable);
