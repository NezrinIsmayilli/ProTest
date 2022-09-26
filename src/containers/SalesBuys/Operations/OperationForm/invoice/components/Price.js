import React from 'react';
import { ProInput } from 'components/Lib';
import styles from '../../styles.module.scss';

const PriceComponent = props => {
    const {
        value,
        row,
        index = null,
        handlePriceChange,
        importOperation = false,
        cashbox,
        selectedExpenses,
    } = props;
    const { id } = row;

    const onChange = event => {
        handlePriceChange(
            index === 0 ? 0 : index || id,
            event.target.value,
            'expense_amount'
        );
    };

    return (
        <ProInput
            size="default"
            value={value}
            onChange={onChange}
            className={`${
                (Number(value || 0) > 0 &&
                    (importOperation &&
                        selectedExpenses
                            ?.filter(
                                ({
                                    expense_amount,
                                    expense_currency,
                                    expense_cashbox,
                                }) =>
                                    expense_amount &&
                                    expense_currency ===
                                        row?.expense_currency &&
                                    expense_cashbox === row?.expense_cashbox
                            )
                            .reduce(
                                (total, { expense_amount }) =>
                                    total + Number(expense_amount),
                                0
                            ) <=
                            Number(
                                row?.editId
                                    ? Number(
                                          cashbox[(row?.expense_cashbox)]?.find(
                                              ({ tenantCurrencyId }) =>
                                                  tenantCurrencyId ===
                                                  row.expense_currency
                                          )?.balance
                                      ) + Number(row?.default_expense_amount)
                                    : cashbox[(row?.expense_cashbox)]?.find(
                                          ({ tenantCurrencyId }) =>
                                              tenantCurrencyId ===
                                              row.expense_currency
                                      )?.balance || 0
                            ))) ||
                (Number(value || 0) > 0 && !importOperation)
                    ? {}
                    : styles.inputError
            } ${styles.tableInput}`}
        />
    );
};

export const Price = PriceComponent;
