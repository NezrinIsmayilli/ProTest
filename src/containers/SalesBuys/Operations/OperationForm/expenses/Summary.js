/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import math from 'exact-math';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import { setSelectedProducts } from 'store/actions/sales-operation';
import styles from '../styles.module.scss';

const BigNumber = require('bignumber.js');

const Summary = props => {
    const {
        selectedExpenses,
        expenseCurrency,
        invoice_expense_rate,
        selectedProducts,
        invoiceCurrencyCode,
        setSelectedProducts,
        selectedImportProducts,
        rates,
        expenseRates,
    } = props;
    const [summaryData, setSummaryData] = useState({
        expense_amount: 0,
        expense_amounts: 0,
        expense_amount_in_percentage: 0,
        invoice_amount: 0,
        total: 0,
    });

    const {
        expense_amounts,
        expense_amount,
        expense_amount_in_percentage,
        invoice_amount,
        total,
    } = summaryData;

    useEffect(() => {
        let expense_amount = 0;
        let expense_amounts = 0;
        let expense_amount_in_percentage = 0;
        let invoice_amount = 0;

        expense_amount = selectedExpenses.reduce(
            (total_amount, { expense_amount, expense_currency }) =>
                math.add(
                    total_amount,
                    math.mul(
                        Number(expense_amount) || 0,
                        Number(
                            expenseRates[
                                [
                                    ...new Set(
                                        selectedExpenses.map(
                                            ({ expense_currency }) =>
                                                Number(expense_currency)
                                        )
                                    ),
                                ].indexOf(expense_currency)
                            ]?.rate || 1
                        )
                    )
                ),
            0
        );

        expense_amounts = selectedImportProducts?.reduce(
            (total, { usedPrice, currencyId }) =>
                math.add(
                    total,
                    Number(
                        math.mul(
                            Number(
                                rates[
                                    [
                                        ...new Set(
                                            selectedImportProducts.map(item =>
                                                Number(item.currencyId)
                                            )
                                        ),
                                    ].indexOf(currencyId)
                                ]?.rate || 1
                            ),
                            Number(usedPrice || 0)
                        )
                    ) || 0
                ),
            0
        );
        if (selectedProducts.length > 0) {
            invoice_amount = selectedProducts.reduce(
                (totalPrice, { invoiceQuantity, invoicePrice }) =>
                    math.add(
                        totalPrice,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(invoicePrice) || 0
                        )
                    ),
                0
            );

            expense_amount_in_percentage = math.div(
                math.mul(
                    math.add(Number(expense_amount), Number(expense_amounts)),
                    100
                ),
                Number(invoice_amount) || 1
            );
        }

        setSummaryData(prevData => ({
            ...prevData,
            expense_amounts,
            expense_amount,
            expense_amount_in_percentage,
            invoice_amount,
            total: math.add(
                Number(expense_amount),
                Number(invoice_amount),
                Number(expense_amounts)
            ),
        }));
    }, [
        selectedExpenses,
        selectedImportProducts,
        selectedProducts,
        expenseCurrency,
        invoice_expense_rate,
        rates,
        expenseRates,
    ]);

    useEffect(() => {
        if (selectedProducts.length > 0) {
            const total_expense_amount = selectedExpenses.reduce(
                (total_amount, { expense_amount, expense_currency }) =>
                    math.add(
                        total_amount,
                        math.mul(
                            Number(expense_amount) || 0,
                            Number(
                                expenseRates[
                                    [
                                        ...new Set(
                                            selectedExpenses.map(
                                                ({ expense_currency }) =>
                                                    Number(expense_currency)
                                            )
                                        ),
                                    ].indexOf(expense_currency)
                                ]?.rate || 1
                            )
                        )
                    ),
                0
            );

            const total_expenses_amount = selectedImportProducts?.reduce(
                (total, { usedPrice, currencyId }) =>
                    math.add(
                        total,
                        Number(
                            math.mul(
                                Number(
                                    rates[
                                        [
                                            ...new Set(
                                                selectedImportProducts.map(
                                                    ({ currencyId }) =>
                                                        Number(currencyId)
                                                )
                                            ),
                                        ].indexOf(currencyId)
                                    ]?.rate || 1
                                ),
                                Number(usedPrice || 0)
                            )
                        ) || 0
                    ),
                0
            );

            const invoice_amount = selectedProducts.reduce(
                (totalPrice, { invoiceQuantity, invoicePrice }) =>
                    math.add(
                        totalPrice,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(invoicePrice) || 0
                        )
                    ),
                0
            );

            const expense_amount_in_percentage = math.div(
                math.mul(
                    math.add(
                        Number(total_expense_amount),
                        Number(total_expenses_amount)
                    ),
                    100
                ),
                Number(invoice_amount) || 1
            );

            setSelectedProducts({
                newSelectedProducts: selectedProducts.map(selectedProduct => {
                    const expense_amount = new BigNumber(
                        new BigNumber(
                            selectedProduct.invoicePrice || 0
                        ).multipliedBy(expense_amount_in_percentage || 0)
                    ).dividedBy(100);
                    const default_expense_amount = Number(
                        new BigNumber(selectedProduct.cost || 0).minus(
                            new BigNumber(selectedProduct.invoicePrice || 0)
                        )
                    );
                    if (selectedProduct.fromEdit) {
                        return {
                            ...selectedProduct,
                            expense_amount_in_percentage: (
                                math.div(
                                    math.mul(default_expense_amount, 100),
                                    Number(selectedProduct.invoicePrice) || 1
                                ) || 0
                            ).toFixed(4),
                            expense_amount: default_expense_amount,
                        };
                    }
                    return {
                        ...selectedProduct,
                        expense_amount_in_percentage: roundToDown(
                            expense_amount_in_percentage
                        ),
                        expense_amount: roundToDown(expense_amount),
                        fromEdit: false,
                        cost: roundToDown(
                            math.add(
                                Number(expense_amount) || 0,
                                Number(selectedProduct.invoicePrice) || 0
                            )
                        ),
                    };
                }),
            });
        }
    }, [selectedExpenses, selectedImportProducts, rates, expenseRates]);

    return (
        <div className={styles.Footer}>
            <div className={styles.row}>
                <span className={styles.label}>
                    Əlavə xərclərin cəmi ({invoiceCurrencyCode}):
                </span>
                <span className={styles.subtitleStyle}>
                    {formatNumberToLocale(
                        defaultNumberFormat(
                            math.add(expense_amount, expense_amounts)
                        )
                    )}{' '}
                    {invoiceCurrencyCode}
                </span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Əlavə xərclərin cəmi (%):</span>
                <span className={styles.subtitleStyle}>
                    {formatNumberToLocale(
                        defaultNumberFormat(expense_amount_in_percentage)
                    )}{' '}
                    %
                </span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>
                    Qaimə məbləği ({invoiceCurrencyCode}):
                </span>
                <span className={styles.subtitleStyle}>
                    {formatNumberToLocale(defaultNumberFormat(invoice_amount))}{' '}
                    {invoiceCurrencyCode}
                </span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Toplam:</span>
                <span className={styles.subtitleStyle}>
                    {formatNumberToLocale(defaultNumberFormat(total))}{' '}
                    {invoiceCurrencyCode}
                </span>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    expenseCurrency: state.salesOperation.expenseCurrency,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    selectedExpenses: state.salesOperation.selectedExpenses,
    selectedImportProducts: state.salesOperation.selectedImportProducts,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProducts,
    }
)(Summary);
