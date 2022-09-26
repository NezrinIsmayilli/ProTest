/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { Row, Col } from 'antd';
import { fetchFilteredPartners, deletePartner } from 'store/actions/partners';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { fetchCustomerTypes } from 'store/actions/contacts-new';
import swal from '@sweetalert/with-react';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
    Table,
    ProPagination,
    ProPageSelect,
    NewButton,
    TableConfiguration,
} from 'components/Lib';
import Can from 'components/Lib/Can';
import { useTranslation } from 'react-i18next';
import { contactCategories } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { IoFilterCircleOutline } from 'react-icons/io5';
import { getColumns } from './columns';
import PartnersSidebar from './PartnersSidebar/index';
import MoreDetails from './MoreDetails';
import styles from './styles.module.scss';
import { fetchAllFilteredPartners } from 'store/actions/export-to-excel/relations';
import { PARTNERS_TABLE_SETTING_DATA } from 'utils/table-config/relationsModule';

const Partners = props => {
    const {
        total,
        isLoading,
        customerTypes,
        fetchCustomerTypes,
        filteredPartners,
        fetchAllFilteredPartners,
        fetchFilteredPartners,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        deletePartner,
        permissionsList,
    } = props;
    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
    const [isVisible, setIsVisible] = useState(false);
    const [contactId, setContactId] = useState({});
    const [partnerId, setPartnerId] = useState({});
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        PARTNERS_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exPartners, setExPartners] = useState([]);
    const { t } = useTranslation();
    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        onFilter('limit', size);
        onFilter('page', 1);
        setCurrentPage(1);
        setPageSize(size);
    };

    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            email: params.email ? params.email : null, // string
            name: params.name ? params.name : null, // string
            status: params.status ? params.status : null, // string
            description: params.description ? params.description : null,
            limit: pageSize,
            page: currentPage,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }

            fetchFilteredPartners({ filters });
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
    }, [rerender]);

    const handleDetailClick = row => {
        setContactId(row.contactId);
        setPartnerId(row.id);
        return (() => setIsVisible(true))();
    };
    const handleCategoryNames = (categories = []) =>
        categories.map(category => contactCategories[category]?.name);

    const handleDeleteClick = id => {
        swal({
            title: t('relations:partners:attention'),
            text: t('relations:partners:deleteApproval'),
            buttons: [
                t('relations:partners:cancel'),
                t('relations:partners:delete'),
            ],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deletePartner(id, () => {
                    if ((total - 1) % pageSize == 0 && currentPage > 1) {
                        handlePaginationChange(currentPage - 1);
                    } else {
                        fetchFilteredPartners({ filters });
                    }
                });
            }
        });
    };
    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Partners-Relations',
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
            const column = PARTNERS_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(PARTNERS_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const handleEditClick = row => {
        history.push(`/relations/partners/edit/${row.id}`);
    };

    useEffect(() => {
        fetchCustomerTypes();
        fetchTableConfiguration({ module: 'Partners-Relations' });
    }, []);

    // Excel table columns
    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];

        columns[columnClone.indexOf('name')] = {
            title: 'Partnyor',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('email')] = {
            title: 'Email',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('phoneNumbers')] = {
            title: 'Mobil telefon',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('categoryIds')] = {
            title: 'Kateqoriya',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('priceTypeId')] = {
            title: 'Qiymət tipi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Əlaqə statusu',
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
        columns[columnClone.indexOf('deliveryAddress')] = {
            title: 'Çatdırılma ünvanı',
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
        const data = exPartners.map((item, index) => {
            let arr = [];
            columnClone.includes('name') &&
                (arr[columnClone.indexOf('name')] = {
                    value: item.name || '-',
                });

            columnClone.includes('email') &&
                (arr[columnClone.indexOf('email')] = {
                    value: item.email || '-',
                });
            columnClone.includes('phoneNumbers') &&
                (arr[columnClone.indexOf('phoneNumbers')] = {
                    value: item.phoneNumbers?.join() || '-',
                });

            columnClone.includes('categoryIds') &&
                (arr[columnClone.indexOf('categoryIds')] = {
                    value: handleCategoryNames(item.categoryIds)?.join() || '-',
                });
            columnClone.includes('priceTypeId') &&
                (arr[columnClone.indexOf('priceTypeId')] = {
                    value:
                        customerTypes &&
                        item.priceTypeId &&
                        customerTypes.length > 0
                            ? customerTypes.filter(
                                  customerType =>
                                      customerType.id === item.priceTypeId
                              )[0]?.name || 'Satış'
                            : 'Satış',
                });
            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = {
                    value:
                        item.status === 'active'
                            ? 'Qoşulub.'
                            : 'Partnyorluq təklifi göndərilib.',
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
            columnClone.includes('deliveryAddress') &&
                (arr[columnClone.indexOf('deliveryAddress')] = {
                    value: item.address || '-',
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
    }, [exPartners]);

    const [openedSidebar, setOpenedSidebar] = React.useState(false);

    return (
        <>
            <PartnersSidebar
                filters={filters}
                onFilter={onFilter}
                handlePaginationChange={handlePaginationChange}
                setCurrentPage={setCurrentPage}
                openedSidebar={openedSidebar}
                setOpenedSidebar={setOpenedSidebar}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={PARTNERS_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <section
                className="aside-without-navigation scrollbar"
                style={{ padding: '0 32px' }}
            >
                {isVisible && (
                    <MoreDetails
                        visible={isVisible}
                        id={contactId}
                        partnerId={partnerId}
                        setIsVisible={setIsVisible}
                    />
                )}
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
                                    a={permissions.partner}
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
                                                fetchAllFilteredPartners({
                                                    filters: {
                                                        ...filters,
                                                        limit: 5000,
                                                        page: undefined,
                                                    },
                                                    onSuccessCallback: data => {
                                                        setExPartners(
                                                            data.data
                                                        );
                                                    },
                                                })
                                            }
                                            data={excelData}
                                            columns={excelColumns}
                                            excelTitle="Partnyorlar"
                                            excelName="Partnyorlar"
                                            filename="Partnyorlar"
                                            count={total}
                                        />
                                    </span>
                                    <Link to="/relations/partners/new">
                                        <NewButton
                                            label={t(
                                                'relations:partners:newPartner'
                                            )}
                                        />
                                    </Link>
                                </Can>
                            </div>
                        </Col>
                    </Row>
                    <Table
                        loading={isLoading}
                        size="middle"
                        columns={getColumns({
                            column: visibleColumns,
                            pageSize,
                            currentPage,
                            customerTypes,
                            handleDetailClick,
                            handleDeleteClick,
                            handleEditClick,
                            fetchInvoiceListByContactId,
                            fetchAdvancePaymentByContactId,
                            permissionsList,
                        })}
                        dataSource={filteredPartners}
                        pagination={false}
                        scroll={{ x: 'max-content', y: 500 }}
                        rowKey={record => record.id}
                    />
                    <Row className={styles.paginationRow}>
                        <Col xs={24} sm={24} md={18}>
                            <ProPagination
                                isLoading={isLoading}
                                current={currentPage}
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

const mapStateToProps = state => ({
    total: state.partnersReducer.total,
    isLoading: state.partnersReducer.isLoading,
    customerTypes: state.newContactsReducer.customerTypes,
    filteredPartners: state.partnersReducer.filteredPartners,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        deletePartner,
        fetchCustomerTypes,
        fetchFilteredPartners,
        fetchAllFilteredPartners,
        fetchInvoiceListByContactId,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchAdvancePaymentByContactId,
    }
)(Partners);
