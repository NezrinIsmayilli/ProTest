import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { Pagination, Row, Col, Select, Tooltip, Spin } from 'antd';
import {
  Table as ProTable,
  DetailButton,
  ProPagination,
  ProPageSelect,
} from 'components/Lib';
import CustomTag from '../../../CustomTag';
import styles from './styles.module.scss';

const Table = props => {
  const {
    actionLoading,
    filters,
    onFilter,
    internalCallsCount,
    calls,
    tenant,
    setPageSize,
    setCurrentPage,
    currentPage,
    pageSize,
    setSelectedCall,
  } = props;

  const handleClick = row => {
    setSelectedCall(row);
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 100,
      render: (val, row, index) =>
       (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Zəng tarixi',
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
              .format('DD-MM-YYYY HH:mm:ss')
          : '-',
    },
    {
      title: 'Nömrə',
      dataIndex: 'fromOperator',
      width: 150,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : value === null
          ? row.fromNumber.replace(
              /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
              '($1) $2 $3 $4 $5'
            )
          : row.toNumber.replace(
              /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
              '($1) $2 $3 $4 $5'
            ),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'prospectContact',
      width: 150,
      align: 'left',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip placement="topLeft" title={value ? value.name : ''}>
          <span>{row.isTotal ? null : value ? value.name : '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'İş rejimi',
      dataIndex: 'isWorkingTime',
      width: 150,
      align: 'left',
      render: (value, row) =>
        row.isTotal ? null : value ? 'İş vaxtı' : 'Qeyri-iş vaxtı',
    },
    {
      title: 'İVR',
      dataIndex: 'ivr',
      width: 150,
      align: 'left',
      render: (value, row) => (row.isTotal ? null : value ? value.name : '-'),
    },
    {
      title: 'Gözləmə müddəti',
      dataIndex: 'waitTime',
      width: 180,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? moment.utc(value * 1000).format('HH:mm:ss')
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'callbackStatus',
      align: 'center',
      width: 180,
      render: (value, row) =>
        row.isTotal ? null : (
          <CustomTag
            data={
              value === 1
                ? { name: 'reject', label: 'Geri yığılmamış' }
                : { name: 'done', label: 'Geri yığılıb' }
            }
          />
        ),
    },
    {
      title: 'Seç',
      align: 'center',
      width: 80,
      render: row => (row.isTotal ? null : <DetailButton onClick={() => handleClick(row)}/>),
      
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
      <ProTable
        loading={actionLoading}
        dataSource={calls}
        className={styles.statusTable}
        columns={columns}
        scroll={{ x: false, y: false }}
        size="default"
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
            total={internalCallsCount}
            onChange={handleChange}
          />
        </Col>
        <Col span={12} align="end">
          <ProPageSelect
            total={internalCallsCount}
            onChange={newPageSize => handlePageSizeChange(1, newPageSize)}
            value={pageSize}
          />
        </Col>
      </Row>
    </div>
  );
};
const mapStateToProps = state => ({
  actionLoading: state.callReportsReducer.actionLoading,
  internalCalls: state.internalCallsReducer.internalCalls,
  internalCallsCount: state.callReportsReducer.internalCallsCount,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  {}
)(Table);
