import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { Pagination, Row, Col, Select, Tooltip } from 'antd';
import { Table as ProTable, DetailButton } from 'components/Lib';
import {
  fetchInternalCalls,
  fetchInternalCallsRecording,
} from 'store/actions/calls/internalCalls';
import CustomTag from '../CustomTag';
import styles from '../styles.module.scss';

const Table = props => {
  const {
    internalCalls,
    total,
    isLoading,
    filters,
    onFilter,
    missedCallData,
    setSelectedCall,
    tenant,
    credential,
    handleChange,
    setPageSize,
    currentPage,
    pageSize
  } = props;
  const pages = [8, 10, 20, 50, 100, total];

  const getInternalCallsWithTotal = internalCalls => {
    if (internalCalls?.length === 0) {
      return internalCalls;
    }
    return [
      ...internalCalls,
      {
        isTotal: true,
      },
    ];
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (value, { isTotal }, index) =>
        isTotal ? null : (filters.page - 1) * filters.limit + index + 1,
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
      render: row =>
        row.isTotal ? null : <DetailButton onClick={() => handleClick(row)} />,
    },
  ];



  const handleNumberChange = size => {
    onFilter('limit', size);
    setPageSize(size);
    handleChange(1);
  };

  const handleClick = row => {
    setSelectedCall(row);
  };

  return (
    <div>
      <ProTable
        loading={isLoading}
        dataSource={getInternalCallsWithTotal(missedCallData)}
        className={styles.tableFooter}
        columns={columns}
        scroll={{ x: false, y: false }}
        size="default"
      />

      <Row
        style={{
          margin: '15px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Col span={8}>
          <Pagination
            current={currentPage}
            className={styles.customPagination}
            pageSize={filters.limit}
            onChange={handleChange}
            total={total || 0}
            size="small"
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <Select
            defaultValue={pageSize}
            className={styles.pageSize}
            size="large"
            onChange={e => handleNumberChange(e)}
          >
            {pages.map(page => (
              <Select.Option
                value={page}
                className={styles.dropdown}
                key={page}
              >
                {page}
              </Select.Option>
            ))}
          </Select>
          <span className={styles.totalNumber}>{`${total} ədəd`}</span>
        </Col>
      </Row>
    </div>
  );
};
const mapStateToProps = state => ({
  isLoading: state.internalCallsReducer.isLoading,
  internalCalls: state.internalCallsReducer.internalCalls,
  total: state.internalCallsReducer.total,
  tenant: state.tenantReducer.tenant,
  credential: state.profileReducer.credential,
});

export default connect(
  mapStateToProps,
  {
    fetchInternalCalls,
    fetchInternalCallsRecording,
  }
)(Table);
