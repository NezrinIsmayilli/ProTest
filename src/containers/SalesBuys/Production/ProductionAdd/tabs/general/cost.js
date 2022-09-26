import React from 'react';
import { connect } from 'react-redux';
import { defaultNumberFormat, formatNumberToLocale, roundToDown } from 'utils';
import { Icon, Button, Tooltip } from 'antd';
import { setSelectedProducts } from 'store/actions/sales-operation';
import { Table } from 'components/Lib';
import math from 'exact-math';
import { PlannedPrice } from '../../invoice';
import styles from '../../styles.module.scss';

const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const FooterRow = ({ primary, quantity, color = '#7c7c7c' }) => (
    <div
        className={styles.opInvoiceContentFooter}
        style={{ color, justifyContent: 'flex-end' }}
    >
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong>{primary}</strong>
        <p style={{ margin: '0 35px 0 20px', fontWeight: '500' }}>{quantity}</p>
    </div>
);

const CostPaper = props => {
    const {
        selectedProducts,
        invoiceCurrencyCode,
        setSelectedProducts,
        summaries,
    } = props;
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
                    math.mul(
                        Number(cost || 0) || 0,
                        Number(invoiceQuantity || 1)
                    ) || 0
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
                                      Number(selectedProduct.cost) || 0,
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
    const setManual = e => {
        e.stopPropagation();
        const totalQuantity = selectedProducts.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(total_amount, Number(invoiceQuantity) || 0),
            0
        );
        const total = selectedProducts.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(
                    total_amount,
                    math.mul(
                        summaries.find(item => item.label === 'Cəmi').value > 0
                            ? math.div(
                                  Number(
                                      summaries.find(
                                          item => item.label === 'Cəmi'
                                      ).value
                                  ) || 0,
                                  Number(totalQuantity) || 1
                              )
                            : 0,
                        Number(invoiceQuantity || 1)
                    ) || 0
                ),
            0
        );
        const cost =
            summaries.find(item => item.label === 'Cəmi').value > 0
                ? roundToDown(
                      math.div(
                          Number(
                              summaries.find(item => item.label === 'Cəmi')
                                  .value
                          ) || 0,
                          Number(totalQuantity) || 1
                      )
                  )
                : 0;

        const cost_percentage =
            cost > 0
                ? math.div(math.mul(Number(cost), 100), Number(total) || 1)
                : 0;

        const newSelectedProducts = [...selectedProducts];
        const newSelectedProductsTwo = [...selectedProducts];

        const totalExpenseWithoutLastRow = newSelectedProducts
            .slice(0, -1)
            .reduce(
                (total_amount, { invoiceQuantity }) =>
                    math.add(
                        total_amount,
                        math.mul(Number(invoiceQuantity), cost) || 0
                    ),
                0
            );
        const costForLastRow = math.div(
            math.sub(
                Number(summaries.find(item => item.label === 'Cəmi').value),
                Number(totalExpenseWithoutLastRow)
            ),
            Number(newSelectedProducts.pop().invoiceQuantity || totalQuantity)
        );

        const notRoundedCost =
            summaries.find(item => item.label === 'Cəmi').value > 0
                ? new BigNumber(
                      new BigNumber(
                          summaries.find(item => item.label === 'Cəmi').value
                      ).minus(new BigNumber(totalExpenseWithoutLastRow))
                  ).dividedBy(
                      new BigNumber(
                          newSelectedProductsTwo.pop().invoiceQuantity ||
                              totalQuantity
                      )
                  )
                : 0;

        setSelectedProducts({
            newSelectedProducts: selectedProducts.map((product, index) => {
                if (index === selectedProducts.length - 1) {
                    return {
                        ...product,
                        cost_percentage: roundTo(Number(cost_percentage), 2),
                        cost:
                            costForLastRow === 0
                                ? 0
                                : roundTo(Number(costForLastRow || 0), 4),
                        total_price: Number(notRoundedCost),
                    };
                }
                return {
                    ...product,
                    cost_percentage: roundTo(Number(cost_percentage), 2),
                    cost: cost === 0 ? 0 : roundTo(Number(cost || 0), 4),
                    total_price: Number(cost),
                };
            }),
        });
    };
    const getColumns = () => [
        {
            title: '№',
            dataIndex: 'id',
            width: 60,
            render: (_value, _row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 120,
            align: 'left',
            ellipsis: true,
            render: value => value,
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            width: 100,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || 0,
        },
        {
            title: 'Vahidə düşən xərc bölgüsü, %',
            dataIndex: 'cost_percentage',
            width: 120,
            align: 'center',
            render: value =>
                `${formatNumberToLocale(defaultNumberFormat(value || 0))} %`,
        },
        {
            title: 'Vahidin faktiki maya dəyəri',
            dataIndex: 'cost',
            width: 150,
            align: 'center',
            render: (value, row) => (
                <PlannedPrice
                    row={row}
                    value={value}
                    handlePriceChange={handleCostChange}
                />
            ),
        },
        {
            title: 'Toplam',
            dataIndex: 'total_price',
            align: 'right',
            width: 120,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        new BigNumber(value || 0).multipliedBy(
                            new BigNumber(row.invoiceQuantity || 0)
                        )
                    )
                )} ${invoiceCurrencyCode}`,
        },
    ];

    return (
        <div className={styles.parentBox}>
            <div className={styles.paper}>
                <div
                    style={{
                        display: 'flex',
                        marginBottom: '20px',
                        alignItems: 'center',
                    }}
                >
                    <span className={styles.newOperationTitle}>
                        Maya dəyərinin hesablanması
                    </span>
                    <Tooltip title="Avtomatik hesabla">
                        <Button
                            onClick={setManual}
                            type="link"
                            className={styles.editButton}
                        >
                            <Icon type="reload" />
                        </Button>
                    </Tooltip>
                </div>
                <Table
                    columns={getColumns()}
                    rowKey={row => row.id}
                    dataSource={selectedProducts}
                />{' '}
                <FooterRow
                    primary="Toplam:"
                    quantity={`${formatNumberToLocale(
                        defaultNumberFormat(
                            selectedProducts.reduce(
                                (total, { total_price, invoiceQuantity }) =>
                                    (
                                        new BigNumber(
                                            total_price || 0
                                        ).multipliedBy(
                                            new BigNumber(invoiceQuantity || 0)
                                        ) || 0
                                    ).plus(new BigNumber(total)),
                                0
                            )
                        )
                    )} ${invoiceCurrencyCode} `}
                />
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    productQuantitiesLoading: state.loadings.fetchEditProductsFromCatalog,
    priceTypesLoading: state.loadings.fetchSalesPrices,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    activePayments: state.salesOperation.activePayments,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
});
export const Cost = connect(
    mapStateToProps,
    { setSelectedProducts }
)(CostPaper);
