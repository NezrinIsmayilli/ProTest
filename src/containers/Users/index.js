import React, { useRef, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';
import {
    Can,
    IconButton,
    ProDots,
    ProDotsItem,
    DetailButton,
    TableConfiguration,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { FiLink } from 'react-icons/fi';
import { permissions, accessTypes } from 'config/permissions';
import { useTranslation } from 'react-i18next';
import { useFilterHandle } from 'hooks';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import swal from '@sweetalert/with-react';
import { toast } from 'react-toastify';
import { deleteUserById, fetchUsers } from 'store/actions/users';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
import UsersSidebar from './Sidebar';
import UsersTable from './Table';
import UsersForm from './Form';
import AddButton from './Form/AddButton';
import styles from './styles.module.scss';
import { fetchAllUsers } from 'store/actions/export-to-excel/usersModule';
import { Users_TABLE_SETTING_DATA } from 'utils/table-config/usersModule';
import { UserCard } from './Table/UserCard';
import UserStatus from './Table/UserStatus';
import { useHistory, useLocation } from 'react-router-dom';
const customStyle = { top: 90 };

function Users(props) {
    const {
        fetchUsers,
        fetchAllUsers,
        users,
        deleteUserById,
        fetchFilteredWorkers,
        tableConfiguration,
        fetchTableConfiguration,
        createTableConfiguration,
        profile,
        fetchBusinessUnitList,
        businessUnits,
    } = props;
    const modalRef = useRef(null);
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const openModal = React.useCallback(({ id }) => {
        modalRef.current.openModal({ id });
    }, []);
    const [worker, setWorker] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [group, setGroup] = useState(undefined);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [isOneAdmin, setIsOneAdmin] = useState(true);
    const [selectedRow, setSelectedRow] = useState({});
    const handleDetailClick = row => {
        setSelectedRow(row);
        setIsVisible(true);
    };
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        Users_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exUsers, setExUsers] = useState([]);

    const [filters, onFilter] = useFilterHandle(
        {
            'filters[search]': undefined,
            'filters[role]': undefined,
            'filters[status]': undefined,
            limit: 1000,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
        },
        fetchUsers
    );
    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, [fetchBusinessUnitList, profile.businessUnits]);
    const handleFilterData = data => {
        if (group && data.length > 0) {
            const newtableDatas = data.filter(({ isAdmin }) => {
                if (isAdmin) {
                    return true;
                }
                return false;
            });
            return newtableDatas;
        }
        return data;
    };

    const onSuccessCallback = () => {
        fetchUsers({
            filters,
        });
        fetchFilteredWorkers(
            { filters: { withTenantPerson: 0, lastEmployeeActivityType: 1 } },
            data => {
                setWorker(data.data);
            }
        );
    };
    useEffect(() => {
        if (users) {
            if (users.filter(user => user.isAdmin === true).length > 1) {
                setIsOneAdmin(false);
            } else {
                setIsOneAdmin(true);
            }
        } else {
            setIsOneAdmin(true);
        }
    }, [users]);

    useEffect(() => {
        fetchTableConfiguration({ module: 'Users-Module' });
    }, []);
    const userDeleteHandle = id => {
        swal({
            title: t('users:table:deleteApproval'),
            icon: 'warning',
            buttons: [t('users:table:cancel'), t('users:table:delete')],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteUserById(id, onSuccessCallback, ({ error }) => {
                    if (
                        error.response?.data?.error?.errors?.error?.type ===
                        'operator.delete.has_role.1'
                    ) {
                        toast.error(t('users:table:deleteError'));
                    }
                });
            }
        });
    };

    const openEditModal = row => {
        history.push({
            pathname: location.pathName,
            search: `?tkn_unit=${
                row.businessUnits.length > 0 ? row.businessUnits[0]?.id : 0
            }`,
        });
        setRoles([]);
        setWorker([]);
        const { id } = row;
        openModal({
            id,
        });
    };
    const statusIconSize = { fontSize: 27, color: '#55ab80' };

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('name')] = {
            title: t('users:table:name'),
            dataIndex: 'name',
            width: 200,
            render: (_, row) => <UserCard data={row} />,
        };
        columns[column.indexOf('email')] = {
            title: t('users:table:email'),
            width: 200,
            ellipsis: true,
            dataIndex: 'email',
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('roleName')] = {
            title: t('users:table:role'),
            width: 150,
            dataIndex: 'roleName',
            render: (value, row) =>
                row.isChief ? (isOneAdmin ? 'Təsisçi' : 'Həmtəsisçi') : value,
        };
        columns[column.indexOf('employeeFullName')] = {
            title: t('users:table:connectedEmployeeName'),
            width: 150,
            align: 'center',
            dataIndex: 'employeeFullName',
            render: (value, row) =>
                row.employeeId ? (
                    <Tooltip title={value}>
                        <FiLink style={statusIconSize} />
                    </Tooltip>
                ) : (
                    <FiLink style={{ fontSize: 27, color: '#808080' }} />
                ),
        };
        columns[column.indexOf('isConnected')] = {
            title: t('users:table:status'),
            dataIndex: 'isConnected',
            align: 'left',
            width: 130,
            render: (_, row) =>
                row.isChief ? (
                    <IconButton
                        buttonStyle={{
                            width: '40px',
                            height: '40px',
                        }}
                        buttonSize="large"
                        className={styles.connectionStatus}
                        icon="connected"
                    />
                ) : (
                    <UserStatus data={row} openModal={openModal} />
                ),
        };
        if (
            allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1
        ) {
            columns[column.indexOf('businessUnits')] = {
                title: 'Biznes blok',
                dataIndex: 'businessUnits',
                align: 'center',
                width: 130,
                ellipsis: true,
                render: value => (
                    <Tooltip
                        placement="topLeft"
                        title={
                            allBusinessUnits?.find(
                                ({ id }) =>
                                    id ===
                                    (value.length !== 0 ? value[0]?.id : null)
                            )?.name
                        }
                    >
                        <span>
                            {
                                allBusinessUnits?.find(
                                    ({ id }) =>
                                        id ===
                                        (value.length !== 0
                                            ? value[0]?.id
                                            : null)
                                )?.name
                            }
                        </span>
                    </Tooltip>
                ),
            };
        }
        columns.push({
            title: 'Seç',
            width: 100,
            align: 'center',
            render: (_, row) => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton
                        onClick={() => handleDetailClick(row)}
                        style={{ height: '30px' }}
                    />
                    <Can I={accessTypes.manage} a={permissions.users}>
                        <ProDots>
                            <>
                                <ProDotsItem
                                    label={t('users:table:edit')}
                                    icon="pencil"
                                    onClick={() => openEditModal(row)}
                                />{' '}
                                <ProDotsItem
                                    label={t('users:table:delete')}
                                    icon="trash"
                                    onClick={() => userDeleteHandle(row.id)}
                                />{' '}
                            </>{' '}
                        </ProDots>{' '}
                    </Can>{' '}
                </div>
            ),
        });
        columns.unshift({
            title: '№',
            dataIndex: 'id',
            render: (value, row, index) => index + 1,
            width: 60,
        });
        return columns;
    };

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Users-Module',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };

    // set Table Configuration data and set visible columns
    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration);
            let columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = Users_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(Users_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    // Excel table columns
    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('name')] = {
            title: t('users:table:name'),
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('email')] = {
            title: t('users:table:email'),
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('roleName')] = {
            title: t('users:table:role'),
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('employeeFullName')] = {
            title: t('users:table:connectedEmployeeName'),
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('isConnected')] = {
            title: t('users:table:status'),
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('businessUnits')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 50 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const data = exUsers.map((item, index) => {
            let arr = [];
            columnClone.includes('name') &&
                (arr[columnClone.indexOf('name')] = {
                    value: `${item.name} ${item.lastName}` || '-',
                });

            columnClone.includes('email') &&
                (arr[columnClone.indexOf('email')] = {
                    value: item.email || '-',
                });
            columnClone.includes('roleName') &&
                (arr[columnClone.indexOf('roleName')] = {
                    value: item.isChief
                        ? isOneAdmin
                            ? 'Təsisçi'
                            : 'Həmtəsisçi'
                        : item.roleName || '-',
                });
            columnClone.includes('businessUnits') &&
                (arr[columnClone.indexOf('businessUnits')] = {
                    value:
                        `${
                            allBusinessUnits?.find(
                                ({ id }) =>
                                    id ===
                                    (item?.businessUnits.length !== 0
                                        ? item.businessUnits[0]?.id
                                        : null)
                            )?.name
                        }` || '-',
                });
            columnClone.includes('employeeFullName') &&
                (arr[columnClone.indexOf('employeeFullName')] = {
                    value: item.employeeId ? item.employeeFullName : '-',
                });
            columnClone.includes('isConnected') &&
                (arr[columnClone.indexOf('isConnected')] = {
                    value:
                        item.isConnected === 0
                            ? 'Dəvət et'
                            : item.isConnected == 3
                            ? 'Yenidən dəvət et'
                            : 'Qoşulub' || '-',
                });
            arr.unshift({ value: index + 1 });
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns();
    }, [visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exUsers]);
    return (
        <section>
            <UsersSidebar
                onFilter={onFilter}
                setGroup={setGroup}
                filters={filters}
                fetchBusinessUnitList={fetchBusinessUnitList}
                businessUnits={businessUnits}
                profile={profile}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Users_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />

            <section className="scrollbar aside" style={customStyle}>
                <div className="container">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Can I={accessTypes.manage} a={permissions.users}>
                            <SettingButton onClick={toggleVisible} />
                            <span
                                style={{
                                    display: 'inline-block',
                                    marginRight: '15px',
                                }}
                            >
                                <ExportToExcel
                                    getExportData={() =>
                                        fetchAllUsers({
                                            filters: {
                                                ...filters,
                                                limit: 5000,
                                                page: undefined,
                                            },
                                            onSuccessCallback: data => {
                                                setExUsers(
                                                    handleFilterData(data.data)
                                                );
                                            },
                                        })
                                    }
                                    data={excelData}
                                    columns={excelColumns}
                                    excelTitle="İstifadəçilər"
                                    disabled={!allBusinessUnits}
                                    excelName="İstifadəçilər"
                                    filename="İstifadəçilər"
                                    count={handleFilterData(users)?.length}
                                />
                            </span>

                            <Fragment>
                                <AddButton
                                    businessUnits={businessUnits}
                                    profile={profile}
                                    openModal={openModal}
                                    setWorker={setWorker}
                                    setRoles={setRoles}
                                />
                                <UsersForm
                                    worker={worker}
                                    roles={roles}
                                    setWorker={setWorker}
                                    setRoles={setRoles}
                                    wrappedComponentRef={ref =>
                                        (modalRef.current = ref)
                                    }
                                />
                            </Fragment>
                        </Can>
                    </div>
                    <UsersTable
                        isVisible={isVisible}
                        setIsVisible={setIsVisible}
                        openModal={openModal}
                        setWorker={setWorker}
                        setRoles={setRoles}
                        selectedRow={selectedRow}
                        visibleColumns={visibleColumns}
                        handleFilterData={handleFilterData}
                        allBusinessUnits={allBusinessUnits}
                        getColumns={getColumns}
                    />
                </div>
            </section>
        </section>
    );
}
const mapStateToProps = state => ({
    users: state.usersReducer.users,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchUsers,
        fetchAllUsers,
        fetchBusinessUnitList,
        deleteUserById,
        fetchFilteredWorkers,
        fetchTableConfiguration,
        createTableConfiguration,
    }
)(Users);
