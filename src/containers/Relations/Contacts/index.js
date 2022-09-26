/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { Row, Col, Tooltip } from 'antd';
import { fetchUsers } from 'store/actions/users';
import queryString from 'query-string';
import { IoFilterCircleOutline } from 'react-icons/io5';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';

import {
    ExcelButton,
    CustomTag,
    Table,
    NewButton,
    ProDots,
    ProDotsItem,
    ProPagination,
    ProPageSelect,
    ProTooltip,
    ProIcon,
    DetailButton,
    TableConfiguration,
} from 'components/Lib';
import {
    fetchContacts,
    fetchFilteredContacts,
    deleteContact,
} from 'store/actions/contacts-new';
import { filterQueryResolver } from 'utils';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import swal from '@sweetalert/with-react';
import ExportJsonExcel from 'js-export-excel';
import { AddFormModal } from 'containers/Settings/#shared';
import { contactCategories } from 'utils/constants';
import PropTypes from 'prop-types';
import Can from 'components/Lib/Can';
import { permissions, accessTypes } from 'config/permissions';
import { isNumber } from 'lodash';
import ContactsSidebar from './ContactsSidebar';
import MoreDetails from './MoreDetails';
import CashboxInfoButton from '../CashboxInfoButton';
import styles from './styles.module.scss';
import { CONTACTS_TABLE_SETTING_DATA } from 'utils/table-config/relationsModule';
import { fetchAllFilteredContacts } from 'store/actions/export-to-excel/relations';

const Contacts = ({
    isLoading,
    actionLoading,
    contacts,
    fetchTableConfiguration,
    createTableConfiguration,
    tableConfiguration,
    filteredContacts,
    fetchContacts,
    fetchFilteredContacts,
    fetchAllFilteredContacts,
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    deleteContact,
    total,
    fetchUsers,
    users,
    permissionsList,
}) => {
    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

    const [isVisible, setIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [activeTab, setActiveTab] = useState(0);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        CONTACTS_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exContacts, setExContact] = useState([]);
    const filterData = {
        types: params.types ? params.types : null, // array
        categories: params.categories ? params.categories : null, // array
        name: params.name ? params.name : null, // string
        managers: params.managers ? params.managers : null, // array
        description: params.description ? params.description : null, // array
        limit: pageSize, // number
        page: currentPage, // number
    };

    const [filters, onFilter, setFilters] = useFilterHandle(
        filterData,
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }

            fetchFilteredContacts({ filters });
        }
    );

    const [rerender, setRerender] = useState(0);
    const popstateEvent = () => {
        setRerender(rerender + 1);
    };

    useEffect(() => {
        window.addEventListener('popstate', popstateEvent);
        return () => window.removeEventListener('popstate', popstateEvent);
    }, [rerender]);

    useEffect(() => {
        const parmas = queryString.parse(location.search, {
            arrayFormat: 'bracket',
        });

        if (rerender > 0) {
            parmas.history = 1;

            if (parmas.page && !isNaN(parmas.page)) {
                setCurrentPage(parseInt(parmas.page));
            }
            setFilters({ ...parmas });
        }
        // /console.log(parmas);
    }, [rerender]);

    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };

    const handleDetailClick = row => {
        fetchInvoiceListByContactId(row.id);
        fetchAdvancePaymentByContactId(row.id);
        setSelectedRow(row);
        setIsVisible(true);
    };
    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Contacts-Relations',
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
            const column = CONTACTS_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(CONTACTS_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const handleDeleteClick = id => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteContact(id, () => {
                    if ((total - 1) % pageSize == 0 && currentPage > 1) {
                        handlePaginationChange(currentPage - 1);
                    } else {
                        fetchFilteredContacts({ filters });
                    }
                });
            }
        });
    };

    const handleCategoryNames = (categories = []) =>
        categories.map(category => contactCategories[category]?.name);

    const handleEditClick = row => {
        history.push(`/relations/contacts/edit/${row.id}`);
    };

    const handleExport = () => {
        const data = contacts || '';
        const option = {};
        const dataTable = data.map(dataItem => ({
            Id: dataItem.id,
            Type: dataItem.type,
            Categories: dataItem.categories.join(', '),
            Name: dataItem.name,
            'Customer type': dataItem.priceType,
            Position: dataItem.position,
            Company: dataItem.company,
            'Phone numbers': dataItem.phoneNumbers.join(', '),
            Emails: dataItem.emails.join(', '),
            Websites: dataItem.websites.join(', '),
            Status: dataItem.status,
            Manager: dataItem.manager,
        }));

        option.fileName = 'orders';
        option.datas = [
            {
                sheetData: dataTable,
                shhetName: 'sheet',
                sheetFilter: [
                    'Id',
                    'Type',
                    'Categories',
                    'Name',
                    'Customer type',
                    'Position',
                    'Company',
                    'Phone numbers',
                    'Emails',
                    'Websites',
                    'Status',
                    'Manager',
                ],
                sheetHeader: [
                    'Id',
                    'Type',
                    'Categories',
                    'Name',
                    'Customer type',
                    'Position',
                    'Company',
                    'Phone numbers',
                    'Emails',
                    'Websites',
                    'Status',
                    'Manager',
                ],
            },
        ];

        const toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    };

    useEffect(() => {
        fetchContacts();
        fetchUsers({});
        fetchTableConfiguration({ module: 'Contacts-Relations' });
    }, []);

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('type')] = {
            title: 'Əlaqə tipi',
            dataIndex: 'type',
            align: 'left',
            width: 150,
            render: value =>
                value === 'Legal entity' ? 'Hüquqi şəxs' : 'Fiziki şəxs',
        };
        columns[column.indexOf('categoryIds')] = {
            title: 'Kateqoriya',
            dataIndex: 'categoryIds',
            align: 'left',
            width: 150,
            render: value => (
                <>
                    {handleCategoryNames(value)[0] || '-'}
                    {value[0] && (
                        <ProTooltip
                            title={handleCategoryNames(value)}
                            align="right"
                        />
                    )}
                </>
            ),
        };
        columns[column.indexOf('name')] = {
            title: 'Ad',
            dataIndex: 'name',
            align: 'left',
            ellipsis: true,
            width: 150,
            render: (value, row) => (
                <div className={styles.InfoContener}>
                    <div className={styles.ellipseDiv}>
                        <Tooltip placement="topLeft" title={value}>
                            <span>{value || '-'}</span>
                        </Tooltip>
                    </div>

                    <div>
                        {permissionsList.transaction_recievables_report
                            .permission !== 0 &&
                        permissionsList.transaction_payables_report
                            .permission !== 0 ? (
                            <CashboxInfoButton
                                fetchInfo={callback =>
                                    fetchInvoiceListByContactId(
                                        row?.id,
                                        callback
                                    )
                                }
                                fetchAdvance={callback =>
                                    fetchAdvancePaymentByContactId(
                                        row?.id,
                                        {},
                                        callback
                                    )
                                }
                            />
                        ) : null}
                    </div>
                </div>
            ),
        };

        columns[column.indexOf('phoneNumbers')] = {
            title: 'Əlaqə tel',
            dataIndex: 'phoneNumbers',
            align: 'left',
            width: 180,
            render: value => (
                <>
                    {value[0] || '-'}
                    {value[0] && <ProTooltip title={value} align="right" />}
                </>
            ),
        };
        columns[column.indexOf('emails')] = {
            title: 'Email',
            dataIndex: 'emails',
            key: 'emails',
            align: 'left',
            ellipsis: true,
            width: 180,
            render: value => (
                <>
                  
                    <Tooltip placement="topLeft"  title={value[0]}>
                  {  (value[0]?.length>15?
                                value[0]?.slice(0,14)+'...':value[0])||'-'}
                    </Tooltip>
                  
                    {value[0] && (
                        <ProTooltip title={value} align="right">
                            <ProIcon width={16} height={16} />
                        </ProTooltip>
                    )}
                </>
            ),
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            width: 120,
            render: value => (
                <CustomTag label={value === 'Active' ? 'Aktiv' : 'Deaktiv'} />
            ),
        };
        columns[column.indexOf('manager')] = {
            title: 'Menecer',
            dataIndex: 'manager',
            align: 'left',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('voen')] = {
            title: 'VÖEN',
            dataIndex: 'voen',
            align: 'left',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('websites')] = {
            title: 'Websayt',
            dataIndex: 'websites',
            align: 'left',
            width: 180,
            ellipsis: true,
            render: value =>
            <>
         
                    <Tooltip placement="topLeft" title={value[0]}>
                    {  (value[0]?.length>15?
                                value[0]?.slice(0,14)+'...':value[0])||'-'}
                                 </Tooltip>
                    
                   { value?.length>1  && (
                        <ProTooltip title={value} align="right">
                            <ProIcon width={16} height={16} />
                        </ProTooltip>
                    )}
                    </>
        };
        columns[column.indexOf('address')] = {
            title: 'Ünvan',
            dataIndex: 'address',
            align: 'left',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('priceType')] = {
            title: 'Qiymət tipi',
            dataIndex: 'priceType',
            align: 'left',
            width: 150,
            ellipsis:true,
            render: value => 
            <Tooltip placement="topLeft"  title={value||'Satış'}>
            {  value ||'Satış'}
              </Tooltip>,
        };
        columns[column.indexOf('description')] = {
            title: 'Əlavə məlumat',
            dataIndex: 'description',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: (value, row) =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('createdAt')] = {
            title: 'Əməliyyat tarixi',
            dataIndex: 'createdAt',
            render: (date, row) => date?.split('  '),
            width: 180,
        };
        columns[column.indexOf('createdBy')] = {
            title: 'Əlavə olunub',
            dataIndex: 'createdBy',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: (value, row) =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('officialName')] = {
            title: 'Şirkət adı',
            dataIndex: 'officialName',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('generalDirector')] = {
            title: 'Baş direktor',
            dataIndex: 'generalDirector',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('companyVoen')] = {
            title: 'VÖEN (Şirkət)',
            dataIndex: 'companyVoen',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('bankName')] = {
            title: 'Bank adı',
            dataIndex: 'bankName',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('bankVoen')] = {
            title: 'VÖEN (Bank)',
            dataIndex: 'bankVoen',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('bankCode')] = {
            title: 'Kod',
            dataIndex: 'bankCode',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('correspondentAccount')] = {
            title: 'Müxbir hesab (M/h)',
            dataIndex: 'correspondentAccount',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('settlementAccount')] = {
            title: 'Hesablaşma hesabı (H/h)',
            dataIndex: 'settlementAccount',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('swift')] = {
            title: 'S.W.I.F.T.',
            dataIndex: 'swift',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns.push({
            title: 'Seç',
            dataIndex: 'details',
            align: 'left',
            width: 80,
            render: (_, row) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailClick(row)} />
                    <Can I={accessTypes.manage} a={permissions.contact}>
                        <ProDots>
                            <>
                                <ProDotsItem
                                    label="Düzəliş et"
                                    icon="pencil"
                                    onClick={() => handleEditClick(row)}
                                />
                                <ProDotsItem
                                    label="Sil"
                                    icon="trash"
                                    onClick={() => handleDeleteClick(row.id)}
                                />
                            </>
                        </ProDots>
                    </Can>
                </div>
            ),
        });
        columns.unshift({
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 70,
            render: (_value, _item, index) =>
                (currentPage - 1) * pageSize + index + 1,
        });
        return columns;
    };
    const modalClose = () => {
        setIsVisible(false);
        setActiveTab(0);
    };

    // Excel table columns
    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('type')] = {
            title: 'Əlaqə tipi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('categoryIds')] = {
            title: 'Kateqoriya',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('name')] = {
            title: 'Ad',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('phoneNumbers')] = {
            title: 'Əlaqə tel',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('emails')] = {
            title: 'Email',
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('status')] = {
            title: 'Status',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('manager')] = {
            title: 'Menecer',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('voen')] = {
            title: 'VÖEN',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('websites')] = {
            title: 'Websayt',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('address')] = {
            title: 'Ünvan',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('priceType')] = {
            title: 'Qiymət tipi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('createdAt')] = {
            title: 'Əməliyyat tarixi',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('createdBy')] = {
            title: 'Əlavə olunub',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('officialName')] = {
            title: 'Şirkət adı',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('generalDirector')] = {
            title: 'Baş direktor',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('companyVoen')] = {
            title: 'VÖEN (Şirkət)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('bankName')] = {
            title: 'Bank adı',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('bankVoen')] = {
            title: 'VÖEN (Bank)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('bankCode')] = {
            title: 'Kod',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('correspondentAccount')] = {
            title: 'Müxbir hesab (M/h)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('settlementAccount')] = {
            title: 'Hesablaşma hesabı (H/h)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('swift')] = {
            title: 'S.W.I.F.T.',
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
        const data = exContacts.map((item, index) => {
            let arr = [];
            columnClone.includes('type') &&
                (arr[columnClone.indexOf('type')] = {
                    value:item.type==='Legal entity' ? 'Hüquqi şəxs' : 'Fiziki şəxs',
                });
            columnClone.includes('categoryIds') &&
                (arr[columnClone.indexOf('categoryIds')] = {
                    value: handleCategoryNames(item.categoryIds)?.join() || '-',
                });
            columnClone.includes('name') &&
                (arr[columnClone.indexOf('name')] = {
                    value: item.name || '-',
                });
            columnClone.includes('phoneNumbers') &&
                (arr[columnClone.indexOf('phoneNumbers')] = {
                    value: item.phoneNumbers?.join() || '-',
                });

            columnClone.includes('emails') &&
                (arr[columnClone.indexOf('emails')] = {
                    value: item.emails?.join() || '-',
                });

            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = {
                    value: item.status==='Active'? 'Aktiv' : 'Deaktiv',
                });
            columnClone.includes('manager') &&
                (arr[columnClone.indexOf('manager')] = {
                    value: item.manager || '-',
                });
            columnClone.includes('voen') &&
                (arr[columnClone.indexOf('voen')] = {
                    value: item.voen || '-',
                });
            columnClone.includes('websites') &&
                (arr[columnClone.indexOf('websites')] = {
                    value: item.websites?.join() || '-',
                });
            columnClone.includes('address') &&
                (arr[columnClone.indexOf('address')] = {
                    value: item.address || '-',
                });
            columnClone.includes('priceType') &&
                (arr[columnClone.indexOf('priceType')] = {
                    value: item.priceType || 'Satış',
                });
            columnClone.includes('description') &&
                (arr[columnClone.indexOf('description')] = {
                    value: item.description || '-',
                });
            columnClone.includes('createdAt') &&
                (arr[columnClone.indexOf('createdAt')] = {
                    value: item?.createdAt || '-',
                });
            columnClone.includes('createdBy') &&
                (arr[columnClone.indexOf('createdBy')] = {
                    value: item.createdBy || '-',
                });
            columnClone.includes('officialName') &&
                (arr[columnClone.indexOf('officialName')] = {
                    value: item.officialName || '-',
                });
            columnClone.includes('generalDirector') &&
                (arr[columnClone.indexOf('generalDirector')] = {
                    value: item.generalDirector || '-',
                });
            columnClone.includes('companyVoen') &&
                (arr[columnClone.indexOf('companyVoen')] = {
                    value: item.companyVoen || '-',
                });
            columnClone.includes('bankName') &&
                (arr[columnClone.indexOf('bankName')] = {
                    value: item.bankName || '-',
                });
            columnClone.includes('bankVoen') &&
                (arr[columnClone.indexOf('bankVoen')] = {
                    value: item.bankVoen || '-',
                });
            columnClone.includes('bankCode') &&
                (arr[columnClone.indexOf('bankCode')] = {
                    value: item.bankCode || '-',
                });
            columnClone.includes('correspondentAccount') &&
                (arr[columnClone.indexOf('correspondentAccount')] = {
                    value: item.correspondentAccount || '-',
                });
            columnClone.includes('settlementAccount') &&
                (arr[columnClone.indexOf('settlementAccount')] = {
                    value: item.settlementAccount || '-',
                });

            columnClone.includes('swift') &&
                (arr[columnClone.indexOf('swift')] = {
                    value: item.swift || '-',
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
    }, [exContacts]);

    const [openedSidebar, setOpenedSidebar] = React.useState(false);

    return (
        <>
            <ContactsSidebar
                onFilter={onFilter}
                persons={users}
                filterData={filters}
                handlePaginationChange={handlePaginationChange}
                fetchUsers={fetchUsers}
                openedSidebar={openedSidebar}
                setOpenedSidebar={setOpenedSidebar}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={CONTACTS_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <section
                className="aside-without-navigation scrollbar"
                style={{ padding: '0 32px' }}
            >
                <AddFormModal
                    width={760}
                    withOutConfirm
                    onCancel={modalClose}
                    visible={isVisible}
                >
                    <MoreDetails
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        visible={isVisible}
                        row={selectedRow}
                        onCancel={modalClose}
                    />
                </AddFormModal>

                <section
                    className="scrollbar aside"
                    style={{ padding: '0 32px' }}
                >
                    <Row className={styles.pageToolsContainer}>
                        <Col span={24}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <div className={styles.responsiveFilterButton}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenedSidebar(!openedSidebar)
                                        }
                                    >
                                        <IoFilterCircleOutline />
                                    </button>
                                </div>
                                <Can
                                    I={accessTypes.manage}
                                    a={permissions.contact}
                                >
                                    <SettingButton onClick={toggleVisible} />
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            marginRight: '15px',
                                        }}
                                    >
                                        <ExportToExcel
                                            getExportData={() =>
                                                fetchAllFilteredContacts({
                                                    filters: {
                                                        ...filters,
                                                        limit: 5000,
                                                        page: undefined,
                                                    },
                                                    onSuccessCallback: data => {
                                                        setExContact(data.data);
                                                    },
                                                })
                                            }
                                            data={excelData}
                                            columns={excelColumns}
                                            excelTitle="Əlaqələr"
                                            excelName="Əlaqələr"
                                            filename="Əlaqələr"
                                            count={total}
                                        />
                                    </span>
                                    <Link to="/relations/contacts/new">
                                        <NewButton label="Yeni əlaqə" />
                                    </Link>
                                </Can>
                            </div>
                        </Col>
                    </Row>
                    <Table
                        loading={isLoading || actionLoading}
                        columns={getColumns({ column: visibleColumns })}
                        dataSource={filteredContacts}
                        size="middle"
                        // className={styles.customTable}
                        pagination={false}
                        scroll={{ x: 'max-content', y: 500 }}
                    />
                    <Row className={styles.paginationRow}>
                        <Col xs={24} sm={24} md={18}>
                            <ProPagination
                                isLoading={isLoading}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                onChange={handlePaginationChange}
                                total={total}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={6} align="end">
                            <ProPageSelect
                                pageSize={pageSize}
                                onChange={e =>
                                    handlePageSizeChange(currentPage, e)
                                }
                                total={total}
                            />
                        </Col>
                    </Row>
                </section>
            </section>
        </>
    );
};

Contacts.propTypes = {
    isLoading: PropTypes.bool,
    actionLoading: PropTypes.bool,
    contacts: PropTypes.array,
    filteredContacts: PropTypes.array,
    fetchContacts: PropTypes.func,
    fetchFilteredContacts: PropTypes.func,
    deleteContact: PropTypes.func,
    total: PropTypes.number,
};

const mapStateToProps = state => ({
    isLoading: state.newContactsReducer.isLoading,
    actionLoading: state.newContactsReducer.actionIsLoading,
    contacts: state.newContactsReducer.contacts,
    filteredContacts: state.newContactsReducer.filteredContacts,
    total: state.newContactsReducer.total,
    users: state.usersReducer.users,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchContacts,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchFilteredContacts,
        fetchAllFilteredContacts,
        deleteContact,
        fetchUsers,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
    }
)(Contacts);
