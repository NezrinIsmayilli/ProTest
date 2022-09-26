import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { Pagination, Row, Col, Select, Tooltip } from 'antd';
import { Table as ProTable } from 'components/Lib';
import CustomTag from './CustomTag';
import styles from './styles.module.scss';

const Table = props => {
  const {
    total,
    isLoading,
    filters,
    onFilter,
    statusHistoryReports,
    tenant,
    handleChange,
    setPageSize
  } = props;
  const pages = [8, 10, 20, 50, 100];

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (value, { isTotal }, index) =>
        (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: 'Operator',
      dataIndex: 'name',
      width: 150,
      align: 'left',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={
            `${row?.tenantPerson?.prospectTenantPerson?.name} ${row?.tenantPerson?.prospectTenantPerson?.lastName} (${row?.tenantPerson?.number})` ||
            ''
          }
        >
          <span>
            {`${row?.tenantPerson?.prospectTenantPerson?.name} ${row?.tenantPerson?.prospectTenantPerson?.lastName} (${row?.tenantPerson?.number})` ||
              '-'}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (value, row) =>
        row.isTotal ? null : (
          <CustomTag
            data={
              value === 1
                ? { name: 'done', label: 'Onlayn' }
                : value === 2
                ? { name: 'delete', label: 'Oflayn' }
                : value === 3
                ? { name: 'going', label: 'Zəngi emal edir' }
                : value === 4
                ? { name: 'takeover', label: 'Zəng daxil olur' }
                : value === 5
                ? { name: 'delivery', label: 'Danışır' }
                : { name: 'reject', label: 'Xətdə saxlayır' }
            }
          />
        ),
    },

    {
      title: 'Başlama tarixi',
      dataIndex: 'startedAt',
      width: 180,
      align: 'center',
      render: (value, row) =>
        value
          ? moment
              .utc(value, null)
              .tz(tenant?.timezone)
              .format('DD-MM-YYYY HH:mm:ss')
          : '-',
    },
    {
      title: 'Bitmə tarixi',
      dataIndex: 'endedAt',
      width: 180,
      align: 'left',
      render: (value, row) =>
        value
          ? moment
              .utc(value, null)
              .tz(tenant?.timezone)
              .format('DD-MM-YYYY HH:mm:ss')
          : 'Davam edir',
    },
    {
      title: 'Səbəb',
      dataIndex: 'offlineReason',
      width: 180,
      align: 'left',
      render: (value, row, index) => value?.name || '-',
    },
  ];

  const handleNumberChange = size => {
    onFilter('limit', size);
    setPageSize(size)
    handleChange(1);
  };

  return (
    <div>
      <ProTable
        loading={isLoading}
        dataSource={statusHistoryReports}
        className={styles.tableFooter}
        columns={columns}
        scroll={{ x: false, y: false }}
        size="default"
        rowKey={record => record.id}
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
            current={filters.page}
            className={styles.customPagination}
            pageSize={filters.limit}
            onChange={handleChange}
            total={total || 0}
            size="small"
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <Select
            defaultValue={filters.limit}
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
  total: state.callReportsReducer.total,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  {}
)(Table);
