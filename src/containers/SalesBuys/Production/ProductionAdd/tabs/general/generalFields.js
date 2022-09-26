import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    ProDatePicker,
    ProFormItem,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';
import moment from 'moment';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond } from 'utils';
import { fetchUsers } from 'store/actions/users';
import { Checkbox, Col, Tooltip } from 'antd';
import { cookies } from 'utils/cookies';
import { updateContractDetails } from 'store/actions/sales-operation';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    fetchContacts,
} from 'store/actions/contact';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import ContactAdd from './ContactAdd';
import CashboxInfoButton from './CashboxInfoButton';
import styles from '../../styles.module.scss';

const GeneralInformation = ({
    form,
    order,
    currencies,
    contracts,
    productionInfo,
    allStocks,

    handleOrderCheckbox,
    contractDetails,
    updateContractDetails,
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    fetchContacts,
    fetchUsers,
    // Loadings
    usersLoading,
    clientsLoading,
    invoiceInfoLoading,
    currenciesLoading,
    contractsLoading,
    permissionsList,
    productionInfoLoading,
}) => {
    const {
        getFieldDecorator,
        getFieldError,
        setFieldsValue,
        getFieldValue,
    } = form;
    const {
        isContractSelected,
        contractAmount,
        contractBalance,
        currencyCode,
    } = contractDetails;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const [contactItem, setContactItem] = useState(false);
    const [endLess, setEndless] = useState(false);
    const [data, setData] = useState(undefined);
    const [clients, setClients] = useState([]);
    const [addedClient, setAddedClient] = useState([]);
    const [users, setUsers] = useState([]);

    const ajaxSalesmansSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: productionInfo
                ? productionInfo?.businessUnitId === null
                    ? [0]
                    : [productionInfo?.businessUnitId]
                : BUSINESS_TKN_UNIT
                ? [BUSINESS_TKN_UNIT]
                : [],
        };
        fetchUsers({
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
                    setUsers(appendList);
                } else {
                    setUsers(users.concat(appendList));
                }
            },
        });
    };

    const ajaxClientsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, categories: [1] };
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
                setClients(appendList);
            } else {
                setClients(clients.concat(appendList));
            }
        });
    };

    useEffect(() => {
        if (data) {
            const filters = { limit: 10, page: 1, ids: [data?.id] };
            fetchContacts(filters, data => {
                if (data.data) {
                    setAddedClient(data.data);
                }
            });
            setFieldsValue({
                client: data?.id,
            });
        }

        if (!productionInfo && !data) {
            setFieldsValue({
                client:
                    clients.length === 1
                        ? clients[0]?.id
                        : getFieldValue('client'),
            });
        }

        if (users.length === 1) {
            setFieldsValue({
                salesman: users[0]?.id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clients, users, data]);

    useEffect(() => {
        if (productionInfo) {
            ajaxSalesmansSelectRequest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productionInfo?.businessUnitId]);

    useEffect(() => {
        if (productionInfo?.endDate === null) {
            setEndless(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productionInfo?.endDate]);

    const handleContactItem = () => {
        setContactItem(true);
    };

    const handleEndlessCheckbox = checked => {
        if (checked) {
            setEndless(true);
            setFieldsValue({ dateTo: undefined });
        } else {
            setEndless(false);
        }
    };

    return (
        <>
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                setData={setData}
                ajaxClientsSelectRequest={ajaxClientsSelectRequest}
            />
            <span className={styles.newOperationTitle}>Ümumi məlumat</span>
            <div className={styles.fieldsContainer}>
                <div className={styles.field}>
                    <ProFormItem
                        label="Başlama tarixi"
                        help={getFieldError('dateFrom')?.[0]}
                    >
                        {getFieldDecorator('dateFrom', {
                            getValueFromEvent: date => {
                                if (getFieldValue('dateTo') < date) {
                                    setFieldsValue({ dateTo: undefined });
                                }
                                return date;
                            },
                            rules: [requiredRule],
                        })(
                            <ProDatePicker
                                size="large"
                                format={fullDateTimeWithSecond}
                                allowClear={false}
                                placeholder="Seçin"
                                disabledDate={d => {
                                    if (
                                        productionInfo &&
                                        productionInfo.stockToId !== null &&
                                        productionInfo.isUsedByAnotherInvoice
                                    ) {
                                        return (
                                            !d ||
                                            d.isAfter(
                                                moment(productionInfo.createdAt, fullDateTimeWithSecond)
                                            )
                                        );
                                    }
                                }}
                            />
                        )}
                    </ProFormItem>
                </div>
                <div
                    className={styles.field}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    <Checkbox
                        style={{
                            position: 'absolute',
                            right: '0px',
                            fontSize: '14px',
                        }}
                        onChange={event =>
                            handleEndlessCheckbox(event.target.checked)
                        }
                        disabled={invoiceInfoLoading || contractsLoading}
                        checked={endLess}
                    >
                        Müddətsiz
                    </Checkbox>
                    <ProFormItem
                        label="Bitmə tarixi"
                        help={getFieldError('dateTo')?.[0]}
                    >
                        {getFieldDecorator('dateTo', {
                            getValueFromEvent: date => date,
                            rules: !endLess ? [requiredRule] : [],
                        })(
                            <ProDatePicker
                                size="large"
                                format={fullDateTimeWithSecond}
                                allowClear={false}
                                disabled={
                                    !getFieldValue('dateFrom') ||
                                    (productionInfo &&
                                        productionInfo.stockToId !== null &&
                                        (productionInfo.hasAnyPayments ||
                                            productionInfo.hasAnyTaxPayments)) ||
                                    endLess
                                }
                                disabledDate={d => {
                                    if (
                                        productionInfo &&
                                        productionInfo.stockToId !== null
                                    ) {
                                        return (
                                            !d ||
                                            d.isBefore(
                                                moment(productionInfo.createdAt)
                                            )
                                        );
                                    }
                                    return (
                                        !d ||
                                        d.isBefore(
                                            moment(getFieldValue('dateFrom'))
                                        )
                                    );
                                }}
                                placeholder="Seçin"
                            />
                        )}
                    </ProFormItem>
                </div>
                <div className={styles.field}>
                    <ProFormItem
                        label="Valyuta"
                        help={getFieldError('currency')?.[0]}
                    >
                        {getFieldDecorator('currency', {
                            getValueFromEvent: currencyId => currencyId,
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                allowClear={false}
                                loading={currenciesLoading}
                                disabled
                                placeholder="Seçin"
                                data={currencies}
                                keys={['code']}
                            />
                        )}
                    </ProFormItem>
                </div>
                <Col className={styles.field} style={{ position: 'relative' }}>
                    {productionInfo &&
                    productionInfo.stockToId !== null ? null : (
                        <Tooltip title="Əlaqə əlavə et">
                            <PlusIcon
                                color="#FF716A"
                                className={styles.plusBtn}
                                onClick={handleContactItem}
                                disabled={order}
                                style={
                                    order
                                        ? {
                                              pointerEvents: 'none',
                                              fill: '#868686',
                                          }
                                        : {
                                              cursor: 'pointer',
                                          }
                                }
                            />
                        </Tooltip>
                    )}

                    <Checkbox
                        style={{
                            position: 'absolute',
                            right: '23px',
                            fontSize: '14px',
                        }}
                        onChange={event =>
                            handleOrderCheckbox(event.target.checked)
                        }
                        checked={order}
                        disabled={
                            productionInfo &&
                            productionInfo.stockToId !== null &&
                            (productionInfo.hasAnyPayments ||
                                productionInfo.hasAnyTaxPayments)
                        }
                    >
                        Daxili sifariş
                    </Checkbox>

                    {getFieldValue('client') &&
                        (permissionsList.transaction_recievables_report
                            .permission !== 0 &&
                        permissionsList.transaction_payables_report
                            .permission !== 0 ? (
                            <CashboxInfoButton
                                fetchInfo={callback =>
                                    fetchInvoiceListByContactId(
                                        getFieldValue('client'),
                                        callback
                                    )
                                }
                                fetchAdvance={callback =>
                                    fetchAdvancePaymentByContactId(
                                        getFieldValue('client'),
                                        {
                                            businessUnitIds: productionInfo
                                                ? productionInfo?.businessUnitId ===
                                                  null
                                                    ? [0]
                                                    : [
                                                          productionInfo?.businessUnitId,
                                                      ]
                                                : BUSINESS_TKN_UNIT
                                                ? [BUSINESS_TKN_UNIT]
                                                : [],
                                        },
                                        callback
                                    )
                                }
                            />
                        ) : null)}

                    <ProFormItem
                        label="Sifarişçi"
                        help={getFieldError('client')?.[0]}
                    >
                        {getFieldDecorator('client', {
                            getValueFromEvent: newCounterparty => {
                                setFieldsValue({ contract: undefined });
                                // updateContractDetails();
                                return newCounterparty;
                            },
                            rules: !order ? [requiredRule] : [],
                        })(
                            <ProAsyncSelect
                                allowClear={false}
                                selectRequest={ajaxClientsSelectRequest}
                                placeholder="Seçin"
                                data={
                                    productionInfo &&
                                    productionInfo?.clientId !== null
                                        ? [
                                              {
                                                  id: productionInfo?.clientId,
                                                  name:
                                                      productionInfo?.clientName,
                                              },
                                              ...addedClient,
                                              ...clients.filter(
                                                  client =>
                                                      client.id !==
                                                          productionInfo?.clientId &&
                                                      !addedClient
                                                          .map(({ id }) => id)
                                                          ?.includes(client.id)
                                              ),
                                          ]
                                        : [
                                              ...addedClient,
                                              ...clients.filter(
                                                  client =>
                                                      !addedClient
                                                          .map(({ id }) => id)
                                                          ?.includes(client.id)
                                              ),
                                          ]
                                }
                                disabled={
                                    contractsLoading ||
                                    productionInfoLoading ||
                                    order ||
                                    (productionInfo &&
                                        productionInfo.stockToId !== null &&
                                        (productionInfo.hasAnyPayments ||
                                            productionInfo.hasAnyTaxPayments))
                                }
                            />
                        )}
                    </ProFormItem>
                </Col>
                <div className={styles.field}>
                    <ProFormItem
                        label="Menecer"
                        help={getFieldError('salesman')?.[0]}
                    >
                        {getFieldDecorator('salesman', {
                            getValueFromEvent: category => category,
                            rules: [requiredRule],
                        })(
                            <ProAsyncSelect
                                allowClear={false}
                                keys={['name', 'lastName']}
                                // loading={usersLoading}
                                selectRequest={ajaxSalesmansSelectRequest}
                                data={
                                    productionInfo
                                        ? [
                                              {
                                                  id:
                                                      productionInfo?.salesmanId,
                                                  name:
                                                      productionInfo?.salesmanName,
                                                  lastName:
                                                      productionInfo?.salesmanLastName,
                                              },
                                              ...users.filter(
                                                  user =>
                                                      user.id !==
                                                      productionInfo?.salesmanId
                                              ),
                                          ]
                                        : users
                                }
                                placeholder="Seçin"
                                disabled={
                                    productionInfo &&
                                    productionInfo.stockToId !== null &&
                                    (productionInfo.hasAnyPayments ||
                                        productionInfo.hasAnyTaxPayments)
                                }
                            />
                        )}
                    </ProFormItem>
                </div>
                <div className={styles.field}>
                    <ProFormItem
                        label="Müqavilə"
                        help={getFieldError('contract')?.[0]}
                        helperText={
                            isContractSelected ? (
                                <span className={styles.contractBalance}>
                                    Müqavilə limiti: {}{' '}
                                    <strong style={{ color: '#55AB80' }}>
                                        {Number(contractAmount)
                                            ? `${Number(
                                                  contractBalance
                                              )} ${currencyCode}`
                                            : 'Limitsiz'}
                                    </strong>
                                </span>
                            ) : null
                        }
                    >
                        {getFieldDecorator('contract', {
                            getValueFromEvent: contractId => {
                                const selectedContract =
                                    contracts.find(
                                        contract => contract.id === contractId
                                    ) || {};
                                const {
                                    amount,
                                    rest,
                                    currencycode,
                                } = selectedContract;
                                if (contractId) {
                                    updateContractDetails({
                                        isContractSelected: contractId,
                                        contractAmount: Number(amount),
                                        contractBalance: Number(rest),
                                        currencyCode: currencycode,
                                    });
                                } else {
                                    updateContractDetails();
                                }

                                return contractId;
                            },
                            rules: [],
                        })(
                            <ProSelect
                                loading={contractsLoading}
                                disabled={
                                    contractsLoading ||
                                    !getFieldValue('client') ||
                                    !contracts.filter(
                                        contract =>
                                            contract.counterparty_id ===
                                            getFieldValue('client')
                                    ).length > 0 ||
                                    (productionInfo &&
                                        productionInfo.stockToId !== null &&
                                        productionInfo.isUsedByAnotherInvoice)
                                }
                                placeholder="Seçin"
                                data={contracts.filter(
                                    contract =>
                                        contract.counterparty_id ===
                                        getFieldValue('client')
                                )}
                                keys={['contract_no']}
                            />
                        )}
                    </ProFormItem>
                </div>
                <div className={styles.field}>
                    <ProFormItem
                        label="Materiallar anbarı"
                        help={getFieldError('productionMaterialsStock')?.[0]}
                    >
                        {getFieldDecorator('productionMaterialsStock', {
                            rules: [],
                        })(<ProSelect data={allStocks} />)}
                    </ProFormItem>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    clients: state.newContactsReducer.clients,
    users: state.usersReducer.users,
    contracts: state.contractsReducer.contracts,
    contractDetails: state.salesOperation.contractDetails,

    contractsLoading: state.loadings.fetchContracts,
    usersLoading: state.loadings.fetchUsers,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    currenciesLoading: state.loadings.fetchCurrencies,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    allStocks: state.stockReducer.stocks,
    productionInfoLoading: state.loadings.productionInfo,
});

export default connect(
    mapStateToProps,
    {
        updateContractDetails,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        fetchContacts,
        fetchUsers,
    }
)(GeneralInformation);
