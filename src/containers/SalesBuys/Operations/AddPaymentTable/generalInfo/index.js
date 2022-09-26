/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Spin, Tooltip } from 'antd';
import { Table } from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import {
    fetchContacts,
    fetchClients,
    fetchSuppliers,
} from 'store/actions/contacts-new';
import { fetchContracts } from 'store/actions/contracts';
import {
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import { fetchInvoiceListByContactId } from 'store/actions/contact';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
    roundToDown,
} from 'utils';
import {
    handleResetInvoiceFields,
    handleEditInvoice,
    setSelectedProducts,
    updateInvoiceCurrencyCode,
    fetchSalesProductsFromCatalog,
} from 'store/actions/sales-operation';
import { fetchStocks } from 'store/actions/stock';
import moment from 'moment';
import { Payment } from '../payment';
import styles from '../styles.module.scss';

import GeneralInformation from './generalFields';

const math = require('exact-math');
const roundTo = require('round-to');

const GeneralInfo = props => {
    const {
        // States
        edit,
        id,
        form,
        invoiceInfo,
        selectedProducts,
        invoiceCurrencyCode,
        endPrice,
        summaries,
        rate,
        summary_types,
        initialPayment,
        setInitialPayment,
        discount,
        initialPaymentTransactions,
        setChecked,
        checked,
        setInitialRemainingDebt,

        // Actions
        handleResetInvoiceFields,
        handleEditInvoice,

        // Loadings
        invoiceInfoLoading = false,

        // DATA
        contracts,
        mainCurrency,
        allProducts,

        // API
        fetchMainCurrency,
        updateInvoiceCurrencyCode,
        fetchUsers,
        fetchClients,
        fetchContracts,
        fetchCurrencies,
        fetchStocks,
        fetchSalesProductsFromCatalog,
        fetchInvoiceListByContactId,
        fetchSuppliers,
        fetchContacts,
        setDebtResult,
    } = props;

    const { setFieldsValue, getFieldValue } = form;

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 90,
            render: (_value, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Qiymət',
            dataIndex: 'invoicePrice',
            align: 'center',
            width: 150,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))}
          ${invoiceCurrencyCode}`,
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 80,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'quantity',
            width: 130,
            align: 'center',
            render: (value, { unitOfMeasurementName, isTotal }) =>
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
            title: 'Seriya nömrələri',
            dataIndex: 'serialNumbers',
            width: 130,
            align: 'center',
            render: (value, row) =>
                row.isTotal ? null : value?.length > 0 ? (
                    <div
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                        {value[0]}
                        <Tooltip
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {value.map(serialNumber => (
                                        <span>{serialNumber}</span>
                                    ))}
                                </div>
                            }
                        >
                            <span className={styles.serialNumberCount}>
                                {value.length}
                            </span>
                        </Tooltip>
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Toplam',
            dataIndex: 'total',
            width: 100,
            align: 'right',
            render: (_, row) =>
                `${handleProductPrice(row)} ${invoiceCurrencyCode}`,
        },
    ];

    // Handle product's total price
    const handleProductPrice = product => {
        const { invoiceQuantity, invoicePrice } = product;
        return formatNumberToLocale(
            defaultNumberFormat(
                math.mul(
                    Number(invoiceQuantity) || 0,
                    Number(invoicePrice) || 0
                )
            )
        );
    };
    const updateEditInvoice = selectedContract => {
        const {
            supplierId,
            agentId,
            salesmanId,
            operationDate,
            currencyId,
            contractId,
            invoiceProducts,
            currencyCode,
            amount,
            discountAmount,
            counterpartyId,
            stockId,
            clientId,
        } = invoiceInfo;
        const { content } = invoiceProducts;
        const selectedProducts = {};
        const selectedProductIds = content.map(({ productId }) => productId);
        const counterparty = supplierId || counterpartyId || clientId;

        fetchSalesProductsFromCatalog({
            label: 'fetchEditProductsFromCatalog',
            setState: false,
            stockId,
            filters: {
                invoiceId: id,
                product: selectedProductIds,
                datetime: operationDate,
                businessUnitIds: id
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
            },
            onSuccessCallback: ({ data: totalQuantities }) => {
                fetchInvoiceListByContactId(
                    counterparty,
                    ({ data: invoices }) => {
                        if (!edit) {
                            setInitialRemainingDebt(
                                Number(
                                    invoices.find(
                                        invoice => invoice.id === Number(id)
                                    )?.remainingInvoiceDebt || 0
                                ).toFixed(2)
                            );
                        }
                        content.forEach(
                            ({
                                productId,
                                productName,
                                quantity,
                                pricePerUnit,
                                isServiceType,
                                unitOfMeasurementName,
                                catalogId,
                                catalogName,
                                serialNumber,
                            }) => {
                                if (selectedProducts[productId]) {
                                    selectedProducts[productId] = {
                                        ...selectedProducts[productId],
                                        serialNumbers: serialNumber
                                            ? [
                                                  ...selectedProducts[productId]
                                                      .serialNumbers,
                                                  serialNumber,
                                              ]
                                            : undefined,
                                        invoiceQuantity: math.add(
                                            roundToDown(quantity),
                                            selectedProducts[productId]
                                                .invoiceQuantity
                                        ),
                                    };
                                } else {
                                    const productDetails = totalQuantities.find(
                                        product => product.id === productId
                                    );
                                    selectedProducts[productId] = {
                                        id: productId,
                                        name: productName,
                                        barcode: undefined,
                                        unitOfMeasurementName,
                                        quantity: Number(
                                            productDetails?.quantity || 0
                                        ),
                                        serialNumbers: serialNumber
                                            ? [serialNumber]
                                            : undefined,
                                        invoiceQuantity: roundToDown(quantity),
                                        invoicePrice: roundToDown(pricePerUnit),
                                        remainingDebt: invoices.find(
                                            invoice => invoice.id === Number(id)
                                        )?.remainingInvoiceDebt,
                                        catalog: {
                                            id: catalogId,
                                            name: catalogName,
                                            isWithoutSerialNumber: !serialNumber,
                                            isServiceType,
                                        },
                                    };
                                }
                            }
                        );

                        handleEditInvoice({
                            selectedProducts: Object.values(selectedProducts),
                            discount: {
                                percentage: roundTo(
                                    math.div(
                                        math.mul(
                                            Number(discountAmount) || 0,
                                            100
                                        ),
                                        amount
                                    ),
                                    4
                                ),
                                amount: discountAmount || undefined,
                            },
                            contractDetails: selectedContract
                                ? {
                                      isContractSelected: true,
                                      contractAmount: Number(
                                          selectedContract.amount
                                      ),
                                      contractBalance: Number(
                                          selectedContract.rest
                                      ),
                                      currencyCode,
                                  }
                                : {
                                      isContractSelected: false,
                                      contractAmount: undefined,
                                      contractBalance: undefined,
                                  },
                            invoiceCurrencyCode: currencyCode,
                            activePayments: [],
                            invoicePaymentDetails: {
                                accountBalance: [],
                            },
                        });
                    },
                    id
                );
            },
        });
        setFieldsValue({
            agent: agentId || undefined,
            dateTime: moment(operationDate, fullDateTimeWithSecond),
            client: clientId || supplierId,
            salesman: salesmanId,
            contract: contractId || undefined,
            currency: currencyId,
            stock: stockId,
        });
    };

    useEffect(() => {
        if (invoiceInfo) {
            const { contractId } = invoiceInfo;
            if (contractId && contracts.length > 0) {
                const selectedContract = contracts.find(
                    ({ id }) => id === contractId
                );
                updateEditInvoice(selectedContract);
            } else if (!contractId) {
                updateEditInvoice(undefined);
            }
        }
    }, [invoiceInfo, contracts]);

    useEffect(() => {
        fetchContacts();
        fetchSuppliers();
        fetchClients();
        fetchCurrencies({});
        fetchMainCurrency();
        return () => {
            handleResetInvoiceFields();
        };
    }, []);

    useEffect(() => {
        if (id) {
            if (invoiceInfo) {
                fetchUsers({
                    filters: {
                        businessUnitIds:
                            invoiceInfo?.businessUnitId === null
                                ? [0]
                                : [invoiceInfo?.businessUnitId],
                    },
                });
                fetchStocks({
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
                fetchContracts({
                    limit: 1000,
                    status: 1,
                    invoiceId: id,
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
            }
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchUsers({
                filters: { businessUnitIds: [cookies.get('_TKN_UNIT_')] },
            });
            fetchStocks({ businessUnitIds: [cookies.get('_TKN_UNIT_')] });
            fetchContracts({
                limit: 1000,
                status: 1,
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
        } else {
            fetchUsers({});
            fetchStocks();
            fetchContracts({ limit: 1000, status: 1 });
        }
    }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);

    useEffect(() => {
        setFieldsValue({
            currency: mainCurrency?.id,
            paymentCurrency: mainCurrency?.id,
        });
        updateInvoiceCurrencyCode(mainCurrency?.code);
    }, [mainCurrency]);

    return (
        <>
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    <Spin spinning={invoiceInfoLoading}>
                        <GeneralInformation
                            invoiceInfo={invoiceInfo}
                            form={form}
                        />
                        <div className={styles.Header}>
                            <span className={styles.newOperationTitle}>
                                Qaimə
                            </span>
                        </div>
                        <Table
                            className={styles.productTable}
                            columns={columns}
                            rowKey={row => row.id}
                            dataSource={selectedProducts}
                        />
                        <div className={styles.Footer}>
                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Toplam qiymət:
                                </span>
                                <span className={styles.subtitleStyle}>
                                    {formatNumberToLocale(
                                        defaultNumberFormat(
                                            selectedProducts.reduce(
                                                (
                                                    totalPrice,
                                                    {
                                                        invoiceQuantity,
                                                        invoicePrice,
                                                    }
                                                ) =>
                                                    math.add(
                                                        totalPrice,
                                                        math.mul(
                                                            Number(
                                                                invoiceQuantity
                                                            ) || 0,
                                                            Number(
                                                                invoicePrice
                                                            ) || 0
                                                        )
                                                    ),
                                                0
                                            )
                                        )
                                    )}
                                    {invoiceCurrencyCode}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span
                                    className={`${styles.label} ${styles.discountLabel}`}
                                >
                                    Endirim ({discount.percentage}%):
                                </span>
                                <div className={styles.inputGroup}>
                                    {discount.amount || 0}
                                </div>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Son qiymət:
                                </span>
                                <span className={styles.subtitleStyle}>
                                    {formatNumberToLocale(
                                        defaultNumberFormat(
                                            roundTo(
                                                math.sub(
                                                    Number(
                                                        selectedProducts.reduce(
                                                            (
                                                                totalPrice,
                                                                {
                                                                    invoiceQuantity,
                                                                    invoicePrice,
                                                                }
                                                            ) =>
                                                                math.add(
                                                                    totalPrice,
                                                                    math.mul(
                                                                        Number(
                                                                            invoiceQuantity
                                                                        ) || 0,
                                                                        Number(
                                                                            invoicePrice
                                                                        ) || 0
                                                                    )
                                                                ),
                                                            0
                                                        )
                                                    ) || 0,
                                                    Number(discount.amount || 0)
                                                ),
                                                4
                                            )
                                        )
                                    )}
                                    {invoiceCurrencyCode}
                                </span>
                            </div>
                        </div>
                    </Spin>
                </div>
            </div>
            {edit ? null : (
                <Payment
                    initialPaymentTransactions={initialPaymentTransactions}
                    setChecked={setChecked}
                    checked={checked}
                    form={form}
                    id={id}
                    invoiceInfo={invoiceInfo}
                    endPrice={endPrice}
                    selectedProducts={selectedProducts}
                    initialPayment={initialPayment}
                    setInitialPayment={setInitialPayment}
                    setDebtResult={setDebtResult}
                    edit={edit}
                />
            )}
        </>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    clients: state.contactsReducer.clients,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    endPrice: state.salesOperation.endPrice,
    contractDetails: state.salesOperation.contractDetails,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    products: state.salesOperation.productsByName,
    profile: state.profileReducer.profile, // used for operator id
    mainCurrency: state.kassaReducer.mainCurrency,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    allProducts: state.productReducer.products,
    discount: state.salesOperation.discount,
});

export default connect(
    mapStateToProps,
    {
        handleResetInvoiceFields,
        handleEditInvoice,
        // API
        fetchUsers,
        fetchContracts,
        fetchCurrencies,
        fetchClients,
        fetchStocks,
        updateInvoiceCurrencyCode,
        fetchMainCurrency,
        setSelectedProducts,
        fetchSalesProductsFromCatalog,
        fetchInvoiceListByContactId,
        fetchSuppliers,
        fetchContacts,
    }
)(GeneralInfo);
