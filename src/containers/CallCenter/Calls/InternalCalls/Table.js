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
import styles from '../styles.module.scss';

const Table = props => {
  const {
    data,
    internalCallData,
    total,
    isLoading,
    filters,
    onFilter,
    setSelectedCall,
    tenant,
    credential,
    getStatus,
    permissionsByKeyValue,
    handleChange,
    setPageSize,
    currentPage,
    pageSize
  } = props;
  const pages = [8, 10, 20, 50, 100, total];
  const { internal_calls } = permissionsByKeyValue;
  const isEditDisabled = internal_calls.permission !== 2;
  document.addEventListener(
    'play',
    function(event) {
      if (
        window.$_currentlyPlaying &&
        window.$_currentlyPlaying != event.target
      ) {
        window.$_currentlyPlaying.pause();
      }
      window.$_currentlyPlaying = event.target;
    },
    true
  );

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
      width: 200,
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
      title: 'İstiqamət',
      dataIndex: 'fromNumber',
      width: 120,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : credential?.number == value
          ? 'Xaric olan'
          : 'Daxil olan',
    },
    {
      title: 'Zəng edən',
      dataIndex: 'fromOperator',
      width: 200,
      align: 'left',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={
            row.isTotal
              ? null
              : `${value?.prospectTenantPerson?.name} ${
                  value?.prospectTenantPerson?.lastName
                    ? value?.prospectTenantPerson?.lastName
                    : null
                }(${value?.number})` || ''
          }
        >
          <span>
            {row.isTotal
              ? null
              : `${value?.prospectTenantPerson?.name} ${
                  value?.prospectTenantPerson?.lastName
                    ? value?.prospectTenantPerson?.lastName
                    : null
                }(${value?.number})` || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Zəngi qəbul edən',
      dataIndex: 'toOperator',
      width: 200,
      align: 'left',
      render: (value, row) =>
        row.isTotal
          ? null
          : `${value?.prospectTenantPerson?.name} ${
              value?.prospectTenantPerson?.lastName
                ? value?.prospectTenantPerson?.lastName
                : ''
            }(${value?.number})`,
    },
    {
      title: 'Səs yazma',
      dataIndex: 'recording',
      align: 'center',
      width: 350,
      render: (value, row) =>
        row.isTotal ? null : value?.id ? (
          <audio
            src={data?.find(item => item?.id === value?.id)?.record}
            type="audio/ogg"
            style={
              isEditDisabled
                ? { width: '98%', height: '40px', pointerEvents: 'none' }
                : { width: '98%', height: '40px' }
            }
            controls
          />
        ) : null,
    },
    {
      title: 'Status',
      dataIndex: 'fromNumber',
      width: 100,
      align: 'center',
      render: (value, row) => (row.isTotal ? null : getStatus(value, row)),
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
    setPageSize(size)
    handleChange(1);
  };

  const handleClick = row => {
    setSelectedCall(row);
  };

  return (
    <div>
      <ProTable
        loading={isLoading}
        dataSource={getInternalCallsWithTotal(internalCallData)}
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
  total: state.internalCallsReducer.total,
  tenant: state.tenantReducer.tenant,
  credential: state.profileReducer.credential,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    fetchInternalCalls,
    fetchInternalCallsRecording,
  }
)(Table);
