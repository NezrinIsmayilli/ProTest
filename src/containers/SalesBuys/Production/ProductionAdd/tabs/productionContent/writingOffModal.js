import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Table, Form, Button, Spin, Row } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/reports/order-report';
import {
    fetchProductionProductOrder,
    deleteProductionProductOrder,
    createInvoice,
    fetchWritingOffProductsByName,
    fetchWritingOffBarcodesByName,
    fetchWritingOffCatalogs,
    fetchWritingOffProductsFromCatalog,
    clearProductsByName,
    fetchWritingOffInvoicesByProduct,
    fetchMaterialList,
    setMaterialList,
    setSelectedProductionMaterial,
} from 'store/actions/sales-operation';
import { toast } from 'react-toastify';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
    re_amount,
} from 'utils';
import { requiredRule } from 'utils/rules';
import {
    ProSelect,
    ProDatePicker,
    ProFormItem,
    ProButton,
} from 'components/Lib';
import moment from 'moment';
import { Header } from './components/Header';
import { AddDescription } from './components/AddDescription';
import { AddProducts } from './components/AddProducts';
import { Quantity } from './components/Quantity';
import { SelectFromInvoice } from './components/SelectFromInvoice';

import { InvoiceModalWithSN } from './components/InvoiceModalWithSN';
import { InvoiceModalWithoutSN } from './components/InvoiceModalWithoutSN';
import { SerialNumbers } from './components/SerialNumbers';
import { AddFromCatalog } from './components/AddFromCatalog';
import { Trash } from './components/Trash';

import styles from '../../styles.module.scss';

function WritingOffModal(props) {
    const {
        id,
        form,
        stocks,
        selectedProducts,
        setSelectedProducts,
        fetchWritingOffInvoicesByProduct,
        fetchWritingOffProductsByName,
        fetchWritingOffProductsFromCatalog,
        fetchWritingOffBarcodesByName,
        fetchWritingOffCatalogs,
        fetchMaterialList,
        setMaterialList,
        createInvoice,
        clearProductsByName,
        productionInvoice,
        users,
        usersLoading,
        profile,
        changeCost,
        setWritingOffModal,
        setWarehouseModal,
        writingOffModal,
        stockFrom,
    } = props;

    const {
        submit,
        validateFields,
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        setFieldsValue,
        resetFields,
    } = form;

    const dispatch = useDispatch();
    const newProductNameRef = useRef(null);
    const [descriptionModal, setDescriptionModal] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState(null);
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [invoiceModalWithSN, setInvoiceModalWithSN] = useState(false);
    const [invoiceModalWithoutSN, setInvoiceModalWithoutSN] = useState(false);
    const [loader, setLoader] = useState(false);

    const toggleDecsriptionModal = () => {
        setDescriptionModal(prevDescriptionModal => !prevDescriptionModal);
    };

    const handleChangeSearch = productBarcode => {
        setBarcodeInput(productBarcode);
    };

    // Toggle Product Invoices Modal with Serial Numbers
    const toggleInvoiceModalWithSN = () => {
        setInvoiceModalWithSN(wasVisible => !wasVisible);
    };

    // Toggle Product Invoices Modal without Serial Numbers
    const toggleInvoiceModalWithoutSN = () => {
        setInvoiceModalWithoutSN(wasVisible => !wasVisible);
    };

    // Add From Invoice Modal Click
    const handleModalClick = row => {
        setSelectedRow(row);
        if (row.catalog.isWithoutSerialNumber) {
            toggleInvoiceModalWithoutSN();
        } else {
            toggleInvoiceModalWithSN();
        }
    };

    useEffect(() => {
        if (!writingOffModal) {
            setSelectedProducts([]);
            setFieldsValue({ salesman: undefined });
        }

        if (users.length === 1) {
            setFieldsValue({ salesman: users[0].id });
        }
    }, [writingOffModal, users]);

    useEffect(() => {
        setFieldsValue({
            date: moment(),
            stockFrom,
            expenseType: 1,
            expense: Number(id),
        });
    }, [id, selectedProducts, stockFrom]);

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (_, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <Quantity
                    row={row}
                    value={value}
                    limit={row.quantity}
                    handleQuantityChange={handleQuantityChange}
                />
            ),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'quantity',
            width: 150,
            align: 'center',
            render: (value, { unitOfMeasurementName }) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    unitOfMeasurementName
                        ? unitOfMeasurementName.toLowerCase()
                        : ''
                }`,
        },
        {
            title: 'Qaimədən seç',
            key: 'addFromInvoice',
            width: 120,
            align: 'center',
            render: (value, row) => (
                <SelectFromInvoice
                    selectedNumbers={row.serialNumbers}
                    quantity={row.invoiceQuantity}
                    disabled={row.catalog?.isServiceType}
                    handleClick={() => handleModalClick(row)}
                    isWithoutSerialNumber={row.catalog.isWithoutSerialNumber}
                />
            ),
        },
        {
            title: 'Seriya nömrələri',
            dataIndex: 'serialNumbers',
            width: 150,
            align: 'center',
            render: value => <SerialNumbers serialNumbers={value || []} />,
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: value => (
                <Trash
                    value={value}
                    handleProductRemove={handleProductRemove}
                />
            ),
        },
    ];

    const handleProductRemove = productId => {
        const newSelectedProducts = selectedProducts.filter(
            selectedProduct => selectedProduct.id !== productId
        );
        setSelectedProducts(newSelectedProducts);
    };

    const handleQuantityChange = (productId, newQuantity, quantity) => {
        const limit = Number(quantity) > 0 ? Number(quantity) : 10000000000;
        if (re_amount.test(Number(newQuantity)) && newQuantity <= limit) {
            setProductQuantity({ productId, newQuantity });
        }
        if (newQuantity === '') {
            setProductQuantity({ productId, undefined });
        }
    };

    const setProductQuantity = ({ productId, newQuantity }) => {
        const newSelectedProducts = selectedProducts.map(selectedProduct => {
            if (productId === selectedProduct.id) {
                return {
                    ...selectedProduct,
                    invoiceQuantity: newQuantity,
                    invoiceProducts: undefined,
                };
            }
            return selectedProduct;
        });
        setSelectedProducts(newSelectedProducts);
    };

    const handleProductBarcodeChange = productBarcode => {
        setBarcodeInput(productBarcode);
        fetchWritingOffBarcodesByName({
            label: 'fetchProductsListByBarcode',
            stockId: stockFrom,
            filters: {
                q: productBarcode,
                only_products: 1,
                datetime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            },
            onSuccessCallback: ({ data }) => {
                if (data && data.length !== 0) {
                    const hasProduct = selectedProducts?.find(
                        product => product.id === data.id
                    );
                    if (hasProduct) {
                        if (data?.catalog?.isWithoutSerialNumber) {
                            handleQuantityChange(
                                data.id,
                                Number(hasProduct.invoiceQuantity) + 1,
                                -1
                            );
                        }
                    } else if (data?.catalog?.isWithoutSerialNumber) {
                        setSelectedProducts([
                            ...selectedProducts,
                            { ...data, invoiceQuantity: 1 },
                        ]);
                    } else {
                        setSelectedProducts([...selectedProducts, { ...data }]);
                    }
                }
                setBarcodeInput(null);
            },
        });
    };

    const handleProductNameChange = productName => {
        clearTimeout(newProductNameRef.current);
        if (productName.length > 2) {
            newProductNameRef.current = setTimeout(
                () =>
                    fetchWritingOffProductsByName({
                        label: 'fetchProductsListByName',
                        stockId: stockFrom,
                        filters: {
                            q: productName,
                            only_products: 1,
                            datetime: getFieldValue('date')?.format(
                                fullDateTimeWithSecond
                            ),
                        },
                    }),
                600
            );
        } else {
            dispatch(clearProductsByName());
        }
    };
    // Fetch sales products by catalog id
    const fetchProductsFromCatalog = catalogId => {
        fetchWritingOffProductsFromCatalog({
            label: 'fetchProductsFromCatalog',
            stockId: stockFrom,
            filters: {
                catalog: catalogId,
                datetime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            },
        });
    };

    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(
            prevCatalogModalIsVisible => !prevCatalogModalIsVisible
        );
    };

    // Fetch sales catalogs by stock Id
    const fetchCatalogs = () => {
        fetchWritingOffCatalogs({
            label: 'fetchCatalogsByInvoiceType',
            stockId: stockFrom,
            filters: {
                only_products: 1,
                datetime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            },
        });
    };

    // Fetch Product Invoices by product Id
    const fetchProductInvoices = (productId, onSuccessCallback) => {
        fetchWritingOffInvoicesByProduct({
            label: 'fetchInvoicesByProduct',
            filters: {
                datetime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            },
            stockId: stockFrom,
            onSuccessCallback,
            productId,
        });
    };

    const productionArr = productionInvoice?.map(invoice => ({
        ...invoice,
        name: `${invoice.invoiceNumber} - ${
            invoice.clientName ? invoice.clientName : 'Daxili sifariş'
        }`,
    }));

    const validateSelectedProducts = selectedProducts => {
        let errorMessage = '';
        let isValid = true;

        // Is product is exists in invoice
        if (selectedProducts.length === 0) {
            errorMessage = 'Qaimədə məhsul mövcud deyil';
            isValid = false;
        }
        // Has price or quantity missed product
        else if (
            selectedProducts.some(
                ({ invoiceQuantity }) => Number(invoiceQuantity || 0) === 0
            )
        ) {
            errorMessage =
                'Qaimədə say və ya qiyməti qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
        } else if (
            selectedProducts.some(
                ({ catalog, serialNumbers }) =>
                    catalog.isWithoutSerialNumber === false &&
                    serialNumbers === undefined
            ) ||
            selectedProducts.some(
                ({ serialNumbers, invoiceQuantity }) =>
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

    const handleNewWritingOff = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );
                if (!isValid) {
                    return toast.error(errorMessage);
                }
                handleCreateInvoice(values);
                setLoader(true);
            }
        });
    };

    const handleSelectedProducts = selectedProducts => {
        const tmp = {};
        selectedProducts.forEach(({ invoiceProducts, id, invoiceQuantity }) => {
            tmp[id] = {
                product: id,
                price: 10,
                quantity: Number(invoiceQuantity),
                serialNumber_ul: [],
                invoiceProductsExtended_ul: invoiceProducts
                    ? invoiceProducts.map(
                          ({ invoice_product_id, invoiceQuantity }) => ({
                              invoice_product_id,
                              quantity: Number(invoiceQuantity),
                          })
                      )
                    : [],
                discountAmount: undefined,
            };
        });
        return tmp;
    };

    const handleCreateInvoice = values => {
        const { date, salesman, stockFrom, expenseType, expense } = values;

        const newWritingOffInvoice = {
            salesman,
            stock: stockFrom,
            contract: null,
            description: selectedProducts?.[0]?.description || null,
            operationDate: date.format(fullDateTimeWithSecond),
            operator: profile.id,
            invoice: expenseType === 1 ? expense : null,
            invoiceProducts_ul: handleSelectedProducts(selectedProducts),
        };

        createInvoice({
            data: newWritingOffInvoice,
            type: 'writingOff',
            onSuccessCallback: ({ data }) => {
                toast.success('Əməliyyat uğurla tamamlandı');
                fetchMaterialList({
                    filters: {
                        isDeleted: 0,
                        attachedInvoices: [id],
                        invoiceTypes: [6],
                        limit: 1000,
                    },
                    onSuccess: res => {
                        dispatch(setMaterialList(res));
                        changeCost(
                            {
                                price: Number(
                                    res.data?.find(item => item.id === data.id)
                                        ?.amountInMainCurrency || 0
                                ),
                            },
                            true
                        );
                    },
                });

                setWritingOffModal(false);
                setWarehouseModal(false);
                setLoader(false);
            },
            onFailureCallback: () => {
                setLoader(false);
            },
        });
    };

    return (
        <div className={styles.AddFromCatalog}>
            <InvoiceModalWithSN
                product={selectedRow}
                isVisible={invoiceModalWithSN}
                fetchProductInvoices={fetchProductInvoices}
                toggleModal={toggleInvoiceModalWithSN}
                setSelectedProducts={setSelectedProducts}
                selectedProducts={selectedProducts}
            />
            <InvoiceModalWithoutSN
                product={selectedRow}
                isVisible={invoiceModalWithoutSN}
                toggleModal={toggleInvoiceModalWithoutSN}
                fetchProductInvoices={fetchProductInvoices}
                setSelectedProducts={setSelectedProducts}
                selectedProducts={selectedProducts}
            />
            <AddFromCatalog
                isVisible={catalogModalIsVisible}
                toggleModal={toggleCatalogModal}
                fetchProducts={fetchProductsFromCatalog}
                fetchCatalogs={fetchCatalogs}
                setSelectedProducts={setSelectedProducts}
                selectedProducts={selectedProducts}
            />
            <Row>
                <Form>
                    <h1 className={styles.title}>Silinmə əməliyyatı</h1>
                    <span className={styles.writingOffModalTitle}>
                        Ümumi məlumat
                    </span>
                    <div className={styles.fieldsContainer}>
                        <div className={styles.field}>
                            <ProFormItem
                                label="Tarix"
                                help={getFieldError('date')?.[0]}
                            >
                                {getFieldDecorator('date', {
                                    rules: [requiredRule],
                                })(
                                    <ProDatePicker
                                        size="large"
                                        format={fullDateTimeWithSecond}
                                        allowClear={false}
                                        placeholder="Seçin"
                                    />
                                )}
                            </ProFormItem>
                        </div>
                        <div className={styles.field}>
                            <ProFormItem
                                label="Satış meneceri"
                                help={getFieldError('salesman')?.[0]}
                            >
                                {getFieldDecorator('salesman', {
                                    getValueFromEvent: category => category,
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        data={users}
                                        keys={['name', 'lastName']}
                                        allowClear={false}
                                        loading={usersLoading}
                                        placeholder="Seçin"
                                        disabled={usersLoading}
                                    />
                                )}
                            </ProFormItem>
                        </div>
                        <div className={styles.field}>
                            <ProFormItem
                                label="Anbar (Haradan)"
                                help={getFieldError('stockFrom')?.[0]}
                            >
                                {getFieldDecorator('stockFrom', {
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        className={styles.selectBox}
                                        style={{ marginBottom: 0 }}
                                        data={stocks}
                                        disabled
                                    />
                                )}
                            </ProFormItem>
                        </div>
                        {id ? (
                            <>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Xərc mərkəzi növü"
                                        help={getFieldError('expenseType')?.[0]}
                                    >
                                        {getFieldDecorator('expenseType', {
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                disabled
                                                data={[
                                                    {
                                                        id: 1,
                                                        name: 'İstehsalat',
                                                    },
                                                ]}
                                                keys={['name']}
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}></div>
                                <div className={styles.field}></div>
                                <div className={styles.field}></div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Xərc mərkəzi"
                                        help={getFieldError('expense')?.[0]}
                                    >
                                        {getFieldDecorator('expense', {
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                disabled
                                                data={productionArr}
                                                keys={['name']}
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                            </>
                        ) : null}
                    </div>
                    <div>
                        <Spin
                            spinning={false}
                            // spinning={invoiceInfoLoading}
                        >
                            <AddDescription
                                isVisible={descriptionModal}
                                toggleModal={toggleDecsriptionModal}
                                selectedProducts={selectedProducts}
                                setSelectedProducts={setSelectedProducts}
                            />
                            <Header
                                disabled={!getFieldValue('stockFrom')}
                                toggleDecsriptionModal={toggleDecsriptionModal}
                                toggleCatalogModal={toggleCatalogModal}
                                // productSelectLoading={productSelectLoading}
                            />
                            <AddProducts
                                selectProductIsDisabled={
                                    !getFieldValue('stockFrom')
                                }
                                handleChangeSearch={handleChangeSearch}
                                handleProductBarcodeChange={
                                    handleProductBarcodeChange
                                }
                                barcodeInput={barcodeInput}
                                handleProductNameChange={
                                    handleProductNameChange
                                }
                                catalogModalIsDisabled={
                                    !getFieldValue('stockFrom')
                                }
                                toggleCatalogModal={toggleCatalogModal}
                                selectedProducts={selectedProducts}
                                setSelectedProducts={setSelectedProducts}
                            />
                            <Table
                                scroll={{ x: 'max-content', y: 500 }}
                                isWhiteTable
                                columns={columns}
                                rowKey={row => row.id}
                                pagination={false}
                                // loading={productQuantitiesLoading || priceTypesLoading}
                                dataSource={selectedProducts}
                            />
                        </Spin>
                    </div>
                    <Button
                        type="primary"
                        disabled={loader}
                        loading={loader}
                        onClick={() => {
                            submit(() => {
                                handleNewWritingOff();
                            });
                        }}
                        // loading={creatingInvoice || editingInvoice}
                        style={{ marginRight: '10px' }}
                    >
                        Təsdiq et
                    </Button>
                </Form>
            </Row>
        </div>
    );
}

const mapStateToProps = state => ({
    invoices: state.orderReportReducer.invoices,
    isLoading: state.orderReportReducer.isLoading,
    tenant: state.tenantReducer.tenant,
    deleteProductionProductOrderLoading:
        state.loadings.deleteProductionProductOrder,
    stockStatistics: state.stockReducer.stocksStatics,
    users: state.usersReducer.users,
    usersLoading: state.loadings.fetchUsers,
    profile: state.profileReducer.profile, // used for operator id
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchProductionProductOrder,
        deleteProductionProductOrder,
        fetchWritingOffInvoicesByProduct,
        fetchWritingOffProductsByName,
        fetchWritingOffProductsFromCatalog,
        fetchWritingOffCatalogs,
        clearProductsByName,
        createInvoice,
        fetchMaterialList,
        setMaterialList,
        fetchWritingOffBarcodesByName,
    }
)(Form.create({ name: 'WritingOffModal' })(WritingOffModal));
