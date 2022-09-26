import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row } from 'antd';
import { connect, useDispatch } from 'react-redux';
import AddCatalog from 'components/Lib/AddCatalog/AddCatalog';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchProductPriceTypes } from 'store/actions/settings/mehsul';
import { fetchMeasurements } from 'store/actions/measurements';
import { fetchFilteredCatalogs } from 'store/actions/catalog';
import {
    setSelectedProducts,
    fetchPurchaseCatalogs,
} from 'store/actions/sales-operation';
import { createProduct } from 'store/actions/product';
import {
    ProModal,
    ProFormItem,
    ProSelect,
    ProInput,
    ProAsyncSelect,
} from 'components/Lib';
import { requiredRule, minLengthRule, longTextMaxRule } from 'utils/rules';
import errorMessages from 'utils/errors';
import { toast } from 'react-toastify';
import { re_amount } from 'utils';
import AddMeasurement from 'containers/Warehouse/Products/AddProduct/Tabs/productInfo/AddMeasurement';
import styles from '../../styles.module.scss';

const roundTo = require('round-to');

function AddProduct(props) {
    const {
        visible,
        toggleVisible,
        actionLoading,
        productPriceTypes,
        selectedProducts,
        form,
        fetchCurrencies,
        fetchProductPriceTypes,
        createProduct,
        setSelectedProducts,
        fetchMeasurements,
        fetchPurchaseCatalogs,
        fetchFilteredCatalogs,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        validateFields,
        setFieldsValue,
        setFields,
        resetFields,
    } = form;

    const dispatch = useDispatch();

    const [formData, setFormData] = useState({});

    const [catalogModalType, setCatalogModalType] = useState('catalog');
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [parentCatalogName, setParentCatalogName] = useState(null);
    const [unitOfMeasurements, setUnitOfMeasurements] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [rendered, setRendered] = useState(false);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [addedCatalog, setAddedCatalog] = useState([]);
    const [addedMeasurements, setAddedMeasurements] = useState([]);
    const [measurementModalIsVisible, setMeasurementModalIsVisible] = useState(
        false
    );

    // Fetch product catalogs by invoice type
    const fetchCatalogs = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const type = 'purchase';
        const defaultFilters = { limit, page, name: search };
        fetchPurchaseCatalogs({
            filters: { serviceType: 1, ...defaultFilters },
            type,
            label: 'fetchCatalogsByInvoiceType',
            onSuccessCallback: data => {
                let appendList = {};
                if (data.data) {
                    appendList = data.data;
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!Object.keys(appendList).length);
                }
                if (stateReset) {
                    setCatalogs(appendList);
                } else {
                    setCatalogs({
                        ...appendList,
                        root: catalogs.root.concat(appendList.root),
                    });
                }
            },
        });
    };

    const handleModal = () => {
        toggleVisible();
        resetFields();
        setRendered(false);
    };

    useEffect(() => {
        fetchProductPriceTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (currencies.length > 0 && !rendered) {
            setFieldsValue({
                currency: currencies[0].id,
                currencyCode: currencies[0].code,
            });
            setRendered(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencies, visible]);

    useEffect(() => {
        if (visible) {
            fetchCatalogs(1, 20, '', 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productPriceTypes, visible]);

    useEffect(() => {
        setParentCatalogName(
            getFieldValue('catalog')
                ? catalogs?.root?.filter(
                      catalog => catalog.id === getFieldValue('catalog')
                  )[0]?.name
                : undefined
        );
        setFieldsValue({
            subCatalog: undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('catalog')]);

    useEffect(() => {
        const subcatalogs = catalogs.children[getFieldValue('catalog')];
        if (catalogs.root?.length === 1) {
            setFieldsValue({
                catalog: catalogs?.root[0].id,
            });
        }

        if (subcatalogs && subcatalogs.length === 1) {
            setFieldsValue({
                subCatalog: subcatalogs[0].id,
            });
        }

        if (unitOfMeasurements?.length === 1) {
            setFieldsValue({
                measurement: unitOfMeasurements[0].id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalogs, getFieldValue('catalog'), unitOfMeasurements]);

    const handleNewCatalogClick = type => {
        setCatalogModalType(type);
        setCatalogModalIsVisible(true);
    };

    const fetchMeasurementsAdded = id => {
        const filters = { limit: 20, page: 1, ids: [id] };

        fetchMeasurements(filters, data => {
            if (data.data) {
                setAddedMeasurements(data.data);
            }
        });
    };

    const onSuccessAddModal = (data, catalogType) => {
        if (catalogType !== 'catalog') {
            fetchCatalogs(1, 20, '', 1);
        } else {
            const defaultFilters = { limit: 20, page: 1, ids: [data.id] };
            fetchFilteredCatalogs(defaultFilters, data => {
                if (data.data) {
                    setAddedCatalog(data.data.root);
                }
            });
        }
        setFieldsValue({
            [catalogModalType === 'catalog'
                ? 'catalog'
                : 'subCatalog']: data.id,
        });
        if (catalogModalType === 'catalog') {
            setFieldsValue({
                subCatalog: undefined,
            });
        }
    };

    const ajaxCurrenciesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchCurrencies(defaultFilters, data => {
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
                setCurrencies(appendList);
            } else {
                setCurrencies(currencies.concat(appendList));
            }
        });
    };

    const ajaxMeasurementsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };

        fetchMeasurements(filters, data => {
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
                setUnitOfMeasurements(appendList);
            } else {
                setUnitOfMeasurements(unitOfMeasurements.concat(appendList));
            }
        });
    };

    const handleDefaultPriceChange = event => {
        const prices = getFieldValue('prices');

        if (event.target.value === '') {
            setFieldsValue({
                prices: prices?.map(() => ({
                    amount: undefined,
                })),
            });
            return undefined;
        }
        if (
            re_amount.test(event.target.value) &&
            Number(event.target.value) <= 10000000
        ) {
            setFieldsValue({
                prices: prices?.map(value => {
                    if (value.percentage) {
                        const discountValue =
                            (Number(event.target.value) *
                                Number(value.percentage)) /
                            100;
                        return {
                            ...value,
                            amount: roundTo(
                                Number(event.target.value) -
                                    Number(discountValue),
                                4
                            ),
                        };
                    }
                    return value;
                }),
            });
            return event.target.value;
        }
        return getFieldValue('price');
    };

    const validateSelectedProducts = selectedProducts => {
        const errorMessage = '';
        const isValid = true;
        // if (
        //     selectedProducts.some(
        //         ({ invoiceQuantity }) => Number(invoiceQuantity || 0) === 0
        //     )
        // ) {
        //     errorMessage = 'Say qeyd edilməyən məhsul mövcuddur.';
        //     isValid = false;
        // }
        return {
            isValid,
            errorMessage,
        };
    };

    const createNewProduct = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    catalog,
                    subCatalog,
                    productName,
                    price,
                    measurement,
                    currency,
                } = values;
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );
                if (!isValid) {
                    if (errorMessage) {
                        return toast.error(errorMessage);
                    }
                } else {
                    const newProduct = {
                        name: productName || null,
                        catalog: subCatalog || catalog,
                        unitOfMeasurement: measurement || null,
                        currency: currency || null,
                        salesPrice: Number(price) || null,
                    };

                    return createProduct(
                        newProduct,
                        ({ data }) => {
                            dispatch(
                                setSelectedProducts({
                                    newSelectedProducts: [
                                        ...selectedProducts,
                                        {
                                            ...newProduct,
                                            catalog: {
                                                isWithoutSerialNumber: catalogs?.root?.find(
                                                    catalogRoot =>
                                                        catalogRoot.id ===
                                                        catalog
                                                ).isWithoutSerialNumber,
                                            },
                                            id: data?.id,
                                            invoicePrice: Number(price) || null,
                                            plannedCost: 0,
                                            plannedPrice: 0,
                                            invoiceQuantity: catalogs.root.find(
                                                catalogRoot =>
                                                    catalogRoot.id === catalog
                                            ).isWithoutSerialNumber
                                                ? 1
                                                : null,
                                        },
                                    ],
                                })
                            );
                            toast.success('Əməliyyat uğurla tamamlandı.');
                            toggleVisible(false);
                            resetFields();
                        },
                        error => {
                            const errorKey =
                                error?.error?.response?.data?.error?.messageKey;
                            if (errorKey) {
                                setFields({
                                    productCode: {
                                        value: getFieldValue('productCode'),
                                        errors: [
                                            new Error(errorMessages[errorKey]),
                                        ],
                                    },
                                });
                            } else if (
                                error?.error?.response?.data?.error?.message ===
                                'This barcode is already exists.'
                            ) {
                                setFields({
                                    barcode: {
                                        value: getFieldValue('barcode'),
                                        errors: [
                                            new Error(
                                                'Bu barkod artıq təyin edilib'
                                            ),
                                        ],
                                    },
                                });
                            } else if (
                                error?.error?.response?.data?.error?.message ===
                                'This product is already exists.'
                            ) {
                                setFields({
                                    productName: {
                                        value: getFieldValue('productName'),
                                        errors: [
                                            new Error(
                                                'Bu məhsul artıq mövcuddur.'
                                            ),
                                        ],
                                    },
                                });
                            } else if (
                                error?.error?.response?.data?.error?.message ===
                                'This product is used.'
                            ) {
                                toast.error(
                                    'Bu məhsul ilə əməliyyat edildiyi üçün məhsulun kataloqunu dəyişmək mümkün deyil.'
                                );
                            }
                        }
                    );
                }
            }
        });
    };
    return (
        <>
            <AddCatalog
                isVisible={catalogModalIsVisible}
                setIsVisible={setCatalogModalIsVisible}
                type={catalogModalType}
                parentCatalogId={getFieldValue('catalog')}
                parentCatalogName={parentCatalogName}
                onSuccessAddModal={onSuccessAddModal}
                setParentCatalogName={setParentCatalogName}
                radioDisabled
            />

            <AddMeasurement
                fromSales
                fetchMeasurements={ajaxMeasurementsSelectRequest}
                isVisible={measurementModalIsVisible}
                setIsVisible={setMeasurementModalIsVisible}
                setMainFormValues={setFieldsValue}
                fetchMeasurementsAdded={fetchMeasurementsAdded}
            />

            <ProModal
                maskClosable
                width={500}
                isVisible={visible}
                customStyles={styles.AddSerialNumbersModal}
                handleModal={handleModal}
            >
                <Form
                    scrollToFirstError
                    onSubmit={event => createNewProduct(event)}
                >
                    <div style={{ padding: '24px' }}>
                        <div style={{ margin: '0 0 10px' }}>
                            <label
                                className={styles.newProductTitle}
                                style={{ fontSize: '24px' }}
                            >
                                Məhsul əlavə et
                            </label>
                        </div>
                        <Col style={{ position: 'relative' }}>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => handleNewCatalogClick('catalog')}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    cursor: 'pointer',
                                    zIndex: 5,
                                }}
                            >
                                Kataloq əlavə et
                            </Button>
                            <ProFormItem
                                label="Kataloq"
                                customStyle={styles.formItem}
                                help={getFieldError('catalog')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('catalog', {
                                    rules: [requiredRule],
                                })(
                                    <ProAsyncSelect
                                        placeholder="Kataloq seç"
                                        selectRequest={fetchCatalogs}
                                        data={
                                            addedCatalog.length > 0
                                                ? [
                                                      ...addedCatalog,
                                                      ...catalogs.root.filter(
                                                          item =>
                                                              !addedCatalog
                                                                  .map(
                                                                      ({
                                                                          id,
                                                                      }) => id
                                                                  )
                                                                  ?.includes(
                                                                      item.id
                                                                  )
                                                      ),
                                                  ]
                                                : catalogs.root || []
                                        }
                                        valueOnChange={id => {
                                            setParentCatalogName(
                                                id
                                                    ? catalogs?.root?.filter(
                                                          catalog =>
                                                              catalog.id === id
                                                      )[0].name
                                                    : undefined
                                            );
                                            setFieldsValue({
                                                subCatalog: undefined,
                                            });
                                        }}
                                    />
                                    // <ProSelect
                                    //     size="large"
                                    //     placeholder="Kataloq seç"
                                    //     data={catalogs?.root}
                                    //     onChange={id => {
                                    //         setParentCatalogName(
                                    //             id
                                    //                 ? catalogs?.root?.filter(
                                    //                       catalog =>
                                    //                           catalog.id === id
                                    //                   )[0].name
                                    //                 : undefined
                                    //         );
                                    //         setFieldsValue({
                                    //             subCatalog: undefined,
                                    //         });
                                    //     }}
                                    // />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col style={{ position: 'relative' }}>
                            <Button
                                type="link"
                                size="small"
                                onClick={() =>
                                    handleNewCatalogClick('sub-catalog')
                                }
                                disabled={!getFieldValue('catalog')}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    cursor: 'pointer',
                                    zIndex: 5,
                                }}
                            >
                                Alt kataloq əlavə et
                            </Button>
                            <ProFormItem
                                label="Alt kataloq"
                                customStyle={styles.formItem}
                                help={getFieldError('subCatalog')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('subCatalog', {
                                    rules:
                                        catalogs?.children?.[
                                            getFieldValue('catalog')
                                        ]?.length > 0
                                            ? [requiredRule]
                                            : [],
                                })(
                                    <ProSelect
                                        disabled={!getFieldValue('catalog')}
                                        data={
                                            getFieldValue('catalog') &&
                                            catalogs?.children?.[
                                                getFieldValue('catalog')
                                            ]
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <ProFormItem
                            label="Məhsul adı"
                            customStyle={styles.formItem}
                            help={getFieldError('productName')?.[0]}
                            style={{ height: '80px' }}
                        >
                            {getFieldDecorator('productName', {
                                rules: [
                                    requiredRule,
                                    minLengthRule,
                                    longTextMaxRule,
                                ],
                            })(<ProInput />)}
                        </ProFormItem>
                        <Row gutter={8}>
                            <Col style={{ position: 'relative' }} span={12}>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() =>
                                        setMeasurementModalIsVisible(true)
                                    }
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: '0px',
                                        cursor: 'pointer',
                                        zIndex: 5,
                                        fontSize: '14px',
                                    }}
                                >
                                    Ölçü vahidi əlavə et
                                </Button>
                                <ProFormItem
                                    label="Ölçü vahidi"
                                    customStyle={styles.formItem}
                                    help={getFieldError('measurement')?.[0]}
                                    style={{ height: '80px' }}
                                >
                                    {getFieldDecorator('measurement', {
                                        rules: [requiredRule],
                                    })(
                                        <ProAsyncSelect
                                            allowClear={false}
                                            selectRequest={
                                                ajaxMeasurementsSelectRequest
                                            }
                                            data={
                                                addedMeasurements.length > 0
                                                    ? [
                                                          ...addedMeasurements,
                                                          ...unitOfMeasurements.filter(
                                                              item =>
                                                                  !addedMeasurements
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                    : unitOfMeasurements
                                            }
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                            <Col span={12}>
                                <Row>
                                    <Col
                                        span={15}
                                        style={{ marginRight: '5px' }}
                                    >
                                        <ProFormItem
                                            label="Satış qiyməti"
                                            customStyle={styles.formItem}
                                            help={getFieldError('price')?.[0]}
                                            style={{ height: '80px' }}
                                        >
                                            {getFieldDecorator('price', {
                                                getValueFromEvent: event =>
                                                    handleDefaultPriceChange(
                                                        event
                                                    ),
                                                rules: [],
                                            })(<ProInput />)}
                                        </ProFormItem>
                                    </Col>
                                    <Col span={8}>
                                        <ProFormItem
                                            label="Valyuta"
                                            customStyle={styles.formItem}
                                            help={
                                                getFieldError('currency')?.[0]
                                            }
                                            style={{ height: '80px' }}
                                        >
                                            {getFieldDecorator('currency', {
                                                getValueFromEvent: value => {
                                                    setFormData({
                                                        currency: currencies.filter(
                                                            currency =>
                                                                currency.id ===
                                                                value
                                                        )[0],
                                                    });
                                                    return value;
                                                },
                                                rules: [],
                                            })(
                                                <ProAsyncSelect
                                                    allowClear={false}
                                                    keys={['code']}
                                                    selectRequest={
                                                        ajaxCurrenciesSelectRequest
                                                    }
                                                    data={currencies}
                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Col className={styles.submitBtn}>
                            <Button
                                htmlType="submit"
                                loading={actionLoading}
                                type="primary"
                            >
                                Məhsul əlavə et
                            </Button>
                        </Col>
                    </div>
                </Form>
            </ProModal>
        </>
    );
}
const mapStateToProps = state => ({
    actionLoading: state.productReducer.actionLoading,
    productPriceTypes: state.mehsulReducer.productPriceTypes,
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        fetchProductPriceTypes,
        fetchCurrencies,
        createProduct,
        setSelectedProducts,
        fetchMeasurements,
        fetchPurchaseCatalogs,
        fetchFilteredCatalogs,
    }
)(Form.create({ name: 'AddProduct' })(AddProduct));
