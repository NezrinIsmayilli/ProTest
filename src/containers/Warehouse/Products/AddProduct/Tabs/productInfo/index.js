import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Collapse, Checkbox, Tooltip, Icon } from 'antd';
import ReactToPrint from 'react-to-print';
import JsBarcode from 'jsbarcode';
import {
    ProFormItem,
    ProSelect,
    ProInput,
    ProTextArea,
    PhotoUpload,
    ProAsyncSelect,
} from 'components/Lib';
import {
    fetchBarcodTypes,
    generateBarcode,
    fetchFreeBarcodTypes,
} from 'store/actions/settings/mehsul';
import { fetchFilteredCatalogs } from 'store/actions/catalog';
import { fetchContacts } from 'store/actions/contact';
import { fetchMeasurements } from 'store/actions/measurements';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import {
    requiredRule,
    minLengthRule,
    shortTextMaxRule,
    longTextMaxRule,
    dinamicMaxLengthRule,
} from 'utils/rules';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { ReactComponent as MinusIcon } from 'assets/img/icons/minus.svg';
import { toast } from 'react-toastify';
import styles from '../../../../styles.module.scss';

const { Panel } = Collapse;

const ProductInfo = props => {
    const {
        id,
        filterSelectedMeauserments,
        setFilterSelectedMeauserments,
        manufacturers,
        addedCatalog,
        setAddedCatalog,
        handleNewCatalogClick,
        handleDefaultPriceChange,
        handlePriceTypeValueChange,
        handlePriceTypePercentageChange,
        handleAddExpenseClick,
        handleProductItem,
        generateBarcode,
        setFormData,
        formData,
        setParentCatalogName,
        fetchFilteredCatalogs,
        fetchCurrencies,
        fetchContacts,
        fetchMeasurements,
        setMeasurementModalIsVisible,
        form,
        allDataPriceEdit,
        constPriceData,
        pricesDataConcat,
        editData,
        fetchBarcodTypes,
        fetchFreeBarcodTypes,
        barcodTypes,
        freeBarcodTypes,
        setAutoGenerate,
        autoGenerate,
        data,
        product,
        setContactItem,
        setAttachment,
        attachment,
        setIsServiceType,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        validateFields,
        setFieldsValue,
        setFields,
    } = form;

    const componentRef = useRef();
    const [barcodeType, setBarcodeType] = useState(undefined);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [Manufacturers, setManufacturers] = useState([]);
    const [
        filterSelectedManufacturers,
        setFilterSelectedManufacturers,
    ] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const stopPropagationHandle = e => {
        if (e) e.stopPropagation();
    };

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        if (data) {
            ajaxManufacturersSelectRequest(1, 10, '', 1);
        }
        data
            ? setFieldsValue({
                manufacturer: data ? manufacturers[0]?.id : undefined,
            })
            : setFieldsValue({
                manufacturer:
                    manufacturers.length === 1
                        ? manufacturers[0]?.id
                        : undefined,
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manufacturers]);
    useEffect(() => {
        if (product.parentCatalogId) {
            fetchFilteredCatalogs({ ids: [product.parentCatalogId] }, data => {
                let appendList = {};
                if (data.data) {
                    appendList = data.data;
                }
                setAddedCatalog(appendList);
            });
        }
        if (product.manufacturerId) {
            const filter = {
                ids: [product.manufacturerId],
                categories: [8],
            };
            fetchContacts(filter, data => {
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
                setFilterSelectedManufacturers(appendList);
            });
        }

        if (product.unitOfMeasurementId) {
            const filter = {
                ids: [product.unitOfMeasurementId],
            };
            fetchMeasurements(filter, data => {
                let appendList = {};
                if (data.data) {
                    appendList = data.data;
                }
                setFilterSelectedMeauserments(appendList);
            });
        }

        if (product.currencyId) {
            fetchCurrencies({ ids: [Number(product.currencyId)] }, data => {
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
    }, [
        fetchContacts,
        fetchCurrencies,
        fetchFilteredCatalogs,
        fetchMeasurements,
        product,
        setAddedCatalog,
        setFilterSelectedMeauserments,
    ]);
    const handleAutoGenerateCheckbox = checked => {
        if (checked) {
            setAutoGenerate(true);
            if (getFieldValue('barcodeType') === 1) {
                generateBarcode(1, ({ data }) => {
                    setFieldsValue({ barcode: data });
                });
            } else if (getFieldValue('barcodeType') === 2) {
                generateBarcode(2, ({ data }) => {
                    setFieldsValue({ barcode: data });
                });
            }
        } else {
            setAutoGenerate(false);
            setFieldsValue({ barcodeType: 1 });
            if (
                getFieldValue('barcodeType') === 1 ||
                getFieldValue('barcodeType') === 2
            ) {
                handleGenerate();
            }
        }
    };

    const handleGenerate = e => {
        stopPropagationHandle(e);
        const type = getFieldValue('barcodeType') === 1 ? 1 : 2;
        generateBarcode(type, ({ data }) => {
            setFieldsValue({ barcode: data });
        });
    };
    const handleBarcodeType = value => {
        setBarcodeType(value);
        if (autoGenerate) {
            generateBarcode(value, ({ data }) => {
                setFieldsValue({ barcode: data });
            });
        }
    };

    useEffect(() => {
        fetchBarcodTypes();
        fetchFreeBarcodTypes();
        setFieldsValue({ barcodeType: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        setParentCatalogName(
            getFieldValue('catalog')
                ? catalogs?.root?.filter(
                    catalog => catalog.id === getFieldValue('catalog')
                )[0]?.name
                : undefined
        );
        console.log('okkkkkkkkkkkkkkkkkkkkkk')
        // setFieldsValue({
        //     subCatalog: undefined,
        // });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('catalog')]);

    useEffect(() => {
        if (catalogs.root.length === 1 && !id) {
            setFieldsValue({
                catalog: catalogs?.root[0].id,
                barcodeType: 1,
            });
        }

        if (measurements.length === 1) {
            setFieldsValue({
                measurement: measurements[0].id,
            });
        }
    }, [catalogs, id, setFieldsValue, measurements]);
    useEffect(() => {
        const data =
            getFieldValue('barcodeType') === 2
                ? getFieldValue('barcode')?.length === 13
                    ? getFieldValue('barcode')
                    : '0000000000000'
                : getFieldValue('barcode')?.length > 0
                    ? getFieldValue('barcode')
                    : '0';
        if (getFieldValue('barcodeType') === 1) {
            JsBarcode('#barcode', data, {
                format: 'CODE39',
            });
        } else if (getFieldValue('barcodeType') === 2) {
            JsBarcode('#barcode', data, {
                format: 'ean13',
                displayValue: barcodTypes[0]?.showNumber || false,
                background: barcodTypes[0]?.barBackground || '#FFFFFF',
                lineColor: barcodTypes[0]?.lineColor || '#000',
                fontSize:
                    barcodTypes[0]?.fontSize === null
                        ? 20
                        : Number(barcodTypes[0]?.fontSize),
                height: barcodTypes[0]?.barHeight || 100,
                width: barcodTypes[0]?.barWidth || 2,
                textAlign: barcodTypes[0]?.textAlign,
                fontOptions:
                    barcodTypes[0]?.fontOptions === '1'
                        ? 'bold'
                        : barcodTypes[0]?.fontOptions === '2'
                            ? 'italic'
                            : '',
                font:
                    barcodTypes[0]?.font === '1'
                        ? '"Lucida Console", "Courier New", monospace'
                        : barcodTypes[0]?.font === '2'
                            ? 'Arial, Helvetica, sans-serif'
                            : barcodTypes[0]?.font === '3'
                                ? '"Times New Roman", Times, serif'
                                : barcodTypes[0]?.font === '4'
                                    ? 'Impact, fantasy'
                                    : barcodTypes[0]?.font === '5'
                                        ? 'Snell Roundhand, cursive'
                                        : '"Lucida Console", "Courier New", monospace',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barcodTypes, getFieldValue('barcode'), getFieldValue('barcodeType')]);

    const handleBarcod = (event, maxLength) => {
        const regex = /^[a-zA-Z0-9-/.$+%]+$/;
        if (
            regex.test(event.target.value) &&
            event.target.value.length <= maxLength
        )
            return event.target.value;
        if (event.target.value === '') return null;
        if (event.target.value.length > maxLength) {
            toast.error(
                `Barkod xanasına ${maxLength} simvoldan çox dəyər daxil etmək olmaz.`,
                {
                    toastId: 'customId',
                }
            );
        }
        return getFieldValue('barcode');
    };

    const handleContactItem = () => {
        setContactItem(true);
    };

    const ajaxCatalogsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchFilteredCatalogs(defaultFilters, data => {
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
        });
    };

    const ajaxManufacturersSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            categories: [8],
            name: search,
        };
        fetchContacts(filters, data => {
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
                setManufacturers(appendList);
            } else {
                setManufacturers(Manufacturers.concat(appendList));
            }
        });
    };

    const ajaxMeasurementSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, q: search };
        fetchMeasurements(defaultFilters, data => {
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
                setMeasurements(appendList);
            } else {
                setMeasurements(measurements.concat(appendList));
            }
        });
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

    return (
        <>
            <Row className={styles.content}>
                <Col md={12} sm={20} xs={20}>
                    <div style={{ margin: '10px 0' }}>
                        <label
                            className={styles.newProductTitle}
                            style={{ fontSize: '24px' }}
                        >
                            {id ? 'Düzəliş et' : 'Yeni Məhsul'}
                        </label>
                    </div>
                    <Col style={{ position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <Tooltip title="Kataloq əlavə et">
                                <PlusIcon
                                    color="#FF716A"
                                    className={styles.plusBtn}
                                    onClick={() =>
                                        handleNewCatalogClick('catalog')
                                    }
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
                                getValueFromEvent: event => {
                                    setIsServiceType(
                                        catalogs.root.find(
                                            cat => cat.id === event
                                        ).isServiceType
                                    );
                                    return event;
                                },
                                rules: [requiredRule],
                            })(
                                <ProAsyncSelect
                                    size="large"
                                    selectRequest={ajaxCatalogsSelectRequest}
                                    placeholder="Kataloq seç"
                                    data={
                                        addedCatalog.root?.length > 0
                                            ? [
                                                ...addedCatalog.root,
                                                ...catalogs.root.filter(
                                                    item =>
                                                        !addedCatalog.root
                                                            .map(
                                                                ({ id }) => id
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
                                                ? catalogs.root.filter(
                                                    catalog =>
                                                        catalog.id === id
                                                )[0].name
                                                : undefined
                                        );
                                        setFieldsValue({
                                            subCatalog:
                                                catalogs.children[id]
                                                    ?.length === 1
                                                    ? catalogs.children[id][0]
                                                        .id
                                                    : undefined,
                                        });
                                    }}
                                />
                            )}
                        </ProFormItem>
                    </Col>
                    <Col style={{ position: 'relative' }}>
                        {/* <Button
                            type="link"
                            size="small"
                            onClick={() => handleNewCatalogClick('sub-catalog')}
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
                        </Button> */}
                        <div style={{ position: 'relative' }}>
                            <Button
                                style={{
                                    border: '0',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    zIndex: 5,
                                    backgroundColor: 'transparent',
                                }}
                                disabled={!getFieldValue('catalog')}
                            >
                                <Tooltip title="Alt kataloq əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        className={styles.plusBtn}
                                        onClick={() =>
                                            handleNewCatalogClick('sub-catalog')
                                        }
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
                                    catalogs.children[getFieldValue('catalog')]
                                        ?.length > 0
                                        ? [requiredRule]
                                        : [],
                            })(
                                <ProSelect
                                    disabled={!getFieldValue('catalog')}
                                    data={
                                        getFieldValue('catalog') &&
                                        (addedCatalog.children[
                                            getFieldValue('catalog')
                                        ]?.length > 0
                                            ? [
                                                ...addedCatalog.children[
                                                getFieldValue('catalog')
                                                ],
                                            ]
                                            : catalogs.children[
                                            getFieldValue('catalog')
                                            ])
                                    }
                                />
                            )}
                        </ProFormItem>
                    </Col>
                    <Row className={styles.photoAndNameRow}>
                        <Col md={8} sm={24} xs={24}>
                            <PhotoUpload
                                setAttachment={setAttachment}
                                attachment={attachment}
                            />
                        </Col>
                        <Col md={16} sm={24} xs={24}>
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
                        </Col>
                    </Row>
                    <Row>
                        <Col md={15} sm={24} xs={24}>
                            <ProFormItem
                                label="Barkod"
                                customStyle={styles.formItem}
                                help={getFieldError('barcode')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('barcode', {
                                    getValueFromEvent: event =>
                                        handleBarcod(
                                            event,
                                            freeBarcodTypes?.[0]?.length || 30
                                        ),
                                    rules: [
                                        dinamicMaxLengthRule(
                                            freeBarcodTypes?.[0]?.length || 30
                                        ),
                                        minLengthRule,
                                    ],
                                })(
                                    <ProInput
                                        className={styles.barcodeInput}
                                        disabled={autoGenerate}
                                        suffix={
                                            autoGenerate && (
                                                <Tooltip title="Avtomatik generasiya et">
                                                    <Button
                                                        onClick={handleGenerate}
                                                        type="link"
                                                        className={
                                                            styles.editButton
                                                        }
                                                    >
                                                        <Icon type="reload" />
                                                    </Button>
                                                </Tooltip>
                                            )
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col
                            md={8}
                            sm={24}
                            xs={24}
                            style={{ marginLeft: '5px' }}
                        >
                            <ProFormItem
                                label={
                                    <Checkbox
                                        style={{
                                            marginBottom: '0px!important',
                                        }}
                                        onChange={event =>
                                            handleAutoGenerateCheckbox(
                                                event.target.checked
                                            )
                                        }
                                        checked={autoGenerate}
                                    >
                                        Avto generasiya
                                    </Checkbox>
                                }
                                help={getFieldError('barcodeType')?.[0]}
                                customStyle={`${styles.formItem} generatorStyle`}
                            >
                                {getFieldDecorator('barcodeType', {
                                    rules: [],
                                })(
                                    <ProSelect
                                        data={
                                            barcodTypes[0]?.isActive
                                                ? [
                                                    {
                                                        id: 1,
                                                        name: 'Sərbəst',
                                                    },
                                                    { id: 2, name: 'EAN-13' },
                                                ]
                                                : [{ id: 1, name: 'Sərbəst' }]
                                        }
                                        disabled={!autoGenerate}
                                        onChange={value => {
                                            handleBarcodeType(value);
                                        }}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row
                        ref={componentRef}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <p>
                            {getFieldValue('barcodeType') === 2
                                ? barcodTypes[0]?.title || null
                                : null}
                        </p>
                        <svg id="barcode"></svg>
                    </Row>
                    <Row className={styles.printButtonRow}>
                        <ReactToPrint
                            trigger={() => (
                                <Button
                                    className={styles.customPrintButton}
                                    style={{ marginRight: 10, marginTop: 10 }}
                                    icon="printer"
                                >
                                    Çap et
                                </Button>
                            )}
                            content={() => componentRef.current}
                        />
                    </Row>
                    <ProFormItem
                        label="Məhsulun kodu"
                        customStyle={styles.formItem}
                        help={getFieldError('productCode')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('productCode', {
                            rules: [minLengthRule, longTextMaxRule],
                        })(<ProInput />)}
                    </ProFormItem>
                    <div style={{ position: 'relative' }}>
                        <Tooltip title="Əlaqə əlavə et">
                            <PlusIcon
                                color="#FF716A"
                                className={styles.plusBtn}
                                onClick={() => handleContactItem()}
                            />
                        </Tooltip>
                    </div>
                    <ProFormItem
                        label="İstehsalçı"
                        customStyle={styles.formItem}
                        help={getFieldError('manufacturer')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('manufacturer', {
                            rules: [],
                        })(
                            <ProAsyncSelect
                                selectRequest={ajaxManufacturersSelectRequest}
                                data={
                                    filterSelectedManufacturers.length > 0
                                        ? [
                                            ...filterSelectedManufacturers,
                                            ...Manufacturers.filter(
                                                item =>
                                                    !filterSelectedManufacturers
                                                        .map(({ id }) => id)
                                                        ?.includes(item.id)
                                            ),
                                        ]
                                        : Manufacturers
                                }
                                allowClear
                            />
                        )}
                    </ProFormItem>
                    <Row gutter={8}>
                        <Col
                            style={{ position: 'relative' }}
                            md={12}
                            sm={24}
                            xs={24}
                        >
                            <div style={{ position: 'relative' }}>
                                <Tooltip title="Ölçü vahidi əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        className={styles.plusBtn}
                                        onClick={() =>
                                            setMeasurementModalIsVisible(true)
                                        }
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
                                    <ProAsyncSelect
                                        selectRequest={
                                            ajaxMeasurementSelectRequest
                                        }
                                        data={
                                            filterSelectedMeauserments.length >
                                                0
                                                ? [
                                                    ...filterSelectedMeauserments,
                                                    ...measurements.filter(
                                                        item =>
                                                            !filterSelectedMeauserments
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
                                                : measurements
                                        }
                                        allowClear
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col md={12} sm={24} xs={24}>
                            <Row>
                                <Col md={16} sm={24} xs={24}>
                                    <ProFormItem
                                        label="Satış qiyməti"
                                        customStyle={styles.formItem}
                                        help={getFieldError('price')?.[0]}
                                        style={{ height: '80px' }}
                                    >
                                        {getFieldDecorator('price', {
                                            getValueFromEvent: event =>
                                                handleDefaultPriceChange(event),
                                            rules: [],
                                        })(<ProInput />)}
                                    </ProFormItem>
                                </Col>
                                <Col md={8} sm={24} xs={24}>
                                    <ProFormItem
                                        label="Valyuta"
                                        customStyle={styles.formItem}
                                        help={getFieldError('currency')?.[0]}
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
                                                selectRequest={
                                                    ajaxCurrenciesSelectRequest
                                                }
                                                data={
                                                    filterSelectedCurrencies.length >
                                                        0
                                                        ? [
                                                            ...filterSelectedCurrencies,
                                                            ...currencies.filter(
                                                                item =>
                                                                    !filterSelectedCurrencies
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
                                                        : currencies
                                                }
                                                keys={['code']}
                                                allowClear={false}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Collapse
                        defaultActiveKey={['1']}
                        className={styles.customCollapse}
                        expandIconPosition="right"
                    >
                        <Panel header="Qiymət tipləri" key="1">
                            {id
                                ? allDataPriceEdit?.length > 0
                                    ? allDataPriceEdit.map((value, index) => (
                                        <Row
                                            gutter={8}
                                            className={styles.productTypeRow}
                                        >
                                            <Col md={12} sm={24} xs={24}>
                                                <ProFormItem
                                                    label="Satış qiymətindən endirim %"
                                                    customStyle={
                                                        styles.formItem
                                                    }
                                                    help={
                                                        getFieldError(
                                                            `prices[${index}].percentage`
                                                        )?.[0]
                                                    }
                                                    style={{ height: '80px' }}
                                                >
                                                    {getFieldDecorator(
                                                        `prices[${index}].percentage`,
                                                        {
                                                            getValueFromEvent: event =>
                                                                handlePriceTypePercentageChange(
                                                                    event,
                                                                    index
                                                                ),
                                                            rules: [],
                                                        }
                                                    )(
                                                        <ProInput
                                                            suffix="%"
                                                            disabled={
                                                                !getFieldValue(
                                                                    'price'
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </ProFormItem>
                                            </Col>
                                            <Col md={10} sm={20} xs={20}>
                                                <ProFormItem
                                                    label={`${value?.price_type_name} qiyməti`}
                                                    customStyle={
                                                        styles.formItem
                                                    }
                                                    help={
                                                        getFieldError(
                                                            `prices[${index}].amount`
                                                        )?.[0]
                                                    }
                                                    style={{ height: '80px' }}
                                                >
                                                    {getFieldDecorator(
                                                        `prices[${index}].amount`,
                                                        {
                                                            getValueFromEvent: event =>
                                                                handlePriceTypeValueChange(
                                                                    event,
                                                                    index
                                                                ),
                                                            rules: [],
                                                        }
                                                    )(
                                                        <ProInput
                                                            suffix={
                                                                formData
                                                                    .currency
                                                                    ?.code
                                                            }
                                                            disabled={
                                                                !getFieldValue(
                                                                    'price'
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </ProFormItem>
                                            </Col>
                                            <Col md={2} sm={4} xs={4}>
                                                <ProFormItem label=" ">
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        {index === 0 ? (
                                                            <PlusIcon
                                                                color="#FF716A"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                }}
                                                                onClick={
                                                                    handleProductItem
                                                                }
                                                            />
                                                        ) : value.is_deletable ===
                                                            false ? null : (
                                                            <MinusIcon
                                                                color="#FF716A"
                                                                className={
                                                                    styles.removeIcon
                                                                }
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    display:
                                                                        'none',
                                                                }}
                                                                onClick={() =>
                                                                    handleAddExpenseClick(
                                                                        'remove',
                                                                        index,
                                                                        value.id
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </ProFormItem>
                                            </Col>
                                        </Row>
                                    ))
                                    : editData.map((value, index) => (
                                        <Row
                                            gutter={8}
                                            className={styles.productTypeRow}
                                        >
                                            <Col md={12} sm={24} xs={24}>
                                                <ProFormItem
                                                    label="Satış qiymətindən endirim %"
                                                    customStyle={
                                                        styles.formItem
                                                    }
                                                    help={
                                                        getFieldError(
                                                            `prices[${index}].percentage`
                                                        )?.[0]
                                                    }
                                                    style={{ height: '80px' }}
                                                >
                                                    {getFieldDecorator(
                                                        `prices[${index}].percentage`,
                                                        {
                                                            getValueFromEvent: event =>
                                                                handlePriceTypePercentageChange(
                                                                    event,
                                                                    index
                                                                ),
                                                            rules: [],
                                                        }
                                                    )(
                                                        <ProInput
                                                            suffix="%"
                                                            disabled={
                                                                !getFieldValue(
                                                                    'price'
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </ProFormItem>
                                            </Col>
                                            <Col md={10} sm={20} xs={20}>
                                                <ProFormItem
                                                    label={`${value.name} qiyməti`}
                                                    customStyle={
                                                        styles.formItem
                                                    }
                                                    help={
                                                        getFieldError(
                                                            `prices[${index}].amount`
                                                        )?.[0]
                                                    }
                                                    style={{ height: '80px' }}
                                                >
                                                    {getFieldDecorator(
                                                        `prices[${index}].amount`,
                                                        {
                                                            getValueFromEvent: event =>
                                                                handlePriceTypeValueChange(
                                                                    event,
                                                                    index
                                                                ),
                                                            rules: [],
                                                        }
                                                    )(
                                                        <ProInput
                                                            suffix={
                                                                formData
                                                                    .currency
                                                                    ?.code
                                                            }
                                                            disabled={
                                                                !getFieldValue(
                                                                    'price'
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </ProFormItem>
                                            </Col>
                                            <Col md={2} sm={4} xs={4}>
                                                <ProFormItem label=" ">
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        {index === 0 ? (
                                                            <PlusIcon
                                                                color="#FF716A"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                }}
                                                                onClick={
                                                                    handleProductItem
                                                                }
                                                            />
                                                        ) : value?.isDeletable ===
                                                            false ? null : (
                                                            <MinusIcon
                                                                color="#FF716A"
                                                                className={
                                                                    styles.removeIcon
                                                                }
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    display:
                                                                        'none',
                                                                }}
                                                                onClick={() =>
                                                                    handleAddExpenseClick(
                                                                        'remove',
                                                                        index,
                                                                        value.id
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </ProFormItem>
                                            </Col>
                                        </Row>
                                    ))
                                        ? constPriceData.map((value, index) => (
                                            <Row
                                                gutter={8}
                                                className={styles.productTypeRow}
                                            >
                                                <Col md={12} sm={24} xs={24}>
                                                    <ProFormItem
                                                        label="Satış qiymətindən endirim %"
                                                        customStyle={
                                                            styles.formItem
                                                        }
                                                        help={
                                                            getFieldError(
                                                                `prices[${index}].percentage`
                                                            )?.[0]
                                                        }
                                                        style={{ height: '80px' }}
                                                    >
                                                        {getFieldDecorator(
                                                            `prices[${index}].percentage`,
                                                            {
                                                                getValueFromEvent: event =>
                                                                    handlePriceTypePercentageChange(
                                                                        event,
                                                                        index
                                                                    ),
                                                                rules: [],
                                                            }
                                                        )(
                                                            <ProInput
                                                                suffix="%"
                                                                disabled={
                                                                    !getFieldValue(
                                                                        'price'
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </ProFormItem>
                                                </Col>
                                                <Col md={10} sm={20} xs={20}>
                                                    <ProFormItem
                                                        label={`${value.name} qiyməti`}
                                                        customStyle={
                                                            styles.formItem
                                                        }
                                                        help={
                                                            getFieldError(
                                                                `prices[${index}].amount`
                                                            )?.[0]
                                                        }
                                                        style={{ height: '80px' }}
                                                    >
                                                        {getFieldDecorator(
                                                            `prices[${index}].amount`,
                                                            {
                                                                getValueFromEvent: event =>
                                                                    handlePriceTypeValueChange(
                                                                        event,
                                                                        index
                                                                    ),
                                                                rules: [],
                                                            }
                                                        )(
                                                            <ProInput
                                                                suffix={
                                                                    formData
                                                                        .currency
                                                                        ?.code
                                                                }
                                                                disabled={
                                                                    !getFieldValue(
                                                                        'price'
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </ProFormItem>
                                                </Col>
                                                <Col md={2} sm={4} xs={4}>
                                                    <ProFormItem label=" ">
                                                        <div
                                                            style={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            {index === 0 ? (
                                                                <PlusIcon
                                                                    color="#FF716A"
                                                                    style={{
                                                                        cursor:
                                                                            'pointer',
                                                                    }}
                                                                    onClick={
                                                                        handleProductItem
                                                                    }
                                                                />
                                                            ) : value?.isDeletable ===
                                                                false ? null : (
                                                                <MinusIcon
                                                                    color="#FF716A"
                                                                    className={
                                                                        styles.removeIcon
                                                                    }
                                                                    style={{
                                                                        cursor:
                                                                            'pointer',
                                                                        display:
                                                                            'none',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleAddExpenseClick(
                                                                            'remove',
                                                                            index,
                                                                            value.id
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </ProFormItem>
                                                </Col>
                                            </Row>
                                        ))
                                        : constPriceData.map((value, index) => (
                                            <Row
                                                gutter={8}
                                                className={styles.productTypeRow}
                                            >
                                                <Col md={12} sm={24} xs={24}>
                                                    <ProFormItem
                                                        label="Satış qiymətindən endirim %"
                                                        customStyle={
                                                            styles.formItem
                                                        }
                                                        help={
                                                            getFieldError(
                                                                `prices[${index}].percentage`
                                                            )?.[0]
                                                        }
                                                        style={{ height: '80px' }}
                                                    >
                                                        {getFieldDecorator(
                                                            `prices[${index}].percentage`,
                                                            {
                                                                getValueFromEvent: event =>
                                                                    handlePriceTypePercentageChange(
                                                                        event,
                                                                        index
                                                                    ),
                                                                rules: [],
                                                            }
                                                        )(
                                                            <ProInput
                                                                suffix="%"
                                                                disabled={
                                                                    !getFieldValue(
                                                                        'price'
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </ProFormItem>
                                                </Col>
                                                <Col md={10} sm={20} xs={20}>
                                                    <ProFormItem
                                                        label={`${value.name} qiyməti`}
                                                        customStyle={
                                                            styles.formItem
                                                        }
                                                        help={
                                                            getFieldError(
                                                                `prices[${index}].amount`
                                                            )?.[0]
                                                        }
                                                        style={{ height: '80px' }}
                                                    >
                                                        {getFieldDecorator(
                                                            `prices[${index}].amount`,
                                                            {
                                                                getValueFromEvent: event =>
                                                                    handlePriceTypeValueChange(
                                                                        event,
                                                                        index
                                                                    ),
                                                                rules: [],
                                                            }
                                                        )(
                                                            <ProInput
                                                                suffix={
                                                                    formData
                                                                        .currency
                                                                        ?.code
                                                                }
                                                                disabled={
                                                                    !getFieldValue(
                                                                        'price'
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </ProFormItem>
                                                </Col>
                                                <Col md={2} sm={4} xs={4}>
                                                    <ProFormItem label=" ">
                                                        <div
                                                            style={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            {index === 0 ? (
                                                                <PlusIcon
                                                                    color="#FF716A"
                                                                    style={{
                                                                        cursor:
                                                                            'pointer',
                                                                    }}
                                                                    onClick={
                                                                        handleProductItem
                                                                    }
                                                                />
                                                            ) : value?.isDeletable ===
                                                                false ? null : (
                                                                <MinusIcon
                                                                    color="#FF716A"
                                                                    className={
                                                                        styles.removeIcon
                                                                    }
                                                                    style={{
                                                                        cursor:
                                                                            'pointer',
                                                                        display:
                                                                            'none',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleAddExpenseClick(
                                                                            'remove',
                                                                            index,
                                                                            value.id
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </ProFormItem>
                                                </Col>
                                            </Row>
                                        ))
                                : pricesDataConcat?.map((value, index) => (
                                    <Row
                                        gutter={8}
                                        className={styles.productTypeRow}
                                    >
                                        <Col md={12} sm={24} xs={24}>
                                            <ProFormItem
                                                label="Satış qiymətindən endirim %"
                                                customStyle={styles.formItem}
                                                help={
                                                    getFieldError(
                                                        `prices[${index}].percentage`
                                                    )?.[0]
                                                }
                                                style={{ height: '80px' }}
                                            >
                                                {getFieldDecorator(
                                                    `prices[${index}].percentage`,
                                                    {
                                                        getValueFromEvent: event =>
                                                            handlePriceTypePercentageChange(
                                                                event,
                                                                index
                                                            ),
                                                        rules: [],
                                                    }
                                                )(
                                                    <ProInput
                                                        suffix="%"
                                                        disabled={
                                                            !getFieldValue(
                                                                'price'
                                                            )
                                                        }
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                        <Col md={10} sm={20} xs={20}>
                                            <ProFormItem
                                                label={`${value?.name} qiyməti`}
                                                customStyle={styles.formItem}
                                                help={
                                                    getFieldError(
                                                        `prices[${index}].amount`
                                                    )?.[0]
                                                }
                                                style={{ height: '80px' }}
                                            >
                                                {getFieldDecorator(
                                                    `prices[${index}].amount`,
                                                    {
                                                        getValueFromEvent: event =>
                                                            handlePriceTypeValueChange(
                                                                event,
                                                                index
                                                            ),
                                                        rules: [],
                                                    }
                                                )(
                                                    <ProInput
                                                        suffix={
                                                            formData.currency
                                                                ?.code
                                                        }
                                                        disabled={
                                                            !getFieldValue(
                                                                'price'
                                                            )
                                                        }
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                        <Col md={2} sm={4} xs={4}>
                                            <ProFormItem label=" ">
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    {index === 0 ? (
                                                        <PlusIcon
                                                            color="#FF716A"
                                                            style={{
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                            onClick={
                                                                handleProductItem
                                                            }
                                                        />
                                                    ) : value?.isDeletable ===
                                                        false ? null : (
                                                        <MinusIcon
                                                            color="#FF716A"
                                                            className={
                                                                styles.removeIcon
                                                            }
                                                            style={{
                                                                cursor:
                                                                    'pointer',
                                                                display:
                                                                    'none',
                                                            }}
                                                            onClick={() =>
                                                                handleAddExpenseClick(
                                                                    'remove',
                                                                    index,
                                                                    value.id
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </ProFormItem>
                                        </Col>
                                    </Row>
                                ))}
                        </Panel>
                    </Collapse>

                    <ProFormItem
                        label="Əlavə məlumat"
                        customStyle={styles.formItem}
                        help={getFieldError('description')?.[0]}
                        style={{ height: '100px' }}
                    >
                        {getFieldDecorator('description', {
                            rules: [minLengthRule, longTextMaxRule],
                        })(
                            <ProTextArea
                                minLength={3}
                                maxLength={120}
                                rows={4}
                            />
                        )}
                    </ProFormItem>
                </Col>
            </Row>
        </>
    );
};

const mapStateToProps = state => ({
    generatedBarcode: state.mehsulReducer.generatedBarcode,
    manufacturers: state.contactsReducer.manufacturers,
    barcodTypes: state.mehsulReducer.barcodTypes,
    freeBarcodTypes: state.mehsulReducer.freeBarcodTypes,
});
export default connect(
    mapStateToProps,
    {
        fetchBarcodTypes,
        generateBarcode,
        fetchFreeBarcodTypes,
        fetchFilteredCatalogs,
        fetchContacts,
        fetchMeasurements,
        fetchCurrencies,
    }
)(ProductInfo);
