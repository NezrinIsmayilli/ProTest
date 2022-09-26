import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { Table as ProTable, InfoCard, DetailButton } from 'components/Lib';
import {
  fetchStatusHistoryReports,
  getStatusHistoryCount,
} from 'store/actions/calls/reports';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { round } from 'utils';
import math from 'exact-math';
import { Tooltip } from 'antd';
import CustomTag from '../../Calls/CustomTag';
import styles from '../styles.module.scss';

const Table = props => {
  const {
    setSelectedRow,
    setIsVisibleOfline,
    supervisorReports,
    setOflineData,
    getStatusHistoryCount,
    setCurrentPage,
    setPageSize,
    fetchStatusHistoryReports,
    sortFilter,
    setSortFilter,
    tenant,
  } = props;

  const getReportsWithTotal = supervisorReports => {
    if (supervisorReports?.length === 0) {
      return supervisorReports;
    }
    return [
      ...supervisorReports,
      {
        isTotal: true,
      },
    ];
  };
  const handleSortTable = (name, orderType) => {
    setSortFilter([
      {
        order: orderType,
        orderBy: name,
      },
    ]);
  };
  const getTime = value => {
    let hours = Math.floor(value / 3600);
    value %= 3600;
    let minutes = Math.floor(value / 60);
    let seconds = value % 60;
    minutes = String(minutes).padStart(2, '0');
    hours = String(hours).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const handleDetailClickOfline = row => {
    setCurrentPage(1);
    setPageSize(8);
    setSelectedRow(row);
    setIsVisibleOfline(true);

    fetchStatusHistoryReports({
      filters: {
        dateFrom: moment().format('DD-MM-YYYY'),
        dateTo: moment().format('DD-MM-YYYY'),
        operators: [row?.id],
        statuses: [2],
        limit: 8,
        page: 1,
      },
      onSuccessCallback: response => {
        setOflineData(Object.values(response.data));
        getStatusHistoryCount({
          filters: {
            dateFrom: moment().format('DD-MM-YYYY'),
            dateTo: moment().format('DD-MM-YYYY'),
            operators: [row?.id],
            statuses: [2],
            limit: 8,
            page: 1,
          },
        });
      },
    });
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      fixed: 'left',
      render: (value, { isTotal }, index) => (isTotal ? null : index + 1),
    },
    {
      title: 'Operator',
      dataIndex: 'prospectTenantPerson',
      width: 350,
      fixed: 'left',
      align: 'left',
      render: (value, row) =>
        row.isTotal || value === null ? null : (
          <InfoCard
            name={value?.name}
            surname={value?.lastName}
            number={row?.number}
            attachmentUrl={value?.attachment}
            width="32px"
            height="32px"
          />
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal ? null : value === null ? (
          '-'
        ) : (
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
      title: 'Zənglər',
      align: 'center',
      children: [
        {
          title: 'Cavablandırılmış',
          dataIndex: 'calls',
          width: 150,
          align: 'center',
          render: (value, row) =>
            row.isTotal ? null : value?.incoming.answered,
        },
        {
          title: 'Daxil olan',
          dataIndex: 'calls',
          width: 150,
          align: 'center',
          render: (value, row) => (row.isTotal ? null : value?.incoming.total),
        },
        {
          title: 'Cavablandırılmış, %',
          dataIndex: 'calls',
          width: 170,
          align: 'center',
          render: (value, row) =>
            row.isTotal
              ? null
              : value
              ? value?.incoming.total === 0
                ? '0%'
                : math.mul(
                    math.div(value?.incoming.answered, value?.incoming.total),
                    100,
                  ) %
                    1 !==
                  0
                ? `${round(
                    math.mul(
                      math.div(value?.incoming.answered, value?.incoming.total),
                      100,
                    ),
                  ).toFixed(2)}%`
                : `${math.mul(
                    math.div(value?.incoming.answered, value?.incoming.total),
                    100,
                  )}%`
              : '0%',
        },
        {
          title: 'Xaric olan',
          dataIndex: 'calls',
          width: 150,
          align: 'center',
          render: (value, row) => (row.isTotal ? null : value?.outgoing.total),
        },
        {
          title: 'Geri yığılmış',
          dataIndex: 'calls',
          width: 150,
          align: 'center',
          render: (value, row) => (row.isTotal ? null : value?.calledBack),
        },
        {
          title: 'Buraxılmış',
          dataIndex: 'calls',
          width: 150,
          align: 'center',
          render: (value, row) => (row.isTotal ? null : value?.incoming.missed),
        },
      ],
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Login vaxtı</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                sortFilter[0]?.orderBy === 'loggedInAt' &&
                sortFilter[0]?.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('loggedInAt', 'asc')}
            />
            <FaCaretDown
              color={
                sortFilter[0]?.orderBy === 'loggedInAt' &&
                sortFilter[0]?.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('loggedInAt', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'loggedInAt',
      width: 150,
      align: 'center',
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
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Oflayn müddəti</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                sortFilter[0]?.orderBy === 'offlineTime' &&
                sortFilter[0]?.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('offlineTime', 'asc')}
            />
            <FaCaretDown
              color={
                sortFilter[0]?.orderBy === 'offlineTime' &&
                sortFilter[0]?.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('offlineTime', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'offlineTime',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal ? null : (
          <div className={styles.detailbtn}>
            <span className={styles.rowNumbers}>{getTime(value)}</span>

            <Tooltip title={getTime(value)} placement="right">
              <DetailButton
                className={styles.detailButton}
                onClick={() => handleDetailClickOfline(row)}
              />
            </Tooltip>
          </div>
        ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Orta danışıq müddəti</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                sortFilter[0]?.orderBy === 'talkTime' &&
                sortFilter[0]?.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('talkTime', 'asc')}
            />
            <FaCaretDown
              color={
                sortFilter[0]?.orderBy === 'talkTime' &&
                sortFilter[0]?.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('talkTime', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'talkTime',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal ? null : getTime(Math.floor(value?.avg)),
    },
    {
      title: 'Orta emal müddəti',
      dataIndex: 'handleTime',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal ? null : getTime(Math.floor(value?.avg)),
    },
    {
      title: 'Maks emal müddəti',
      dataIndex: 'handleTime',
      width: 150,
      align: 'center',
      render: (value, row) => (row.isTotal ? null : getTime(value?.max)),
    },
    {
      title: 'Xəttdə saxlama,say',
      dataIndex: 'hold',
      width: 150,
      align: 'center',
      render: (value, row) => (row.isTotal ? null : value?.count),
    },
    {
      title: 'Xəttdə saxlama müddəti',
      align: 'center',
      dataIndex: 'hold',
      width: 150,
      render: (value, row) => (row.isTotal ? null : getTime(value?.total)),
    },
    {
      title: 'Xəttdə saxlanılan zəng sayı',
      dataIndex: 'hold',
      width: 150,
      align: 'center',
      render: (value, row) => (row.isTotal ? null : value?.callCount),
    },
    {
      title: 'Məşğulluq faizi',
      dataIndex: 'handleTime',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? math.add(value.total, row?.idleTime.total) === 0
            ? '0%'
            : math.mul(
                math.div(
                  value?.total,
                  math.add(value?.total, row?.idleTime.total),
                ),
                100,
              ) %
                1 !==
              0
            ? `${round(
                math.mul(
                  math.div(
                    value?.total,
                    math.add(value?.total, row?.idleTime.total),
                  ),
                  100,
                ),
              ).toFixed(2)}%`
            : `${math.mul(
                math.div(
                  value?.total,
                  math.add(value?.total, row?.idleTime.total),
                ),
                100,
              )}%`
          : '0%',
    },
    {
      title: 'İstifadə faizi',
      dataIndex: 'handleTime',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? math.add(value?.total, row.idleTime.total, row.offlineTime) === 0
            ? '0%'
            : math.mul(
                math.div(
                  math.add(value?.total, row.idleTime.total),
                  math.add(value?.total, row.idleTime.total, row.offlineTime),
                ),
                100,
              ) %
                1 !==
              0
            ? `${round(
                math.mul(
                  math.div(
                    math.add(value?.total, row.idleTime.total),
                    math.add(value?.total, row.idleTime.total, row.offlineTime),
                  ),
                  100,
                ),
              ).toFixed(2)}%`
            : `${math.mul(
                math.div(
                  math.add(value?.total, row.idleTime.total),
                  math.add(value?.total, row.idleTime.total, row.offlineTime),
                ),
                100,
              )}%`
          : '0%',
    },
    {
      title: 'Statusun başlama müddəti',
      align: 'center',
      dataIndex: 'statusTime',
      width: 150,
      render: (value, row) => (row.isTotal ? null : getTime(value)),
    },
  ];

  return (
    <div>
      <ProTable
        // loading={isLoading}
        dataSource={getReportsWithTotal(supervisorReports)}
        className={styles.tableSupervisor}
        columns={columns}
        scroll={{ x: false, y: false }}
        size="default"
        rowKey={record => record.id}
      />
    </div>
  );
};
const mapStateToProps = state => ({
  isLoading: state.loadings.fetchOperatorReports,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  { fetchStatusHistoryReports, getStatusHistoryCount },
)(Table);
