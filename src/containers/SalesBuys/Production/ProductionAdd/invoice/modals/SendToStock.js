/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ProModal,
    ProSelect,
    ProFormItem,
    ProDatePicker,
} from 'components/Lib';
import {
    editInvoice,
    createInvoice,
    createProductionExpense,
    createProductionEmployeeExpense,
    createProductionMaterialExpense,
    setSelectedProducts,
    transferProduction,
    handleResetInvoiceFields,
    fetchProductionInfo,
    createProductionProductOrder,
    fetchProductionEmployeeExpense,
    setSelectedProductionEmployeeExpense,
} from 'store/actions/sales-operation';
import { Form, Button, Table, Row, Col } from 'antd';
import { requiredRule } from 'utils/rules';
import moment from 'moment';
import math from 'exact-math';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    fullDateTimeWithSecond,
    messages,
} from 'utils';
import { fetchStocks } from 'store/actions/stock';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';
import {
    PlannedPrice,
    SelectFromInvoice,
    AddSerialNumbers,
    SerialNumbers,
} from '..';
import styles from '../../styles.module.scss';

const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

function disabledDate(current) {
    return current && current > moment().endOf('day');
}

const SendToStockModal = ({
    fromTable = false,
    businessUnit,
    filters,
    isVisible,
    form,
    edit,
    setActiveTab,
    setStockTo,
    description,
    formValidate,
    summaries,
    stocks,
    fetchStocks,
    selectedProducts,
    setSelectedProducts,
    invoiceCurrencyCode,
    toggleModal,
    startDate,
    stocksLoading,
    fetchSalesInvoiceList,
    fetchSalesInvoiceCount,
    editInvoice,
    createInvoice,
    transferProduction,
    createProductionExpense,
    createProductionEmployeeExpense,
    createProductionMaterialExpense,
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    handleResetInvoiceFields,
    businessUnits,
    setCreateOrderPost,
    fetchProductionInfo,
    selectedOrdersWithProduct,
    createProductionProductOrder,
    creatingInvoice,
    editingInvoice,
    editDateAndWarehouseLoading,
    transferProductionLoading,
    editTransferProductionLoading,
    productionInfoLoading,
    fetchProductionEmployeeExpense,
    setSelectedProductionEmployeeExpense,
    productionCount,
    handlePaginationChange,
    newCreatedProduct,
}) => {
    const {
        submit,
        getFieldDecorator,
        getFieldError,
        validateFields,
        getFieldValue,
        setFieldsValue,
    } = form;

    const history = useHistory();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const productionStatus = urlParams.get('productionStatus');
    const isDeleted = urlParams.get('isDeleted');
    const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [defaultSelectedProducts, setDefaultSelectedProducts] = useState([]);
    const [firstRender, setFirstRender] = useState(false);
    const dispatch = useDispatch();
    const getTotalData = (data = []) => {
        const total = data.reduce(
            (total, current) =>
                total +
                Number(
                    math.mul(
                        Number(current.cost || 0),
                        Number(current.invoiceQuantity || 0)
                    )
                ),
            0
        );
        return [
            ...data,
            {
                isTotal: true,
                id: 'Total count',
                cost: total,
            },
        ];
    };
    useEffect(() => {
        setStockTo(getFieldValue('stockTo'));
    }, [getFieldValue('stockTo')]);
    useEffect(() => {
        if (fromTable) {
            setFieldsValue({ stockTo: undefined });
        }
    }, []);
    useEffect(() => {
        if (isVisible) {
            if (
                selectedProducts &&
                !firstRender &&
                selectedProducts.length > 0
            ) {
                setDefaultSelectedProducts(selectedProducts);
                setFirstRender(true);
            }
        }
    }, [selectedProducts, firstRender, isVisible]);
    useEffect(() => {
        if (businessUnit !== undefined) {
            fetchStocks({
                limit: 1000,
                businessUnitIds: businessUnit === null ? [0] : [businessUnit],
            });
        } else if (BUSINESS_TKN_UNIT) {
            fetchStocks({ limit: 1000, businessUnitIds: [BUSINESS_TKN_UNIT] });
        } else {
            fetchStocks({ limit: 1000 });
        }
    }, [BUSINESS_TKN_UNIT, fromTable, businessUnit]);
    useEffect(() => {
        if (isVisible) {
            setFieldsValue({ productionDate: moment() });
        } else {
            setFirstRender(false);
        }
    }, [isVisible]);

    const handleModal = () => {
        toggleModal();
        if (fromTable) {
            handleResetInvoiceFields();
            setFieldsValue({ stockTo: undefined });
        } else {
            setSelectedProducts({
                newSelectedProducts: defaultSelectedProducts,
            });
            setFirstRender(false);
        }
    };
    const closeModal = () => {
        setSelectedProducts({ newSelectedProducts: [] });
        toggleModal();
    };
    const clearModal = () => {
        handleModal();
    };

    const setCreateOrderPostFromTable = allData => {
        if (
            allData.filter(
                ({ invoiceProductId }) => invoiceProductId !== undefined
            ).length > 0
        ) {
            if (
                selectedOrdersWithProduct.filter(
                    selectedOrder => selectedOrder.orders.length > 0
                ).length > 0
            ) {
                selectedOrdersWithProduct
                    .filter(selectedOrder => selectedOrder.orders.length > 0)
                    .map((item, index) => {
                        const newSelectedOrders = {
                            orders_ul: item.orders.map(({ id }) => id),
                            invoiceProduct: [
                                ...[].concat(
                                    ...allData.map(content =>
                                        content.productContent.map(
                                            items => items
                                        )
                                    )
                                ),
                            ].find(({ id }) => id === item.productId)
                                ?.selectedProductId,
                            productMaterial: item.productId,
                        };
                        createProductionProductOrder({
                            data: newSelectedOrders,
                        });
                    });
                handleModal();
            } else {
                handleModal();
            }
        } else {
            handleModal();
        }
    };

    const handleCreateExpense = (invoiceId, values) => {
        const expense = {
            expenses_ul: selectedProductionExpense.map(
                ({ name, date, price }) => ({
                    name,
                    date,
                    price: Number(price),
                })
            ),
            invoice: Number(invoiceId),
        };
        const employeeExpense = {
            expenses_ul: selectedProductionEmployeeExpense.map(
                ({
                    employeeName,
                    date,
                    price,
                    type,
                    hours,
                    applyToSalary,
                    staffEmployeeId,
                }) => ({
                    applyToSalary,
                    employee: staffEmployeeId,
                    employeeName,
                    date,
                    price: Number(price),
                    hours: Number(hours) || null,
                    type,
                })
            ),
            invoice: Number(invoiceId),
        };
        const material = {
            materials_ul: selectedProductionMaterial.map(
                ({ name, date, price, quantity, unitOfMeasurementId }) => ({
                    name,
                    date,
                    price: Number(price),
                    unitOfMeasurement: unitOfMeasurementId,
                    quantity: Number(quantity),
                })
            ),
            invoice: Number(invoiceId),
        };
        createProductionExpense({
            data:
                selectedProductionExpense?.length > 0
                    ? expense
                    : {
                          expenses_ul: [],
                          invoice: Number(invoiceId),
                      },
        });
        createProductionEmployeeExpense({
            data:
                selectedProductionEmployeeExpense?.length > 0
                    ? employeeExpense
                    : {
                          expenses_ul: [],
                          invoice: Number(invoiceId),
                      },
            onFailureCallback: () => {
                fetchProductionEmployeeExpense({
                    id: Number(edit),
                    onSuccess: ({ data }) => {
                        dispatch(
                            setSelectedProductionEmployeeExpense({
                                newSelectedProductionEmployeeExpense: [...data],
                            })
                        );
                    },
                });
            },
        });

        createProductionMaterialExpense({
            data:
                selectedProductionMaterial?.length > 0
                    ? material
                    : {
                          materials_ul: [],
                          invoice: Number(invoiceId),
                      },
        });
        onCreateCallBack(invoiceId, values);
    };
    const onCreateCallBack = (invoiceId, values) => {
        const { productionDate, stockTo } = values;
        let newTransferData = {};
        newTransferData = {
            operationDate: productionDate.format(fullDateTimeWithSecond),
            stock: stockTo,
            invoiceProducts_ul: handleSelectedProducts(selectedProducts),
        };
        transferProduction({
            data: newTransferData,
            id: Number(invoiceId),
            onSuccessCallback: () => {
                toast.success(messages.successText);

                fetchProductionInfo({
                    id: Number(invoiceId),
                    onSuccess: ({ data }) => {
                        let allData = data.invoiceProducts.content
                            .filter(item => item.materials?.length > 0)
                            .map(product => {
                                return {
                                    ...product,
                                    name: product.productName,
                                    invoiceQuantity: product.quantity,
                                    productContent: product.materials.map(
                                        item => {
                                            return {
                                                ...item,
                                                idForFind: product.id,
                                                selectedProductId:
                                                    product.invoiceProductId,
                                            };
                                        }
                                    ),
                                };
                            });
                        if (fromTable) {
                            setCreateOrderPostFromTable(allData);
                        } else {
                            setCreateOrderPost(allData);
                            if (newCreatedProduct) {
                                history.push(
                                    `/sales/production?productionStatus=${productionStatus}&isDeleted=${isDeleted}`
                                );
                            } else {
                                history.goBack();
                            }
                        }
                    },
                });

                if (filters) {
                    if (
                        (productionCount - 1) % Number(filters.limit) == 0 &&
                        Number(filters.page) > 1
                    ) {
                        handlePaginationChange(Number(filters.page) - 1);
                    } else {
                        fetchSalesInvoiceList({ filters });
                        fetchSalesInvoiceCount({ filters });
                    }
                } else {
                    fetchSalesInvoiceList({
                        filters: {
                            invoiceTypes: [11],
                            allProduction: 1,
                            productionStatus: 1,
                            isDeleted: 0,
                            types: null,
                            directions: null,
                            responsiblePersons: null,
                            dateFrom: undefined,
                            dateTo: undefined,
                            status: null,
                            businessUnitIds:
                                businessUnits?.length === 1
                                    ? businessUnits[0]?.id !== null
                                        ? [businessUnits[0]?.id]
                                        : undefined
                                    : undefined,
                            limit: 8,
                            page: 1,
                        },
                    });
                    fetchSalesInvoiceCount({
                        filters: {
                            invoiceTypes: [11],
                            allProduction: 1,
                            productionStatus: 1,
                            isDeleted: 0,
                            types: null,
                            directions: null,
                            responsiblePersons: null,
                            dateFrom: undefined,
                            dateTo: undefined,
                            status: null,
                            businessUnitIds:
                                businessUnits?.length === 1
                                    ? businessUnits[0]?.id !== null
                                        ? [businessUnits[0]?.id]
                                        : undefined
                                    : undefined,
                            limit: 8,
                            page: 1,
                        },
                    });
                }
            },
        });
    };
    const handleTransfer = (values, productionValues) => {
        if (!fromTable) {
            const {
                dateFrom,
                dateTo,
                currency,
                client,
                salesman,
                contract,
            } = productionValues;
            let newPurchaseInvoice = {};
            newPurchaseInvoice = {
                startDate: dateFrom.format(fullDateTimeWithSecond),
                endDate: dateTo ? dateTo?.format(fullDateTimeWithSecond) : null,
                salesman,
                currency,
                client: client || null,
                contract: contract || null,
                description: description || null,
                invoiceProducts_ul: handleSelectedProducts(selectedProducts),
            };
            if (edit) {
                editInvoice({
                    data: newPurchaseInvoice,
                    type: 'production',
                    id: Number(edit),
                    onSuccessCallback: () => {
                        handleCreateExpense(edit, values);
                    },
                });
            } else {
                createInvoice({
                    data: newPurchaseInvoice,
                    type: 'production',
                    onSuccessCallback: ({ data }) => {
                        handleCreateExpense(data.id, values);
                    },
                });
            }
        } else {
            onCreateCallBack(edit, values);
        }
    };
    // Manipulate selected products to api required form.
    const handleSelectedProducts = selectedProducts =>
        selectedProducts.map(
            ({
                plannedCost,
                plannedPrice,
                id,
                invoiceQuantity,
                serialNumbers,
                cost,
            }) => ({
                product: id,
                quantity: Number(invoiceQuantity),
                plannedCost: Number(plannedCost),
                plannedPrice: Number(plannedPrice),
                itemCost: Number(cost),
                serialNumber_ul: serialNumbers || [],
            })
        );
    const handleConfirmClick = () => {
        if (!fromTable) {
            formValidate.validateFields((errors, fields) => {
                if (!errors) {
                    const { isValid, errorMessage } = validateSelectedProducts(
                        selectedProducts
                    );
                    if (!isValid) {
                        if (
                            errorMessage ===
                            'Seriya nömrəsi qeyd edilməyən məhsul mövcuddur.'
                        ) {
                            return toast.error(errorMessage);
                        }
                        closeModal();
                        return toast.error(errorMessage);
                    }
                    validateFields((errors, values) => {
                        if (!errors) {
                            handleTransfer(values, fields);
                        }
                    });
                } else {
                    setActiveTab('1');
                    handleModal();
                }
            });
        } else {
            validateFields((errors, values) => {
                if (!errors) {
                    const { isValid, errorMessage } = validateSelectedProducts(
                        selectedProducts
                    );
                    if (!isValid) {
                        return toast.error(errorMessage);
                    }
                    handleCreateExpense(edit, values);
                }
            });
        }
    };

    const validateSelectedProducts = selectedProducts => {
        let errorMessage = '';
        let isValid = true;
        // Is product is exists in invoice
        if (selectedProducts.length === 0) {
            errorMessage = 'Qaimədə məhsul mövcud deyil';
            isValid = false;
        } else if (
            selectedProducts.some(
                ({ plannedPrice, plannedCost, invoiceQuantity }) =>
                    plannedPrice === undefined ||
                    plannedCost === undefined ||
                    Number(invoiceQuantity || 0) === 0
            )
        ) {
            errorMessage =
                'İstehsalat tapşırığında say, maya dəyəri və ya satış qiyməti qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
            if (!fromTable) {
                setActiveTab('1');
            }
        } else if (
            selectedProducts.some(
                ({ catalog, serialNumbers }) =>
                    catalog.isWithoutSerialNumber === false &&
                    serialNumbers === undefined
            ) ||
            selectedProducts.some(
                ({ serialNumbers, invoiceQuantity, catalog }) =>
                    catalog.isWithoutSerialNumber === false &&
                    serialNumbers?.length < Number(invoiceQuantity)
            )
        ) {
            errorMessage = 'Seriya nömrəsi qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
        }
        return {
            isValid,
            errorMessage,
        };
    };
    // Toggle Add Serial Numbers Modal
    const toggleSerialModal = () => {
        setSerialModalIsVisible(
            prevSerialModalIsVisible => !prevSerialModalIsVisible
        );
    };
    const handleModalClick = row => {
        setSelectedRow(row);
        toggleSerialModal();
    };
    const updatePrice = (productId, newPrice) => {
        const selectedProduct = selectedProducts.find(
            item => item.id === productId
        );
        const selectedTotal = math.mul(
            math.sub(Number(newPrice || 0), Number(selectedProduct.cost || 0)),
            Number(selectedProduct.invoiceQuantity || 1)
        );
        const total = selectedProducts.reduce(
            (total_amount, { invoiceQuantity, cost }) =>
                math.add(
                    total_amount,
                    math.mul(Number(cost) || 0, Number(invoiceQuantity || 1)) ||
                        0
                ),
            0
        );
        const newSelectedProducts = selectedProducts.map(selectedProduct => {
            if (selectedProduct.id === productId) {
                return {
                    ...selectedProduct,
                    cost_percentage:
                        math.add(Number(selectedTotal), Number(total)) === 0
                            ? 0
                            : roundTo(
                                  math.mul(
                                      math.div(
                                          Number(newPrice || 0) || 0,
                                          math.add(
                                              Number(selectedTotal),
                                              Number(total)
                                          )
                                      ),
                                      100
                                  ),
                                  2
                              ),
                    cost: newPrice || undefined,
                    total_price: newPrice || undefined,
                };
            }
            return {
                ...selectedProduct,
                cost_percentage:
                    math.add(Number(selectedTotal), Number(total)) === 0
                        ? 0
                        : roundTo(
                              math.mul(
                                  math.div(
                                      selectedProduct.cost || 0,
                                      math.add(
                                          Number(selectedTotal),
                                          Number(total)
                                      )
                                  ),
                                  100
                              ),
                              2
                          ),
            };
        });

        setSelectedProducts({ newSelectedProducts });
    };
    const handleCostChange = (productId, newPrice) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
        if (re.test(newPrice) && newPrice <= 10000000) {
            updatePrice(productId, newPrice);
        }
        if (newPrice === '') {
            updatePrice(productId, undefined);
        }
    };
    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (value, row, index) => (row.isTotal ? 'Toplam' : index + 1),
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            ellipsis: true,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Maya dəyəri',
            dataIndex: 'cost',
            width: 120,
            align: 'center',
            render: (value, row) =>
                row.isTotal ? null : (
                    <PlannedPrice
                        row={row}
                        value={value}
                        handlePriceChange={handleCostChange}
                    />
                ),
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 100,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'quantity',
            width: 100,
            align: 'center',
            render: (value, { isTotal, unitOfMeasurementName }) =>
                isTotal
                    ? null
                    : Number(value || 0) > 0
                    ? `${formatNumberToLocale(
                          defaultNumberFormat(value || 0)
                      )} ${
                          unitOfMeasurementName
                              ? unitOfMeasurementName.toLowerCase()
                              : ''
                      }`
                    : `-`,
        },
        {
            title: 'SN əlavə et',
            key: 'addFromInvoice',
            width: 80,
            align: 'center',
            render: (_, row) =>
                row.isTotal ? null : (
                    <SelectFromInvoice
                        selectedNumbers={row.serialNumbers}
                        quantity={row.invoiceQuantity}
                        handleClick={() => handleModalClick(row)}
                        disabled={row.catalog.isWithoutSerialNumber}
                    />
                ),
        },
        {
            title: 'Seriya nömrələri',
            dataIndex: 'serialNumbers',
            width: 100,
            align: 'center',
            render: (value, row) =>
                row.isTotal ? null : (
                    <SerialNumbers serialNumbers={value || []} />
                ),
        },
        {
            title: 'Toplam',
            dataIndex: 'cost',
            width: 100,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(
                          defaultNumberFormat(value)
                      )} ${invoiceCurrencyCode}`
                    : `${formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  Number(value || 0),
                                  Number(row.invoiceQuantity || 0)
                              )
                          )
                      )} ${invoiceCurrencyCode}`,
        },
    ];
    return (
        <>
            <AddSerialNumbers
                selectedRow={selectedRow}
                isVisible={serialModalIsVisible}
                toggleModal={toggleSerialModal}
            />
            <ProModal
                maskClosable
                width={1200}
                isVisible={isVisible}
                customStyles={styles.AddSerialNumbersModal}
                handleModal={handleModal}
            >
                <div className={styles.AddFromCatalog}>
                    <h2>Anbara transfer</h2>
                    <Row>
                        {
                            <div className={styles.infoWarning}>
                                <p className={styles.fade}>
                                    İstehsal olunan məhsullar anbara transfer
                                    edildikdən sonra, istehsalat prosesi başa
                                    çatacaq və istehsalat tapşırığında bəzi
                                    məlumatlara düzəliş etmək mümkün olmayacaq
                                </p>
                                <div>
                                    <ExclamationIcon />
                                </div>
                            </div>
                        }
                    </Row>
                    <div
                        className={styles.exportBox}
                        style={{
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <Form
                            style={{ flexDirection: 'column', width: '100%' }}
                            layout="vertical"
                        >
                            <Row>
                                <Col span={5} style={{ marginRight: 6 }}>
                                    <ProFormItem
                                        label="İstehsal tarixi"
                                        help={
                                            getFieldError('productionDate')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('productionDate', {
                                            getValueFromEvent: date => date,
                                            rules: [requiredRule],
                                        })(
                                            <ProDatePicker
                                                size="large"
                                                format={fullDateTimeWithSecond}
                                                disabledDate={disabledDate}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                                <Col span={5}>
                                    <ProFormItem
                                        label="Anbar(Haraya)"
                                        help={getFieldError('stockTo')?.[0]}
                                    >
                                        {getFieldDecorator('stockTo', {
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                data={stocks}
                                                disabled={stocksLoading}
                                                // disabled={isEditDisabled}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>
                            <div
                                className={styles.opInvTable}
                                style={{
                                    margin: '32px 0',
                                    maxHeight: 600,
                                    overflowY: 'auto',
                                }}
                            >
                                <Table
                                    scroll={{ x: 'max-content' }}
                                    dataSource={
                                        selectedProducts?.length > 0
                                            ? getTotalData(selectedProducts)
                                            : []
                                    }
                                    className={styles.tableFooter}
                                    columns={columns}
                                    pagination={false}
                                />
                            </div>

                            <div className={styles.button}>
                                <Button
                                    type="primary"
                                    disabled={
                                        !selectedProducts?.find(
                                            product => Number(product.cost) >= 0
                                        ) ||
                                        creatingInvoice ||
                                        editingInvoice ||
                                        editDateAndWarehouseLoading ||
                                        transferProductionLoading ||
                                        editTransferProductionLoading ||
                                        productionInfoLoading
                                    }
                                    className={styles.confirmButton}
                                    onClick={() => {
                                        submit(() => {
                                            handleConfirmClick();
                                        });
                                    }}
                                >
                                    Təsdiq et
                                </Button>
                                <Button
                                    className={styles.cancelButton}
                                    onClick={clearModal}
                                >
                                    İmtina et
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </ProModal>
        </>
    );
};

const mapStateToProps = state => ({
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    stocks: state.stockReducer.stocks,
    stocksLoading: state.loadings.fetchStocks,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
    creatingInvoice: state.loadings.createInvoiceOperation,
    editingInvoice: state.loadings.editInvoiceOperation,
    editDateAndWarehouseLoading: state.loadings.editDateAndWarehouseTransfer,
    productionInfoLoading: state.loadings.productionInfo,
    transferProductionLoading: state.loadings.transferProduction,
    editTransferProductionLoading: state.loadings.editTransferProduction,
});

export const SendToStock = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        fetchStocks,
        editInvoice,
        createInvoice,
        createProductionExpense,
        createProductionEmployeeExpense,
        createProductionMaterialExpense,
        transferProduction,
        handleResetInvoiceFields,
        fetchSalesInvoiceList,
        fetchSalesInvoiceCount,
        fetchProductionInfo,
        createProductionProductOrder,
        fetchProductionEmployeeExpense,
        setSelectedProductionEmployeeExpense,
    }
)(
    Form.create({
        name: 'SendToStockForm',
    })(SendToStockModal)
);
