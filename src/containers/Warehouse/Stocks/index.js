/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
    ProDots,
    ProDotsItem,
    Table,
    NewButton,
    ProPagination,
    ProPageSelect,
} from 'components/Lib';
import { TableConfiguration } from 'components/Lib/TableConfiguration';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { cookies } from 'utils/cookies';
import {
    createStock,
    editStock,
    fetchStocks,
    fetchStocksCount,
    deleteStock,
} from 'store/actions/stock';
import swal from '@sweetalert/with-react';
import { fetchStockTypes } from 'store/actions/settings/anbar';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchUsers } from 'store/actions/users';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { connect } from 'react-redux';
import { Row, Col, Tooltip, Dropdown, Menu } from 'antd';
import { AiOutlineDown, BiUnite } from 'react-icons/all';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    filterQueryResolver,
} from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import queryString from 'query-string';

import { useHistory, useLocation } from 'react-router-dom';
import { STOCK_TABLE_SETTING_DATA } from 'utils/table-config/stocksModule';
import { fetchAllStocks } from 'store/actions/export-to-excel/stocksModule';
import { IoFilterCircleOutline } from 'react-icons/io5';
import styles from '../styles.module.scss';
import UpdateWarehouse from './UpdateWarehouse';
import StocksSidebar from './Sidebar';

const Stocks = props => {
    const {
        isLoading,
        stocks,
        stocksCount,
        fetchStocks,
        fetchAllStocks,
        fetchStocksCount,
        fetchStockTypes,
        fetchUsers,
        deleteStock,
        tableConfiguration,
        mainCurrencyCode,
        permissionsByKeyValue,
        fetchTableConfiguration,
        createTableConfiguration,
        profile,
        fetchBusinessUnitList,
        businessUnits,
    } = props;

    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
    const [stockTypes, setStocktypes] = useState([]);
    const [users, setUsers] = useState([]);
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [visible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        STOCK_TABLE_SETTING_DATA
    );
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [exStocks, setExStocks] = useState([]);
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );

    const handleMenuClick = ({ key }) => {
        history.push({
            pathname: location.pathName,
            search: `${filterQueryResolver({ ...filters })}&tkn_unit=${
                key == 'null' ? 0 : key
            }`,
        });
    };
    const menu = (
        <Menu
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            onClick={handleMenuClick}
        >
            {profile.businessUnits?.length === 0
                ? businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={() => {
                              setModalIsVisible(true);
                              setStocktypes([]);
                              setUsers([]);
                          }}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={() => {
                              setModalIsVisible(true);
                              setStocktypes([]);
                              setUsers([]);
                          }}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))}
        </Menu>
    );
    const getSTocksWithTotal = stocks => {
        const totalPrice = stocks.reduce(
            (totalValue, currentValue) =>
                totalValue + Number(currentValue.price),
            0
        );

        const totalQuantity = stocks.reduce(
            (totalValue, currentValue) =>
                totalValue + Number(currentValue.quantity),
            0
        );
        return [
            ...stocks,
            {
                isTotal: true,
                id: 'Toplam qiymət',
                quantity: totalQuantity,
                price: totalPrice,
            },
        ];
    };

    const getColumns = ({ column }) => {
        const columns = [];
        columns[column.indexOf('name')] = {
            title: 'Anbar adı',
            dataIndex: 'name',
            width: 250,
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Tooltip title={value}>
                        {value.length > 15 ? value : value}
                    </Tooltip>
                ),
        };
        columns[column.indexOf('stock_type_name')] = {
            title: 'Anbar növü',
            width: 150,
            dataIndex: 'stock_type_name',
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? (
                    ''
                ) : value ? (
                    <Tooltip placement="topLeft" title={value}>
                        <span>{value}</span>
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('warehouseman_name')] = {
            title: 'Məsul şəxs',
            dataIndex: 'warehouseman_name',
            width: 200,
            align: 'left',
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? null : row.warehouseman_id ? (
                    <Tooltip
                        title={`${row.warehouseman_name || ''} ${row.lastname ||
                            ''}`}
                    >
                        {`${row.warehouseman_name ||
                            ''} ${row.warehouseman_lastname || ''}`}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };

        columns[column.indexOf('quantity')] = {
            title: 'Məhsul miqdarı',
            dataIndex: 'quantity',
            width: 150,
            align: 'center',
            render: value => formatNumberToLocale(defaultNumberFormat(value)),
        };

        if (permissionsByKeyValue.stocks_products_price.permission !== 0) {
            columns[column.indexOf('price')] = {
                title: 'Məhsulların dəyəri',
                width: 200,
                dataIndex: 'price',
                align: 'right',
                render: value =>
                    `${formatNumberToLocale(
                        defaultNumberFormat(value)
                    )} ${mainCurrencyCode}`,
            };
        }

        columns.push({
            title: 'Seç',
            align: 'center',
            width: 60,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Can I={accessTypes.manage} a={permissions.stock}>
                        <ProDots>
                            <>
                                <ProDotsItem
                                    label="Düzəliş et"
                                    icon="pencil"
                                    onClick={() => editStock(row)}
                                />
                                <ProDotsItem
                                    label="Sil"
                                    icon="trash"
                                    onClick={() => removeStock(row.id)}
                                />
                            </>
                        </ProDots>
                    </Can>
                ),
        });
        columns.unshift({
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (value, row, index) =>
                row.isTotal
                    ? 'Toplam:'
                    : (currentPage - 1) * pageSize + index + 1,
        });

        return columns;
    };
    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            q: params.q ? params.q : undefined,
            limit: pageSize,
            page: currentPage,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }
            fetchStocks(filters);
            fetchStocksCount(filters);
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

    useEffect(() => {
        fetchStockTypes();
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });

        fetchTableConfiguration({ module: 'stock' });
    }, []);

    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            const parseData = JSON.parse(tableConfiguration);
            const columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = STOCK_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(STOCK_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    useEffect(() => {
        getExcelData();
    }, [exStocks]);

    useEffect(() => {
        getExcelColumns(mainCurrencyCode);
    }, [visibleColumns]);

    const handleSaveSettingModal = column => {
        const tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        const filterColumn = column.filter(col => col.dataIndex !== 'id');
        const data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({ moduleName: 'stock', columnsOrder: data });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };
    useEffect(() => {
        if (mainCurrencyCode) {
            getExcelColumns(mainCurrencyCode);
        }
    }, [mainCurrencyCode]);
    const getExcelColumns = mainCurrencyCode => {
        const columnClone = [...visibleColumns];

        const columns = [];
        columns[columnClone.indexOf('name')] = {
            title: 'Anbar adı',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('stock_type_name')] = {
            title: 'Anbar növü',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('warehouseman_name')] = {
            title: 'Məsul şəxs',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('quantity')] = {
            title: 'Məhsul miqdarı',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('price')] = {
            title: `Məhsulların dəyəri (${mainCurrencyCode})`,
            width: { wpx: 200 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 80 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const columnFooterStyle = {
            font: { color: { rgb: 'FFFFFF' }, bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
        };
        const data = exStocks.map((item, index) => {
            let arr = [];
            columnClone.includes('name') &&
                (arr[columnClone.indexOf('name')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : { value: item.name || '-' });
            columnClone.includes('stock_type_name') &&
                (arr[columnClone.indexOf('stock_type_name')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : { value: item.stock_type_name || '-' });
            columnClone.includes('warehouseman_name') &&
                (arr[columnClone.indexOf('warehouseman_name')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              item.warehouseman_name +
                                  ' ' +
                                  item.warehouseman_lastname || '-',
                      });
            columnClone.includes('quantity') &&
                (arr[columnClone.indexOf('quantity')] = {
                    value: Number(item.quantity).toFixed(4) || '-',
                    style: item?.isTotal ? columnFooterStyle : '',
                });
            columnClone.includes('price') &&
                (arr[columnClone.indexOf('price')] = {
                    value: Number(
                        formatNumberToLocale(
                            defaultNumberFormat(item.price || 0)
                        ).replaceAll(',', '')
                    ),
                    style: item?.isTotal ? columnFooterStyle : '',
                });
            arr.unshift(
                item.isTotal
                    ? { value: 'Toplam:', style: columnFooterStyle }
                    : { value: index + 1 }
            );
            return arr;
        });
        setExcelData(data);
    };
    const removeStock = id => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['İmtina', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteStock(id, () => {
                    if ((stocksCount - 1) % pageSize == 0 && currentPage > 1) {
                        handlePaginationChange(currentPage - 1);
                    } else {
                        fetchStocks(filters);
                        fetchStocksCount(filters);
                    }
                });
            }
        });
    };

    const editStock = row => {
        setStocktypes([]);
        setUsers([]);
        setSelectedRow(row);
        setModalIsVisible(true);
    };
    useEffect(() => {
        if (!modalIsVisible) setSelectedRow(null);
    }, [modalIsVisible]);

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };

    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };
    useEffect(() => {
        if (modalIsVisible) {
            if (selectedRow !== null) {
                fetchUsers({
                    filters:
                        selectedRow.business_unit_id === null
                            ? { businessUnitIds: [0] }
                            : {
                                  businessUnitIds: [
                                      selectedRow.business_unit_id,
                                  ],
                              },
                });
            } else if (params?.BUSINESS_TKN_UNIT) {
                fetchUsers({
                    filters: { businessUnitIds: [params?.BUSINESS_TKN_UNIT] },
                });
            }
        } else {
            history.push({
                pathname: location.pathName,
                search: `${filterQueryResolver({ ...filters })}`,
            });
        }
    }, [params?.BUSINESS_TKN_UNIT, modalIsVisible]);

    const [openedSidebar, setOpenedSidebar] = React.useState(false);

    return (
        <div>
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={visible}
                AllStandartColumns={STOCK_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <StocksSidebar
                filters={filters}
                onFilter={onFilter}
                businessUnits={businessUnits}
                profile={profile}
                handlePaginationChange={handlePaginationChange}
                openedSidebar={openedSidebar}
                setOpenedSidebar={setOpenedSidebar}
            />

            <section className="scrollbar aside" style={{ padding: '0 32px' }}>
                <UpdateWarehouse
                    visible={modalIsVisible}
                    toggleVisible={setModalIsVisible}
                    fetchStocks={fetchStocks}
                    fetchStocksCount={fetchStocksCount}
                    filters={filters}
                    stockTypes={stockTypes}
                    users={users}
                    setUsers={setUsers}
                    setStocktypes={setStocktypes}
                    data={selectedRow}
                />
                <Row className={styles.pageToolsContainer}>
                    <Can I={accessTypes.manage} a={permissions.stock}>
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
                                <SettingButton onClick={toggleVisible} />
                                <ExportToExcel
                                    getExportData={() =>
                                        fetchAllStocks({
                                            filters: {
                                                ...filters,
                                                limit: 5000,
                                                page: undefined,
                                            },
                                            onSuccessCallback: data => {
                                                setExStocks(
                                                    getSTocksWithTotal(
                                                        data.data
                                                    )
                                                );
                                            },
                                        })
                                    }
                                    data={excelData}
                                    columns={excelColumns}
                                    excelTitle="Anbarlar"
                                    excelName="Anbarlar"
                                    filename="Anbarlar"
                                    count={stocksCount}
                                />
                                {profile.businessUnits?.length > 1 ? (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                        trigger={['click']}
                                    >
                                        <NewButton
                                            style={{ marginLeft: '15px' }}
                                            label="Yeni anbar"
                                            icon={
                                                <AiOutlineDown
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
                                                />
                                            }
                                        />
                                    </Dropdown>
                                ) : profile.businessUnits?.length === 1 ? (
                                    <NewButton
                                        style={{ marginLeft: '15px' }}
                                        onClick={() => setModalIsVisible(true)}
                                        label="Yeni anbar"
                                    />
                                ) : businessUnits?.length === 1 ? (
                                    <NewButton
                                        style={{ marginLeft: '15px' }}
                                        onClick={() => setModalIsVisible(true)}
                                        label="Yeni anbar"
                                    />
                                ) : (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                        trigger={['click']}
                                    >
                                        <NewButton
                                            style={{ marginLeft: '15px' }}
                                            label="Yeni anbar"
                                            icon={
                                                <AiOutlineDown
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
                                                />
                                            }
                                        />
                                    </Dropdown>
                                )}
                            </div>
                        </Col>
                    </Can>
                </Row>
                <Row style={{ marginBottom: '15px' }}>
                    <Table
                        loading={isLoading}
                        scroll={{ x: 'max-content', y: 500 }}
                        dataSource={getSTocksWithTotal(stocks)}
                        rowKey={record => record.id}
                        columns={getColumns({
                            column: visibleColumns,
                        })}
                        footer={false}
                        className={styles.tableFooter}
                    />
                </Row>

                <Row className={styles.paginationRow}>
                    <Col xs={24} sm={24} md={18}>
                        <ProPagination
                            currentPage={currentPage}
                            pageSize={pageSize}
                            total={stocksCount || 0}
                            onChange={handlePaginationChange}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6} align="end">
                        <ProPageSelect
                            total={stocksCount || 0}
                            onChange={newPageSize =>
                                handlePageSizeChange(1, newPageSize)
                            }
                            value={pageSize}
                        />
                    </Col>
                </Row>
            </section>
        </div>
    );
};

const mapStateToProps = state => ({
    isLoading: state.loadings.fetchStocks,
    users: state.usersReducer.users,
    mainCurrencyCode: state.stockReducer.mainCurrencyCode,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
    stocks: state.stockReducer.stocks,
    stocksCount: state.stockReducer.stocksCount,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
    mapStateToProps,
    {
        fetchStocks,
        fetchStocksCount,
        createStock,
        createTableConfiguration,
        fetchStockTypes,
        fetchAllStocks,
        fetchUsers,
        editStock,
        deleteStock,
        fetchBusinessUnitList,
        fetchTableConfiguration,
    }
)(Stocks);
