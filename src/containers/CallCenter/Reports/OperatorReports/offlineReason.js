/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import {
  fetchStatusHistoryReports,
  getStatusHistoryCount,
} from 'store/actions/calls/reports';
import { useFilterHandle } from 'hooks';
import { ProPageSelect, ProPagination, Table } from 'components/Lib';
import { Row, Col } from 'antd';
import styles from './styles.module.scss';

const OfflineReasons = props => {
  const {
    oflineData,
    isLoading,
    selectedRow,
    tenant,
    filters,
    total,
    pageSize,
    currentPage,
    setOflineData,
    getStatusHistoryCount,
    fetchStatusHistoryReports,
    setCurrentPage,
    setPageSize,
  } = props;

  const [filterss, onFilter] = useFilterHandle(
    {
      limit: 8,
      page: 1,
    },
    ({ filterss }) => {
      fetchStatusHistoryReports({
        filters: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          operators: [selectedRow?.id],
          statuses: [2],
          limit: pageSize,
          page: currentPage,
        },
        onSuccessCallback: response => {
          setOflineData(Object.values(response.data));
          getStatusHistoryCount({
            filters: {
              dateFrom: filters.dateFrom,
              dateTo: filters.dateTo,
              operators: [selectedRow?.id],
              statuses: [2],
              limit: pageSize,
              page: currentPage,
            },
          });
        },
      });
    }
  );

  const TimeInterval = row => {
    const currentTime = Date.parse(moment());
    const createdAtDate = Date.parse(moment(row.startedAt));
    const bronDate = Date.parse(moment(row.endedAt));

    var sec = ((bronDate - createdAtDate) / 1000) % 60;
    var min = Math.floor(((bronDate - createdAtDate) / (1000 * 60)) % 60);
    var hr = Math.floor((bronDate - createdAtDate) / (1000 * 60 * 60));

  
    // Current Data
    var seconds = ((currentTime - createdAtDate) / 1000) % 60;
    var minutes = Math.floor(
      ((currentTime - createdAtDate) / (1000 * 60)) % 60
    );
    var hours = Math.floor((currentTime - createdAtDate) / (1000 * 60 * 60));
    return row.endedAt!==null
      ? Number(
          `${hr < 10 ? '0' + hr : hr}${min < 10 ? '0' + min : min}${
            sec < 10 ? '0' + sec : sec
          }`
        )
      : Number(
          `${hours < 10 ? '0' + hours : hours}${
            minutes < 10 ? '0' + minutes : minutes
          }${seconds < 10 ? '0' + seconds : seconds}`
        );
  };

  const TimeIntervalFormat = row => {
    const currentTime = Date.parse(moment());
    const createdAtDate = Date.parse(moment(row.startedAt));
    const bronDate = Date.parse(moment(row.endedAt));

    var sec = ((bronDate - createdAtDate) / 1000) % 60;
    var min = Math.floor(((bronDate - createdAtDate) / (1000 * 60)) % 60);
    var hr = Math.floor((bronDate - createdAtDate) / (1000 * 60 * 60));

    // Current Data
    var seconds = ((currentTime - createdAtDate) / 1000) % 60;
    var minutes = Math.floor(
      ((currentTime - createdAtDate) / (1000 * 60)) % 60
    );
    var hours = Math.floor((currentTime - createdAtDate) / (1000 * 60 * 60));
    return row.endedAt!==null
      ? `${hr < 10 ? '0' + hr : hr}:${min < 10 ? '0' + min : min}:${
          sec < 10 ? '0' + sec : sec
        }`
      : `${hours < 10 ? '0' + hours : hours}:${
          minutes < 10 ? '0' + minutes : minutes
        }:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const getTotalValues = expensesInfo => {
    return expensesInfo
      ? [
          ...expensesInfo,
          {
            isTotal: true,
          },
        ]
      : [];
  };

  const getSum = data => {
    const sumData = data.reduce(
      (totalValue, currentValue) => totalValue + TimeInterval(currentValue),
      0
    );

    const sec = Number(sumData)
      .toString()
      .slice(-2);
    const min =
      Number(sumData).toString().length > 6
        ? Number(sumData)
            .toString()
            .slice(3, -2)
        : Number(sumData)
            .toString()
            .slice(2, -2);
    const hr =
      Number(sumData).toString().length > 6
        ? Number(sumData)
            .toString()
            .slice(0, 3)
        : Number(sumData)
            .toString()
            .slice(0, 2);

    console.log(Number(sumData), hr, min, sec);
    return `${hr}:${min}:${sec}`;
  };

  const columns = [
    {
      title: '№',
      width: 90,
      render: (val, row, index) =>
        row.isTotal ? 'Toplam:' : (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tarixi',
      dataIndex: 'startedAt',
      width: 180,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? moment
              .utc(value, null)
              .tz(tenant?.timezone)
              .format('DD-MM-YYYY')
          : '-',
    },
    {
      title: 'Oflayn səbəbi',
      dataIndex: 'offlineReason',
      width: 180,
      render: (value, row, index) => (row.isTotal ? null : value?.name || '-'),
    },
    {
      title: 'Başlama vaxtı',
      dataIndex: 'startedAt',
      width: 180,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? moment
              .utc(value, null)
              .tz(tenant?.timezone)
              .format('HH:mm:ss')
          : '-',
    },
    {
      title: 'Bitmə vaxtı',
      dataIndex: 'endedAt',
      width: 180,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? moment
              .utc(value, null)
              .tz(tenant?.timezone)
              .format('HH:mm:ss')
          : 'Davam edir',
    },
    {
      title: 'Müddət',
      dataIndex: 'startedAt',
      width: 180,
      align: 'left',
      render: (value, row) =>
        row.isTotal ? getSum(oflineData) : TimeIntervalFormat(row),
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
      <div className={styles.title}>
        <h3>{`${selectedRow.prospectTenantPerson.name} ${selectedRow.prospectTenantPerson.lastName} (${selectedRow.number})`}</h3>
      </div>
      <Table
        scroll={{ x: 'max-content' }}
        className={styles.statusTable}
        dataSource={getTotalValues(oflineData)}
        loading={isLoading}
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
            total={total}
            onChange={handleChange}
          />
        </Col>
        <Col span={12} align="end">
          <ProPageSelect
            total={total}
            onChange={newPageSize => handlePageSizeChange(1, newPageSize)}
            value={pageSize}
          />
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchStatusHistoryReports,
  tenant: state.tenantReducer.tenant,
  total: state.callReportsReducer.total,
});

export const OfflineReason = connect(
  mapStateToProps,
  { getStatusHistoryCount, fetchStatusHistoryReports }
)(OfflineReasons);
