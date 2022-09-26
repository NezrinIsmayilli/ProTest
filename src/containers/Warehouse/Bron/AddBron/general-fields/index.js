import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    ProSelect,
    ProFormItem,
    ProDatePicker,
    ProAsyncSelect,
} from 'components/Lib';
import {
    updateContractDetails,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import { cookies } from 'utils/cookies';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import { fetchContracts } from 'store/actions/contracts';
import { fetchUsers } from 'store/actions/users';
import { fetchStocks } from 'store/actions/stock';
import { fetchContacts } from 'store/actions/contact';
import { fetchOrders } from 'store/actions/orders';
import { Checkbox, Tooltip, Row, Col } from 'antd';
import { requiredRule } from 'utils/rules';
import moment from 'moment';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import ContractField from './contract';
import ContactAdd from './ContactAdd';
import CashboxInfoButton from './CashboxInfoButton';
import styles from '../styles.module.scss';

const GeneralFields = props => {
    const {
        form,
        updateContractDetails,
        setEndless,
        endLess,
        clients,
        clientsLoading,
        orderLoading,
        usersLoading,
        stocksLoading,
        setSelectedProducts,
        fetchStocks,
        fetchOrders,
        fetchUsers,
        fetchContacts,
        fetchContracts,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        permissionsList,
        invoiceInfo,
    } = props;
    const {
        getFieldError,
        getFieldDecorator,
        setFieldsValue,
        getFieldValue,
    } = form;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const [contactItem, setContactItem] = useState(false);

    const [data, setData] = useState(undefined);
    const [stocks, setStocks] = useState([]);
    const [defaultSelectedStock, setDefaultSelectedStock] = useState(undefined);
    const [salesman, setSalesman] = useState([]);
    const [defaultSelectedSalesman, setDefaultSelectedSalesman] = useState(
        undefined
    );
    const [loadClients, setClients] = useState([]);
    const [defaultSelectedClient, setDefaultSelectedClient] = useState(
        undefined
    );
    const [orders, setOrders] = useState([]);
    const [defaultSelectedOrder, setDefaultSelectedOrder] = useState(undefined);
    const ordersOptions = defaultSelectedOrder
        ? [
              ...defaultSelectedOrder,
              ...orders.filter(
                  item =>
                      !defaultSelectedOrder
                          .map(({ id }) => id)
                          ?.includes(item.id)
              ),
          ]
        : orders;

    useEffect(() => {
        if (invoiceInfo?.stockId) {
            fetchStocks({ ids: [invoiceInfo.stockId] }, data => {
                setDefaultSelectedStock(data.data);
            });
        }
        if (invoiceInfo?.salesmanId) {
            fetchUsers({
                filters: { ids: [invoiceInfo.salesmanId] },
                onSuccessCallback: data => {
                    setDefaultSelectedSalesman(data.data);
                },
            });
        }
        if (invoiceInfo?.clientId) {
            fetchContacts(
                { ids: [invoiceInfo.clientId], categories: [1] },
                data => {
                    setDefaultSelectedClient(data.data);
                }
            );
        }
        if (invoiceInfo?.orderId) {
            fetchOrders(
                { ids: [invoiceInfo.orderId], statusGroup: 1 },
                data => {
                    setDefaultSelectedOrder(data.data);
                }
            );
        }
    }, [invoiceInfo]);

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        if (data) {
            setFieldsValue({
                client: data ? clients[0]?.id : undefined,
            });
            ajaxClientSelectRequest(1, 20, '', 1);
        }
        if (!data) {
            if (loadClients.length === 1) {
                setFieldsValue({
                    client: loadClients[0].id,
                });
            }
            if (salesman.length === 1) {
                setFieldsValue({
                    salesman: salesman[0].id,
                });
            }
            if (stocks.length === 1) {
                setFieldsValue({
                    stockFrom: stocks[0].id,
                });
            }
        }
    }, [clients, salesman, stocks]);

    const handleContactItem = () => {
        setContactItem(true);
    };

    const handleEndlessCheckbox = checked => {
        if (checked) {
            setEndless(true);
            setFieldsValue({ endDate: undefined });
        } else {
            setEndless(false);
        }
    };

    const ajaxClientSelectRequest = (
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
                setClients(loadClients.concat(appendList));
            }
        });
    };

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
            businessUnitIds: BUSINESS_TKN_UNIT
                ? [BUSINESS_TKN_UNIT]
                : invoiceInfo
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : '',
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
                    setSalesman(appendList);
                } else {
                    setSalesman(salesman.concat(appendList));
                }
            },
        });
    };

    const ajaxOrdersSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            serialNumber: search,
            statusGroup: 1,
        };
        fetchOrders(defaultFilters, data => {
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
                setOrders(appendList);
            } else {
                setOrders(orders.concat(appendList));
            }
        });
    };

    const ajaxStocksSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            q: search,
            businessUnitIds: BUSINESS_TKN_UNIT
                ? [BUSINESS_TKN_UNIT]
                : invoiceInfo
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : '',
        };
        fetchStocks(defaultFilters, data => {
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
                setStocks(appendList);
            } else {
                setStocks(stocks.concat(appendList));
            }
        });
    };
    return (
        <>
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                setData={setData}
            />
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    <span className={styles.newOperationTitle}>
                        Ümumi məlumat
                    </span>
                    <div
                    // className={styles.fieldsContainer}
                    >
                        {/* <div className={styles.field}> */}
                        <Row gutter={16}>
                            <Col xl={6} md={12} sm={12} xs={24}>
                                <ProFormItem
                                    label="Başlama tarixi"
                                    help={getFieldError('startDate')?.[0]}
                                >
                                    {getFieldDecorator('startDate', {
                                        rules: [requiredRule],
                                    })(<ProDatePicker disabled />)}
                                </ProFormItem>
                            </Col>
                            {/* </div> */}
                            {/* <div
                            className={styles.field}
                            style={{ position: 'relative' }}
                        > */}
                            <Col xl={6} md={12} sm={12} xs={24}>
                                <Checkbox
                                    style={{
                                        position: 'absolute',
                                        right: '-8px',
                                        top: '5px',
                                        fontSize: '12px',
                                    }}
                                    onChange={event =>
                                        handleEndlessCheckbox(
                                            event.target.checked
                                        )
                                    }
                                    checked={endLess}
                                >
                                    Müddətsiz
                                </Checkbox>
                                <ProFormItem
                                    label="Bitmə tarixi"
                                    help={getFieldError('endDate')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('endDate', {
                                        rules: !endLess ? [requiredRule] : [],
                                    })(
                                        <ProDatePicker
                                            style={{ minWidth: '163px' }}
                                            showTime={{
                                                defaultValue: moment(
                                                    'HH:mm:ss'
                                                ),
                                            }}
                                            format="DD-MM-YYYY HH:mm:ss"
                                            disabled={endLess}
                                            disabledDate={date =>
                                                date.isBefore(
                                                    moment().subtract(1, 'day')
                                                )
                                            }
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                            {/* </div> */}
                            {/* <div
                            className={styles.field}
                            style={{ position: 'relative' }}
                        > */}
                            <Col xl={6} md={12} sm={12} xs={24}>
                                <Tooltip title="Əlaqə əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        className={styles.plusBtn}
                                        onClick={handleContactItem}
                                    />
                                </Tooltip>
                                <ProFormItem
                                    label="Qarşı tərəf"
                                    help={getFieldError('client')?.[0]}
                                >
                                    {getFieldDecorator('client', {
                                        getValueFromEvent: newCounterparty => {
                                            setFieldsValue({
                                                contract: undefined,
                                            });
                                            updateContractDetails();
                                            return newCounterparty;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProAsyncSelect
                                            allowClear={false}
                                            selectRequest={
                                                ajaxClientSelectRequest
                                            }
                                            data={
                                                defaultSelectedClient
                                                    ? [
                                                          ...defaultSelectedClient,
                                                          ...loadClients.filter(
                                                              item =>
                                                                  !defaultSelectedClient
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                    : loadClients
                                            }
                                            placeholder="Seçin"
                                        />
                                    )}
                                </ProFormItem>
                                {getFieldValue('client') &&
                                    (permissionsList
                                        .transaction_recievables_report
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
                                                        businessUnitIds: invoiceInfo
                                                            ? invoiceInfo?.businessUnitId ===
                                                              null
                                                                ? [0]
                                                                : [
                                                                      invoiceInfo?.businessUnitId,
                                                                  ]
                                                            : BUSINESS_TKN_UNIT
                                                            ? [
                                                                  BUSINESS_TKN_UNIT,
                                                              ]
                                                            : [],
                                                    },
                                                    callback
                                                )
                                            }
                                        />
                                    ) : null)}
                                {/* </div> */}
                            </Col>
                            <Col xl={6} md={12} sm={12} xs={24}>
                                {/* <div className={styles.field}> */}
                                <ProFormItem
                                    label="Satış meneceri"
                                    help={getFieldError('salesman')?.[0]}
                                >
                                    {getFieldDecorator('salesman', {
                                        getValueFromEvent: category => category,
                                        rules: [requiredRule],
                                    })(
                                        <ProAsyncSelect
                                            data={
                                                defaultSelectedSalesman
                                                    ? [
                                                          ...defaultSelectedSalesman,
                                                          ...salesman.filter(
                                                              item =>
                                                                  !defaultSelectedSalesman
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                    : salesman
                                            }
                                            selectRequest={
                                                ajaxSalesmansSelectRequest
                                            }
                                            keys={['name', 'lastName']}
                                            allowClear={false}
                                            placeholder="Seçin"
                                        />
                                    )}
                                </ProFormItem>
                                {/* </div> */}
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <ContractField
                                form={form}
                                invoiceInfo={invoiceInfo}
                            />
                            <Col xl={6} md={12} sm={12} xs={24}>
                                {/* <div className={styles.field}> */}
                                <ProFormItem
                                    label="Sifariş"
                                    help={getFieldError('order')?.[0]}
                                >
                                    {getFieldDecorator('order', {
                                        getValueFromEvent: order => order,
                                    })(
                                        <ProAsyncSelect
                                            selectRequest={
                                                ajaxOrdersSelectRequest
                                            }
                                            placeholder="Seçin"
                                            data={[
                                                ...ordersOptions.map(order => ({
                                                    ...order,
                                                    name:
                                                        order.direction === 1
                                                            ? `SFD${moment(
                                                                  order.createdAt.replace(
                                                                      /(\d\d)-(\d\d)-(\d{4})/,
                                                                      '$3'
                                                                  ),
                                                                  'YYYY'
                                                              ).format(
                                                                  'YYYY'
                                                              )}/${
                                                                  order.serialNumber
                                                              }`
                                                            : `SFX${moment(
                                                                  order.createdAt.replace(
                                                                      /(\d\d)-(\d\d)-(\d{4})/,
                                                                      '$3'
                                                                  ),
                                                                  'YYYY'
                                                              ).format(
                                                                  'YYYY'
                                                              )}/${
                                                                  order.serialNumber
                                                              }`,
                                                })),
                                            ]}
                                        />
                                    )}
                                </ProFormItem>
                                {/* </div> */}
                            </Col>
                            <Col xl={6} md={12} sm={12} xs={24}>
                                {/* <div className={styles.field}> */}
                                <ProFormItem
                                    customStyle={styles.expenseItem}
                                    label="Anbar"
                                    help={getFieldError('stockFrom')?.[0]}
                                >
                                    {getFieldDecorator('stockFrom', {
                                        getValueFromEvent: stockId => {
                                            setSelectedProducts({
                                                newSelectedProducts: [],
                                            });
                                            return stockId;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProAsyncSelect
                                            selectRequest={
                                                ajaxStocksSelectRequest
                                            }
                                            placeholder="Seçin"
                                            data={
                                                defaultSelectedStock
                                                    ? [
                                                          ...defaultSelectedStock,
                                                          ...stocks.filter(
                                                              item =>
                                                                  !defaultSelectedStock
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                    : stocks
                                            }
                                        />
                                    )}
                                </ProFormItem>
                                {/* </div> */}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
};
const mapStateToProps = state => ({
    usersLoading: state.loadings.fetchUsers,
    stocksLoading: state.loadings.fetchStocks,
    orderLoading: state.ordersReducer.isLoading,
    clientsLoading: state.loadings.fetchClients,
    clients: state.contactsReducer.clients,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProducts,
        updateContractDetails,
        fetchStocks,
        fetchOrders,
        fetchUsers,
        fetchContacts,
        fetchContracts,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
    }
)(GeneralFields);
