import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Table, ProSelect } from 'components/Lib';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    re_paymentAmount,
    roundToDown,
} from 'utils';
import { Tooltip, Icon, message, Alert } from 'antd';
import {
    setExpenses,
    setExpenseError,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import math from 'exact-math';
import { FaInfoCircle } from 'react-icons/fa';
import { Price, Trash } from '../invoice';
import styles from '../styles.module.scss';

const ExpensesTable = props => {
    const {
        id,
        selectedExpenses,
        currencies,
        setExpenses,
        expenseCurrency,
        expenseCashboxType,
        expenseCashbox,
        invoice_expense_rate,
        invoiceCurrencyCode,
        operationsList,
        setFinanceDeleteVisible,
        setSelectedRow,
        financeDeleteLoading,
        allCashBoxNames,
        expenseRates,
        cashbox,
        setExpenseError,
        expenseError,
        setSelectedProducts,
        selectedProducts,
    } = props;

    const cashboxTypes = [
        {
            id: 1,
            name: 'cash',
            label: 'Nəğd',
        },
        {
            id: 2,
            name: 'bank',
            label: 'Bank',
        },
        {
            id: 3,
            name: 'cart',
            label: 'Kart',
        },
        {
            id: 4,
            name: 'other',
            label: 'Digər',
        },
    ];

    useEffect(() => {
        if (selectedExpenses) {
            const newExpenses = selectedExpenses.map(selectedExpenseItem => {
                if (
                    currencies?.some(
                        currency =>
                            currency.id === selectedExpenseItem.expense_currency
                    )
                ) {
                    return selectedExpenseItem;
                }
                return { ...selectedExpenseItem, expense_currency: undefined };
            });
            setExpenses({ newExpenses });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencies]);

    const handlePriceChange = (expenseItemId, newPrice, type) => {
        setSelectedProducts({
            newSelectedProducts: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                fromEdit: false,
            })),
        });
        const newExpenses = selectedExpenses.map(
            (selectedExpenseItem, index) => {
                if (index === expenseItemId) {
                    if (type === 'expense_amount') {
                        if (
                            (re_paymentAmount.test(newPrice) &&
                                Number(newPrice) < 10000000) ||
                            newPrice === ''
                        ) {
                            return {
                                ...selectedExpenseItem,
                                [type || 'expense_amount']: newPrice,
                            };
                        }
                    } else {
                        return {
                            ...selectedExpenseItem,
                            [type]: newPrice,
                            expense_cashbox:
                                type === 'expense_cashbox_type'
                                    ? undefined
                                    : type === 'expense_cashbox'
                                        ? newPrice
                                        : selectedExpenseItem?.expense_cashbox,
                        };
                    }
                }
                return selectedExpenseItem;
            }
        );

        setExpenses({ newExpenses });
    };

    const setFinanceDelete = value => {
        setSelectedProducts({
            newSelectedProducts: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                fromEdit: false,
            })),
        });
        setFinanceDeleteVisible(true);
        setSelectedRow(value);
    };
    const handleExpenseRemove = expenseId => {
        setSelectedProducts({
            newSelectedProducts: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                fromEdit: false,
            })),
        });
        const newExpenses = selectedExpenses.filter(
            ({ id }) => id !== expenseId
        );
        setExpenses({ newExpenses });
    };

    const getCashboxNames = expenseCashboxType =>
        allCashBoxNames.filter(
            ({ type }) => type === expenseCashboxType?.expense_cashbox_type
        );

    function addTotals(data, rates) {
        if (data?.length > 0) {
            const total = roundToDown(
                data.reduce(
                    (total, { expense_amount, expense_currency }) =>
                        math.add(
                            total,
                            Number(
                                math.mul(
                                    Number(
                                        rates[
                                            [
                                                ...new Set(
                                                    selectedExpenses.map(
                                                        ({
                                                            expense_currency,
                                                        }) =>
                                                            Number(
                                                                expense_currency
                                                            )
                                                    )
                                                ),
                                            ].indexOf(expense_currency)
                                        ]?.rate || 1
                                    ),
                                    Number(expense_amount || 0)
                                )
                            ) || 0
                        ),
                    0
                )
            );
            return [
                ...data,
                {
                    isTotal: true,
                    expense_amount: total,
                },
            ];
        }
        return [];
    }

    const getColumns = () => [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (_, row, index) => (row.isTotal ? null : index + 1),
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'expense_name',
            width: 120,
            align: 'left',
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Valyuta',
            dataIndex: 'expense_currency',
            width: 150,
            render: (val, row, index) =>
                row.isTotal ? null : (
                    <ProSelect
                        style={{ marginBottom: '0' }}
                        data={currencies}
                        value={val}
                        keys={['code']}
                        onChange={value =>
                            handlePriceChange(index, value, 'expense_currency')
                        }
                    />
                ),
        },
        {
            title: 'Hesab növü',
            dataIndex: 'expense_cashbox_type',
            width: 150,
            render: (val, row, index) =>
                row.isTotal ? null : (
                    <ProSelect
                        style={{ marginBottom: '0' }}
                        keys={['label']}
                        data={cashboxTypes}
                        value={val}
                        onChange={value =>
                            handlePriceChange(
                                index,
                                value,
                                'expense_cashbox_type'
                            )
                        }
                    />
                ),
        },
        {
            title: 'Hesab',
            dataIndex: 'expense_cashbox',
            width: 230,
            render: (val, row, index) =>
                row.isTotal ? null : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ProSelect
                            value={val}
                            style={{ marginBottom: '0', width: '150px' }}
                            data={getCashboxNames(row)}
                            onChange={value =>
                                handlePriceChange(
                                    index,
                                    value,
                                    'expense_cashbox'
                                )
                            }
                        />
                        {val ? (
                            <Tooltip
                                placement="right"
                                title={
                                    <div>
                                        Əməliyyat tarixi üzrə qalıq:
                                        {cashbox[val]?.length === 0
                                            ? '0.00'
                                            : cashbox[val]?.map(
                                                ({
                                                    balance,
                                                    currencyCode,
                                                    tenantCurrencyId,
                                                }) =>
                                                    tenantCurrencyId ? (
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    '5px',
                                                            }}
                                                        >
                                                            {formatNumberToLocale(
                                                                defaultNumberFormat(
                                                                    id
                                                                        ? math.add(
                                                                            Number(
                                                                                balance
                                                                            ),
                                                                            Number(
                                                                                selectedExpenses
                                                                                    .filter(
                                                                                        ({
                                                                                            editId,
                                                                                            expense_currency,
                                                                                        }) =>
                                                                                            editId &&
                                                                                            tenantCurrencyId ===
                                                                                            expense_currency
                                                                                    )
                                                                                    .reduce(
                                                                                        (
                                                                                            total,
                                                                                            {
                                                                                                default_expense_amount,
                                                                                            }
                                                                                        ) =>
                                                                                            total +
                                                                                            Number(
                                                                                                default_expense_amount
                                                                                            ),
                                                                                        0
                                                                                    )
                                                                            )
                                                                        )
                                                                        : balance ||
                                                                        0
                                                                )
                                                            )}
                                                            {currencyCode}
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )
                                            ) || '0.00'}
                                    </div>
                                }
                            >
                                <Icon
                                    component={FaInfoCircle}
                                    style={{
                                        fontSize: '18px',
                                        marginLeft: '10px',
                                    }}
                                ></Icon>
                            </Tooltip>
                        ) : (
                            <Icon
                                disabled={!val || (id && row.editId)}
                                component={FaInfoCircle}
                                style={{ fontSize: '18px', marginLeft: '10px' }}
                            ></Icon>
                        )}
                    </div>
                ),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'expense_amount',
            width: 150,
            align: 'center',
            render: (value, row, index) => {
                if (!row.isTotal) {
                    return (
                        <Price
                            importOperation
                            row={row}
                            value={value}
                            index={index}
                            handlePriceChange={handlePriceChange}
                            cashbox={cashbox}
                            selectedExpenses={selectedExpenses}
                            setExpenseError={setExpenseError}
                            expenseError={expenseError}
                        />
                    );
                }
            },
        },
        {
            title: `Məbləğ (${invoiceCurrencyCode})`,
            dataIndex: 'expense_amount',
            width: 150,
            align: 'right',
            render: (value, row) =>
                row?.isTotal
                    ? formatNumberToLocale(defaultNumberFormat(value))
                    : formatNumberToLocale(
                        defaultNumberFormat(
                            math.mul(
                                Number(
                                    expenseRates[
                                        [
                                            ...new Set(
                                                selectedExpenses
                                                    .filter(
                                                        ({
                                                            expense_currency,
                                                        }) =>
                                                            expense_currency !==
                                                            undefined
                                                    )
                                                    .map(
                                                        ({
                                                            expense_currency,
                                                        }) => expense_currency
                                                    )
                                            ),
                                        ].indexOf(row.expense_currency)
                                    ]?.rate || 1
                                ),
                                Number(value || 0)
                            ) || 0
                        )
                    ),
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 60,
            render: (value, { isTotal }) =>
                isTotal ? null : (
                    <Trash
                        value={value}
                        handleProductRemove={
                            id &&
                                operationsList.find(
                                    operation =>
                                        operation.transactionItemId === value
                                )
                                ? setFinanceDelete
                                : handleExpenseRemove
                        }
                    />
                ),
        },
    ];

    return (
        <div>
            <Table
                scroll={{ x: 'max-content', y: (addTotals(selectedExpenses, expenseRates).length >= 8 ? 500 : false) }}
                columns={getColumns(
                    expenseCashboxType,
                    expenseCurrency,
                    expenseCashbox,
                    currencies
                )}
                rowKey={row => row.id}
                dataSource={addTotals(selectedExpenses, expenseRates)}
                loading={financeDeleteLoading}
                className={styles.customTable}
            />
        </div>
    );
};

const mapStateToProps = state => ({
    employee: state.salesOperation.employee,
    expenseDirection: state.salesOperation.expenseDirection,
    currencies: state.kassaReducer.currencies,
    expenseCurrency: state.salesOperation.expenseCurrency,
    expenseCashbox: state.salesOperation.expenseCashbox,
    expenseCashboxType: state.salesOperation.expenseCashboxType,
    expenseCashboxBalance: state.salesOperation.expenseCashboxBalance,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    selectedProducts: state.salesOperation.selectedProducts,
    operationsList: state.financeOperationsReducer.operationsList,
    financeDeleteLoading: state.loadings.deleteFinanceOperations,
    expenseError: state.salesOperation.expenseError,
});

export default connect(
    mapStateToProps,
    {
        setExpenses,
        setExpenseError,
        setSelectedProducts,
    }
)(ExpensesTable);
