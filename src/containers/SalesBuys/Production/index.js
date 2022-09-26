/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AiOutlineDown, BiUnite, FaPencilAlt } from 'react-icons/all';
import {
    ExcelButton,
    NewButton,
    Table,
    Can,
    ProStage,
    DetailButton,
    ProPagination,
    ProPageSelect,
    ProModal,
    ProWarningModal,
    TableConfiguration,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
// fetchs
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import { fetchStockStatics } from 'store/actions/stock';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
    fetchSalesInvoiceInfo,
} from 'store/actions/salesAndBuys';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import {
    fetchProductionInfo,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    fetchProductionExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    setSelectedProducts,
    deleteOperation,
    handleEditInvoice,
    handleResetInvoiceFields,
    fetchProductionProductOrder,
} from 'store/actions/sales-operation';
import { fetchOperationsList } from 'store/actions/finance/operations';
import {
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import { fetchAllSalesInvoiceList } from 'store/actions/export-to-excel/stocksModule';
import {
    Row,
    Col,
    Button,
    Dropdown,
    Menu,
    Tooltip,
    Icon,
    Radio,
    Input,
} from 'antd';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    round,
    fullDateTimeWithSecond,
    filterQueryResolver,
} from 'utils';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import moment from 'moment';
import { toast } from 'react-toastify';
import queryString from 'query-string';
import { SendToStock } from './ProductionAdd/invoice';
import { DeleteModal } from './deleteModal';
import styles from './styles.module.scss';
import ProductionSideBar from './sideBar';
import ProductionsDetails from './productionsDetails';
import { Sales_Production_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';

const { TextArea } = Input;

const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const summary_types = [
    {
        label: 'Cəmi',
        key: 1,
    },
    {
        label: 'Xərclər',
        key: 2,
    },
    {
        label: 'Materiallar',
        key: 3,
    },
    {
        label: 'İşçilik',
        key: 4,
    },
];
function Production(props) {
    const {
        handleEditInvoice,
        fetchSalesInvoiceInfo,
        fetchProductionInfo,
        fetchOperationsList,
        fetchSalesInvoiceList,
        fetchAllSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
        selectedProductionExpense,
        selectedProductionEmployeeExpense,
        selectedProductionMaterial,
        fetchProductionMaterialExpense,
        fetchProductionEmployeeExpense,
        fetchProductionExpense,
        fetchStockStatics,
        setSelectedProductionEmployeeExpense,
        setSelectedProductionExpense,
        setSelectedProductionMaterial,
        setSelectedProducts,
        selectedProducts,
        mainCurrency,
        fetchUsers,
        fetchCurrencies,
        fetchMainCurrency,
        fetchFilteredContacts,
        tableConfiguration,
        fetchTableConfiguration,
        createTableConfiguration,
        deleteOperation,
        productionCount,
        productionInvoices,
        currencies,
        isLoading,
        actionLoading,
        stocks,
        stocksActionLoading,
        stocksLoading,
        profile,
        fetchBusinessUnitList,
        businessUnits,
        fetchProductionProductOrder,
    } = props;
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [deleteType, setDeleteType] = useState(0);
    const [materialData, setMaterialData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [deleteModalVisibe, setDeleteModalVisibe] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [productionInfo, setProductionInfo] = useState(undefined);
    const [stockRow, setStockRow] = useState(undefined);
    const [stockTo, setStockTo] = useState(undefined);
    const [summaries, setSummaries] = useState(summary_types);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedRow, setSelectedRow] = useState({});
    const [selectedOrdersWithProduct, setSelectedOrdersWithProduct] = useState(
        []
    );
    const sectionRef = useRef(null);
    const productionStatus = params.productionStatus
        ? Number(params.productionStatus)
        : null;
    const isDeleted = params.isDeleted ? Number(params.isDeleted) : null;
    const [details, setDetails] = useState(false);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [description, setDescription] = useState(undefined);
    const [deleteLoad, setDeleteLoad] = useState(false);
    const [loader, setLoader] = useState(false);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        Sales_Production_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exProduction, setExProduction] = useState([]);

    useEffect(() => {
        if (!deleteModalVisibe) {
            setDescription(undefined);
        }
    }, [deleteModalVisibe]);

    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            invoiceTypes: params.invoiceTypes ? params.invoiceTypes : [11],
            allProduction: params.allProduction ? params.allProduction : 1,
            productionStatus:
                productionStatus === 'undefined'
                    ? undefined
                    : productionStatus === null
                    ? params.status
                        ? undefined
                        : 1
                    : Number(productionStatus),
            isDeleted:
                isDeleted === 'undefined' ? undefined : Number(isDeleted),
            types: params.types ? params.types : null,
            directions: params.directions ? params.directions : null,
            responsiblePersons: params.responsiblePersons
                ? params.responsiblePersons
                : null,
            dateFrom: params.dateFrom ? params.dateFrom : undefined,
            dateTo: params.dateTo ? params.dateTo : undefined,
            status: params.status ? params.status : undefined,
            invoices: params.invoices ? params.invoices : undefined,
            order: params.order ? params.order : undefined,
            contacts: params.contacts ? params.contacts : undefined,
            description: params.description ? params.description : null,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
            limit: pageSize,
            page: currentPage,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters['history'] == 'undefined') {
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
        if (isLoading || actionLoading) {
            setLoader(true);
        } else if (!isLoading && !actionLoading) {
            setTimeout(() => {
                setLoader(false);
            }, 1000);
        }
    }, [isLoading, actionLoading]);

    useEffect(() => {
        const parmas = queryString.parse(location.search, {
            arrayFormat: 'bracket',
        });

        if (rerender > 0) {
            parmas['history'] = 1;

            if (parmas.page && !isNaN(parmas.page)) {
                setCurrentPage(parseInt(parmas.page));
            }
            setFilters({ ...parmas });
        }
    }, [rerender]);
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
                      >
                          <Link
                              to={`/sales/production/add?productionStatus=${filters.productionStatus}&isDeleted=${filters.isDeleted}`}
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
                              to={`/sales/production/add?productionStatus=${filters.productionStatus}&isDeleted=${filters.isDeleted}`}
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

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Sales-Production',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns(mainCurrency);
    };

    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration);
            let columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = Sales_Production_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(Sales_Production_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    useEffect(() => {
        if (!stockModalVisible) {
            setStockRow(undefined);
            setMaterialData([]);
            setExpensesData([]);
        }
    }, [stockModalVisible]);
    useEffect(() => {
        fetchCurrencies();
        fetchUsers({});
        fetchMainCurrency();
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

        fetchTableConfiguration({ module: 'Sales-Production' });
    }, []);
    useEffect(() => {
        if (stockTo) {
            fetchStockStatics({
                filters: {
                    limit: 10000,
                    invoiceTypes: [1, 3, 5, 7, 10, 11],
                    stocks: stockTo ? [stockTo] : undefined,
                },
            });
        }
    }, [stockTo]);
    useEffect(() => {
        if (
            (stockModalVisible && !stocksLoading && !stocksActionLoading,
            stockTo)
        ) {
            setSelectedProducts({
                newSelectedProducts: selectedProducts.map(product => {
                    return {
                        ...product,
                        quantity: stocks
                            ?.filter(item => item.product_id === product.id)
                            .reduce(
                                (total, current) =>
                                    math.add(
                                        Number(total),
                                        Number(current.quantity)
                                    ),
                                0
                            ),
                    };
                }),
            });
        }
    }, [stocks, stockModalVisible, stocksLoading, stocksActionLoading]);

    useEffect(() => {
        if (stockRow) {
            fetchProductionInfo({
                id: stockRow?.id,
                onSuccess: ({ data }) => {
                    setProductionInfo(data);
                    const allData = data.invoiceProducts.content
                        .filter(item => item.materials?.length > 0)
                        .map(product => {
                            return {
                                ...product,
                                name: product.productName,
                                invoiceQuantity: product.quantity,
                                productContent: product.materials.map(item => {
                                    return {
                                        ...item,
                                        idForFind: product.id,
                                        selectedProductId:
                                            product.invoiceProductId,
                                    };
                                }),
                            };
                        });
                    fetchProductionProductOrder({
                        filters: {
                            invoiceProducts: [
                                ...[].concat(
                                    ...allData.map(item =>
                                        item.productContent.map(
                                            ({ selectedProductId }) =>
                                                selectedProductId
                                        )
                                    )
                                ),
                            ],
                        },
                        onSuccessCallback: ({ data }) => {
                            let tmp = {};
                            if (data.length > 0) {
                                data.forEach((value, index) => {
                                    if (tmp[value.productMaterialId]) {
                                        tmp = {
                                            ...tmp,
                                            [value.productMaterialId]: {
                                                ...tmp[value.productMaterialId],
                                                orders: value.orderId
                                                    ? [
                                                          ...tmp[
                                                              value
                                                                  .productMaterialId
                                                          ].orders,
                                                          {
                                                              direction:
                                                                  value.orderDirection,
                                                              id: value.orderId,
                                                              serialNumber:
                                                                  value.orderSerialNumber,
                                                          },
                                                      ]
                                                    : [],
                                            },
                                        };
                                    } else {
                                        tmp[value.productMaterialId] = {
                                            productId: value.productMaterialId,
                                            orders: [
                                                {
                                                    direction:
                                                        value.orderDirection,
                                                    id: value.orderId,
                                                    serialNumber:
                                                        value.orderSerialNumber,
                                                },
                                            ],
                                        };
                                    }
                                });
                            }
                            setSelectedOrdersWithProduct(Object.values(tmp));
                        },
                    });
                    fetchProductionExpense({
                        id: stockRow?.id,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionExpense({
                                    newSelectedProductionExpense: [...data],
                                })
                            );
                        },
                    });
                    fetchSalesInvoiceList({
                        filters: {
                            isDeleted: 0,
                            attachedInvoices: [stockRow.id],
                            invoiceTypes: [6],
                            limit: 1000,
                        },
                        onSuccess: res => {
                            setMaterialData(res.data);
                        },
                    });
                    fetchOperationsList({
                        filters: {
                            invoices: [stockRow.id],
                            vat: 0,
                            limit: 1000,
                        },
                        setOperations: false,
                        onSuccessCallback: data => {
                            setExpensesData(data.data);
                        },
                    });
                    fetchProductionMaterialExpense({
                        id: stockRow?.id,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionMaterial({
                                    newSelectedProductionMaterial: [...data],
                                })
                            );
                        },
                    });
                    fetchProductionEmployeeExpense({
                        id: stockRow?.id,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionEmployeeExpense({
                                    newSelectedProductionEmployeeExpense: [
                                        ...data,
                                    ],
                                })
                            );
                        },
                    });
                },
            });
        }
    }, [stockRow]);

    useEffect(() => {
        if (
            productionCount % pageSize == 0 &&
            currentPage > 1 &&
            currentPage > Math.ceil(productionCount / pageSize)
        ) {
            handlePaginationChange(currentPage - 1);
        } else {
            fetchSalesInvoiceList({ filters });
            fetchSalesInvoiceCount({ filters });
        }
    }, []);

    const handleDeleteOperation = (id, reason, deleteType) => {
        deleteOperation(id, reason, deleteSuccess, deleteType);
    };
    const deleteSuccess = () => {
        toast.success('Əməliyyat uğurla tamamlandı.');
        setDeleteModalVisibe(false);
        setDeleteType(0);
        if ((productionCount - 1) % pageSize == 0 && currentPage > 1) {
            handlePaginationChange(currentPage - 1);
        } else {
            fetchSalesInvoiceList({ filters });
            fetchSalesInvoiceCount({ filters });
        }
    };
    const handleStageChange = (newStageId, row) => {
        if (newStageId === 3) {
            if (row.id && row.stockToId !== null) {
                setDeleteLoad(true);
                fetchSalesInvoiceInfo({
                    id: row.id,
                    onSuccess: res => {
                        setDeleteLoad(false);
                        if (
                            res.data.invoiceProducts &&
                            res.data.invoiceProducts.content
                        ) {
                            let invoiceContent = res.data.invoiceProducts;
                            const { content } = invoiceContent;
                            if (
                                content.filter(
                                    ({ usedQuantity }) =>
                                        Number(usedQuantity) > 0
                                )?.length > 0
                            ) {
                                toast.error('Bu qaimə silinə bilməz');
                            } else {
                                setDeleteModalVisibe(true);
                                setSelectedRow(row);
                            }
                        }
                    },
                });
            } else {
                setDeleteModalVisibe(true);
                setSelectedRow(row);
            }
        } else if (newStageId === 2 && row.stockToId === null) {
            setStockModalVisible(true);
            setStockRow(row);
        }
    };
    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
    };
    useEffect(() => {
        if (productionInfo) {
            const {
                invoiceProducts,
                currencyCode,
                description,
            } = productionInfo;
            const { content } = invoiceProducts;
            const selectedProducts = {};
            content.forEach(
                ({
                    quantityInStock,
                    invoiceProductId,
                    productId,
                    productName,
                    quantity,
                    pricePerUnit,
                    isServiceType,
                    isWithoutSerialNumber,
                    unitOfMeasurementName,
                    catalogId,
                    catalogName,
                    serialNumber,
                    cost,
                    planned_cost,
                    planned_price,
                    materials,
                }) => {
                    if (selectedProducts[productId]) {
                        selectedProducts[productId] = {
                            ...selectedProducts[productId],
                            invoiceQuantity: math.add(
                                round(quantity),
                                selectedProducts[productId].invoiceQuantity
                            ),
                        };
                    } else {
                        selectedProducts[productId] = {
                            id: productId,
                            invoiceProductId,
                            name: productName,
                            barcode: undefined,
                            unitOfMeasurementName,
                            serialNumbers: serialNumber
                                ? [serialNumber]
                                : undefined,
                            quantity: Number(quantityInStock || 0),
                            invoiceQuantity: round(quantity),
                            invoicePrice: round(pricePerUnit),
                            cost: roundTo(Number(cost), 4),
                            total_price: cost,
                            plannedCost: Number(planned_cost),
                            plannedPrice: Number(planned_price),
                            materials,
                            cost_percentage:
                                Number(cost) > 0
                                    ? math.div(
                                          math.mul(Number(cost), 100),
                                          Number(
                                              summaries.find(
                                                  item => item.label === 'Cəmi'
                                              ).value
                                          ) || 1
                                      )
                                    : 0,
                            catalog: {
                                id: catalogId,
                                name: catalogName,
                                isWithoutSerialNumber,
                                isServiceType,
                            },
                        };
                    }
                }
            );
            handleEditInvoice({
                selectedProducts: Object.values(selectedProducts),
                description: description || undefined,
                invoiceCurrencyCode: currencyCode,
            });
        }
    }, [productionInfo]);
    useEffect(() => {
        if (stockRow) {
            const totalExpencePrice = selectedProductionExpense.reduce(
                (total, { price }) => math.add(total || 0, Number(price) || 0),
                0
            );
            const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
                (total, { price, hours }) =>
                    math.add(
                        total || 0,
                        math.mul(Number(price), Number(hours || 1)) || 0
                    ),
                0
            );
            const totalMaterialPrice = selectedProductionMaterial.reduce(
                (total, { price, quantity }) =>
                    math.add(
                        total || 0,
                        math.mul(Number(price), Number(quantity)) || 0
                    ),
                0
            );
            const totalInvoiceMaterialPrice = materialData.reduce(
                (total, { amountInMainCurrency }) =>
                    math.add(total || 0, Number(amountInMainCurrency) || 0),
                0
            );
            const totalProductionEmployeeExpensesList = expensesData
                ?.filter(item => item.transactionType === 6)
                .reduce(
                    (total, { amountConvertedToMainCurrency }) =>
                        math.add(
                            total || 0,
                            Number(amountConvertedToMainCurrency) || 0
                        ),
                    0
                );
            const totalProductionExpensesList = expensesData
                ?.filter(
                    item =>
                        item.transactionType === 8 || item.transactionType === 9
                )
                .reduce(
                    (total, { amountConvertedToMainCurrency }) =>
                        math.add(
                            total || 0,
                            Number(amountConvertedToMainCurrency) || 0
                        ),
                    0
                );
            const totalAllExpense = math.add(
                totalExpencePrice,
                totalEmployeePrice,
                totalMaterialPrice,
                totalInvoiceMaterialPrice,
                totalProductionEmployeeExpensesList,
                totalProductionExpensesList
            );
            const expensePercent =
                totalAllExpense > 0
                    ? math.mul(
                          math.div(
                              math.add(
                                  totalExpencePrice,
                                  totalProductionExpensesList
                              ),
                              totalAllExpense
                          ),
                          100
                      )
                    : 0;
            const employeePercent =
                totalAllExpense > 0
                    ? math.mul(
                          math.div(
                              math.add(
                                  totalEmployeePrice,
                                  totalProductionEmployeeExpensesList
                              ),
                              totalAllExpense
                          ),
                          100
                      )
                    : 0;
            const materialPercent =
                totalAllExpense > 0
                    ? math.mul(
                          math.div(
                              math.add(
                                  totalMaterialPrice,
                                  totalInvoiceMaterialPrice
                              ),
                              totalAllExpense
                          ),
                          100
                      )
                    : 0;
            const totalPercent = totalAllExpense > 0 ? 100 : 0;
            const totals = [];
            summary_types.forEach(({ label, key }) =>
                totals.push({
                    label,
                    value:
                        key === 2
                            ? math.add(
                                  totalExpencePrice,
                                  totalProductionExpensesList
                              )
                            : key === 3
                            ? math.add(
                                  totalMaterialPrice,
                                  totalInvoiceMaterialPrice
                              )
                            : key === 4
                            ? math.add(
                                  totalEmployeePrice,
                                  totalProductionEmployeeExpensesList
                              )
                            : totalAllExpense || 0,
                    percent:
                        key === 2
                            ? expensePercent
                            : key === 3
                            ? materialPercent
                            : key === 4
                            ? employeePercent
                            : totalPercent || 0,
                })
            );
            setSummaries(totals);
        }
    }, [
        selectedProductionExpense,
        selectedProductionEmployeeExpense,
        selectedProductionMaterial,
        materialData,
        expensesData,
    ]);

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            dataIndex: 'createdAt',
            render: date => date.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
            width: 120,
        };
        columns[column.indexOf('clientId')] = {
            title: 'Sifarişçi',
            dataIndex: 'clientId',
            ellipsis: true,
            render: (value, row) =>
                value ? (
                    <Tooltip
                        placement="topLeft"
                        title={`${row.clientName || ''} ${row.clientSurname ||
                            ''}`}
                    >
                        <span>{`${row.clientName || ''} ${row.clientSurname ||
                            ''}`}</span>
                    </Tooltip>
                ) : (
                    'Daxili sifariş'
                ),
            width: 120,
        };
        columns[column.indexOf('invoiceNumber')] = {
            title: 'Sənəd',
            dataIndex: 'invoiceNumber',
            width: 120,
            render: value => value,
        };
        columns[column.indexOf('planned_cost')] = {
            title: `Planlaşdırılmış maya dəyəri, ${mainCurrency.code}`,
            width: 200,
            align: 'center',
            dataIndex: 'planned_cost',
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value || 0)),
        };
        columns[column.indexOf('cost')] = {
            title: `Faktiki maya dəyəri, ${mainCurrency.code}`,
            dataIndex: 'cost',
            align: 'center',
            width: 200,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value || 0)),
        };
        columns[column.indexOf('planned_cost_deviation')] = {
            title: `Yayınma, ${mainCurrency.code}`,
            dataIndex: 'planned_cost_deviation',
            align: 'center',
            width: 200,
            render: (value, row) =>
                formatNumberToLocale(
                    defaultNumberFormat(
                        math.sub(row.planned_cost || 0, row.cost || 0)
                    )
                ),
        };
        columns[column.indexOf('planned_cost_percentage')] = {
            title: 'Yayınma, %',
            dataIndex: 'planned_cost_percentage',
            align: 'center',
            width: 200,
            render: (value, row) =>
                row.planned_cost > 0
                    ? formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  math.div(
                                      math.sub(
                                          row.planned_cost || 0,
                                          row.cost || 0
                                      ),
                                      row.planned_cost
                                  ),
                                  100
                              )
                          )
                      )
                    : formatNumberToLocale(defaultNumberFormat(0)),
        };
        columns[column.indexOf('totalQuantity')] = {
            title: `Məhsul miqdarı`,
            dataIndex: 'totalQuantity',
            align: 'center',
            width: 200,
            render: (value, row) =>
                formatNumberToLocale(defaultNumberFormat(value || 0)),
        };

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
                            allBusinessUnits?.find(({ id }) => id === value)
                                ?.name
                        }
                    >
                        <span>
                            {
                                allBusinessUnits?.find(({ id }) => id === value)
                                    ?.name
                            }
                        </span>
                    </Tooltip>
                ),
            };
        }

        columns[column.indexOf('CurrentDate')] = {
            title: 'Müddət/Cari müddət (gün)',
            dataIndex: 'CurrentDate',
            width: 150,
            align: 'left',
            render: (value, row) =>
                row.stockToId !== null || row.isDeleted ? (
                    row.endDate !== null ? (
                        `${math.round(
                            math.div(
                                Number(
                                    moment(
                                        row.endDate,
                                        fullDateTimeWithSecond
                                    ).diff(
                                        moment(
                                            row.startDate,
                                            fullDateTimeWithSecond
                                        )
                                    )
                                ) || 0,
                                86400000
                            )
                        ) + 1}/ -`
                    ) : (
                        `Müddətsiz/ -`
                    )
                ) : (
                    <span>
                        {row.endDate !== null
                            ? math.round(
                                  math.div(
                                      Number(
                                          moment(
                                              row.endDate,
                                              fullDateTimeWithSecond
                                          ).diff(
                                              moment(
                                                  row.startDate,
                                                  fullDateTimeWithSecond
                                              )
                                          )
                                      ) || 0,
                                      86400000
                                  )
                              ) + 1
                            : 'Müddətsiz'}{' '}
                        /{' '}
                        {math.round(
                            math.div(
                                Number(
                                    moment(
                                        row.startDate,
                                        fullDateTimeWithSecond
                                    ).diff(moment())
                                ) || 0,
                                86400000
                            )
                        ) > 0 ? (
                            0
                        ) : math.round(
                              math.div(
                                  Number(
                                      moment().diff(
                                          moment(
                                              row.startDate,
                                              fullDateTimeWithSecond
                                          )
                                      )
                                  ) || 0,
                                  86400000
                              )
                          ) >
                          math.round(
                              math.div(
                                  Number(
                                      moment(
                                          row.endDate,
                                          fullDateTimeWithSecond
                                      ).diff(
                                          moment(
                                              row.startDate,
                                              fullDateTimeWithSecond
                                          )
                                      )
                                  ) || 0,
                                  86400000
                              )
                          ) ? (
                            <span style={{ color: 'red' }}>
                                {math.round(
                                    math.div(
                                        Number(
                                            moment().diff(
                                                moment(
                                                    row.startDate,
                                                    fullDateTimeWithSecond
                                                )
                                            )
                                        ) || 0,
                                        86400000
                                    )
                                ) + 1}
                            </span>
                        ) : (
                            math.round(
                                math.div(
                                    Number(
                                        moment().diff(
                                            moment(
                                                row.startDate,
                                                fullDateTimeWithSecond
                                            )
                                        )
                                    ) || 0,
                                    86400000
                                )
                            ) + 1
                        )}{' '}
                    </span>
                ),
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <ProStage
                    disabled={row.isDeleted}
                    visualStage={
                        row.stockToId === null && !row.isDeleted
                            ? { id: 1, name: 'delivery' }
                            : row.stockToId !== null && row.statusOfOperation!==3
                            ? { id: 2, name: 'going' }
                            : { id: 3, name: 'new' }
                    }
                    statuses={
                        row.stockToId !== null
                            ? 
                           [
                                  {
                                      id: 2,
                                      label: 'Anbarda',
                                      color: '#f39c12',
                                  },
                                  {
                                    id: 3,
                                    label: 'Silinib',
                                    color: '#3b4557',
                                },
                                 
                              ]
                            : [
                                  {
                                      id: 1,
                                      label: 'İstehsalatda',
                                      color: '#2980b9',
                                  },
                                  {
                                      id: 2,
                                      label: 'Anbarda',
                                      color: '#f39c12',
                                  },
                                  {
                                      id: 3,
                                      label: 'Silinib',
                                      color: '#3b4557',
                                  },
                              ]
                    }
                    onChange={newStage => handleStageChange(newStage, row)}
                />
            ),
        };

        columns[column.indexOf('startDate')] = {
            title: 'Başlama tarixi',
            dataIndex: 'startDate',
            width: 150,
            align: 'left',
            render: value => value || '-',
        };

        columns[column.indexOf('endDate')] = {
            title: 'Bitmə tarixi',
            dataIndex: 'endDate',
            width: 150,
            align: 'left',
            render: value => value || 'Müddətsiz',
        };
        columns[column.indexOf('salesmanName')] = {
            title: 'Menecer',
            dataIndex: 'salesmanName',
            align: 'left',
            width: 120,
            render: (value, row) =>
                `${value} ${row.salesmanLastName}`.length > 10 ? (
                    <Tooltip title={`${value} ${row.salesmanLastName}`}>
                        {`${value} ${row.salesmanLastName}`.substring(0, 10)}
                        ...
                    </Tooltip>
                ) : (
                    `${value} ${row.salesmanLastName}` || '-'
                ),
        };

        columns[column.indexOf('contractNo')] = {
            title: 'Müqavilə',
            dataIndex: 'contractNo',
            align: 'center',
            width: 120,
            render: (value, row) =>
                value?.length > 10 ? (
                    <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
                ) : (
                    value || '-'
                ),
        };

        columns[column.indexOf('productionMaterialsStockName')] = {
            title: 'Materiallar anbarı',
            dataIndex: 'productionMaterialsStockName',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : value?.length > 10 ? (
                    <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
                ) : (
                    value || '-'
                ),
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
        columns[column.indexOf('daysPassed')] = {
            title: 'Gecikmə (gün)',
            align: 'center',
            dataIndex: 'daysPassed',
            render: (value, row) =>
                row.endDate !== null ? (
                    math.round(
                        math.div(
                            Number(
                                moment().diff(
                                    moment(
                                        row.startDate,
                                        fullDateTimeWithSecond
                                    )
                                )
                            ) || 0,
                            86400000
                        )
                    ) >
                    math.round(
                        math.div(
                            Number(
                                moment(
                                    row.endDate,
                                    fullDateTimeWithSecond
                                ).diff(
                                    moment(
                                        row.startDate,
                                        fullDateTimeWithSecond
                                    )
                                )
                            ) || 0,
                            86400000
                        )
                    ) ? (
                        <span style={{ color: 'red' }}>
                            {math.round(
                                math.div(
                                    Number(
                                        moment().diff(
                                            moment(
                                                row.startDate,
                                                fullDateTimeWithSecond
                                            )
                                        )
                                    ) || 0,
                                    86400000
                                )
                            ) -
                                math.round(
                                    math.div(
                                        Number(
                                            moment(
                                                row.endDate,
                                                fullDateTimeWithSecond
                                            ).diff(
                                                moment(
                                                    row.startDate,
                                                    fullDateTimeWithSecond
                                                )
                                            )
                                        ) || 0,
                                        86400000
                                    )
                                )}
                        </span>
                    ) : (
                        '-'
                    )
                ) : (
                    '-'
                ),
        };
        columns.push({
            title: 'Seç',
            width: 90,
            align: 'center',
            render: row => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                    <div
                        className={
                            row.isDeleted
                                ? styles.editDisabled
                                : styles.editActive
                        }
                    >
                        <Can
                            I={accessTypes.manage}
                            a={permissions.production_invoice}
                        >
                            <Button
                                style={{ padding: '2px' }}
                                className={styles.editIcon}
                                disabled={row.isDeleted}
                                type="button"
                                onClick={() =>
                                    history.push(
                                        `/sales/production/edit?id=${row.id}&productionStatus=${filters.productionStatus}&isDeleted=${filters.isDeleted}`
                                    )
                                }
                            >
                                <FaPencilAlt style={{ marginTop: '5px' }} />
                            </Button>
                        </Can>
                    </div>
                </div>
            ),
        });

        columns.unshift({
            title: '№',
            width: 60,
            render: (value, row, index) =>
                (filters.page - 1) * filters.limit + index + 1,
        });

        return columns;
    };

    const getExcelColumns = mainCurrency => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`clientId`)] = {
            title: `Sifarişçi`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('invoiceNumber')] = {
            title: `Sənəd`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('planned_cost')] = {
            title: `Planlaşdırılmış maya dəyəri, ${mainCurrency?.code}`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('cost')] = {
            title: `Faktiki maya dəyəri, ${mainCurrency?.code}`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('planned_cost_deviation')] = {
            title: `Yayınma, ${mainCurrency?.code}`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('planned_cost_percentage')] = {
            title: `Yayınma, %`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('totalQuantity')] = {
            title: 'Məhsul miqdarı',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('CurrentDate')] = {
            title: 'Müddət/Cari müddət (gün)',
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('status')] = {
            title: `Status`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('businessUnitId')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('daysPassed')] = {
            title: 'Gecikmə, gün',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('startDate')] = {
            title: 'Başlama tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('endDate')] = {
            title: 'Bitmə tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('salesmanName')] = {
            title: 'Menecer',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('contractNo')] = {
            title: 'Müqavilə',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('productionMaterialsStockName')] = {
            title: 'Materiallar anbarı',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 120 },
        };

        columns.unshift({
            title: '№',
            width: { wpx: 60 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];

        const data = exProduction.map((item, index) => {
            let arr = [];
            columnClone.includes('createdAt') &&
                (arr[columnClone.indexOf('createdAt')] = {
                    value:
                        item.createdAt.replace(
                            /(\d{4})-(\d\d)-(\d\d)/,
                            '$3-$2-$1'
                        ) || '-',
                });
            columnClone.includes('clientId') &&
                (arr[columnClone.indexOf('clientId')] = {
                    value: item.clientId
                        ? `${item.clientName || ''} ${item.clientSurname || ''}`
                        : 'Daxili sifariş',
                });
            columnClone.includes('invoiceNumber') &&
                (arr[columnClone.indexOf('invoiceNumber')] = {
                    value: item.invoiceNumber || '-',
                });
            columnClone.includes('planned_cost') &&
                (arr[columnClone.indexOf('planned_cost')] = {
                    value: Number(defaultNumberFormat(item.planned_cost || 0)),
                });
            columnClone.includes('cost') &&
                (arr[columnClone.indexOf('cost')] = {
                    value: Number(defaultNumberFormat(item.cost || 0)),
                });
            columnClone.includes('planned_cost_deviation') &&
                (arr[columnClone.indexOf('planned_cost_deviation')] = {
                    value: Number(
                        defaultNumberFormat(
                            math.sub(item.planned_cost || 0, item.cost || 0)
                        )
                    ),
                });
            columnClone.includes('planned_cost_percentage') &&
                (arr[columnClone.indexOf('planned_cost_percentage')] = {
                    value:
                        item.planned_cost > 0
                            ? Number(
                                  defaultNumberFormat(
                                      math.mul(
                                          math.div(
                                              math.sub(
                                                  item.planned_cost || 0,
                                                  item.cost || 0
                                              ),
                                              item.planned_cost
                                          ),
                                          100
                                      )
                                  )
                              )
                            : 0,
                });
            columnClone.includes('totalQuantity') &&
                (arr[columnClone.indexOf('totalQuantity')] = {
                    value: Number(defaultNumberFormat(item.totalQuantity || 0)),
                });
            columnClone.includes('businessUnitId') &&
                (arr[columnClone.indexOf('businessUnitId')] = {
                    value:
                        `${
                            allBusinessUnits?.find(
                                ({ id }) => id == item.businessUnitId
                            )?.name
                        }` || '-',
                });
            columnClone.includes('CurrentDate') &&
                (arr[columnClone.indexOf('CurrentDate')] = {
                    value:
                        item.stockToId !== null || item.isDeleted
                            ? item.endDate !== null
                                ? `${math.round(
                                      math.div(
                                          Number(
                                              moment(
                                                  item.endDate,
                                                  fullDateTimeWithSecond
                                              ).diff(
                                                  moment(
                                                      item.startDate,
                                                      fullDateTimeWithSecond
                                                  )
                                              )
                                          ) || 0,
                                          86400000
                                      )
                                  ) + 1}/ -`
                                : `Müddətsiz/ -`
                            : `${
                                  item.endDate !== null
                                      ? math.round(
                                            math.div(
                                                Number(
                                                    moment(
                                                        item.endDate,
                                                        fullDateTimeWithSecond
                                                    ).diff(
                                                        moment(
                                                            item.startDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    )
                                                ) || 0,
                                                86400000
                                            )
                                        ) + 1
                                      : 'Müddətsiz'
                              }/${
                                  math.round(
                                      math.div(
                                          Number(
                                              moment(
                                                  item.startDate,
                                                  fullDateTimeWithSecond
                                              ).diff(moment())
                                          ) || 0,
                                          86400000
                                      )
                                  ) > 0
                                      ? 0
                                      : math.round(
                                            math.div(
                                                Number(
                                                    moment().diff(
                                                        moment(
                                                            item.startDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    )
                                                ) || 0,
                                                86400000
                                            )
                                        ) >
                                        math.round(
                                            math.div(
                                                Number(
                                                    moment(
                                                        item.endDate,
                                                        fullDateTimeWithSecond
                                                    ).diff(
                                                        moment(
                                                            item.startDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    )
                                                ) || 0,
                                                86400000
                                            )
                                        )
                                      ? math.round(
                                            math.div(
                                                Number(
                                                    moment().diff(
                                                        moment(
                                                            item.startDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    )
                                                ) || 0,
                                                86400000
                                            )
                                        ) + 1
                                      : math.round(
                                            math.div(
                                                Number(
                                                    moment().diff(
                                                        moment(
                                                            item.startDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    )
                                                ) || 0,
                                                86400000
                                            )
                                        ) + 1
                              }`,
                });

            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = {
                    value:
                    item.stockToId === null && !item.isDeleted
                    ? 'İstehsalatda'
                    : item.stockToId !== null && item.statusOfOperation!==3
                    ? 'Anbarda'
                    : 'Silinib'
                });
            columnClone.includes('startDate') &&
                (arr[columnClone.indexOf('startDate')] = {
                    value: item.startDate || '-',
                });
            columnClone.includes('endDate') &&
                (arr[columnClone.indexOf('endDate')] = {
                    value: item.endDate || 'Müddətsiz',
                });
            columnClone.includes('salesmanName') &&
                (arr[columnClone.indexOf('salesmanName')] = {
                    value:
                        `${item.salesmanName} ${item.salesmanLastName}` || '-',
                });
            columnClone.includes('contractNo') &&
                (arr[columnClone.indexOf('contractNo')] = {
                    value: item.contractNo || '-',
                });
            columnClone.includes('productionMaterialsStockName') &&
                (arr[columnClone.indexOf('productionMaterialsStockName')] = {
                    value: item.productionMaterialsStockName || '-',
                });
            columnClone.includes('daysPassed') &&
                (arr[columnClone.indexOf('daysPassed')] = {
                    value:
                        item.endDate !== null
                            ? math.round(
                                  math.div(
                                      Number(
                                          moment().diff(
                                              moment(
                                                  item.startDate,
                                                  fullDateTimeWithSecond
                                              )
                                          )
                                      ) || 0,
                                      86400000
                                  )
                              ) >
                              math.round(
                                  math.div(
                                      Number(
                                          moment(
                                              item.endDate,
                                              fullDateTimeWithSecond
                                          ).diff(
                                              moment(
                                                  item.startDate,
                                                  fullDateTimeWithSecond
                                              )
                                          )
                                      ) || 0,
                                      86400000
                                  )
                              )
                                ? math.round(
                                      math.div(
                                          Number(
                                              moment().diff(
                                                  moment(
                                                      item.startDate,
                                                      fullDateTimeWithSecond
                                                  )
                                              )
                                          ) || 0,
                                          86400000
                                      )
                                  ) -
                                  math.round(
                                      math.div(
                                          Number(
                                              moment(
                                                  item.endDate,
                                                  fullDateTimeWithSecond
                                              ).diff(
                                                  moment(
                                                      item.startDate,
                                                      fullDateTimeWithSecond
                                                  )
                                              )
                                          ) || 0,
                                          86400000
                                      )
                                  )
                                : '-'
                            : '-',
                });

            columnClone.includes('description') &&
                (arr[columnClone.indexOf('description')] = {
                    value: item.description || '-',
                });

            arr.unshift({ value: index + 1 });
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        if (mainCurrency) {
            getExcelColumns(mainCurrency);
        }
    }, [mainCurrency, visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exProduction]);

    return (
        <section>
            <ProModal
                maskClosable
                padding
                width={1300}
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
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Sales_Production_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <SendToStock
                fromTable
                edit={stockRow?.id}
                businessUnit={stockRow?.businessUnitId}
                summaries={summaries}
                isVisible={stockModalVisible}
                toggleModal={() =>
                    setStockModalVisible(prevStockModal => !prevStockModal)
                }
                startDate={stockRow?.operationDate}
                description={stockRow?.description}
                filters={filters}
                setStockTo={setStockTo}
                selectedOrdersWithProduct={selectedOrdersWithProduct}
                productionCount={productionCount}
                handlePaginationChange={handlePaginationChange}
            />
            <ProWarningModal
                width={600}
                maskClosable={false}
                open={deleteModalVisibe}
                titleIcon={<Icon type="warning" />}
                bodyTitle={`${selectedRow?.invoiceNumber} nömrəli istehsalat tapşırığı silindikdə, hesablanmış ƏH məbləğləri ləğv olunacaq və silinmə sənədi ilə sərf olunmuş materiallar anbara geri qaytaralacaqdır.`}
                bodyContent={
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            marginTop: '25px',
                        }}
                    >
                        İstehsalat tapşırığına bağlı:
                        <Radio.Group
                            name="gender"
                            onChange={e => setDeleteType(e.target.value)}
                            value={deleteType}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Radio value={0}>
                                Xərc və ƏH sənədləri qorunsun və "Baş ofis" xərc
                                mərkəzinə bağlansın.
                            </Radio>
                            <Radio value={1} style={{ marginTop: '10px' }}>
                                Xərc və ƏH sənədləri avtomatik silinsin.
                            </Radio>
                        </Radio.Group>
                        <div
                            style={{
                                paddingTop: 24,
                                paddingBottom: 12,
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            <h6 className={styles.deleteModalTitle}>
                                Silinmə səbəbini qeyd edin
                            </h6>
                            <TextArea
                                rows={4}
                                onChange={e => {
                                    setDescription(e.target.value);
                                }}
                                value={description}
                            />
                        </div>
                    </div>
                }
                continueText="Təsdiq et"
                onCancel={() => {
                    setDeleteModalVisibe(false);
                    setDeleteType(0);
                }}
                okFunc={() => {
                    handleDeleteOperation(
                        selectedRow.id,
                        description,
                        deleteType
                    );
                }}
            />
            <ProductionSideBar
                {...{
                    filters,
                    onFilter,
                    setCurrentPage,
                    fetchSalesInvoiceSearch,
                    fetchSalesInvoiceList,
                    fetchBusinessUnitList,
                    fetchFilteredContacts,
                    profile,
                    handlePaginationChange,
                    loader,
                }}
                {...props}
            />
            <section className="scrollbar aside" ref={sectionRef}>
                <div
                    id="productActionDropDown"
                    className="container"
                    style={{ marginTop: 30 }}
                >
                    <Row gutter={16}>
                        <Col xl={24} xxl={24} className="paddingBottom70">
                            <Row style={{ marginBottom: '20px' }}>
                                <Col span={24}>
                                    <Can
                                        I={accessTypes.manage}
                                        a={permissions.production_invoice}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <SettingButton
                                                onClick={toggleVisible}
                                            />
                                            <ExportToExcel
                                                getExportData={() =>
                                                    fetchAllSalesInvoiceList({
                                                        filters: {
                                                            ...filters,
                                                            limit: 5000,
                                                            page: undefined,
                                                        },
                                                        onSuccessCallback: data => {
                                                            setExProduction(
                                                                data.data
                                                            );
                                                        },
                                                    })
                                                }
                                                data={excelData}
                                                columns={excelColumns}
                                                excelTitle={`İstehsalat`}
                                                excelName="İstehsalat"
                                                filename="İstehsalat"
                                                count={productionCount}
                                                disable={!allBusinessUnits}
                                            />
                                            {profile.businessUnits?.length >
                                            1 ? (
                                                <Dropdown
                                                    className={
                                                        styles.newDropdownBtn
                                                    }
                                                    overlay={menu}
                                                >
                                                    <NewButton
                                                        label="Yeni istehsalat tapşırığı"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                        icon={
                                                            <AiOutlineDown
                                                                style={{
                                                                    marginLeft:
                                                                        '5px',
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Dropdown>
                                            ) : profile.businessUnits
                                                  ?.length === 1 ? (
                                                <Link
                                                    to={`/sales/production/add?productionStatus=${filters.productionStatus}&isDeleted=${filters.isDeleted}`}
                                                >
                                                    <NewButton
                                                        label="Yeni istehsalat tapşırığı"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                    />
                                                </Link>
                                            ) : businessUnits?.length === 1 ? (
                                                <Link
                                                    to={`/sales/production/add?productionStatus=${filters.productionStatus}&isDeleted=${filters.isDeleted}`}
                                                >
                                                    <NewButton
                                                        label="Yeni istehsalat tapşırığı"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                    />
                                                </Link>
                                            ) : (
                                                <Dropdown
                                                    className={
                                                        styles.newDropdownBtn
                                                    }
                                                    overlay={menu}
                                                >
                                                    <NewButton
                                                        label="Yeni istehsalat tapşırığı"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                        icon={
                                                            <AiOutlineDown
                                                                style={{
                                                                    marginLeft:
                                                                        '5px',
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Dropdown>
                                            )}
                                        </div>
                                    </Can>
                                </Col>
                            </Row>
                            <Table
                                loading={
                                    isLoading || actionLoading || deleteLoad
                                }
                                scroll={{ x: 'max-content' }}
                                dataSource={productionInvoices}
                                className={styles.productionTable}
                                columns={getColumns({ column: visibleColumns })}
                                rowKey={record => record.id}
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
                                        total={productionCount}
                                    />
                                </Col>
                                <Col span={6} offset={2} align="end">
                                    <ProPageSelect
                                        currentPage={currentPage}
                                        pageSize={pageSize}
                                        total={productionCount}
                                        onChange={e =>
                                            handlePageSizeChange(currentPage, e)
                                        }
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </section>
        </section>
    );
}

const mapStateToProps = state => ({
    isLoading: state.salesAndBuysReducer.isLoading,
    actionLoading: state.salesAndBuysReducer.actionLoading,
    productionInvoices: state.salesAndBuysReducer.invoices,
    productionCount: state.salesAndBuysReducer.invoicesCount,
    users: state.usersReducer.users,
    currencies: state.kassaReducer.currencies,
    selectedProducts: state.salesOperation.selectedProducts,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
    stocks: state.stockReducer.stocksStatics,
    stocksLoading: state.stockReducer.isLoading,
    stocksActionLoading: state.stockReducer.actionLoading,
    mainCurrency: state.kassaReducer.mainCurrency,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchCurrencies,
        fetchMainCurrency,
        fetchStockStatics,
        fetchSalesInvoiceList,
        fetchAllSalesInvoiceList,
        fetchSalesInvoiceCount,
        fetchSalesInvoiceSearch,
        fetchUsers,
        fetchFilteredContacts,
        deleteOperation,
        fetchProductionInfo,
        fetchProductionMaterialExpense,
        fetchProductionEmployeeExpense,
        fetchProductionExpense,
        setSelectedProductionEmployeeExpense,
        setSelectedProductionExpense,
        setSelectedProductionMaterial,
        setSelectedProducts,
        fetchOperationsList,
        handleEditInvoice,
        handleResetInvoiceFields,
        fetchBusinessUnitList,
        fetchProductionProductOrder,
        fetchSalesInvoiceInfo,
        fetchTableConfiguration,
        createTableConfiguration,
    }
)(Production);
