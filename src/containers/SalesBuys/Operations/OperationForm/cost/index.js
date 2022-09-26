import React from 'react';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { Icon, Button, Tooltip } from 'antd';
import { fetchExpenseCatalogs } from 'store/actions/expenseItem';
import { setSelectedProducts } from 'store/actions/sales-operation';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import { fetchContracts } from 'store/actions/contracts';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { connect } from 'react-redux';
import { roundToDown } from 'utils';
import styles from '../styles.module.scss';
import { ActionButtons } from '../invoice';
import CostTable from './CostTable';
import Summary from './Summary';

const math = require('exact-math');

const Cost = props => {
    const {
        id,
        invoiceInfo,
        form,
        invoiceType,
        type,
        isDraft,
        handleNewInvoice,
        handleDraftInvoice,
        selectedExpenses,
        selectedProducts,
        setSelectedProducts,
        invoice_expense_rate,
        loading,
        selectedImportProducts,
        rates,
        expenseRates,
    } = props;

    const setManual = e => {
        e.stopPropagation();
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

        // const total_expense_amount = selectedExpenses.reduce(
        //     (total_amount, { expense_amount }) =>
        //         math.add(
        //             total_amount,
        //             math.mul(
        //                 Number(expense_amount) || 0,
        //                 Number(invoice_expense_rate)
        //             )
        //         ),
        //     0
        // );

        const expense_amount_in_percentage = math.div(
            math.mul(
                Number(
                    math.add(
                        Number(total_expense_amount),
                        Number(total_expenses_amount)
                    )
                ),
                100
            ),
            Number(invoice_amount) || 1
        );

        const selectedProductsWithCost = selectedProducts.map(
            selectedProduct => {
                const expense_amount = math.div(
                    math.mul(
                        Number(selectedProduct.invoicePrice) || 0,
                        Number(expense_amount_in_percentage) || 0
                    ),
                    100
                );
                return {
                    ...selectedProduct,
                    expense_amount_in_percentage: roundToDown(
                        expense_amount_in_percentage
                    ),
                    expense_amount: roundToDown(expense_amount),
                    cost: roundToDown(
                        math.add(
                            Number(expense_amount) || 0,
                            Number(selectedProduct.invoicePrice) || 0
                        )
                    ),
                };
            }
        );

        setSelectedProducts({ newSelectedProducts: selectedProductsWithCost });
    };

    return (
        <div className={styles.parentBox}>
            <div className={styles.paper}>
                <div
                    className={styles.Header}
                    style={{ justifyContent: 'flex-start' }}
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
                <CostTable form={form} />
                <Summary form={form} id={id} invoiceInfo={invoiceInfo} />
                <ActionButtons
                    form={form}
                    invoiceType={invoiceType}
                    type={type}
                    isDraft={isDraft}
                    handleNewInvoice={handleNewInvoice}
                    handleDraftInvoice={handleDraftInvoice}
                    loading={loading}
                />
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    workers: state.workersReducer.workers,
    workersLoading: state.loadings.fetchWorkers,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    tenant: state.tenantReducer.tenant,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    selectedProducts: state.salesOperation.selectedProducts,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    selectedImportProducts: state.salesOperation.selectedImportProducts,

    // Loadings
    balanceLoading: state.loadings.accountBalance,
    tenantBalanceLoading: state.loadings.tenantBalance,
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        fetchExpenseCatalogs,
        fetchContracts,
        fetchAllCashboxNames,
        fetchAccountBalance,
        fetchCurrencies,
        setSelectedProducts,
    }
)(Cost);
