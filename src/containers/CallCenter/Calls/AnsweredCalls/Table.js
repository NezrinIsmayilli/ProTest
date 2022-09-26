import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { Pagination, Row, Col, Select, Tooltip } from 'antd';
import { Table as ProTable, DetailButton } from 'components/Lib';
import {
  fetchInternalCalls,
  fetchInternalCallsRecording,
} from 'store/actions/calls/internalCalls';

// import AudioPlayer from './AudioPlayer';
import styles from '../styles.module.scss';

const Table = props => {
  const {
    data,
    total,
    isLoading,
    filters,
    onFilter,
    answeredCallData,
    setSelectedCall,
    tenant,
    permissionsByKeyValue,
    handleChange,
    setPageSize,
    pageSize,
    currentPage
  } = props;
  const pages = [8, 10, 20, 50, 100, total];
  const { answered_calls } = permissionsByKeyValue;
  const isEditDisabled = answered_calls.permission !== 2;
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
  const getColumns = tableData => {
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
        title: 'İstiqamət',
        dataIndex: 'direction',
        width: 120,
        align: 'left',
        render: (value, row) =>
          row.isTotal ? null : value === 1 ? 'Daxil olan' : 'Xaric olan',
      },
      {
        title: 'Operator',
        dataIndex: 'fromOperator',
        width: 150,
        align: 'left',
        ellipsis: true,
        render: (value, row) => (
          <Tooltip
            placement="topLeft"
            title={
              row.isTotal
                ? null
                : value === null
                ? row.toOperator !== null
                  ? `${row.toOperator?.prospectTenantPerson.name} ${
                      row.toOperator?.prospectTenantPerson.lastName
                        ? row.toOperator?.prospectTenantPerson.lastName
                        : ''
                    }`
                  : '-'
                : `${value?.prospectTenantPerson.name} ${
                    value?.prospectTenantPerson.lastName
                      ? value?.prospectTenantPerson.lastName
                      : ''
                  }` || ''
            }
          >
            <span>
              {row.isTotal
                ? null
                : value === null
                ? row.toOperator !== null
                  ? `${row.toOperator?.prospectTenantPerson.name} ${
                      row.toOperator?.prospectTenantPerson.lastName
                        ? row.toOperator?.prospectTenantPerson.lastName
                        : ''
                    }`
                  : '-'
                : `${value?.prospectTenantPerson.name} ${
                    value?.prospectTenantPerson.lastName
                      ? value?.prospectTenantPerson.lastName
                      : ''
                  }` || '-'}
            </span>
          </Tooltip>
        ),
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
    ];
    if (tableData.length > 0) {
      if (filters.statuses[0] == 1) {
        columns.push({
          title: 'Zəngin növü',
          dataIndex: 'type',
          width: 150,
          align: 'left',
          render: (value, row) =>
            row.isTotal
              ? null
              : value === 1
              ? 'Məlumat'
              : value === 2
              ? 'Şikayət'
              : value === 3
              ? 'Təklif'
              : value === 4
              ? 'Sifariş'
              : value === 5
              ? 'Səhv'
              : '-',
        });
        columns.push({
          title: 'Müraciətin növü',
          dataIndex: 'appealType',
          width: 170,
          align: 'left',
          render: (value, row) =>
            row.isTotal
              ? null
              : value !== null
              ? value.parent !== null
                ? value.parent.name
                : '-'
              : '-',
        });
        columns.push({
          title: 'Müraciətin alt növü',
          dataIndex: 'appealType',
          width: 170,
          align: 'left',
          render: (value, row) =>
            row.isTotal ? null : value !== null ? value.name : `-`,
        });
        columns.push({
          title: 'Səs yazma',
          dataIndex: 'recording',
          align: 'center',
          width: 360,
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
        });
        // {
        //   title: 'Status',
        //   dataIndex: 'fromNumber',
        //   align: 'center',
        //   render: (value, row) => (row.isTotal ? null : getStatus(value, row)),
        // },
        columns.push({
          title: 'Seç',
          align: 'center',
          width: 80,
          render: row =>
            row.isTotal ? null : (
              <DetailButton onClick={() => handleClick(row)} />
            ),
        });
      } else {
        columns.push({
          title: 'Gözləmə müddəti',
          dataIndex: 'waitTime',
          width: 150,
          align: 'left',
          render: (value, row) =>
            row.isTotal
              ? null
              : value
              ? moment.utc(value * 1000).format('HH:mm:ss')
              : '-',
        });
        columns.push({
          title: 'Seç',
          align: 'center',
          width: 80,
          render: row =>
            row.isTotal ? null : (
              <DetailButton onClick={() => handleClick(row)} />
            ),
        });
      }
    }

    return columns;
  };

  

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
        dataSource={getInternalCallsWithTotal(answeredCallData)}
        className={styles.tableFooter}
        columns={getColumns(getInternalCallsWithTotal(answeredCallData))}
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
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    fetchInternalCalls,
    fetchInternalCallsRecording,
  }
)(Table);
