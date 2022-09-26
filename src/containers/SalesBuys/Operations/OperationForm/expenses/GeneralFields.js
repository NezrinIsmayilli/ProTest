import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ProFormItem, ProSelect, ProAsyncSelect } from 'components/Lib';
import { Spin } from 'antd';
import { cookies } from 'utils/cookies';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
} from 'utils';
import {
    setEmployee,
    setExpenseDirection,
    setExpenseCurrency,
    setExpenseCashboxType,
    setExpenseCashbox,
    setInvoiceExpenseRate,
} from 'store/actions/sales-operation';
import { convertCurrency } from 'store/actions/settings/kassa';
import { requiredRule } from 'utils/rules';
import styles from '../styles.module.scss';

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

const GeneralFields = props => {
    const {
        form,
        id,
        tenant,
        workers,
        contracts,
        currencies,
        allCashBoxNames,
        fetchFilteredWorkers,
        expenseCashboxType,
        fetchAccountBalance,
        setEmployee,
        setExpenseDirection,
        setExpenseCurrency,
        setExpenseCashboxType,
        setExpenseCashbox,
        invoiceInfo,
        financeInfo,
        selectedExpenses,
    } = props;
    const {
        getFieldError,
        setFieldsValue,
        getFieldDecorator,
        getFieldValue,
    } = form;

    const mainCurrency = currencies.find(currency => currency.isMain);
    const [worker, setWorker] = useState([]);

    useEffect(() => {
        if (getFieldValue('expenseCashbox')) {
            const newExpenseCashbox = allCashBoxNames.find(
                ({ id }) => getFieldValue('expenseCashbox') === id
            );
            if (newExpenseCashbox) {
                fetchAccountBalance({
                    id: getFieldValue('expenseCashbox'),
                    filters: {
                        dateTime: getFieldValue('date')?.format(
                            fullDateTimeWithSecond
                        ),
                    },
                    callBack: data => {
                        setExpenseCashbox({
                            newExpenseCashbox,
                            newExpenseCashboxBalance:
                                data?.data.length > 0
                                    ? data.data
                                    : [{ balance: 0 }],
                        });
                    },
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('date')]);
    // useEffect(() => {
    //     if (worker.length === 1) {
    //         setFieldsValue({
    //             employee: worker[0].id,
    //         });
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [worker]);

    useEffect(() => {
        if (mainCurrency && !id) {
            setFieldsValue({
                expenseCurrency: mainCurrency.id,
            });
            setExpenseCurrency({ newExpenseCurrency: mainCurrency || {} });
        }

        if (getCashboxNames(expenseCashboxType).length === 1) {
            setFieldsValue({
                expenseCashbox: getCashboxNames(expenseCashboxType)[0].id,
            });
            handlePaymentAccountChange(
                getCashboxNames(expenseCashboxType)[0].id
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenseCashboxType, mainCurrency]);

    const handleEmployeeChange = employeeId => {
        const newEmployee = worker.find(({ id }) => employeeId === id);
        if (newEmployee) {
            setEmployee({ newEmployee });
        }
    };

    const handleExpenseDirectionChange = contractId => {
        const newContract = contracts.find(({ id }) => contractId === id);
        if (newContract) {
            setExpenseDirection({ newExpenseDirection: newContract });
        }
    };

    const handleExpenseCurrencyChange = currencyId => {
        const expenseCurrency = currencies.find(({ id }) => currencyId === id);
        setExpenseCurrency({ newExpenseCurrency: expenseCurrency || {} });
    };

    const handlePaymentAccountChange = accountId => {
        const newExpenseCashbox = allCashBoxNames.find(
            ({ id }) => accountId === id
        );
        if (newExpenseCashbox) {
            fetchAccountBalance({
                id: accountId,
                filters: {
                    dateTime: getFieldValue('date')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: data => {
                    setExpenseCashbox({
                        newExpenseCashbox,
                        newExpenseCashboxBalance:
                            data?.data.length > 0
                                ? data.data
                                : [{ balance: 0 }],
                    });
                },
            });
        }
    };

    const handleCashboxTypeChange = cashboxType => {
        const newExpenseCashboxType = cashboxType
            ? cashboxTypes.find(({ id }) => cashboxType === id)
            : {};
        setExpenseCashboxType({ newExpenseCashboxType });
        setFieldsValue({
            expenseCashbox: undefined,
        });
    };

    const getCashboxNames = expenseCashboxType =>
        allCashBoxNames.filter(({ type }) => type === expenseCashboxType.id);

    const getAccountBalance = (
        accountBalance,
        invoiceCashboxBalanceLoading = false
    ) => {
        if (invoiceCashboxBalanceLoading) {
            return <Spin spinning size="small" />;
        }
        if (accountBalance.length > 0) {
            return (
                <span style={{ color: '#55AB80' }}>
                    Əməliyyat tarixi üzrə qalıq:{' '}
                    {getBalanceString(accountBalance)}
                </span>
            );
        }
        return '';
    };

    const contractsArr = contracts.map(contract => ({
        ...contract,
        name: `${contract.counterparty_name} - ${contract.contract_no}`,
    }));

    const getBalanceString = balance => {
        const amounts = balance.map(
            value =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value.balance)
                )} ${value.currencyCode || ''}`
        );
        return amounts.join(', ');
    };

    const ajaxWorkerSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            lastEmployeeActivityType: 1,
            businessUnitIds:
                id && invoiceInfo
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
            'filters[search]': search,
        };
        fetchFilteredWorkers({
            filters: defaultFilters,
            onSuccessCallback: data => {
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
                    setWorker(appendList);
                } else {
                    setWorker(worker.concat(appendList));
                }
            },
        });
    };
    return (
        <>
            <h2>Ümumi məlumat</h2>
            <div className={styles.fieldsContainer}>
                <div className={styles.field}>
                    <ProFormItem
                        label="Əməkdaş"
                        help={getFieldError('employee')?.[0]}
                    >
                        {getFieldDecorator('employee', {
                            getValueFromEvent: employeeId => {
                                handleEmployeeChange(employeeId);
                                return employeeId;
                            },
                            rules:
                                selectedExpenses.length > 0
                                    ? [requiredRule]
                                    : [],
                        })(
                            // <ProSelect
                            //     keys={['name', 'surname', 'patronymic']}
                            //     data={workers}
                            // />
                            <ProAsyncSelect
                                data={
                                    id && financeInfo.length > 0
                                        ? [
                                              {
                                                  id:
                                                      financeInfo[0]
                                                          ?.employeeId,
                                                  name:
                                                      financeInfo[0]
                                                          ?.contactOrEmployee,
                                              },
                                              ...worker.filter(
                                                  contact =>
                                                      contact.id !==
                                                      financeInfo[0]?.employeeId
                                              ),
                                          ]
                                        : worker
                                }
                                selectRequest={ajaxWorkerSelectRequest}
                                keys={['name', 'surname', 'patronymic']}
                            />
                        )}
                    </ProFormItem>
                </div>
                <div className={styles.field}>
                    <ProFormItem
                        label="Xərc mərkəzi"
                        help={getFieldError('expense_direction')?.[0]}
                    >
                        {getFieldDecorator('expense_direction', {
                            rules:
                                selectedExpenses.length > 0
                                    ? [requiredRule]
                                    : [],
                            initialValue: 0,
                        })(
                            <ProSelect
                                disabled
                                data={[{ ...tenant, id: 0 }, ...contractsArr]}
                                keys={['name']}
                            />
                        )}
                    </ProFormItem>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    // workers: state.workersReducer.workers,
    workersLoading: state.loadings.fetchWorkers,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    tenant: state.tenantReducer.tenant,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    expenseCashboxBalance: state.salesOperation.expenseCashboxBalance,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    expenseCashboxType: state.salesOperation.expenseCashboxType,
    selectedExpenses: state.salesOperation.selectedExpenses,
    // Loadings
    balanceLoading: state.loadings.accountBalance,
    tenantBalanceLoading: state.loadings.tenantBalance,
});

export default connect(
    mapStateToProps,
    {
        setEmployee,
        setExpenseDirection,
        setExpenseCurrency,
        setExpenseCashboxType,
        setExpenseCashbox,
        setInvoiceExpenseRate,
        fetchAccountBalance,
        convertCurrency,
        fetchFilteredWorkers,
    }
)(GeneralFields);
