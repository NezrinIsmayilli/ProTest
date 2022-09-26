import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, Col, Row, Tooltip } from 'antd';
import { useHistory, Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import {
    Can,
    Table,
    ProPageSelect,
    ProPagination,
    DetailButton,
    ProDots,
    ProDotsItem,
    ProModal,
    ProButton,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import moment from 'moment';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';
import { deleteInvoice } from 'store/actions/operations';
import {
    fetchMainCurrency,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import axios from 'axios';
import InitialWarehouseDetails from './initialWarehouseDetails';
import styles from './styles.module.scss';

function InitialRemainsWarehouse(props) {
    const {
        invoices,
        isLoading,
        actionLoading,
        invoicesCount,

        deleteInvoice,
        fetchSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
        fetchMainCurrency,
        fetchBusinessUnitList,
        fetchCurrencies,
        permissionsList,
        mainCurrency,
        businessUnits,
    } = props;

    const history = useHistory();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const stocks = urlParams.get('stocks');
    const isDeleted = urlParams.get('isDeleted');

    const [pageSize, setPageSize] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedRow, setSelectedRow] = useState({});
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });
    const [filters, onFilter] = useFilterHandle(
        {
            invoiceTypes: [7],
            invoices: undefined,
            stocks:
                stocks !== null && stocks !== ''
                    ? stocks.split(',').map(Number)
                    : undefined,
            dateFrom: undefined,
            dateTo: undefined,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            limit: pageSize,
            page: currentPage,
            isDeleted: isDeleted === null ? 0 : isDeleted,
        },
        ({ filters }) => {
            fetchSalesInvoiceList({ filters });
            fetchSalesInvoiceCount({ filters });
        }
    );

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
        setVisible(!visible);
        setSelectedRow(row);
    };

    const handleDeleteClick = (row, array) => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                if (array) {
                    const notRemovedData = [];
                    Promise.all(
                        row.map(async item => {
                            try {
                                const { data } = await axios.delete(
                                    `/sales/invoices/${item}`
                                );
                            } catch (error) {
                                notRemovedData.push(item);
                            }
                        })
                    ).then(results => {
                        fetchSalesInvoiceList({
                            filters,
                        });
                        fetchSalesInvoiceCount({
                            filters,
                        });
                        setCheckList({
                            checkedListAll: [],
                            ItemsChecked: false,
                        });
                        if (notRemovedData.length > 0) {
                            const arr = invoices
                                .filter(item =>
                                    notRemovedData.includes(item.id)
                                )
                                .map(item => item.invoiceNumber);
                            toast.error(
                                `${arr.toString()} nömrəli sənədlər silinə bilməz`
                            );
                        }
                    });
                } else {
                    deleteInvoice({
                        id: row.id,
                        attribute: {},
                        onSuccess: () => {
                            fetchSalesInvoiceList({
                                filters,
                            });
                            fetchSalesInvoiceCount({
                                filters,
                            });
                        },
                    });
                }
            }
        });
    };

    useEffect(() => {
        if (!mainCurrency.id) fetchMainCurrency();
    }, [fetchMainCurrency, mainCurrency.id]);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, [fetchBusinessUnitList]);

    const getStatusOfOperationLabel = statusOfOperation =>
        statusOfOperation === 1 ? (
            <span
                className={styles.chip}
                style={{
                    color: '#F3B753',
                    background: '#FDF7EA',
                }}
            >
                Aktiv
            </span>
        ) : (
            <span
                style={{
                    color: '#C4C4C4',
                    background: '#F8F8F8',
                }}
                className={styles.chip}
            >
                Silinib
            </span>
        );

    const columns = [
        {
            title: '',
            width: 46,
            dataIndex: 'id',
            render(val, row) {
                return (
                    <Can
                        I={accessTypes.manage}
                        a={permissions.sales_init_invoice}
                    >
                        <Checkbox
                            disabled={row.isDeleted}
                            checked={checkList.checkedListAll.includes(val)}
                            onChange={event => handleCheckboxes(row, event)}
                        />
                    </Can>
                );
            },
        },
        {
            title: '№',
            width: 80,
            render: (value, row, index) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Qalıq tarixi',
            dataIndex: 'operationDate',
            render: (date, row) => (row.isTotal ? null : date || ''),
            width: 180,
        },
        {
            title: 'Sənəd',
            dataIndex: 'invoiceNumber',
            align: 'center',
            width: 200,
            render: (value, row) => (row.isTotal ? null : value),
        },

        {
            title: 'Anbar adı',
            dataIndex: 'stockName',
            align: 'left',
            width: 150,
            render: value => value,
        },

        {
            title: 'Məhsul miqdarı',
            dataIndex: 'totalQuantity',
            width: 150,
            align: 'center',
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || '-',
        },
        {
            title: 'Məhsulların dəyəri',
            width: 200,
            dataIndex: 'amount',
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.currencyCode
                }`,
        },
        {
            title: 'Status',
            dataIndex: 'statusOfOperation',
            align: 'center',
            width: 130,
            render: value => getStatusOfOperationLabel(value),
        },
        {
            title: 'Seç',
            dataIndex: 'id',
            width: 90,
            align: 'center',
            render: (value, row) => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailClick(row)} />
                    <Can
                        I={accessTypes.manage}
                        a={permissions.sales_init_invoice}
                    >
                        <ProDots isDisabled={row.isDeleted}>
                            <>
                                <Link
                                    to={`/settings/initial-remains/initial-remains-warehouse/edit/${row.id}`}
                                >
                                    <ProDotsItem
                                        label="Düzəliş et"
                                        icon="pencil"
                                    />
                                </Link>
                                <ProDotsItem
                                    label="Sil"
                                    icon="trash"
                                    onClick={() => handleDeleteClick(row)}
                                />
                            </>
                        </ProDots>
                    </Can>
                </div>
            ),
        },
    ];

    const handleCheckbox = checked => {
        let collection = [];

        if (checked) {
            collection = getAllItems();
        }
        setCheckList({
            checkedListAll: collection,
            ItemsChecked: checked,
        });
    };
    const getAllItems = () => {
        const collection = [];
        for (const item of invoices) {
            if (!item.isDeleted) {
                collection.push(item.id);
            }
        }

        return collection;
    };

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = invoices;

            setCheckList(prevState => ({
                checkedListAll: [...prevState.checkedListAll, row.id * 1],
                ItemsChecked:
                    collection.length === prevState.checkedListAll.length + 1,
            }));
        } else {
            setCheckList(prevState => ({
                checkedListAll: prevState.checkedListAll.filter(
                    item => item !== row.id
                ),
                ItemsChecked: false,
            }));
        }
    };

    return (
        <>
            <ProModal
                maskClosable
                padding
                width={1000}
                handleModal={handleDetailClick}
                visible={visible}
            >
                <InitialWarehouseDetails
                    row={selectedRow}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailClick}
                    visible={visible}
                    allBusinessUnits={allBusinessUnits}
                    {...props}
                />
            </ProModal>
            <section
                className="scrollbar aside"
                style={{ padding: '0 32px', marginTop: '10px' }}
            >
                <Row
                    style={{
                        margin: '20px 0',
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}
                >
                    <Col span={12} align="start">
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                margin: '0 12px 0',
                                alignItems: 'center',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.sales_init_invoice}
                            >
                                <Checkbox
                                    onChange={event =>
                                        handleCheckbox(event.target.checked)
                                    }
                                    checked={checkList.ItemsChecked}
                                />

                                <Button
                                    onClick={() =>
                                        handleDeleteClick(
                                            checkList.checkedListAll,
                                            true
                                        )
                                    }
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                    }}
                                    disabled={
                                        checkList.checkedListAll.length === 0
                                    }
                                >
                                    <Tooltip
                                        placement="bottom"
                                        title={`${'Silinmə'}${' '}(${
                                            checkList.checkedListAll.length
                                        })`}
                                    >
                                        <FaTrash
                                            size="20px"
                                            style={{
                                                marginTop: '5px',
                                            }}
                                        />
                                    </Tooltip>
                                </Button>
                            </Can>
                        </div>
                    </Col>
                    <Col span={12} align="end">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.sales_init_invoice}
                            >
                                <Link to="/settings/initial-remains/initial-remains-warehouse/add">
                                    <ProButton
                                        icon="plus"
                                        size="large"
                                        type="primary"
                                    >
                                        Məhsul əlavə et
                                    </ProButton>
                                </Link>
                            </Can>
                        </div>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    loading={isLoading || actionLoading}
                    dataSource={invoices}
                    rowKey={record => record.rowId}
                    className={styles.initialWarehouseTable}
                />
                <Row
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                    }}
                >
                    <Col span={16}>
                        <ProPagination
                            loading={isLoading}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onChange={handlePaginationChange}
                            total={invoicesCount}
                        />
                    </Col>
                    <Col span={6} offset={2} align="end">
                        <ProPageSelect
                            currentPage={currentPage}
                            pageSize={pageSize}
                            total={invoicesCount}
                            onChange={e => handlePageSizeChange(currentPage, e)}
                        />
                    </Col>
                </Row>
            </section>
        </>
    );
}
const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
    isLoading: state.salesAndBuysReducer.isLoading,
    actionLoading: state.salesAndBuysReducer.actionLoading,
    invoices: state.salesAndBuysReducer.invoices,
    invoicesCount: state.salesAndBuysReducer.invoicesCount,
    mainCurrency: state.kassaReducer.mainCurrency,
    businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
    mapStateToProps,
    {
        deleteInvoice,
        fetchSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
        fetchMainCurrency,
        fetchCurrencies,
        fetchBusinessUnitList,
    }
)(InitialRemainsWarehouse);
