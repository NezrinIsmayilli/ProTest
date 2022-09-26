import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    Table,
    ProSelect,
    ProModal,
    ProButton,
    ProAsyncSelect,
    ProPagination,
    ProPageSelect,
} from 'components/Lib';
import { cookies } from 'utils/cookies';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
} from 'utils';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchSalesInvoices } from 'store/actions/operations/sold-items';
import { fetchProducts } from 'store/actions/product';
import { RiErrorWarningLine } from 'react-icons/all';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import { fetchContacts } from 'store/actions/contacts-new';
import { Checkbox, Input, Row, Col } from 'antd';
import {
    setExpenses,
    setSelectedImportProducts,
    setSelectedProducts,
} from 'store/actions/sales-operation';

import math from 'exact-math';
import moment from 'moment';
import { Price, Trash } from '../invoice';
import styles from '../styles.module.scss';

const AddInvoice = props => {
    const {
        id,
        isVisible,
        selectedExpenses,
        currencies,
        setExpenses,
        invoice_expense_rate,
        operationsList,
        setFinanceDeleteVisible,
        setSelectedRow,
        financeDeleteLoading,
        fetchSalesInvoiceList,
        fetchContacts,
        fetchProducts,
        toggleModal,
        setSelectedInvoices,
        fetchSalesInvoices,
        setSelectedImportProducts,
        selectedImportProducts,
        invoiceInfo,
        setSelectedProducts,
        selectedProducts,
    } = props;

    const [invoice, setInvoice] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [pageSize, setPageSize] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        counterparty: [],
        products: [],
        invoices: [],
    });
    const [checkList, setCheckList] = useState([]);

    const handlePaginationChange = value => (() => setCurrentPage(value))();
    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
    };

    const handleCreateInvoice = () => {
        setSelectedProducts({
            newSelectedProducts: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                fromEdit: false,
            })),
        });
        setSelectedImportProducts([
            ...invoice
                .filter(
                    ({ id }) =>
                        checkList.includes(id) &&
                        !selectedImportProducts
                            .map(({ id }) => id)
                            ?.includes(id)
                )
                ?.map(inv => ({
                    ...inv,
                    expenseInvoiceId: inv.id,
                    usedPrice: defaultNumberFormat(inv.endPrice),
                    dateForSend: moment(
                        inv?.operationDate,
                        fullDateTimeWithSecond
                    )?.format('DD-MM-YYYY'),
                })),
            ...selectedImportProducts,
        ]);
        toggleModal();
        setCheckList([]);
        setInvoice([]);
        setFilters({
            counterparty: [],
            products: [],
            invoices: [],
        });
    };

    const handleFilter = (type, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [type]: value,
        }));
    };

    const cashboxTypes = [
        {
            id: 1,
            name: 'cash',
            label: 'Nəğd',
        },
        {
            id: 2,
            name: 'bank',
            label: 'Bank',
        },
        {
            id: 3,
            name: 'cart',
            label: 'Kart',
        },
        {
            id: 4,
            name: 'other',
            label: 'Digər',
        },
    ];

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            setCheckList(prevState => [...prevState, row.id * 1]);
        } else {
            setCheckList(prevState =>
                prevState.filter(item => item !== row.id)
            );
        }
    };
    const ajaxProductsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, q: search, isDeleted: 0 };
        fetchProducts({
            filters: defaultFilters,
            callback: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setProducts(appendList);
                } else {
                    setProducts(products.concat(appendList));
                }
            },
        });
    };

    const ajaxSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            name: search,
            hasInvoiceRelatedOperation: 1,
            businessUnitIds: id
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
        };
        fetchContacts(false, filters, data => {
            const appendList = [];
            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setContacts(appendList);
            } else {
                setContacts(contacts.concat(appendList));
            }
        });
    };

    const ajaxInvoicesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            name: search,
            invoiceTypes: [1],
            isDeleted: 0,
            contacts:
                filters.counterparty.length > 0
                    ? filters.counterparty
                    : undefined,
            businessUnitIds: id
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
        };
        fetchSalesInvoices(defaultFilters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setSalesInvoices(appendList);
            } else {
                setSalesInvoices(salesInvoices.concat(appendList));
            }
        });
    };

    useEffect(() => {
        if (filters.counterparty?.length > 0) {
            ajaxInvoicesSelectRequest(1, 20, '', 1);
            fetchSalesInvoiceList({
                filters: {
                    contacts: filters.counterparty,
                    invoices:
                        filters.invoices?.length > 0
                            ? filters.invoices
                            : undefined,
                    products:
                        filters.products?.length > 0
                            ? filters.products
                            : undefined,
                    invoiceTypes: [1],
                    isDeleted: 0,
                    limit: 1000,
                    businessUnitIds: id
                        ? invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId]
                        : cookies.get('_TKN_UNIT_')
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                },
                onSuccess: res => {
                    setInvoice(res.data);
                },
            });
        } else {
            setInvoice([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchSalesInvoiceList, filters, id]);

    const setFinanceDelete = value => {
        setFinanceDeleteVisible(true);
        setSelectedRow(value);
    };
    const handleExpenseRemove = expenseId => {
        const newExpenses = selectedExpenses.filter(
            ({ id }) => id !== expenseId
        );
        setExpenses({ newExpenses });
    };

    const getColumns = () => [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (_, row, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'counterparty',
            ellipsis: true,
            width: 120,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 150,
            render: value => value,
        },
        {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 100,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Qiymət',
            dataIndex: 'endPrice',
            width: 150,
            align: 'center',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.currencyCode
                }`,
        },
        {
            title: 'Əlavə et',
            width: 150,
            align: 'center',
            dataIndex: 'id',
            render(val, row) {
                return (
                    <Checkbox
                        checked={checkList.includes(val)}
                        onChange={event => handleCheckboxes(row, event)}
                        disabled={row.usedQuantity > 0}
                    />
                );
            },
        },
        {
            title: 'Seç',
            dataIndex: 'id',
            key: 'view',
            align: 'center',
            width: 80,
            render: (value, row) => (
                <RecievablesInvoiceAction
                    row={row}
                    invoiceId={value}
                    fromModal
                />
            ),
        },
    ];

    const filterDuplicates = (tableDatas, field) => {
        const data = [];
        return tableDatas.reduce((total, current) => {
            if (data.includes(current[field])) {
                return total;
            }
            data.push(current[field]);
            return [...total, { name: current[field] }];
        }, []);
    };

    useEffect(() => {
        if (selectedImportProducts) {
            setCheckList(selectedImportProducts?.map(({ id }) => id));
        }
    }, [selectedImportProducts]);

    return (
        <ProModal
            maskClosable
            padding
            width={1300}
            handleModal={toggleModal}
            isVisible={isVisible}
        >
            <div
                id="recievablesActionDropDownModal"
                className={styles.exportBox}
                style={{ marginBottom: '20px' }}
            >
                <span
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '50px',
                    }}
                >
                    Qaimə əlavə et
                </span>
            </div>
            <Row>
                {
                    <div className={styles.infoWarningYellow}>
                        <div style={{ display: 'flex' }}>
                            <RiErrorWarningLine size={24} color="#f9be45" />
                        </div>
                        <p>
                            Qaimələrin cədvəldə əks olunması üçün aşağıda
                            verilən filterdən qarşı tərəfin seçilməsi mütləqdir.
                        </p>
                    </div>
                }
            </Row>
            <div
                style={{
                    display: 'flex',
                    width: '70%',
                    margin: '40px 0 20px 0',
                }}
            >
                <Input.Group style={{ width: '30%' }}>
                    <span className={styles.filterName}>Qarşı tərəf</span>
                    <ProAsyncSelect
                        mode="multiple"
                        size="medium"
                        selectRequest={ajaxSelectRequest}
                        valueOnChange={values =>
                            handleFilter('counterparty', values)
                        }
                        data={contacts}
                        value={
                            filters.counterparty
                                ? filters.counterparty.map(Number)
                                : undefined
                        }
                    />
                </Input.Group>
                <Input.Group style={{ marginLeft: '5px', width: '30%' }}>
                    <span className={styles.filterName}>Qaimə</span>

                    <ProAsyncSelect
                        mode="multiple"
                        keys={['invoiceNumber']}
                        size="medium"
                        selectRequest={ajaxInvoicesSelectRequest}
                        valueOnChange={invoices => {
                            handleFilter('invoices', invoices);
                        }}
                        data={salesInvoices?.filter(
                            ({ id }) =>
                                !selectedImportProducts
                                    ?.map(
                                        ({ expenseInvoiceId }) =>
                                            expenseInvoiceId
                                    )
                                    ?.includes(id)
                        )}
                        value={
                            filters.invoices
                                ? filters.invoices.map(Number)
                                : undefined
                        }
                        disabled={filters.counterparty?.length === 0}
                    />
                </Input.Group>
                <Input.Group style={{ marginLeft: '5px', width: '30%' }}>
                    <span className={styles.filterName}>Məhsul</span>
                    <ProAsyncSelect
                        mode="multiple"
                        size="medium"
                        selectRequest={ajaxProductsSelectRequest}
                        valueOnChange={products =>
                            handleFilter('products', products)
                        }
                        data={products}
                        value={filters.products}
                        disabled={filters.counterparty?.length === 0}
                    />
                </Input.Group>
            </div>
            <Table
                columns={getColumns()}
                rowKey={row => row.id}
                dataSource={invoice
                    .filter(
                        ({ id }) =>
                            !selectedImportProducts
                                ?.map(
                                    ({ expenseInvoiceId }) => expenseInvoiceId
                                )
                                ?.includes(id)
                    )
                    ?.slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                    )}
                loading={financeDeleteLoading}
            />
            <Row className={styles.paginationRow} style={{ marginTop: '20px' }}>
                <Col xs={24} sm={24} md={18}>
                    <ProPagination
                        current={currentPage}
                        pageSize={pageSize}
                        onChange={handlePaginationChange}
                        total={
                            invoice.filter(
                                ({ id }) =>
                                    !selectedImportProducts
                                        ?.map(
                                            ({ expenseInvoiceId }) =>
                                                expenseInvoiceId
                                        )
                                        ?.includes(id)
                            )?.length
                        }
                    />
                </Col>
                <Col xs={24} sm={24} md={6} align="end">
                    <ProPageSelect
                        pageSize={pageSize}
                        onChange={e => handlePageSizeChange(currentPage, e)}
                        total={
                            invoice.filter(
                                ({ id }) =>
                                    !selectedImportProducts
                                        ?.map(
                                            ({ expenseInvoiceId }) =>
                                                expenseInvoiceId
                                        )
                                        ?.includes(id)
                            )?.length
                        }
                    />
                </Col>
            </Row>
            <ProButton
                style={{ marginTop: '20px' }}
                // disabled={selectedPriceTypes.length === 0}
                onClick={handleCreateInvoice}
            >
                Təsdiq et
            </ProButton>
        </ProModal>
    );
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    selectedProducts: state.salesOperation.selectedProducts,
    operationsList: state.financeOperationsReducer.operationsList,
    financeDeleteLoading: state.loadings.deleteFinanceOperations,

    products: state.productReducer.products,
    selectedImportProducts: state.salesOperation.selectedImportProducts,
});

export default connect(
    mapStateToProps,
    {
        setExpenses,
        fetchProducts,
        fetchContacts,
        fetchSalesInvoiceList,
        fetchSalesInvoices,
        setSelectedImportProducts,
        setSelectedProducts,
    }
)(AddInvoice);
