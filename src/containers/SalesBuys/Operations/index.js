/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { fetchUsers } from 'store/actions/users';
import { fetchContacts } from 'store/actions/contact';
import { fetchSuppliers, fetchClients } from 'store/actions/relations';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchContracts } from 'store/actions/contracts';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import {
    fetchMainCurrency,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { deleteInvoice } from 'store/actions/operations';
import { fetchFilteredStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import {
    editInvoice,
    fetchProductionInfo,
    editTransferProduction,
    editProductionCost,
} from 'store/actions/sales-operation';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';
import { fetchAllSalesIvoices } from 'store/actions/export-to-excel/salesBuyModule';
import { fetchSalesBuysForms } from 'store/actions/settings/serialNumberPrefix';
import {
    AiOutlineDown,
    BiUnite,
    HiOutlineDocumentDownload,
} from 'react-icons/all';
import {
    Table,
    ProPagination,
    ProPageSelect,
    NewButton,
    DetailButton,
    ProDots,
    ProDotsItem,
    Can,
    ProModal,
    TableConfiguration,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Row, Col, Tooltip, Dropdown, Menu, Modal, Button } from 'antd';
import {
    onChangeDateHandle,
    formatNumberToLocale,
    defaultNumberFormat,
    getHighestPermissionKey,
    exportFileDownloadHandle,
    roundToDown,
    round,
    filterQueryResolver,
} from 'utils';
import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import { useFilterHandle } from 'hooks/useFilterHandle';
import swal from '@sweetalert/with-react';
import { accessTypes, permissions } from 'config/permissions';
import { toast } from 'react-toastify';
import queryString from 'query-string';
import styles from './styles.module.scss';
import SalesOperationsSideBar from './sideBar';
import OperationsDetails from './operationsDetails';
import { AddFormModal } from '../../Settings/#shared';
import { Forms } from './formModal';
import ProductionsDetails from '../Production/productionsDetails';
import { Sales_Invoices_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';
const math = require('exact-math');
const BigNumber = require('bignumber.js');

const operationTypesByPermissionKeys = {
    1: 'purchase_invoice',
    2: 'sales_invoice',
    3: 'return_from_customer_invoice',
    4: 'return_to_supplier_invoice',
    5: 'transfer_invoice',
    6: 'remove_invoice',
    8: 'remove_invoice',
    10: 'import_purchase',
    11: 'production_invoice',
};

const paymentAvailableInvoiceTypes = [1, 2, 3, 4, 10];
function SalesOperationsList(props) {
    const {
        tableConfiguration,
        suppliers,
        fetchUsers,
        deleteInvoice,
        fetchContacts,
        fetchFilteredStocks,
        fetchProducts,
        fetchCurrencies,
        fetchContracts,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchAllSalesIvoices,
        fetchSalesInvoiceList,
        fetchSalesInvoiceCount,
        fetchSalesInvoiceSearch,
        fetchMainCurrency,
        fetchSalesBuysForms,
        salesBuysForms,
        mainCurrency,
        clients,
        invoices,
        isLoading,
        actionLoading,
        invoicesCount,
        permissionsList,
        permissionsByKeyValue,
        profile,
        fetchBusinessUnitList,
        businessUnits,
        editTransferProduction,
        editProductionCost,
        fetchProductionInfo,
        fetchCreditPayments,
    } = props;

    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

    const baseURL =
        process.env.NODE_ENV === 'production'
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_DEV_API_URL;
    const token = cookies.get('_TKN_');
    const tenantId = cookies.get('__TNT__');

    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    // const [mainCurrency] = useState(null);
    const [credits, setCredits] = useState([]);
    const [details, setDetails] = useState(false);
    const [formModal, setFormModal] = useState(false);
    const [formsData, setFormsData] = useState(undefined);
    const [activeTab, setActiveTab] = useState(0);
    const [productionInvoice, setProductionInvoice] = useState([]);
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [filterSelectedContracts, setFilterSelectedContracts] = useState([]);
    const [
        filterSelectedSalesInvoices,
        setFilterSelectedSalesInvoices,
    ] = useState([]);
    const [filterSelectedStocks, setFilterSelectedStocks] = useState([]);
    const [filterSelectedProducts, setFilterSelectedProducts] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const [
        filterSelectedSalesManagers,
        setFilterSelectedSalesManagers,
    ] = useState([]);
    const [filterSelectedAgent, setFilterSelectedAgent] = useState([]);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [selectedRow, setSelectedRow] = useState({});
    const [selectedExportRow, setSelectedExportRow] = useState({});
    const [docs, setDocs] = useState([]);
    const [visible, setVisible] = useState(false);
    const [agents, setAgents] = useState([]);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(Sales_Invoices_TABLE_SETTING_DATA);
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exInvoices, setExInvoices] = useState([])
    useEffect(() => {
        if (!mainCurrency.id) fetchMainCurrency();
        fetchSalesBuysForms();
        // fetchSalesInvoiceList({
        //     filters: {
        //         invoiceTypes: [11],
        //         allProduction: 1,
        //         limit: 10000,
        //     },
        //     onSuccess: res => {
        //         setProductionInvoice(res.data);
        //     },
        // });

        fetchCreditPayments({
            filters: { limit: 1000 },
            onSuccessCallback: response => {
                setCredits(response.data);
            },
        });

        if (params.contacts) {
            fetchContacts({ ids: params.contacts.map(Number) }, data => {
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
                setFilterSelectedContacts(appendList);
            });
        }
        if (params.contracts) {
            fetchContracts({ ids: params.contracts.map(Number) }, data => {
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
                setFilterSelectedContracts(appendList);
            });
        }
        if (params.invoices) {
            fetchSalesInvoiceList({
                label: 'invoicesForSelect',
                filters: { ids: params.invoices.map(Number) },
                onSuccess: data => {
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
                    setFilterSelectedSalesInvoices(appendList);
                },
            });
        }
        if (params.stocks) {
            fetchFilteredStocks({
                filters: { ids: params.stocks.map(Number) },
                onSuccessCallback: ({ data }) => {
                    const appendList = [];

                    if (data) {
                        data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                                ...element,
                            });
                        });
                    }
                    setFilterSelectedStocks(appendList);
                },
            });
        }
        if (params.products) {
            fetchProducts({
                filters: { ids: params.products.map(Number) },
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
                    setFilterSelectedProducts(appendList);
                },
            });
        }
        if (params.currencyId) {
            fetchCurrencies({ ids: [Number(params.currencyId)] }, data => {
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
                setFilterSelectedCurrencies(appendList);
            });
        }
        if (params.salesManagers) {
            fetchUsers({
                filters: { ids: params.salesManagers.map(Number) },
                onSuccessCallback: data => {
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
                    setFilterSelectedSalesManagers(appendList);
                },
            });
        }
        if (params.agents) {
            fetchContacts({ ids: params.agents.map(Number) }, data => {
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
                setFilterSelectedAgent(appendList);
            });
        }
    }, []);
    const handleMenuClick = ({ key }) => {
        if (key === 'null') {
            cookies.set('_TKN_UNIT_', 0);
        } else {
            cookies.set('_TKN_UNIT_', key);
        }
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
                    >
                        <Link
                            to="/sales/operations/add"
                            style={{ width: '100%' }}
                        >
                            <BiUnite style={{ marginRight: '5px' }} />
                            {item.name}
                        </Link>
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
                    >
                        <Link
                            to="/sales/operations/add"
                            style={{ width: '100%' }}
                        >
                            <BiUnite style={{ marginRight: '5px' }} />
                            {item.name}
                        </Link>
                    </Menu.Item>
                ))}
        </Menu>
    );
    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
    };
    const handleFormModal = row => {
        setSelectedExportRow(row);
        if (row.invoiceTypeNumber === 1 || row.draftType === 1) {
            const formData = salesBuysForms.filter(
                salesBuys => salesBuys.type === 1
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        } else if (row.invoiceTypeNumber === 5 || row.draftType === 5) {
            const formData = salesBuysForms.filter(
                salesBuys => salesBuys.type === 6
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        } else if (row.invoiceTypeNumber === 6 || row.draftType === 6) {
            const formData = salesBuysForms.filter(
                salesBuys => salesBuys.type === 7
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        } else if (row.invoiceTypeNumber === 10 || row.draftType === 10) {
            const formData = salesBuysForms.filter(
                salesBuys => salesBuys.type === 2
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        } else if (row.draftType !== null) {
            const formData = salesBuysForms.filter(
                salesBuys => row.draftType + 1 === salesBuys.type
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        } else {
            const formData = salesBuysForms.filter(
                salesBuys => row.invoiceTypeNumber + 1 === salesBuys.type
            );
            if (
                row.id &&
                (formData.length === 0 || formData?.[0]?.docs?.length === 0)
            ) {
                toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
            } else if (formData?.[0]?.docs?.length === 1) {
                handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
            } else {
                setFormModal(true);
                setFormsData(formData);
            }
        }
    };

    function toFixed(x) {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = `0.${new Array(e).join('0')}${x.toString().substring(2)}`;
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }
        return x;
    }

    const getInvoiceProducts = (
        rows,
        productionInfo,
        positiveCost,
        totalExpense,
        totalQuantity
    ) => {
        const totalExpenseWithoutLastRow = rows
            .slice(0, -1)
            .reduce(
                (total_amount, { invoiceQuantity }) =>
                    math.add(
                        total_amount,
                        math.mul(Number(invoiceQuantity), positiveCost) || 0
                    ),
                0
            );
        const costForLastRow = math.div(
            math.sub(Number(totalExpense), Number(totalExpenseWithoutLastRow)),
            Number(rows.pop().invoiceQuantity || totalQuantity)
        );

        if (productionInfo?.stockToId !== null) {
            const arr = productionInfo.invoiceProducts?.content.map(
                ({ planned_cost, planned_price, invoiceProductId }, index) => {
                    if (
                        index ===
                        productionInfo.invoiceProducts?.content.length - 1
                    ) {
                        return {
                            id: invoiceProductId,
                            plannedCost: Number(planned_cost),
                            plannedPrice: Number(planned_price),
                            itemCost:
                                toFixed(costForLastRow) === 0
                                    ? 0
                                    : toFixed(costForLastRow) || 0,
                        };
                    }
                    return {
                        id: invoiceProductId,
                        plannedCost: Number(planned_cost),
                        plannedPrice: Number(planned_price),
                        itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
                    };
                }
            );
            return arr;
        }
        const arr = productionInfo.invoiceProducts?.content.map(
            ({ invoiceProductId }, index) => {
                if (
                    index ===
                    productionInfo.invoiceProducts?.content.length - 1
                ) {
                    return {
                        id: invoiceProductId,
                        itemCost:
                            toFixed(costForLastRow) === 0
                                ? 0
                                : toFixed(costForLastRow) || 0,
                    };
                }
                return {
                    id: invoiceProductId,
                    itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
                };
            }
        );
        return arr;
    };

    const changeCost = (row, id, data, productionInfo) => {
        const totalQuantity = row.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(total_amount, Number(invoiceQuantity) || 0),
            0
        );
        const cost =
            productionInfo.cost > 0 || data.price > 0
                ? new BigNumber(
                    new BigNumber(productionInfo.cost).plus(
                        new BigNumber(data.price)
                    )
                ).dividedBy(new BigNumber(totalQuantity || 1))
                : 0;

        const positiveCost = Number(cost) < 0 || Number(cost) === -0 ? 0 : cost;

        const totalExpense = row.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(
                    total_amount,
                    math.mul(
                        Number(invoiceQuantity) || 0,
                        Number(positiveCost) || 0
                    )
                ),
            0
        );

        if (productionInfo?.stockToId !== null) {
            let newTransferData = {};
            newTransferData = {
                operationDate: productionInfo.operationDate,
                stock: productionInfo.stockToId,
                invoiceProducts_ul: getInvoiceProducts(
                    row,
                    productionInfo,
                    roundToDown(positiveCost),
                    totalExpense,
                    totalQuantity
                ),
            };
            editTransferProduction({
                data: newTransferData,
                id: Number(id),
            });
        } else {
            let newData = {};
            newData = {
                invoiceProducts_ul: getInvoiceProducts(
                    row,
                    productionInfo,
                    roundToDown(positiveCost),
                    totalExpense,
                    totalQuantity
                ),
            };
            editProductionCost({ data: newData, id: Number(id) });
        }

        fetchSalesInvoiceList({
            filters,
        });
        fetchSalesInvoiceCount({
            filters,
        });
    };

    const onRemoveProduct = (operationId, filters, row) => {
        swal({
            title: 'Diqqət!',
            text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
            buttons: ['İmtina', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                if (
                    row.attachedInvoice !== null &&
                    row.invoiceTypeNumber === 6
                ) {
                    deleteInvoice({
                        id: operationId,
                        attribute: {},
                        onSuccess: () => {
                            if (
                                (invoicesCount - 1) % pageSize == 0 &&
                                currentPage > 1
                            ) {
                                handlePaginationChange(currentPage - 1);
                            } else {
                                fetchProductionInfo({
                                    id: row.attachedInvoice,
                                    onSuccess: ({ data }) => {
                                        if (Object.keys(data).length > 0) {
                                            const { invoiceProducts } = data;
                                            const { content } = invoiceProducts;
                                            const selectedProducts = {};

                                            content.forEach(
                                                ({
                                                    invoiceProductId,
                                                    productId,
                                                    productName,
                                                    quantity,
                                                    pricePerUnit,
                                                    unitOfMeasurementName,
                                                    serialNumber,
                                                    cost,
                                                    planned_cost,
                                                    planned_price,
                                                }) => {
                                                    if (
                                                        selectedProducts[
                                                        productId
                                                        ]
                                                    ) {
                                                        selectedProducts[
                                                            productId
                                                        ] = {
                                                            ...selectedProducts[
                                                            productId
                                                            ],
                                                            invoiceQuantity: math.add(
                                                                round(quantity),
                                                                selectedProducts[
                                                                    productId
                                                                ]
                                                                    .invoiceQuantity
                                                            ),
                                                        };
                                                    } else {
                                                        selectedProducts[
                                                            productId
                                                        ] = {
                                                            id: productId,
                                                            invoiceProductId,
                                                            name: productName,
                                                            barcode: undefined,
                                                            unitOfMeasurementName,
                                                            serialNumbers: serialNumber
                                                                ? [serialNumber]
                                                                : undefined,
                                                            invoiceQuantity: round(
                                                                quantity
                                                            ),
                                                            invoicePrice: round(
                                                                pricePerUnit
                                                            ),
                                                            cost: Number(cost),
                                                            plannedCost: Number(
                                                                planned_cost
                                                            ),
                                                            plannedPrice: Number(
                                                                planned_price
                                                            ),
                                                        };
                                                    }
                                                }
                                            );
                                            changeCost(
                                                Object.values(selectedProducts),
                                                row.attachedInvoice,
                                                {
                                                    price: math.mul(
                                                        Number(
                                                            row.amountInMainCurrency ||
                                                            0
                                                        ),
                                                        -1
                                                    ),
                                                },
                                                data,
                                                operationId
                                            );
                                        }
                                    },
                                });
                            }
                        },
                        onFailure: ({ error }) => {
                            if (
                                error?.response?.data?.error?.errors?.key ===
                                'Invoice is used as import purchase expense'
                            ) {
                                return toast.error(
                                    'Bu qaimə idxal alış qaiməsində əlavə xərc olaraq daxil edildiyi üçün silinə bilməz'
                                );
                            }
                            return toast.error(
                                error?.response?.data?.error?.message
                            );
                        },
                    });
                } else {
                    deleteInvoice({
                        id: operationId,
                        attribute: {},
                        onSuccess: () => {
                            if (
                                (invoicesCount - 1) % pageSize == 0 &&
                                currentPage > 1
                            ) {
                                handlePaginationChange(currentPage - 1);
                            } else {
                                fetchSalesInvoiceList({
                                    filters,
                                });
                                fetchSalesInvoiceCount({
                                    filters,
                                });
                            }
                        },
                        onFailure: ({ error }) => {
                            if (
                                error?.response?.data?.error?.errors?.key ===
                                'Invoice is used as import purchase expense'
                            ) {
                                return toast.error(
                                    'Bu qaimə idxal alış qaiməsində əlavə xərc olaraq daxil edildiyi üçün silinə bilməz'
                                );
                            }
                            return toast.error(
                                error?.response?.data?.error?.message
                            );
                        },
                    });
                }
            }
        });
    };

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };
    useEffect(() => {
        if (!visible) {
            setDocs([]);
        }
    }, [visible]);

    const handleSaveSettingModal = column => {
        let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn })
        createTableConfiguration({ moduleName: "Sales-Operations", columnsOrder: data })
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns()
    };


    // set Table Configuration data and set visible columns
    useEffect(() => {

        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration)
            let columns = parseData.filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns)
            setTableSettingData(parseData)
        }
        else if (tableConfiguration == null) {
            const column = Sales_Invoices_TABLE_SETTING_DATA
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(Sales_Invoices_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration])
    const handleDocumentDetailClick = (file, document) => {
        const newDocs = [
            {
                uri: `${baseURL}/sales/invoices/export/invoice/${file}/${Math.random() *
                    (10000 - 100) +
                    100}?sampleDocumentId=${document?.id
                    }&tenant=${tenantId}&token=${token}`,
                name: document.name,
                fileType:
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        ];

        setVisible(true);
        setDocs(newDocs);
    };
    const getColumns = ({ column }) => {
        const columns = []
        columns[column.indexOf('invoiceType')] = {
            title: 'Əməliyyat növü',
            dataIndex: 'invoiceType',
            width: 130,
            render: value =>
                value.length > 10 ? (
                    <Tooltip title={value}>
                        {value.substring(0, 10)}...
                    </Tooltip>
                ) : (
                    value
                ),
        };
        columns[column.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            dataIndex: 'createdAt',
            render: date =>
                date.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
            width: 120,
        };
        columns[column.indexOf('operationDate')] = {
            title: 'Əməliyyat tarixi',
            dataIndex: 'operationDate',
            render: date => date?.split('   '),
            width: 150,
        };
        columns[column.indexOf('counterparty')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'counterparty',
            align: 'left',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: (
                value,
                { invoiceTypeNumber, counterpartyName, isVat }
            ) =>
                invoiceTypeNumber === 10 && isVat ? (
                    counterpartyName?.length > 10 ? (
                        <Tooltip title={counterpartyName}>
                            {counterpartyName.substring(0, 10)}...
                        </Tooltip>
                    ) : (
                        counterpartyName || '-'
                    )
                ) : value?.length > 10 ? (
                    <Tooltip title={value}>
                        {value.substring(0, 10)}...
                    </Tooltip>
                ) : (
                    value || '-'
                ),
        };
        columns[column.indexOf('contractNo')] = {
            title: 'Müqavilə',
            width: 100,
            dataIndex: 'contractNo',
            ellipsis: {
                showTitle: false,
            },
            align: 'center',
            render: value =>
                value?.length > 8 ? (
                    <Tooltip title={value}>
                        {value?.substring(0, 8)}...
                    </Tooltip>
                ) : (
                    value || '-'
                ),
        };
        columns[column.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 110,
            render: (value, row) => row.invoiceNumber ? row.invoiceNumber : '-'
        };
        columns[column.indexOf('paymentStatus')] = {
            title: 'Ödəniş statusu',
            dataIndex: 'paymentStatus',
            align: 'center',
            width: 150,
            render: (value, row) =>
                row.isDeleted === true ||
                    (row.paymentStatus === 3 && Number(row.endPrice) === 0)
                    ? '-'
                    : paymentAvailableInvoiceTypes.includes(
                        row.invoiceTypeNumber
                    )
                        ? row.isVat
                            ? getPaymentStatus(row.taxPaymentStatus)
                            : getPaymentStatus(row.paymentStatus)
                        : '-'
        };
        columns[column.indexOf('endPrice')] = {
            title: 'Son qiymət',
            dataIndex: 'endPrice',
            align: 'right',
            width: 150,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${row.currencyCode || row.mainCurrencyCode}`,
        };
        columns[column.indexOf('endPriceInMainCurrency')] = {
            title: `Son qiymət (${mainCurrency?.code || ''})`,
            dataIndex: 'endPriceInMainCurrency',
            width: 150,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${row.mainCurrencyCode || row.currencyCode}`,
        };
        columns[column.indexOf('salesmanName')] = {
            title: 'Satış meneceri',
            dataIndex: 'salesmanName',
            align: 'left',
            width: 120,
            render: (value, row) =>
                `${value} ${row.salesmanLastName}`.length > 10 ? (
                    <Tooltip title={`${value} ${row.salesmanLastName}`}>
                        {`${value} ${row.salesmanLastName}`.substring(
                            0,
                            10
                        )}
                        ...
                    </Tooltip>
                ) : (
                    `${value} ${row.salesmanLastName}` || '-'
                ),
        };
        columns[column.indexOf('statusOfOperationLabel')] = {
            title: 'Status',
            dataIndex: 'statusOfOperationLabel',
            align: 'center',
            width: 130,
            render: value => value,
        };
        columns[column.indexOf('amount')] = {
            title: 'Məbləğ',
            dataIndex: 'amount',
            align: 'right',
            width: 150,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${row.currencyCode || row.mainCurrencyCode}`,
        };
        columns[column.indexOf('operatorName')] = {
            title: 'Əlavə olunub',
            dataIndex: 'operatorName',
            align: 'left',
            width: 120,
            render: (value, row) =>
                `${value} ${row.salesmanLastName}`.length > 10 ? (
                    <Tooltip title={`${value} ${row.operatorLastname}`}>
                        {`${value} ${row.operatorLastname}`.substring(
                            0,
                            10
                        )}
                        ...
                    </Tooltip>
                ) : (
                    `${value} ${row.operatorLastname}` || '-'
                ),
        };
        columns[column.indexOf('stockName')] = {
            title: 'Anbar',
            dataIndex: 'stockName',
            width: 130,
            render: (value, row) =>
                value ?
                    value?.length > 10 ? (
                        <Tooltip title={value}>
                            {value.substring(0, 10)}...
                        </Tooltip>
                    ) : (
                        value
                    ) : '-'
        };
        columns[column.indexOf('endPriceCache')] = {
            title: 'Ödənilməlidir',
            dataIndex: 'endPriceCache',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.invoiceType == 'Silinmə' || row.invoiceType == 'Transfer' || row.invoiceType == 'İstehsalat' ? '-' :
                    (value ? <Tooltip
                        placement="topLeft"
                        title={`${value}  ${row.currencyCode}`}
                    >
                        {value}  {row.currencyCode}
                    </Tooltip> : '-'),
        };

        columns[column.indexOf('discountPercentage')] = {
            title: 'Endirim (%)',
            dataIndex: 'discountPercentage',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                Number(value) !== 0 ? <Tooltip
                    placement="topLeft"
                    title={`${formatNumberToLocale(
                        defaultNumberFormat(Number(value) || 0)
                    )} %`}
                >
                    {formatNumberToLocale(
                        defaultNumberFormat(Number(value) || 0)
                    )} %
                </Tooltip> : '-',
        };
        columns[column.indexOf('discountAmount')] = {
            title: 'Endirim',
            dataIndex: 'discountAmount',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: (value, row) =>
                value ? <Tooltip
                    placement="topLeft"
                    title={`${value} ${row.currencyCode}`}
                >
                    {value} {row.currencyCode}
                </Tooltip> : '-',
        };
        columns[column.indexOf('totalQuantity')] = {
            title: 'Məhsul miqdarı',
            dataIndex: 'totalQuantity',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? <Tooltip
                    placement="topLeft"
                    title={formatNumberToLocale(
                        defaultNumberFormat(value || 0)
                    )}
                >
                    {formatNumberToLocale(
                        defaultNumberFormat(value || 0)
                    )}
                </Tooltip> : '-',
        };

        columns[column.indexOf('taxPercentage')] = {
            title: 'Vergi (%)',
            dataIndex: 'taxPercentage',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                Number(value) !== 0 ? <Tooltip
                    placement="topLeft"
                    title={`${value} %`}
                >
                    {formatNumberToLocale(
                        defaultNumberFormat(Number(value)?.toFixed(4) || 0)
                    )} %
                </Tooltip> : '-',
        };
        columns[column.indexOf('taxAmount')] = {
            title: 'Vergi',
            dataIndex: 'taxAmount',
            align: 'center',
            width: 120,
            render: (value, row) =>
                value ? <Tooltip
                    placement="topLeft"
                    title={`${formatNumberToLocale(
                        defaultNumberFormat(Number(value) || 0)
                    )} ${row.taxCurrencyCode}`}
                >
                    {formatNumberToLocale(
                        defaultNumberFormat(Number(value) || 0)
                    )} {row.taxCurrencyCode}
                </Tooltip> : '-',
        };
        columns[column.indexOf('agentName')] = {
            title: 'Agent',
            dataIndex: 'agentName',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? <Tooltip
                    placement="topLeft"
                    title={value}
                >
                    {value}
                </Tooltip> : '-',
        };

        columns[column.indexOf('description')] = {
            title: 'Əlavə məlumat',
            dataIndex: 'description',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: value =>
                value ? <Tooltip
                    placement="topLeft"
                    title={value}
                >
                    {value}
                </Tooltip> : '-',
        };
        columns.push({
            title: 'Seç',
            dataIndex: 'id',
            width: 100,
            align: 'center',
            render: (value, row) => (
                <div
                    style={{
                        width: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                    <Can
                        I={accessTypes.manage}
                        a={getHighestPermissionKey(
                            permissionsList.filter(
                                ({ group_key, sub_group_key }) =>
                                    group_key === 'sales' &&
                                    sub_group_key === 'operations'
                            )
                        )}
                    >
                        <button
                            className={styles.iconButton}
                            disabled={
                                permissionsByKeyValue[
                                    permissions[
                                    operationTypesByPermissionKeys[
                                    row.invoiceTypeNumber
                                    ]
                                    ]
                                ]?.permission !== 2
                            }
                            type="button"
                        >
                            <HiOutlineDocumentDownload
                                onClick={() => {
                                    if (
                                        permissionsByKeyValue[
                                            permissions[
                                            operationTypesByPermissionKeys[
                                            row.invoiceTypeNumber
                                            ]
                                            ]
                                        ]?.permission !== 2
                                    ) {
                                        return null;
                                    }
                                    handleFormModal(row);
                                }}
                                stroke={
                                    permissionsByKeyValue[
                                        permissions[
                                        operationTypesByPermissionKeys[
                                        row.invoiceTypeNumber
                                        ]
                                        ]
                                    ]?.permission !== 2
                                        ? '#C4C4C4'
                                        : '#343434'
                                }
                                style={
                                    permissionsByKeyValue[
                                        permissions[
                                        operationTypesByPermissionKeys[
                                        row.invoiceTypeNumber
                                        ]
                                        ]
                                    ]?.permission !== 2
                                        ? {
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'not-allowed',
                                        }
                                        : {
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                        }
                                }
                            />
                        </button>
                        <ProDots
                            isDisabled={
                                row.isDeleted ||
                                (row.isVat
                                    ? row.taxPaymentStatus === 3 &&
                                    row.invoiceTypeNumber !== 2 && row.invoiceTypeNumber !== 1 && row.invoiceTypeNumber !== 3 && row.invoiceTypeNumber !== 4 && row.invoiceTypeNumber !== 5 && row.invoiceTypeNumber !== 10
                                    : row.paymentStatus === 3 &&
                                    row.invoiceTypeNumber !== 2 && row.invoiceTypeNumber !== 1 && row.invoiceTypeNumber !== 3 && row.invoiceTypeNumber !== 4 && row.invoiceTypeNumber !== 5 && row.invoiceTypeNumber !== 10 &&
                                    Number(row.endPrice) !== 0)
                            }
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.transaction_invoice_payment}
                            >
                                {paymentAvailableInvoiceTypes.includes(
                                    row.invoiceTypeNumber
                                ) &&
                                    (row.isVat
                                        ? row.taxPaymentStatus !== 3
                                        : row.paymentStatus !== 3) ? (
                                    <>
                                        <ProDotsItem
                                            label="Ödəniş et"
                                            onClick={() =>
                                                history.push(
                                                    `/finance/operations/add?id=${value}&isVat=${row.isVat}`
                                                )
                                            }
                                            icon="payment-card"
                                        />
                                        <Can
                                            I={accessTypes.manage}
                                            a={permissions.credits_table}
                                        >
                                            {(row.paymentStatus === 1 ||
                                                row.paymentStatus === 2) &&
                                                row.creditId === null ? (
                                                <ProDotsItem
                                                    label="Ödəniş cədvəli qur"
                                                    onClick={() =>
                                                        history.push(
                                                            `/sales/operations/creditTable/add/${value}`
                                                        )
                                                    }
                                                    icon="payment-card"
                                                />
                                            ) : null}
                                        </Can>
                                    </>
                                ) : null}
                            </Can>
                            <Can
                                I={accessTypes.manage}
                                a={
                                    permissions[
                                    operationTypesByPermissionKeys[
                                    row.invoiceTypeNumber
                                    ]
                                    ]
                                }
                            >
                                {(row.paymentStatus === 1 &&
                                    row.taxPaymentStatus === 1) ||
                                    (row.paymentStatus === 3 &&
                                        Number(row.endPrice) === 0) ? (
                                    <ProDotsItem
                                        label="Düzəliş et"
                                        icon="pencil"
                                        onClick={() => {
                                            row.invoiceTypeNumber === 11
                                                ? history.push(
                                                    `/sales/production/edit?id=${value}`
                                                )
                                                : history.push(
                                                    `/sales/operations/edit/${row.invoiceTypeNumber ===
                                                        8
                                                        ? row.draftType
                                                        : row.invoiceTypeNumber
                                                    }/${value}`
                                                );
                                        }}
                                    />
                                ) : row.invoiceTypeNumber === 2 || row.invoiceTypeNumber === 1 || row.invoiceTypeNumber === 3 || row.invoiceTypeNumber === 4 || row.invoiceTypeNumber === 5 || row.invoiceTypeNumber === 10 ? (
                                    <ProDotsItem
                                        label="Düzəliş et"
                                        icon="pencil"
                                        onClick={() => {
                                            history.push(
                                                `/sales/operations/edit/${row.invoiceTypeNumber}/${value}`
                                            );
                                        }}
                                    />
                                ) : null}
                                {(row.paymentStatus === 1 &&
                                    row.taxPaymentStatus === 1 &&
                                    row.invoiceTypeNumber !== 11) ||
                                    (row.paymentStatus === 3 &&
                                        Number(row.endPrice) === 0) ? (
                                    <ProDotsItem
                                        label="Sil"
                                        icon="trash"
                                        onClick={() =>
                                            onRemoveProduct(
                                                value,
                                                filters,
                                                row
                                            )
                                        }
                                    />
                                ) : null}
                            </Can>
                        </ProDots>
                    </Can>
                </div>
            ),
        });

        if (
            allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1
        ) {
            columns[column.indexOf('businessUnitId')] = {
                title: 'Biznes blok',
                dataIndex: 'businessUnitId',
                align: 'center',
                width: 130,
                ellipsis: true,
                render: value => (
                    <Tooltip
                        placement="topLeft"
                        title={
                            allBusinessUnits?.find(({ id }) => id === value)?.name
                        }
                    >
                        <span>
                            {allBusinessUnits?.find(({ id }) => id === value)?.name}
                        </span>
                    </Tooltip>
                ),
            };
        }

        columns.unshift({
            title: '№',
            width: 65,
            render: (value, row, index) =>
                (currentPage - 1) * pageSize + index + 1,
        });
        return columns;

    };
    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            paymentStatuses: params.paymentStatuses
                ? params.paymentStatuses
                : undefined,
            invoiceTypes: params.invoiceTypes ? params.invoiceTypes : undefined,
            contracts: params.contracts ? params.contracts : undefined,
            invoices: params.invoices ? params.invoices : undefined,
            salesManagers: params.salesManagers
                ? params.salesManagers
                : undefined,
            dateFrom: params.dateFrom ? params.dateFrom : undefined,
            dateTo: params.dateTo ? params.dateTo : undefined,
            amountFrom: params.amountFrom ? params.amountFrom : undefined,
            amountTo: params.amountTo ? params.amountTo : undefined,
            agents: params.agents ? params.agents : undefined,
            contacts: params.contacts ? params.contacts : undefined,
            currencyId: params.currencyId ? params.currencyId : undefined,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            bypass: 0,
            isDeleted: params.isDeleted ? params.isDeleted : 0,
            limit: pageSize,
            page: currentPage,
            stocks: params.stocks ? params.stocks : undefined,
            products: params.products ? params.products : undefined,
            serialNumber: params.serialNumber ? params.serialNumber : undefined,
            description: params.description ? params.description : undefined,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }
            fetchSalesInvoiceList({ filters });
            fetchSalesInvoiceCount({ filters });
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

    const sectionRef = useRef(null);
    const onChangeDate = (startDate, endDate) => {
        onChangeDateHandle(startDate, endDate, onFilter, filters, 1);
    };

    const checkPaymentStatus = invoices =>
        invoices.filter(invoice => {
            if (invoice.isVat) {
                if (
                    filters.paymentStatuses.includes(invoice.taxPaymentStatus)
                ) {
                    return invoice;
                }
                return false;
            }
            if (filters.paymentStatuses.includes(invoice.paymentStatus)) {
                return invoice;
            }
            return false;
        });

    const getEndPrice = (endPrice, data) => {
        const { invoiceType } = data;
        return invoiceType === 'Transfer' || invoiceType === 'Silinmə'
            ? null
            : roundToDown(endPrice);
    };

    const getEndPriceInMainCurrency = (endPriceInMainCurrency, data) => {
        const { invoiceType } = data;
        return invoiceType === 'Transfer' || invoiceType === 'Silinmə'
            ? null
            : roundToDown(endPriceInMainCurrency);
    };

    const getExcelStatusOfOperationLabel = (statusOfOperation) => {
        switch (statusOfOperation) {
            case 1:
                return 'Aktiv';
            case 2:
                return 'Qaralama';
            default:
                return 'Silinib';
        };

    }
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
        ) : statusOfOperation === 2 ? (
            <span
                style={{
                    color: '#B16FE4',
                    background: '#F6EEFC',
                }}
                className={styles.chip}
            >
                Qaralama
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

    const getInvoicesWithVat = invoices => {
        const newInvoices =
            invoices &&
            invoices.length > 0 &&
            invoices?.reduce((acc, cur) => {
                if (Number(cur.taxAmount) !== 0 || Number(cur.taxPercentage) !== 0) {

                    return acc.concat([
                        {
                            ...cur,
                            rowId: `${cur.id}`,
                            isDeleted: cur.statusOfOperation === 3,
                            invoiceTypeNumber: cur.invoiceType,
                            invoiceType: getInvoiceType(cur.invoiceType),
                            endPriceCache: formatNumberToLocale(
                                defaultNumberFormat(Number(cur.endPrice) - Number(cur.paidAmount))
                            ),
                            endPrice: getEndPrice(cur.endPrice, cur),
                            endPriceInMainCurrency: getEndPriceInMainCurrency(
                                cur.endPriceInMainCurrency,
                                cur
                            ),
                            statusOfOperationLabel: getStatusOfOperationLabel(
                                cur.statusOfOperation
                            ),
                        },
                        {
                            ...cur,
                            rowId: `${cur.id}-vat`,
                            invoiceTypeNumber: cur.invoiceType,
                            currencyCode:
                                cur.taxCurrencyCode || cur.currencyCode,
                            isDeleted: cur.statusOfOperation === 3,
                            invoiceType: `${getInvoiceType(
                                cur.invoiceType
                            )}(Vergi)`,
                            amount: cur.taxAmount,
                            endPriceCache: formatNumberToLocale(
                                defaultNumberFormat(Number(cur.taxAmount) - Number(cur.paidTaxAmount) || 0)
                            ),
                            taxAmount: null,
                            taxPercentage: null,
                            discountAmount: null,
                            discountPercentage: null,
                            paidAmount: cur.paidTaxAmount,
                            endPrice: getEndPrice(cur.taxAmount, cur),
                            endPriceInMainCurrency: getEndPriceInMainCurrency(
                                cur.taxAmountInMainCurrency,
                                cur
                            ),
                            statusOfOperationLabel: getStatusOfOperationLabel(
                                cur.statusOfOperation
                            ),
                            isVat: true,
                        },
                    ]);
                }
                return acc.concat([
                    {
                        ...cur,
                        rowId: `${cur.id}`,
                        invoiceTypeNumber: cur.invoiceType,
                        invoiceType: getInvoiceType(cur.invoiceType),
                        isDeleted: cur.statusOfOperation === 3,
                        endPriceCache: formatNumberToLocale(
                            defaultNumberFormat(Number(cur.endPrice) - Number(cur.paidAmount))
                        ),
                        endPrice: getEndPrice(cur.endPrice, cur),
                        endPriceInMainCurrency: getEndPriceInMainCurrency(
                            cur.endPriceInMainCurrency,
                            cur
                        ),
                        statusOfOperationLabel: getStatusOfOperationLabel(
                            cur.statusOfOperation
                        ),
                    },
                ]);
            }, []);

        return filters.paymentStatuses?.length > 0 && newInvoices?.length > 0
            ? checkPaymentStatus(newInvoices)
            : newInvoices;
    };
    const filteredInvoice = tableData => {
        if (tableData) {
            if (filters.contacts?.length > 0) {
                const passedAgents = agents.filter(({ id }) => {
                    if (filters.contacts?.includes(id)) {
                        return true;
                    }
                    return false;
                });
                if (passedAgents.length > 0) {
                    const newtableDatas = tableData?.filter(
                        ({
                            invoiceType,
                            counterpartyName,
                            counterparty,
                            endPrice,
                        }) => {
                            if (
                                (invoiceType === 'İdxal'
                                    ? passedAgents?.some(
                                        passedAgent =>
                                            passedAgent.name === counterparty
                                    )
                                    : invoiceType === 'İdxal(Vergi)'
                                        ? passedAgents?.some(
                                            passedAgent =>
                                                passedAgent.name ===
                                                counterpartyName
                                        )
                                        : true) &&
                                (filters.amountFrom
                                    ? filters.amountFrom <= endPrice
                                    : filters.amountTo
                                        ? filters.amountTo >= endPrice
                                        : true)
                            ) {
                                return true;
                            }
                            return false;
                        }
                    );
                    return newtableDatas;
                }
                return tableData;
            }
            if (filters.amountFrom || filters.amountTo) {
                const newtableDatas = tableData?.filter(({ endPrice }) => {
                    if (
                        filters.amountFrom
                            ? filters.amountFrom <= endPrice
                            : filters.amountTo
                                ? filters.amountTo >= endPrice
                                : true
                    ) {
                        return true;
                    }
                    return false;
                });
                return newtableDatas;
            }
            return tableData;
        }
        return tableData;
    };

    const getInvoiceType = invoiceType => {
        switch (invoiceType) {
            case 1:
                return 'Alış';
            case 2:
                return 'Satış';
            case 3:
                return 'Geri alma';
            case 4:
                return 'Geri qaytarma';
            case 5:
                return 'Transfer';
            case 6:
                return 'Silinmə';
            case 9:
                return 'Bron';
            case 10:
                return 'İdxal';
            case 11:
                return 'İstehsalat';
            default:
                return 'Qaralama';
        }
    };

    const getPaymentStatus = paymentStatus => {
        switch (paymentStatus) {
            case 1:
                return (
                    <span
                        className={styles.chip}
                        style={{
                            color: '#4E9CDF',
                            background: '#EAF3FB',
                        }}
                    >
                        Açıq
                    </span>
                );
            case 2:
                return (
                    <span
                        className={styles.chip}
                        style={{
                            color: '#F3B753',
                            background: '#FDF7EA',
                        }}
                    >
                        Qismən ödənilib
                    </span>
                );
            case 3:
                return (
                    <span
                        className={styles.chip}
                        style={{
                            color: '#55AB80',
                            background: '#EBF5F0',
                        }}
                    >
                        Ödənilib
                    </span>
                );
            default:
                break;
        }
    };

    const getExcelPaymentStatus = paymentStatus => {
        switch (paymentStatus) {
            case 1:
                return 'Açıq';

            case 2:
                return 'Qismən ödənilib';
            case 3:
                return 'Ödənilib'
            default:
                break;
        }
    };



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

        fetchTableConfiguration({ module: 'Sales-Operations' })
    }, []);


    useEffect(() => {
        if (mainCurrency.code) {
            getExcelColumns(mainCurrency);
        }
    }, [mainCurrency])

    // Excel table columns
    const getExcelColumns = (mainCurrency) => {
        let columnClone = [...visibleColumns];
        let columns = []
        columns[columnClone.indexOf('invoiceType')] = {
            title: 'Əməliyyat növü',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('operationDate')] = {
            title: 'Əməliyyat tarixi',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('counterparty')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('contractNo')] = {
            title: 'Müqavilə',
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('paymentStatus')] = {
            title: 'Ödəniş statusu',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('endPrice')] = {
            title: 'Son qiymət ',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('endPriceInMainCurrency')] = {
            title: `Son qiymət (${mainCurrency?.code ? mainCurrency?.code : mainCurrency})`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('businessUnitId')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('salesmanName')] = {
            title: 'Satış meneceri',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('statusOfOperationLabel')] = {
            title: 'Status',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('amount')] = {
            title: 'Məbləğ',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('operatorName')] = {
            title: 'Əlavə olunub',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('stockName')] = {
            title: 'Anbar',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('endPriceCache')] = {
            title: 'Ödənilməlidir',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('discountPercentage')] = {
            title: 'Endirim (%)',
            width: { wpx: 100 },
        };
        columns[columnClone.indexOf('discountAmount')] = {
            title: 'Endirim',
            width: { wpx: 100 },
        };
        columns[columnClone.indexOf('totalQuantity')] = {
            title: 'Məhsul miqdarı',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('taxPercentage')] = {
            title: 'Vergi (%)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('taxAmount')] = {
            title: 'Vergi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('agentName')] = {
            title: 'Agent',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 200 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 50 },
        });
        setExcelColumns(columns)
    }


    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const data = exInvoices.map((item, index) => {

            let arr = [];
            let endPriceInMainCurrency = formatNumberToLocale(defaultNumberFormat(Number(item.endPriceInMainCurrency) || 0))
            columnClone.includes('invoiceType') && (arr[columnClone.indexOf('invoiceType')] = { value: item.invoiceType || '-', })
            columnClone.includes('createdAt') && (arr[columnClone.indexOf('createdAt')] = { value: item.createdAt.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-', })
            columnClone.includes('operationDate') && (arr[columnClone.indexOf('operationDate')] = { value: item.operationDate || '-', })
            columnClone.includes('counterparty') && (arr[columnClone.indexOf('counterparty')] = { value: item.counterparty || '-', })
            columnClone.includes('contractNo') && (arr[columnClone.indexOf('contractNo')] = { value: item.contractNo || '-' })
            columnClone.includes('invoiceNumber') && (arr[columnClone.indexOf('invoiceNumber')] = { value: item.invoiceNumber || '-' })
            columnClone.includes('paymentStatus') && (arr[columnClone.indexOf('paymentStatus')] = {
                value:
                    item.isDeleted === true ||
                        (item.paymentStatus === 3 && Number(item.endPrice) === 0)
                        ? '-'
                        : paymentAvailableInvoiceTypes.includes(
                            item.invoiceTypeNumber
                        )
                            ? item.isVat
                                ? getExcelPaymentStatus(item.taxPaymentStatus)
                                : getExcelPaymentStatus(item.paymentStatus)
                            : '-'
            })
            columnClone.includes('endPrice') && (arr[columnClone.indexOf('endPrice')] = { value: `${formatNumberToLocale(defaultNumberFormat(Number(item.endPrice) || 0))} ${item.currencyCode || item.mainCurrencyCode}` || '-', });
            columnClone.includes('endPriceInMainCurrency') && (arr[columnClone.indexOf('endPriceInMainCurrency')] = { value: Number(endPriceInMainCurrency.replaceAll(",", '')) });
            columnClone.includes('businessUnitId') && (arr[columnClone.indexOf('businessUnitId')] = { value: `${allBusinessUnits?.find(({ id }) => id === item.businessUnitId)?.name}` || '-', })
            columnClone.includes('salesmanName') && (arr[columnClone.indexOf('salesmanName')] = { value: `${item.salesmanName} ${item.salesmanLastName}` || '-', });
            columnClone.includes('statusOfOperationLabel') && (arr[columnClone.indexOf('statusOfOperationLabel')] = { value: `${getExcelStatusOfOperationLabel(item.statusOfOperation)}` || '-', });
            columnClone.includes('amount') && (arr[columnClone.indexOf('amount')] = { value: `${formatNumberToLocale(defaultNumberFormat(Number(item.amount) || 0))} ${item.currencyCode || item.mainCurrencyCode}` || '-', });
            columnClone.includes('operatorName') && (arr[columnClone.indexOf('operatorName')] = { value: `${item.operatorName} ${item.operatorLastname}` || '-', });
            columnClone.includes('stockName') && (arr[columnClone.indexOf('stockName')] = { value: item.stockName || '-', });
            columnClone.includes('endPriceCache') && (arr[columnClone.indexOf('endPriceCache')] = {
                value: (item.invoiceType == 'Silinmə' || item.invoiceType == 'Transfer' || item.invoiceType == 'İstehsalat') ? '-' :
                    (Number(item.endPrice) - Number(item.paidAmount) !== 0 ? `${formatNumberToLocale(defaultNumberFormat(Number(item.endPrice) - Number(item.paidAmount)))} ${item.currencyCode || item.mainCurrencyCode}` : '-'),
            });
            columnClone.includes('discountPercentage') && (arr[columnClone.indexOf('discountPercentage')] = { value: Number(item.discountPercentage) !== 0 ? `${formatNumberToLocale(defaultNumberFormat(Number(item.discountPercentage)?.toFixed(4) || 0))} %` : '-', });
            columnClone.includes('discountAmount') && (arr[columnClone.indexOf('discountAmount')] = { value: item.discountAmount ? `${item.discountAmount} ${item.currencyCode} ` : '-' });
            columnClone.includes('totalQuantity') && (arr[columnClone.indexOf('totalQuantity')] = { value: formatNumberToLocale(defaultNumberFormat(item.totalQuantity || 0)) || '-', });
            columnClone.includes('taxPercentage') && (arr[columnClone.indexOf('taxPercentage')] = { value: Number(item.taxPercentage) !== 0 ? `${formatNumberToLocale(defaultNumberFormat(Number(item.taxPercentage)?.toFixed(4) || 0))} %` : '-', });
            columnClone.includes('taxAmount') && (arr[columnClone.indexOf('taxAmount')] = { value: item.taxAmount ? `${formatNumberToLocale(defaultNumberFormat(Number(item.taxAmount) - Number(item.paidTaxAmount || 0) || 0))} ${item.taxCurrencyCode}` : '-', });
            columnClone.includes('agentName') && (arr[columnClone.indexOf('agentName')] = { value: item.agentName || '-' });
            columnClone.includes('description') && (arr[columnClone.indexOf('description')] = { value: item.description || '-', })
            arr.unshift({ value: index + 1, })
            return arr;
        })
        setExcelData(data);
    }

    useEffect(() => {
        getExcelColumns(mainCurrency.code)
    }, [visibleColumns])

    useEffect(() => {
        getExcelData()
    }, [exInvoices]);

    useEffect(() => {
        if (filters?.businessUnitIds) {
            fetchUsers({
                filters: {
                    businessUnitIds: filters?.businessUnitIds,
                },
            });
        } else {
            fetchUsers({});
        }
    }, [filters.businessUnitIds]);

    const myHeader = state => {
        if (!state.currentDocument || state.config?.header?.disableFileName) {
            return null;
        }
        return (
            <div className={styles.fileViewer}>
                <h2>{state.currentDocument.name || ''}</h2>
                <a title="Download file" href={state.currentDocument?.uri}>
                    <i
                        aria-label="icon: download"
                        title="Download file"
                        tabIndex="-1"
                        className="anticon anticon-download"
                    >
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            className={styles.downloadIcon}
                            data-icon="download"
                            width="1.2em"
                            height="1.2em"
                            fill="grey"
                            aria-hidden="true"
                        >
                            <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
                        </svg>
                    </i>
                </a>
            </div>
        );
    };
    return (
        <section>
            {selectedRow?.invoiceTypeNumber === 11 ? (
                <ProModal
                    maskClosable
                    padding
                    width={selectedRow.stockToId === null ? 1000 : 1200}
                    handleModal={handleDetailsModal}
                    isVisible={details}
                >
                    <ProductionsDetails
                        row={selectedRow}
                        mainCurrencyCode={mainCurrency?.code}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onCancel={handleDetailsModal}
                        visible={details}
                        allBusinessUnits={allBusinessUnits}
                        {...props}
                    />
                </ProModal>
            ) : (
                <AddFormModal
                    width={
                        selectedRow.invoiceTypeNumber !== 10 ||
                            selectedRow.statusOfOperation === 3
                            ? activeTab === 0
                                ? 760
                                : 1200
                            : 1400
                    }
                    withOutConfirm
                    onCancel={handleDetailsModal}
                    visible={details}
                >
                    <OperationsDetails
                        row={selectedRow}
                        mainCurrencyCode={mainCurrency}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onCancel={handleDetailsModal}
                        visible={details}
                        allBusinessUnits={allBusinessUnits}
                        credits={credits}
                        {...props}
                    />
                </AddFormModal>
            )}
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Sales_Invoices_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <ProModal
                maskClosable
                padding
                isVisible={visible}
                handleModal={() => setVisible(false)}
                width={900}
            >
                <DocViewer
                    pluginRenderers={DocViewerRenderers}
                    documents={docs}
                    style={{ width: 820, height: 1000 }}
                    config={{
                        header: {
                            overrideComponent: myHeader,
                        },
                    }}
                />
            </ProModal>
            {formsData && formsData.length > 0 ? (
                <Modal
                    className={styles.customModal}
                    footer={null}
                    onCancel={() => setFormModal(false)}
                    closable={false}
                    width={formsData?.[0]?.docs.length > 3 ? 600 : 400}
                    visible={formModal}
                >
                    <Button
                        className={styles.closeButton}
                        size="large"
                        onClick={() => setFormModal(false)}
                    >
                        <img
                            width={14}
                            height={14}
                            src="/img/icons/X.svg"
                            alt="trash"
                            className={styles.icon}
                        />
                    </Button>
                    <Forms
                        handleDocumentDetailClick={handleDocumentDetailClick}
                        row={selectedExportRow}
                        formsData={formsData}
                        onCancel={() => setFormModal(false)}
                        visible={formModal}
                        baseURL={baseURL}
                        token={token}
                        tenantId={tenantId}
                        {...props}
                    />
                </Modal>
            ) : null}
            <SalesOperationsSideBar
                {...{
                    businessUnits,
                    filters,
                    onFilter,
                    setCurrentPage,
                    fetchSalesInvoiceSearch,
                    permissionsByKeyValue,
                    profile,
                    handlePaginationChange,
                    fetchSalesInvoiceList,
                    filterSelectedContracts,
                    filterSelectedContacts,
                    filterSelectedSalesInvoices,
                    filterSelectedStocks,
                    filterSelectedProducts,
                    filterSelectedCurrencies,
                    filterSelectedSalesManagers,
                    filterSelectedAgent,
                    agents,
                    setAgents,
                }}
                onChangeDate={onChangeDate}
                {...props}
            />
            <section
                className="scrollbar aside"
                ref={sectionRef}
                style={{ padding: '0 32px' }}
                id="productActionDropDown"
            >
                <Row style={{ margin: '20px 0' }}>
                    <Col span={24}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={getHighestPermissionKey(
                                    permissionsList.filter(
                                        ({ group_key, sub_group_key, key }) =>
                                            group_key === 'sales' &&
                                            sub_group_key === 'operations' &&
                                            key !== 'production_invoice'
                                    )
                                )}
                            >
                                <SettingButton onClick={toggleVisible} />
                                <ExportToExcel
                                    getExportData={
                                        () => fetchAllSalesIvoices({
                                            filters: { ...filters, limit: 5000, page: undefined }, onSuccessCallback: data => {
                                                setExInvoices(filteredInvoice(getInvoicesWithVat(data.data)))
                                            }
                                        })
                                    }
                                    data={excelData}
                                    columns={excelColumns}
                                    excelTitle="Əməliyyatlar"
                                    disabled={!allBusinessUnits}
                                    excelName="Əməliyyatlar"
                                    filename="Əməliyyatlar"
                                    count={invoicesCount}
                                />
                                {profile.businessUnits?.length > 1 ? (
                                    <Dropdown

                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <NewButton
                                            label="Yeni əməliyyat"
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
                                    <Link to="/sales/operations/add">
                                        <NewButton label="Yeni əməliyyat" />
                                    </Link>
                                ) : businessUnits?.length === 1 ? (
                                    <Link to="/sales/operations/add">
                                        <NewButton label="Yeni əməliyyat" />
                                    </Link>
                                ) : (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <NewButton
                                            label="Yeni əməliyyat"
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
                            </Can>
                        </div>
                    </Col>
                </Row>
                <Table
                    columns={getColumns({ column: visibleColumns })}
                    loading={isLoading || actionLoading}
                    dataSource={filteredInvoice(getInvoicesWithVat(invoices))}
                    rowKey={record => record.rowId}
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
        </section>
    );
}

const mapStateToProps = state => ({
    salesman: state.usersReducer.users,
    suppliers: state.contactsReducer.suppliers,
    clients: state.contactsReducer.clients,
    contracts: state.contractsReducer.contracts,
    isLoading: state.salesAndBuysReducer.isLoading,
    actionLoading: state.salesAndBuysReducer.actionLoading,
    invoices: state.salesAndBuysReducer.invoices,
    invoicesCount: state.salesAndBuysReducer.invoicesCount,
    permissionsList: state.permissionsReducer.permissions,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    mainCurrency: state.kassaReducer.mainCurrency,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    salesBuysForms: state.serialNumberPrefixReducer.salesBuysForms,
    isLoadingExport: !!state.loadings.exportFormDownloadHandle,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        deleteInvoice,
        fetchUsers,
        fetchContacts,
        fetchSuppliers,
        fetchClients,
        fetchContracts,
        fetchAllSalesIvoices,
        fetchSalesInvoiceSearch,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchSalesInvoiceList,
        fetchSalesInvoiceCount,
        fetchMainCurrency,
        fetchBusinessUnitList,
        fetchSalesBuysForms,
        exportFileDownloadHandle,
        fetchProductionInfo,
        editTransferProduction,
        editProductionCost,
        editInvoice,
        fetchCreditPayments,
        fetchFilteredStocks,
        fetchProducts,
        fetchCurrencies,
    }
)(SalesOperationsList);
