/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
    ProInput,
    ProSelect,
    ProFormItem,
    ProAsyncSelect,
} from 'components/Lib';
import {
    setVat,
    setCounterparty,
    setVatCurrencyCode,
} from 'store/actions/sales-operation';
import { fetchContacts } from 'store/actions/contacts-new';
import { Checkbox, Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import math from 'exact-math';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    re_amount,
    re_percent,
} from 'utils';
import { requiredRule } from 'utils/rules';
import ContactAdd from './ContactAdd';
import styles from '../styles.module.scss';

const roundTo = require('round-to');

const Summary = props => {
    const {
        id,
        invoiceInfo,
        fetchContacts,
        form,
        selectedExpenses,
        selectedProducts,
        setVatCurrencyCode,
        vatCurrencyCode,
        currencies,
        invoiceCurrencyCode,
        setVat,
        setCounterparty,
        vat,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [useVat, setUseVat] = useState(false);
    const [data, setData] = useState(undefined);
    const [contactItem, setContactItem] = useState(false);
    const [clients, setClients] = useState([]);
    const [addedCounterparty, setAddedCounterparty] = useState([]);
    const [summaryData, setSummaryData] = useState({
        total: 0,
    });

    const { total } = summaryData;
    const mainCurrency = currencies.find(currency => currency.isMain);
    // const handleTaxPercentage = event => {
    //     const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    //     if (re.test(event.target.value) && event.target.value <= 100)
    //         return event.target.value;
    //     if (event.target.value === '') return null;
    //     return getFieldValue('taxPercentage');
    // };

    const handleAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('taxAmount');
    };

    const handleCounterpartyChange = newCounterpartyId => {
        const newCounterparty = clients.find(
            ({ id }) => newCounterpartyId === id
        );
        setCounterparty({ newCounterparty });
    };

    const handleVatChange = (value, type) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        // if (
        //     type === 'percentage' &&
        //     re_percent.test(value) &&
        //     Number(value) <= 100
        // ) {
        //     const AMOUNT = roundTo(
        //         math.div(math.mul(Number(value), Number(total || 0)), 100),
        //         2
        //     );
        //     setVat({
        //         newPercentage: value,
        //         newAmount: AMOUNT,
        //     });
        // }
        if (type === 'amount' && re.test(value)) {
            // const PERCENTAGE = roundTo(
            //     math.div(math.mul(Number(value), 100), Number(total || 1)),
            //     4
            // );
            setVat({
                // newPercentage: PERCENTAGE,
                newAmount: value,
            });
        }
        if (value === '') {
            setVat({
                //  newPercentage: null,
                newAmount: null,
            });
        }
    };

    const handleUseVat = event => {
        setUseVat(event.target.checked);
        if (!event.target.checked) {
            setVat({
                // newPercentage: null,
                newAmount: null,
            });
            setFieldsValue({
                expense_counterparty: undefined,
                taxCurrency: undefined,
                taxAmount: undefined,
                // taxPercentage: undefined,
            });
        } else {
            if (clients.length === 1) {
                setFieldsValue({
                    expense_counterparty: clients[0].id,
                });
            }

            setFieldsValue({
                taxCurrency: mainCurrency.id,
            });
            setVatCurrencyCode(mainCurrency.code);
        }
    };
    useEffect(() => {
        if (selectedProducts.length > 0) {
            const totalAmount = selectedProducts.reduce(
                (totalPrice, { invoiceQuantity, cost }) =>
                    math.add(
                        Number(totalPrice),
                        math.mul(
                            Number(cost || 0),
                            Number(invoiceQuantity || 0)
                        )
                    ),
                0
            );
            setSummaryData(() => ({
                total: totalAmount,
            }));
        }
    }, [selectedExpenses, selectedProducts]);

    useEffect(() => {
        if (!useVat && vat.amount) setUseVat(true);
    }, [total]);

    useEffect(() => {
        setFieldsValue({
            // taxPercentage: vat.percentage,
            taxAmount: vat.amount,
        });
    }, [vat]);
    // const ajaxContactsSelectRequest = (
    //     page = 1,
    //     limit = 20,
    //     search = '',
    //     stateReset = 0,
    //     onSuccessCallback
    // ) => {
    //     const filters = { limit, page, name: search, categories: [4] };
    //     fetchContacts(false, filters, data => {
    //         const appendList = [];

    //         if (data.data) {
    //             data.data.forEach(element => {
    //                 appendList.push({
    //                     id: element.id,
    //                     name: element.name,
    //                     ...element,
    //                 });
    //             });
    //         }
    //         if (onSuccessCallback !== undefined) {
    //             onSuccessCallback(!appendList.length);
    //         }
    //         if (stateReset) {
    //             setContacts(appendList);
    //         } else {
    //             setContacts(contacts.concat(appendList));
    //         }
    //     });
    // };

    useEffect(() => {}, []);

    const handleContactItem = () => {
        setContactItem(true);
    };
    const ajaxClientsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, categories: [4] };
        fetchContacts(false, filters, data => {
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
                setClients(appendList);
            } else {
                setClients(clients.concat(appendList));
            }
        });
    };

    useEffect(() => {
        if (data) {
            const filters = { limit: 10, page: 1, ids: [data?.id] };
            fetchContacts(false, filters, data => {
                if (data.data) {
                    setAddedCounterparty(data.data);
                }
            });
            setFieldsValue({
                client: clients[0]?.id,
            });
        }

        if (!id && !data) {
            setFieldsValue({
                client:
                    clients.length === 1
                        ? clients[0]?.id
                        : getFieldValue('client'),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clients]);

    return (
        <div className={styles.Footer}>
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                nameFields="clients"
                setData={setData}
                ajaxSupplierSelectRequest={() => {}}
                ajaxClientsSelectRequest={ajaxClientsSelectRequest}
            />
            <div className={styles.row}>
                <span className={styles.label}>
                    Toplam qiymət ({invoiceCurrencyCode}):
                </span>
                <span className={styles.subtitleStyle}>
                    {formatNumberToLocale(defaultNumberFormat(total))}{' '}
                    {invoiceCurrencyCode}
                </span>
            </div>

            <div className={styles.row} style={{ alignItems: 'flex-start' }}>
                <div>
                    <Checkbox
                        checked={useVat}
                        onChange={handleUseVat}
                        style={{ marginRight: '10px' }}
                    />
                    <span className={`${styles.label} ${styles.vatLabel}`}>
                        ƏDV:
                    </span>
                </div>
                <div className={styles.inputGroup}>
                    {/* <ProFormItem
                        style={{ marginBottom: 0 }}
                        help={getFieldError('taxPercentage')?.[0]}
                    >
                        {getFieldDecorator('taxPercentage', {
                            getValueFromEvent: event =>
                                handleTaxPercentage(event),
                            rules: useVat ? [requiredRule] : [],
                        })(
                            <ProInput
                                value={vat.percentage}
                                onChange={event =>
                                    handleVatChange(
                                        event.target.value,
                                        'percentage'
                                    )
                                }
                                disabled={!useVat}
                                className={styles.input}
                                size="middle"
                                suffix="%"
                            />
                        )}
                    </ProFormItem> */}
                    <ProFormItem
                        style={{ marginBottom: 0 }}
                        help={getFieldError('taxAmount')?.[0]}
                    >
                        {getFieldDecorator('taxAmount', {
                            getValueFromEvent: event => handleAmount(event),
                            rules: useVat ? [requiredRule] : [],
                        })(
                            <ProInput
                                value={vat.amount}
                                disabled={!useVat}
                                onChange={event =>
                                    handleVatChange(
                                        event.target.value,
                                        'amount'
                                    )
                                }
                                className={styles.input}
                                size="middle"
                                style={{ marginLeft: 10 }}
                                suffix={vatCurrencyCode}
                            />
                        )}
                    </ProFormItem>
                </div>
            </div>
            <div className={styles.row}>
                <span></span>
                <div className={styles.inputGroup}>
                    <div style={{ position: 'relative' }}>
                        {invoiceInfo?.invoiceType === 10 &&
                        invoiceInfo?.hasAnyTaxPayments ? null : (
                            <Tooltip title="Əlaqə əlavə et">
                                <PlusIcon
                                    color="#FF716A"
                                    className={styles.plusBtn}
                                    style={{ right: '15px' }}
                                    onClick={handleContactItem}
                                />
                            </Tooltip>
                        )}
                        <ProFormItem
                            label="Qarşı tərəf"
                            labelAlign="left"
                            help={getFieldError('expense_counterparty')?.[0]}
                        >
                            {getFieldDecorator('expense_counterparty', {
                                getValueFromEvent: counterparty => {
                                    handleCounterpartyChange(counterparty);
                                    return counterparty;
                                },
                                rules: useVat ? [requiredRule] : [],
                            })(
                                // <ProSelect
                                //     data={contacts}
                                //     placeholder="Seçin"
                                //     style={{ marginRight: '10px' }}
                                //     disabled={!useVat}
                                //     className={styles.input}
                                //     size="middle"
                                // />
                                <ProAsyncSelect
                                    disabled={
                                        !useVat ||
                                        (invoiceInfo?.invoiceType === 10 &&
                                            invoiceInfo?.hasAnyTaxPayments)
                                    }
                                    style={{ marginRight: '10px' }}
                                    className={styles.input}
                                    allowClear={false}
                                    size="middle"
                                    selectRequest={ajaxClientsSelectRequest}
                                    data={
                                        id && invoiceInfo
                                            ? [
                                                  {
                                                      id:
                                                          invoiceInfo?.counterpartyId,
                                                      name:
                                                          invoiceInfo?.counterpartyName,
                                                  },
                                                  ...addedCounterparty,
                                                  ...clients.filter(
                                                      contact =>
                                                          contact.id !==
                                                              invoiceInfo?.counterpartyId &&
                                                          !addedCounterparty
                                                              .map(
                                                                  ({ id }) => id
                                                              )
                                                              ?.includes(
                                                                  contact.id
                                                              )
                                                  ),
                                              ]
                                            : [
                                                  ...addedCounterparty,
                                                  ...clients.filter(
                                                      contact =>
                                                          !addedCounterparty
                                                              .map(
                                                                  ({ id }) => id
                                                              )
                                                              ?.includes(
                                                                  contact.id
                                                              )
                                                  ),
                                              ]
                                    }
                                />
                            )}
                        </ProFormItem>{' '}
                    </div>
                    <ProFormItem
                        label="Ədv valyutası"
                        help={getFieldError('taxCurrency')?.[0]}
                    >
                        {getFieldDecorator('taxCurrency', {
                            getValueFromEvent: currencyId => {
                                const selectedCurrency = currencies.find(
                                    ({ id }) => currencyId === id
                                );
                                if (selectedCurrency) {
                                    setVatCurrencyCode(selectedCurrency.code);
                                }
                                return currencyId;
                            },
                            rules: useVat ? [requiredRule] : [],
                        })(
                            <ProSelect
                                allowClear={false}
                                className={styles.input}
                                disabled={
                                    !useVat ||
                                    (invoiceInfo?.invoiceType === 10 &&
                                        invoiceInfo?.hasAnyTaxPayments)
                                }
                                size="middle"
                                data={currencies}
                                keys={['code']}
                            />
                        )}
                    </ProFormItem>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    expenseCurrency: state.salesOperation.expenseCurrency,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    selectedExpenses: state.salesOperation.selectedExpenses,
    selectedProducts: state.salesOperation.selectedProducts,
    vatCurrencyCode: state.salesOperation.vatCurrencyCode,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    vat: state.salesOperation.vat,
});

export default connect(
    mapStateToProps,
    {
        setVat,
        setVatCurrencyCode,
        setCounterparty,
        fetchContacts,
    }
)(Summary);
