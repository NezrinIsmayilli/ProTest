import React from 'react';
import { connect } from 'react-redux';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { Table as ProTable, DetailButton, InfoCard } from 'components/Lib';
import {
    fetchLoginTime,
    fetchStatusHistoryReports,
    getStatusHistoryCount,
} from 'store/actions/calls/reports';
import math from 'exact-math';
import { Tooltip } from 'antd';
import styles from '../styles.module.scss';

const Table = props => {
    const {
        isLoading,
        operatorReports,
        sortFilter,
        setSortFilter,
        fetchLoginTime,
        fetchStatusHistoryReports,
        getStatusHistoryCount,
        filters,
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        setIsVisible,
        setIsVisibleOfline,
        setLoginData,
        setOflineData,
        setSelectedRow,
    } = props;

    const getReportsWithTotal = internalCalls => {
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
    const handleSortTable = (name, orderType) => {
        setSortFilter([
            {
                order: orderType,
                orderBy: name,
            },
        ]);
    };
    const handleDetailClick = row => {
        setSelectedRow(row);
        setIsVisible(true);
        fetchLoginTime({
            filters: {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                type: 2,
                tenantPersons: [row?.prospectTenantPerson.id],
                limit: 1000,
            },
            onSuccessCallback: response => {
                setLoginData(Object.values(response.data));
            },
        });
    };

    const handleDetailClickOfline = row => {
        setCurrentPage(1);
        setPageSize(8);
        setSelectedRow(row);
        setIsVisibleOfline(true);

        fetchStatusHistoryReports({
            filters: {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                operators: [row?.id],
                statuses: [2],
                limit: filters.limit,
                page: filters.page,
            },
            onSuccessCallback: response => {
                setOflineData(Object.values(response.data));
                getStatusHistoryCount({
                    filters: {
                        dateFrom: filters.dateFrom,
                        dateTo: filters.dateTo,
                        operators: [row?.id],
                        statuses: [2],
                        limit: filters.limit,
                        page: filters.page,
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
                        name={value.name}
                        surname={value.lastName}
                        number={row.number}
                        attachmentUrl={value.attachment}
                        width="32px"
                        height="32px"
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
                    render: (value, row) =>
                        row.isTotal ? null : Math.floor(value?.incoming.total),
                },
                {
                    title: 'Cavablandırılmış, %',
                    dataIndex: 'calls',
                    width: 170,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal
                            ? null
                            : value?.incoming.total === 0
                            ? '0%'
                            : math.mul(
                                  math.div(
                                      value?.incoming.answered,
                                      value?.incoming.total
                                  ),
                                  100
                              ) %
                                  1 !==
                              0
                            ? `${Math.floor(
                                  math.mul(
                                      math.div(
                                          value?.incoming.answered,
                                          value?.incoming.total
                                      ),
                                      100
                                  )
                              )}%`
                            : `${Math.floor(
                                  math.mul(
                                      math.div(
                                          value?.incoming.answered,
                                          value?.incoming.total
                                      ),
                                      100
                                  )
                              )}%`,
                },
                {
                    title: 'Xaric olan',
                    dataIndex: 'calls',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : Math.floor(value?.outgoing.total),
                },
                {
                    title: 'Geri yığılmış',
                    dataIndex: 'calls',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : value?.calledBack,
                },
                {
                    title: 'Buraxılmış',
                    dataIndex: 'calls',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : value?.incoming.missed,
                },
            ],
        },
        {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Aktivlik müddəti</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                sortFilter[0]?.orderBy === 'activityTime' &&
                                sortFilter[0]?.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('activityTime', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                sortFilter[0]?.orderBy === 'activityTime' &&
                                sortFilter[0]?.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('activityTime', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'activityTime',
            width: 170,
            align: 'center',
            render: (value, row) => (row.isTotal ? null : getTime(value)),
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
                            onClick={() =>
                                handleSortTable('offlineTime', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                sortFilter[0]?.orderBy === 'offlineTime' &&
                                sortFilter[0]?.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('offlineTime', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'offlineTime',
            width: 170,
            align: 'center',
            render: (value, row) =>
                row.isTotal ? null : (
                    <div className={styles.detailbtn}>
                        <span className={styles.rowNumbers}>
                            {getTime(value)}
                        </span>

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
                    <span>Zəng müddəti</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                sortFilter[0]?.orderBy === 'ringTime' &&
                                sortFilter[0]?.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('ringTime', 'asc')}
                        />
                        <FaCaretDown
                            color={
                                sortFilter[0]?.orderBy === 'ringTime' &&
                                sortFilter[0]?.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('ringTime', 'desc')}
                        />
                    </div>
                </div>
            ),
            dataIndex: 'ringTime',
            width: 170,
            align: 'center',
            render: (value, row) => (row.isTotal ? null : getTime(value)),
        },
        {
            title: 'Danışıq müddəti',
            align: 'center',
            children: [
                {
                    title: 'Ortalama',
                    dataIndex: 'talkTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(Math.floor(value?.avg)),
                },
                {
                    title: 'Maksimum',
                    dataIndex: 'talkTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.max),
                },
                {
                    title: 'Cəmi',
                    dataIndex: 'talkTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.total),
                },
            ],
        },
        {
            title: 'Cavablandırılmış zənglər',
            align: 'center',
            children: [
                {
                    title: 'Ortalama',
                    dataIndex: 'handleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(Math.floor(value?.avg)),
                },
                {
                    title: 'Maksimum',
                    dataIndex: 'handleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.max),
                },
                {
                    title: 'Cəmi',
                    dataIndex: 'handleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.total),
                },
            ],
        },
        {
            title: 'Xəttdə saxlama müddəti',
            align: 'center',
            children: [
                {
                    title: 'Ortalama',
                    dataIndex: 'hold',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(Math.floor(value?.avg)),
                },
                {
                    title: 'Maksimum',
                    dataIndex: 'hold',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.max),
                },
                {
                    title: 'Say',
                    dataIndex: 'hold',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : value?.count || '-',
                },
                {
                    title: 'Cəmi',
                    dataIndex: 'hold',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.total),
                },
            ],
        },
        {
            title: 'Boş qalma müddəti',
            align: 'center',
            children: [
                {
                    title: 'Ortalama',
                    dataIndex: 'idleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(Math.floor(value?.avg)),
                },
                {
                    title: 'Maksimum',
                    dataIndex: 'idleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.max),
                },
                {
                    title: 'Cəmi',
                    dataIndex: 'idleTime',
                    width: 150,
                    align: 'center',
                    render: (value, row) =>
                        row.isTotal ? null : getTime(value?.total),
                },
            ],
        },
        {
            title: 'Limitin aşılması',
            align: 'center',
            children: [
                {
                    title: 'Nahar',
                    dataIndex: 'fromOperator',
                    width: 150,
                    align: 'center',
                    render: (value, row) => (row.isTotal ? null : getTime(0)),
                },
                {
                    title: 'Fasilə',
                    dataIndex: 'fromOperator',
                    width: 150,
                    align: 'center',
                    render: (value, row) => (row.isTotal ? null : getTime(0)),
                },
            ],
        },
        {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>ACW</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                sortFilter[0]?.orderBy === 'acwTime' &&
                                sortFilter[0]?.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('acwTime', 'asc')}
                        />
                        <FaCaretDown
                            color={
                                sortFilter[0]?.orderBy === 'acwTime' &&
                                sortFilter[0]?.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('acwTime', 'desc')}
                        />
                    </div>
                </div>
            ),
            dataIndex: 'acwTime',
            width: 150,
            align: 'center',
            render: (value, row) => (row.isTotal ? null : getTime(value)),
        },
        {
            title: 'Məşğulluq faizi',
            dataIndex: 'handleTime',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : math.add(value?.total, row.idleTime.total) === 0
                    ? '0%'
                    : math.mul(
                          math.div(
                              value?.total,
                              math.add(value?.total, row.idleTime.total)
                          ),
                          100
                      ) %
                          1 !==
                      0
                    ? `${Math.floor(
                          math.mul(
                              math.div(
                                  value?.total,
                                  math.add(value?.total, row.idleTime.total)
                              ),
                              100
                          )
                      )}%`
                    : `${Math.floor(
                          math.mul(
                              math.div(
                                  value?.total,
                                  math.add(value?.total, row.idleTime.total)
                              ),
                              100
                          )
                      )}%`,
        },
        {
            title: 'İstifadə faizi',
            dataIndex: 'handleTime',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : math.add(
                          value?.total,
                          row.idleTime.total,
                          row.offlineTime
                      ) === 0
                    ? '0%'
                    : math.mul(
                          math.div(
                              math.add(value?.total, row.idleTime.total),
                              math.add(
                                  value?.total,
                                  row.idleTime.total,
                                  row.offlineTime
                              )
                          ),
                          100
                      ) %
                          1 !==
                      0
                    ? `${Math.floor(
                          math.mul(
                              math.div(
                                  math.add(value?.total, row.idleTime.total),
                                  math.add(
                                      value?.total,
                                      row.idleTime.total,
                                      row.offlineTime
                                  )
                              ),
                              100
                          )
                      )}%`
                    : `${Math.floor(
                          math.mul(
                              math.div(
                                  math.add(value?.total, row.idleTime.total),
                                  math.add(
                                      value?.total,
                                      row.idleTime.total,
                                      row.offlineTime
                                  )
                              ),
                              100
                          )
                      )}%`,
        },
        {
            title: 'Login/Logout',
            dataIndex: 'id',
            width: 100,
            render: (value, row) => (
                <DetailButton
                    onClick={() => handleDetailClick(row)}
                    style={{ height: '30px' }}
                />
            ),
        },
    ];

    return (
        <div>
            <ProTable
                loading={isLoading}
                dataSource={getReportsWithTotal(operatorReports)}
                className={styles.tableFooter}
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
});

export default connect(
    mapStateToProps,
    { fetchLoginTime, fetchStatusHistoryReports, getStatusHistoryCount }
)(Table);
