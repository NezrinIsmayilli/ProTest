import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Col, Row, Select, Pagination, Spin, Tooltip } from 'antd';
import moment from 'moment';
import 'moment-timezone';
import { updateCall } from 'store/actions/calls/internalCalls';
import ExportJsonExcel from 'js-export-excel';
import IconButton from 'containers/Orders/utils/IconButton/index';

import styles from './styles.module.scss';
import CustomTag from 'containers/CallCenter/Reports/MainIndicatorsReport/CustomTag';

const Calls = ({
  selectedCall,
  callWithContact,
  isLoading,
  getStatus,
  tenant,
  credential,
  visible = false,
  audioData,
  isView,
  permissionsByKeyValue,
  total,
  onFilter,
  filters,
}) => {
  const pages = [8, 10, 20, 50, 100, total];
  const { internal_calls, answered_calls } = permissionsByKeyValue;
  const isEditDisabled =
    isView === 'answered'
      ? answered_calls.permission !== 2
      : internal_calls.permission !== 2;
  const handleExport = () => {
    const option = {};
    const dataTable = [
      {
        Id: selectedCall.id,
        Date: moment
          .utc(selectedCall?.startedAt, null)
          .tz(tenant?.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        Caller: `${selectedCall?.fromOperator.prospectTenantPerson?.name} ${
          selectedCall?.fromOperator.prospectTenantPerson?.lastName
            ? selectedCall?.fromOperator.prospectTenantPerson?.lastName
            : null
        }(${selectedCall?.fromOperator.number})`,
        Number: selectedCall?.toNumber,
        Called: `${selectedCall?.toOperator.prospectTenantPerson?.name} ${
          selectedCall?.toOperator.prospectTenantPerson?.lastName
            ? selectedCall?.toOperator.prospectTenantPerson?.lastName
            : ''
        }(${selectedCall?.toOperator.number})`,
        Description: null,
      },
    ];

    option.fileName = 'call-detail';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Date',
          'Caller',
          'Number ',
          'Called',
          'Description',
        ],
        sheetHeader: [
          'Id',
          'Date',
          'Caller',
          'Number ',
          'Called',
          'Description',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };
  const getColumns = data => {
    const columns = [
      {
        title: '№',
        dataIndex: 'id',
        width: 60,
        render: (value, row, index) =>
          (filters.page - 1) * filters.limit + index + 1,
      },
      {
        title: 'Zəng tarixi',
        dataIndex: 'startedAt',
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
        width: 180,
      },
    ];
    if (data.length > 0) {
      if (isView === 'internal') {
        columns.push({
          title: 'İstiqamət',
          dataIndex: 'fromNumber',
          align: 'left',
          width: 120,
          render: (value, row) =>
            row.isTotal
              ? null
              : credential?.number == value
              ? 'Xaric olan'
              : 'Daxil olan',
        });
        columns.push({
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
        });
        columns.push({
          title: 'Zəngi qəbul edən',
          dataIndex: 'toOperator',
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
                        : ''
                    }(${value?.number})` || ''
              }
            >
              <span>
                {row.isTotal
                  ? null
                  : `${value?.prospectTenantPerson?.name} ${
                      value?.prospectTenantPerson?.lastName
                        ? value?.prospectTenantPerson?.lastName
                        : ''
                    }(${value?.number})` || '-'}
              </span>
            </Tooltip>
          ),
        });
        columns.push({
          title: 'Səs yazısı',
          align: 'center',
          dataIndex: 'recording',
          width: 300,
          render: (value, row) =>
            row.isTotal ? null : value?.id ? (
              <audio
                src={audioData?.find(item => item?.id === value?.id)?.record}
                type="audio/ogg"
                style={
                  isEditDisabled
                    ? { height: '35px', pointerEvents: 'none' }
                    : { height: '35px' }
                }
                controls
              />
            ) : null,
        });
        columns.push({
          title: 'Status',
          dataIndex: 'fromNumber',
          align: 'center',
          width: 100,
          render: (value, row) => (row.isTotal ? null : getStatus(value, row)),
        });
      } else if (isView === 'missed') {
        columns.push({
          title: 'Nömrə',
          dataIndex: 'fromOperator',
          width: 120,
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
        });
        columns.push({
          title: 'İş rejimi',
          dataIndex: 'isWorkingTime',
          width: 120,
          align: 'left',
          render: (value, row) =>
            row.isTotal ? null : value ? 'İş vaxtı' : 'Qeyri-iş vaxtı',
        });
        columns.push({
          title: 'İVR',
          dataIndex: 'ivr',
          width: 120,
          align: 'left',
          render: (value, row) =>
            row.isTotal ? null : value ? value.name : '-',
        });
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
          title: 'Status',
          dataIndex: 'callbackStatus',
          width: 150,
          align: 'center',
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
        });
      } else if (isView === 'answered') {
        columns.push({
          title: 'İstiqamət',
          dataIndex: 'direction',
          width: 120,
          align: 'left',
          render: (value, row) =>
            row.isTotal ? null : value === 1 ? 'Daxil olan' : 'Xaric olan',
        });
        columns.push({
          title: 'Zəngin növü',
          dataIndex: 'type',
          width: 120,
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
          width: 150,
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
          width: 150,
          align: 'left',
          render: (value, row) =>
            row.isTotal ? null : value !== null ? value.name : `-`,
        });
        columns.push({
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
                    ? `${row.toOperator?.prospectTenantPerson?.name} ${
                        row.toOperator?.prospectTenantPerson?.lastName
                          ? row.toOperator?.prospectTenantPerson?.lastName
                          : ''
                      }`
                    : '-'
                  : `${value?.prospectTenantPerson?.name} ${
                      value?.prospectTenantPerson?.lastName
                        ? value?.prospectTenantPerson?.lastName
                        : ''
                    }` || ''
              }
            >
              <span>
                {row.isTotal
                  ? null
                  : value === null
                  ? row.toOperator !== null
                    ? `${row.toOperator?.prospectTenantPerson?.name} ${
                        row.toOperator?.prospectTenantPerson?.lastName
                          ? row.toOperator?.prospectTenantPerson?.lastName
                          : ''
                      }`
                    : '-'
                  : `${value?.prospectTenantPerson?.name} ${
                      value?.prospectTenantPerson?.lastName
                        ? value?.prospectTenantPerson?.lastName
                        : ''
                    }` || '-'}
              </span>
            </Tooltip>
          ),
        });
      }
    }
    return columns;
  };
  const handleChange = value => {
    onFilter('page', value);
  };
  const handleNumberChange = size => {
    onFilter('limit', size);
    onFilter('page', 1);
  };
  if (!visible) return null;
  return (
    <div className={styles.Detail}>
      <Row type="flex" style={{ alignItems: 'center', margin: '0 0 25px 0' }}>
        <Col span={8} offset={16} align="end">
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            buttonStyle={{ marginRight: '10px' }}
            onClick={handleExport}
          />
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={window.print}
          />
        </Col>
      </Row>
      <Table
        loading={isLoading}
        dataSource={callWithContact}
        className={styles.customWhiteTable}
        pagination={false}
        bordered={false}
        scroll={{ x: 'max-content', y: 450 }}
        columns={getColumns(callWithContact)}
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
            defaultValue={8}
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
  isLoading: state.loadings.fetchCallsByNumber,
  credential: state.profileReducer.credential,
  tenant: state.tenantReducer.tenant,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    updateCall,
  }
)(Calls);
