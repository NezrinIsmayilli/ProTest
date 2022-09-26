import React, { useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import { useFilterHandle } from 'hooks';

import {
  fetchCalls,
  fetchCallsCount,
} from 'store/actions/calls/reports';

import { ProPageSelect, ProPagination, Table } from 'components/Lib';
import { Row, Col, Tooltip } from 'antd';
import styles from './styles.module.scss';

function UnverifiedCalls(props) {
  const {
    calls,
    actionLoading,

    filters,
    callCount,
    // pageSize,
    // currentPage,
    modalName,
    fetchCalls,
    // setCurrentPage,
    // setPageSize,
    fetchCallsCount,
  } = props;

  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const getDateFrom = month => `01-${month}-${filters.years.getFullYear()}`;
  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(month))
      ? `31-${month}-${filters.years.getFullYear()}`
      : Number(month) === 2
      ? `28-${month}-${filters.years.getFullYear()}`
      : `30-${month}-${filters.years.getFullYear()}`;

  const [filterss, onFilter] = useFilterHandle(
    {
      dateFrom: moment().format('DD-MM-YYYY'),
      dateTo: moment().format('DD-MM-YYYY'),
      limit: pageSize,
      page: currentPage,
    },
    ({ filterss }) => {
      // eslint-disable-next-line no-unused-expressions
      modalName === 'Unikal müştəri sayı'
        ? fetchCalls({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(filters.months),
              dateFromTo: getDateTo(filters.months),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
            },
            onSuccessCallback: response => {
              fetchCallsCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(filters.months),
                  dateFromTo: getDateTo(filters.months),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                },
              });
            },
          })
        : modalName === 'Unikal müştəri sayı (itirilmiş)'
        ? fetchCalls({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(filters.months),
              dateFromTo: getDateTo(filters.months),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [1],
            },
            onSuccessCallback: response => {
              fetchCallsCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(filters.months),
                  dateFromTo: getDateTo(filters.months),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [1],
                },
              });
            },
          })
        : modalName === 'Unikal müştəri sayı (cavablandırılmış)'
        ? fetchCalls({
            filters: {
              limit: pageSize,
              page: currentPage,
              dateFrom: getDateFrom(filters.months),
              dateFromTo: getDateTo(filters.months),
              groupBy: 'contact',
              directions: [1],
              isCallcenter: 1,
              statuses: [2],
              callbackStatuses: [1],
            },
            onSuccessCallback: response => {
              fetchCallsCount({
                filters: {
                  limit: pageSize,
                  page: currentPage,
                  dateFrom: getDateFrom(filters.months),
                  dateFromTo: getDateTo(filters.months),
                  groupBy: 'contact',
                  directions: [1],
                  isCallcenter: 1,
                  statuses: [2],
                  callbackStatuses: [1],
                },
              });
            },
          })
        : null;
    }
  );

  const getTotalValues = expensesInfo => {
    return expensesInfo
      ? [
          ...expensesInfo,
          {
            isTotal: true,
            count: expensesInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.count),
              0
            ),
          },
        ]
      : [];
  };

  const columns = [
    {
      title: '№',
      width: 90,
      render: (val, row, index) =>
        row.isTotal ? 'Toplam:' : (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Nömrə',
      dataIndex: 'prospectContact',
      width: 180,
      align: 'left',
      render: (row, val) =>
        val.isTotal ? null : (
          <Tooltip
            placement="topLeft"
            title={
              row?.phoneNumbers && row?.phoneNumbers.length > 0
                ? row?.phoneNumbers[0]
                : ''
            }
          >
            <span>
              {row?.phoneNumbers && row?.phoneNumbers.length > 0 ? (
                row?.phoneNumbers.length > 1 ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className={styles.ellipsisDiv}>
                      {row?.phoneNumbers[0]}
                    </span>
                    <Tooltip
                      placement="right"
                      title={
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          {row?.phoneNumbers.map(structure => (
                            <span>{structure}</span>
                          ))}
                        </div>
                      }
                    >
                      <span className={styles.serialNumberCount}>
                        {row?.phoneNumbers?.length}
                      </span>
                    </Tooltip>
                  </div>
                ) : (
                  row?.phoneNumbers[0]
                )
              ) : (
                '-'
              )}
            </span>
          </Tooltip>
        ),
    },
    {
      title: 'Zəng sayı',
      dataIndex: 'count',
      width: 180,
      align: 'left',
    },
  ];

  const handlePageSizeChange = (_, size) => {
    setCurrentPage(1);
    setPageSize(size);
    onFilter('page', 1);
    onFilter('limit', size);
  };

  const handleChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  return (
    <div>
      <Table
        scroll={{ x: 'max-content' }}
        className={styles.statusTable}
        dataSource={getTotalValues(calls)}
        loading={actionLoading}
        columns={columns}
        rowKey={record => record.id}
      />
      <Row
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '15px',
        }}
      >
        <Col span={12}>
          <ProPagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={callCount}
            onChange={handleChange}
          />
        </Col>
        <Col span={12} align="end">
          <ProPageSelect
            total={callCount}
            onChange={newPageSize => handlePageSizeChange(1, newPageSize)}
            value={pageSize}
          />
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = state => ({
  actionLoading: state.callReportsReducer.actionLoading,
  callCount: state.callReportsReducer.callCount,
});

export default connect(
  mapStateToProps,
  { fetchCalls, fetchCallsCount }
)(UnverifiedCalls);
