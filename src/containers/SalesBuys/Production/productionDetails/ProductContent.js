import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { Tooltip } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import {
    handleResetInvoiceFields,
    fetchProductionProductOrder,
    createProductionProductOrder,
} from 'store/actions/sales-operation';
import axios from 'axios';
import moment from 'moment';
import { ProStage, Table } from 'components/Lib';
import { fetchStockStatics } from 'store/actions/stock';
import styles from './styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

function ProductContent({
    row,
    handleResetInvoiceFields,
    productContents,
    materialInvoices,
    productionProductOrder,
    stocks,
    orders,
    fetchSalesInvoiceInfo,
    fetchStockStatics,
    fetchProductionProductOrder,
    isLoading,
}) {
    const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
    const [remainingCount, setRemainingCount] = useState(undefined);
    const [isLast, setIsLast] = useState(false);
    const [allDataMerged, setAllDataMerged] = useState(false);
    const [selectedOrdersWithProduct, setSelectedOrdersWithProduct] = useState(
        []
    );

    useEffect(() => {
        if (row?.id) {
            fetchStockStatics({
                filters: {
                    limit: 10000,
                    invoiceTypes: [1, 3, 5, 7, 10, 11],
                    stocks: undefined,
                    businessUnitIds:
                        row?.businessUnitId === null
                            ? [0]
                            : [row?.businessUnitId],
                },
            });
        } else {
            fetchStockStatics({
                filters: {
                    limit: 10000,
                    invoiceTypes: [1, 3, 5, 7, 10, 11],
                    stocks: undefined,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row]);

    useEffect(() => {
        if (productContents && productContents.length > 0) {
            fetchProductionProductOrder({
                filters: {
                    invoiceProducts: [
                        ...[].concat(
                            ...productContents.map(item =>
                                item.productContent.map(
                                    ({ selectedProductId }) => selectedProductId
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
                                                      value.productMaterialId
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
                                            direction: value.orderDirection,
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productContents]);

    useEffect(() => {
        let tmp = {};
        if (materialInvoices?.length > 0) {
            Promise.all(
                materialInvoices.map(async (item, indexMaterial) => {
                    try {
                        const { data } = await axios.get(
                            `/sales/invoices/invoice/${item.id}`
                        );
                        if (
                            data.data.invoiceProducts &&
                            data.data.invoiceProducts.content
                        )
                            data.data.invoiceProducts.content.forEach(
                                (value, index) => {
                                    if (tmp[value.productId]) {
                                        tmp = {
                                            ...tmp,
                                            [value.productId]: {
                                                ...tmp[value.productId],
                                                quantity: math.add(
                                                    tmp[value.productId]
                                                        .quantity || 0,
                                                    Number(value.quantity) || 0
                                                ),
                                            },
                                        };
                                    } else {
                                        tmp[value.productId] = {
                                            id: index + 1,
                                            invoiceProductId:
                                                value.invoiceProductId,
                                            materialId: item.id,
                                            product: value.productId,
                                            productName: value.productName,
                                            catalogName: value.catalogName,
                                            quantity: roundTo(
                                                Number(value.quantity),
                                                2
                                            ),
                                            pricePerUnit: roundTo(
                                                Number(value.pricePerUnit),
                                                2
                                            ),
                                            unitsOfMeasurementName:
                                                value.unitOfMeasurementName,
                                        };
                                    }
                                }
                            );
                    } catch (error) {}
                })
            ).then(results => {
                setMergedInvoiceContent(Object.values(tmp));
                setAllDataMerged(Object.values(tmp));
            });
        }
    }, [materialInvoices]);

    useEffect(() => {
        if (mergedInvoiceContent.length > 0) {
            const newRemainingCount = mergedInvoiceContent.map(
                (item, index) => {
                    if (mergedInvoiceContent.length - 1 === index) {
                        setIsLast(true);
                    }
                    return {
                        product: item.product,
                        quantity: item.quantity,
                        info: {
                            name: item.productName,
                            unitOfMeasurement: {
                                name: item.unitsOfMeasurementName,
                            },
                        },
                    };
                }
            );
            setRemainingCount(newRemainingCount);
        }
    }, [mergedInvoiceContent]);

    const remainingRef = React.useRef([]);
    const moreThanEnought = React.useRef([]);
    const getUsedCount = data => {
        if (remainingRef.current !== undefined && allDataMerged && isLast) {
            remainingRef.current = remainingCount;
            return data.map((product, index) => {
                if (
                    product &&
                    product.productContent &&
                    product.productContent.length
                ) {
                    const productContent = product.productContent.map(item => {
                        const materialProduct = remainingRef.current?.find(
                            count => count.product === item.product.id
                        );
                        if (materialProduct) {
                            let itemQuantity = 0;
                            if (
                                product.invoiceQuantity &&
                                Number(product.invoiceQuantity) > 1
                            ) {
                                itemQuantity =
                                    Number(item.quantity) *
                                    Number(product.invoiceQuantity);
                            } else {
                                itemQuantity = Number(item.quantity);
                            }
                            if (
                                Number(materialProduct?.quantity) >=
                                itemQuantity
                            ) {
                                const sub = remainingRef.current.map(
                                    quantity => {
                                        if (
                                            quantity.product === item.product.id
                                        ) {
                                            const sum =
                                                Number(quantity.quantity) -
                                                itemQuantity;
                                            return {
                                                ...quantity,
                                                quantity: sum,
                                                info: item.product,
                                            };
                                        }
                                        return quantity;
                                    }
                                );
                                remainingRef.current = sub;
                                return { ...item, usedCount: itemQuantity };
                            }
                            if (
                                Number(materialProduct?.quantity) < itemQuantity
                            ) {
                                const sub = remainingRef.current.map(
                                    quantity => {
                                        if (
                                            quantity.product === item.product.id
                                        ) {
                                            return {
                                                ...quantity,
                                                quantity: 0,
                                                info: item.product,
                                            };
                                        }
                                        return quantity;
                                    }
                                );
                                remainingRef.current = sub;
                                return {
                                    ...item,
                                    usedCount: Number(
                                        materialProduct?.quantity
                                    ),
                                };
                            }
                        }
                        return { ...item, usedCount: 0 };
                    });

                    if (data.length === index + 1) {
                        const moreThan = remainingRef.current.filter(
                            itm => Number(itm.quantity) > 0
                        );

                        if (moreThan) {
                            moreThanEnought.current = [
                                {
                                    barcode: undefined,
                                    catalog: null,
                                    cost: 0,
                                    cost_percentage: 0,
                                    id: 0,
                                    invoicePrice: 0,
                                    invoiceProductId: 0,
                                    invoiceQuantity: 0,
                                    name: 'Tərkibdən kənar materiallar',
                                    plannedCost: 0,
                                    plannedPrice: 0,
                                    productContent: [...moreThan],
                                    quantity: 0,
                                    serialNumbers: undefined,
                                    unitOfMeasurementName: undefined,
                                },
                            ];
                        }
                    }

                    return { ...product, productContent };
                }

                return product;
            });
        }
        return data;
    };
    const columnsForMoreThan = [
        {
            title: '№',
            width: 70,
            render: (val, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'info',
            width: 200,
            render: val => val?.name,
        },
        {
            title: 'Ölçü vahidi',
            dataIndex: 'info',
            align: 'center',
            width: 100,
            render: val => val?.unitOfMeasurement?.name,
        },
        {
            title: 'Say',
            dataIndex: 'quantity',
            width: 140,
            align: 'center',
            render: value => value,
        },
    ];
    const columns = [
        {
            title: '№',
            width: 70,
            render: (val, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'product',
            width: 200,
            render: (val, row) => val?.name,
        },
        {
            title: 'Ölçü vahidi',
            dataIndex: 'product',
            align: 'center',
            width: 100,
            render: (val, row) => val?.unitOfMeasurement?.name,
        },
        {
            title: 'Tərkibi, say',
            dataIndex: 'quantity',
            align: 'center',
            width: 120,
            render: (value, row) => {
                if (row.selectedProductId) {
                    return formatNumberToLocale(
                        defaultNumberFormat(
                            math.mul(
                                Number(
                                    productContents.find(
                                        ({ invoiceProductId }) =>
                                            row.selectedProductId ===
                                            invoiceProductId
                                    ).invoiceQuantity
                                ) || 0,
                                Number(value) || 0
                            )
                        )
                    );
                }
                return formatNumberToLocale(
                    defaultNumberFormat(
                        math.mul(
                            Number(
                                productContents.find(
                                    ({ id }) => row.idForFind === id
                                ).invoiceQuantity
                            ) || 0,
                            Number(value) || 0
                        )
                    )
                );
            },
        },
        {
            title: 'Sərf olunan, say',
            dataIndex: 'usedCount',
            width: 140,
            align: 'center',
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value || 0)),
        },
        {
            title: 'Fərq, say',
            dataIndex: 'product',
            align: 'center',
            width: 120,
            render: (value, row) =>
                formatNumberToLocale(
                    defaultNumberFormat(
                        math.sub(
                            Number(
                                math.mul(
                                    Number(
                                        productContents?.find(
                                            ({ invoiceProductId }) =>
                                                row.selectedProductId ===
                                                invoiceProductId
                                        ).invoiceQuantity || 0
                                    ),
                                    Number(row.quantity || 0)
                                )
                            ),
                            Number(row.usedCount || 0)
                        )
                    )
                ),
        },
        {
            title: 'Anbar, say',
            dataIndex: 'product',
            width: 120,
            align: 'center',
            render: value =>
                formatNumberToLocale(
                    defaultNumberFormat(
                        stocks
                            ?.filter(item => item.product_id === value.id)
                            .reduce(
                                (total, current) =>
                                    math.add(
                                        Number(total),
                                        Number(current.quantity)
                                    ),
                                0
                            )
                    )
                ),
        },
        {
            title: 'Status',
            dataIndex: 'product',
            width: 150,
            align: 'center',
            render: (value, row) => {
                const stockQuantity = stocks
                    ?.filter(item => item.product_id === value.id)
                    .reduce(
                        (total, current) =>
                            math.add(Number(total), Number(current.quantity)),
                        0
                    );
                const subQuantity = math.sub(
                    Number(
                        math.mul(
                            Number(
                                productContents?.find(
                                    ({ invoiceProductId }) =>
                                        row.selectedProductId ===
                                        invoiceProductId
                                ).invoiceQuantity || 0
                            ),
                            Number(row.quantity || 0)
                        )
                    ),
                    Number(row.usedCount || 0)
                );
                const product = selectedOrdersWithProduct?.filter(
                    item => item.productId === row.id
                );
                const orderProduct = orders?.filter(order =>
                    product[0]?.orders?.map(({ id }) => id)?.includes(order?.id)
                );
                return (
                    <ProStage
                        disabled
                        visualStage={
                            orderProduct.length > 0
                                ? { id: 1, name: 'delivery' }
                                : stockQuantity !== 0 &&
                                  stockQuantity >= subQuantity
                                ? { id: 2, name: 'going' }
                                : { id: 3, name: 'new' }
                        }
                        statuses={[
                            {
                                id: 1,
                                label: 'Sifariş olunub',
                                color: '#2980b9',
                            },
                            {
                                id: 2,
                                label: 'Anbarda var',
                                color: '#f39c12',
                            },
                            {
                                id: 3,
                                label: 'Anbarda yoxdur',
                                color: '#3b4557',
                            },
                        ]}
                    />
                );
            },
        },
        {
            title: 'Sifariş',
            dataIndex: 'id',
            width: 150,
            align: 'center',
            render: (value, row) => {
                const product = selectedOrdersWithProduct?.filter(
                    item => item.productId === value
                );
                const orderProduct = orders?.filter(order =>
                    product[0]?.orders?.map(({ id }) => id)?.includes(order?.id)
                );
                return orderProduct && orderProduct.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {orderProduct.map(item => (
                                        <span>
                                            SFX
                                            {moment(
                                                item.createdAt.replace(
                                                    /(\d\d)-(\d\d)-(\d{4})/,
                                                    '$3'
                                                ),
                                                'YYYY'
                                            ).format('YYYY')}
                                            /{item.serialNumber}
                                        </span>
                                    ))}
                                </div>
                            }
                            placement="right"
                        >
                            <span className={styles.rowNumbers}>
                                {`SFX${moment(
                                    orderProduct[0].createdAt.replace(
                                        /(\d\d)-(\d\d)-(\d{4})/,
                                        '$3'
                                    ),
                                    'YYYY'
                                ).format('YYYY')}/${
                                    orderProduct[0].serialNumber
                                }`}
                            </span>
                        </Tooltip>
                        {orderProduct.length > 1 ? (
                            <Tooltip placement="right">
                                <span className={styles.serialNumberCount}>
                                    {orderProduct.length}
                                </span>
                            </Tooltip>
                        ) : null}
                    </div>
                ) : (
                    '-'
                );
            },
        },
    ];

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 6px',
                width: '100%',
                height: '900px',
                overflow: 'scroll',
            }}
        >
            {getUsedCount(productContents)?.map((content, index) => (
                <div style={{ marginBottom: '20px' }}>
                    <div
                        style={{
                            fontWeight: 'bold',
                            fontSize: '22px',
                        }}
                    >
                        {`${content?.name} (${roundTo(
                            Number(content?.invoiceQuantity),
                            2
                        )} ${content?.unitOfMeasurementName})`}
                    </div>

                    <Table
                        scroll={{ x: 'max-content', y: 500 }}
                        dataSource={content?.productContent}
                        loading={isLoading}
                        columns={columns}
                        pagination={false}
                        rowKey={record => record.id}
                    />
                </div>
            ))}
            {moreThanEnought.current &&
            moreThanEnought.current.length > 0 &&
            moreThanEnought.current[0].productContent.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                    <div
                        style={{
                            fontWeight: 'bold',
                            fontSize: '22px',
                        }}
                    >
                        {moreThanEnought.current[0].name}
                    </div>
                    <Table
                        scroll={{ x: 'max-content', y: 500 }}
                        dataSource={moreThanEnought.current[0].productContent}
                        columns={columnsForMoreThan}
                        pagination={false}
                        rowKey={121212}
                    />
                </div>
            ) : null}
        </div>
    );
}

const mapStateToProps = state => ({
    materialInvoices: state.salesOperation.materialList,
    productionProductOrder: state.salesOperation.productionProductOrder,
    stocks: state.stockReducer.stocksStatics,
    isLoading: state.ordersReducer.isLoading,
});
export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceInfo,
        fetchProductionProductOrder,
        handleResetInvoiceFields,
        fetchStockStatics,
        createProductionProductOrder,
    }
)(ProductContent);
