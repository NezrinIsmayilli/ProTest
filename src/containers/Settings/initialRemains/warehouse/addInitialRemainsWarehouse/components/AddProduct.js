import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row,Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { connect, useDispatch } from 'react-redux';
import AddCatalog from 'components/Lib/AddCatalog/AddCatalog';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import {
    fetchUnitOfMeasurements,
    fetchProductPriceTypes,
} from 'store/actions/settings/mehsul';
import {
    setSelectedProducts,
    fetchPurchaseCatalogs,
} from 'store/actions/sales-operation';
import { createProduct } from 'store/actions/product';
import { ProModal, ProFormItem, ProSelect, ProInput } from 'components/Lib';
import { requiredRule, minLengthRule, longTextMaxRule } from 'utils/rules';
import errorMessages from 'utils/errors';
import { toast } from 'react-toastify';
import { re_amount } from 'utils';
import AddMeasurement from 'containers/Warehouse/Products/AddProduct/Tabs/productInfo/AddMeasurement';
import styles from '../styles.module.scss';

const roundTo = require('round-to');

function AddProduct(props) {
    const {
        visible,
        toggleVisible,
        catalogs,
        currencies,
        actionLoading,
        productPriceTypes,
        unitOfMeasurements,
        selectedProducts,
        form,
        fetchCurrencies,
        fetchProductPriceTypes,
        fetchUnitOfMeasurements,
        fetchPurchaseCatalogs,
        createProduct,
        setSelectedProducts,
        selectedStock,
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
    const [measurementModalIsVisible, setMeasurementModalIsVisible] = useState(
        false
    );

    const handleModal = () => {
        toggleVisible();
        resetFields();
        fetchCurrencies();
    };

    useEffect(() => {
        fetchProductPriceTypes();
    }, []);
    const fetchCatalogs = () => {
        fetchPurchaseCatalogs({
            filters: {
                limit: 1000,
                serviceType: 1,
                stock: getFieldValue('stockTo'),
            },
            label: 'fetchCatalogsByInvoiceType',
        });
    };

    useEffect(() => {
        if (currencies.length > 0) {
            setFieldsValue({
                currency: currencies[0].id,
                currencyCode: currencies[0].code,
            });
        }
    }, [currencies, visible]);

    useEffect(() => {
        fetchCatalogs();
        if (unitOfMeasurements.length === 0) fetchUnitOfMeasurements();
        fetchCurrencies();
    }, [productPriceTypes]);

    const handleNewCatalogClick = type => {
        setCatalogModalType(type);
        setCatalogModalIsVisible(true);
    };

    const onSuccessAddModal = data => {
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
                selectedStock={selectedStock}
                fetchPurchasedCatalogs
                radioDisabled
            />

            <AddMeasurement
                isVisible={measurementModalIsVisible}
                setIsVisible={setMeasurementModalIsVisible}
                setMainFormValues={setFieldsValue}
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
                            <div style={{ position: 'relative' }}>
                                <Tooltip title="Kataloq əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        className={styles.plusBtn}
                                        onClick={() =>handleNewCatalogClick('catalog')}
                                    />
                                </Tooltip>
                            </div>
                            <ProFormItem
                                label="Kataloq"
                                customStyle={styles.formItem}
                                help={getFieldError('catalog')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('catalog', {
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        size="large"
                                        placeholder="Kataloq seç"
                                        data={catalogs?.root}
                                        onChange={id => {
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
                                )}
                            </ProFormItem>
                        </Col>
                        <Col style={{ position: 'relative' }}>
                        <div style={{ position: 'relative'}} >
                                <Button 
                                style={{border:"0", position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        zIndex:5,
                                        backgroundColor:'transparent'
                                    }} 
                                disabled={!getFieldValue('catalog')}
                                >
                                        <Tooltip title="Alt kataloq əlavə et" >
                                            <PlusIcon
                                                color="#FF716A"
                                                className={styles.plusBtn}
                                                onClick={() => handleNewCatalogClick('sub-catalog')}
                                            
                                            />
                                        </Tooltip>
                                </Button>
                            </div>
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
                            <div style={{ position: 'relative' }}>
                                    <Tooltip title="Ölçü vahidi əlavə et">
                                        <PlusIcon
                                            color="#FF716A"
                                            className={styles.plusBtn}
                                            onClick={() =>setMeasurementModalIsVisible(true)}
                                        />
                                    </Tooltip>
                            </div>
                                <ProFormItem
                                    label="Ölçü vahidi"
                                    customStyle={styles.formItem}
                                    help={getFieldError('measurement')?.[0]}
                                    style={{ height: '80px' }}
                                >
                                    {getFieldDecorator('measurement', {
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            data={unitOfMeasurements}
                                            allowClear
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
                                                <ProSelect
                                                    data={currencies}
                                                    keys={['code']}
                                                    allowClear={false}
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
    catalogs: state.salesOperation.catalogs,
    productPriceTypes: state.mehsulReducer.productPriceTypes,
    currencies: state.kassaReducer.currencies,
    unitOfMeasurements: state.mehsulReducer.unitOfMeasurements,
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        fetchProductPriceTypes,
        fetchUnitOfMeasurements,
        fetchCurrencies,
        createProduct,
        setSelectedProducts,
        fetchPurchaseCatalogs,
    }
)(Form.create({ name: 'AddProduct' })(AddProduct));
