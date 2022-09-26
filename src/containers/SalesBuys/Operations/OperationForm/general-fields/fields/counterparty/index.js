import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProFormItem, ProAsyncSelect } from 'components/Lib';
import { Tooltip } from 'antd';
import {
    updateContractDetails,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import { cookies } from 'utils/cookies';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    fetchContacts,
} from 'store/actions/contact';
import { requiredRule } from 'utils/rules';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { useParams } from 'react-router-dom';
import ContactAdd from './ContactAdd';
import CashboxInfoButton from './CashboxInfoButton';
import styles from '../../../styles.module.scss';

const CounterpartyField = props => {
    const {
        counterpartyLabel,
        field,
        form,
        disabled,
        invoiceInfo,
        // States
        // clients,
        // suppliers,
        // Loadings
        clientsLoading,
        updateContractDetails,
        setSelectedProducts,
        suppliersLoading,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        permissionsList,
        fetchContacts,
    } = props;
    const { label, name, from } = field;
    const {
        setFieldsValue,
        getFieldError,
        getFieldDecorator,
        getFieldValue,
    } = form;

    const [contactItem, setContactItem] = useState(false);
    const [data, setData] = useState(undefined);
    const { id } = useParams();
    const handleContactItem = () => {
        setContactItem(true);
    };

    const [suppliers, setSuppliers] = useState([]);
    const [clients, setClients] = useState([]);
    const [addedCounterparty, setAddedCounterparty] = useState([]);

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
    const ajaxSupplierSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, categories: [4] };
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
                setSuppliers(appendList);
            } else {
                setSuppliers(suppliers.concat(appendList));
            }
        });
    };

    useEffect(() => {
        if (data) {
            const filters = { limit: 10, page: 1, ids: [data?.id] };
            fetchContacts(filters, data => {
                if (data.data) {
                    setAddedCounterparty(data.data);
                }
            });
            if (name === 'supplier') {
                setFieldsValue({
                    supplier: suppliers[0]?.id,
                });
            } else {
                setFieldsValue({
                    client: clients[0]?.id,
                });
            }
        }

        if (!id && !data) {
            if (name === 'supplier') {
                setFieldsValue({
                    supplier:
                        suppliers.length === 1
                            ? suppliers[0]?.id
                            : getFieldValue('supplier'),
                });
            } else {
                setFieldsValue({
                    client:
                        clients.length === 1
                            ? clients[0]?.id
                            : getFieldValue('client'),
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suppliers, clients]);
    return (
        <>
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                nameFields={name}
                suppliers={suppliers}
                setData={setData}
                ajaxSupplierSelectRequest={ajaxSupplierSelectRequest}
                ajaxClientsSelectRequest={ajaxClientsSelectRequest}
            />
            <div className={styles.field} style={{ position: 'relative' }}>
                {counterpartyLabel ||
                disabled ||
                ((invoiceInfo?.invoiceType === 2 &&
                    invoiceInfo?.hasAnyRelatedOperation) ||
                    ((invoiceInfo?.invoiceType === 1 ||
                        invoiceInfo?.invoiceType === 10) &&
                        (invoiceInfo?.isRelatedToCredit ||
                            invoiceInfo?.hasAnyPayments ||
                            invoiceInfo?.hasAnyTaxPayments))) ? null : (
                    <Tooltip title="Əlaqə əlavə et">
                        <PlusIcon
                            color="#FF716A"
                            className={styles.plusBtn}
                            onClick={handleContactItem}
                        />
                    </Tooltip>
                )}
                {getFieldValue(name === 'supplier' ? 'supplier' : 'client') &&
                    (permissionsList.transaction_recievables_report
                        .permission !== 0 &&
                    permissionsList.transaction_payables_report.permission !==
                        0 ? (
                        <CashboxInfoButton
                            fetchInfo={callback =>
                                fetchInvoiceListByContactId(
                                    getFieldValue(
                                        name === 'supplier'
                                            ? 'supplier'
                                            : 'client'
                                    ),
                                    callback
                                )
                            }
                            fetchAdvance={callback =>
                                fetchAdvancePaymentByContactId(
                                    getFieldValue(
                                        name === 'supplier'
                                            ? 'supplier'
                                            : 'client'
                                    ),
                                    {
                                        businessUnitIds: invoiceInfo
                                            ? invoiceInfo?.businessUnitId ===
                                              null
                                                ? [0]
                                                : [invoiceInfo?.businessUnitId]
                                            : cookies.get('_TKN_UNIT_')
                                            ? [cookies.get('_TKN_UNIT_')]
                                            : [],
                                    },
                                    callback
                                )
                            }
                        />
                    ) : null)}
                <ProFormItem
                    label={label}
                    help={
                        getFieldError(
                            name === 'supplier' ? 'supplier' : 'client'
                        )?.[0]
                    }
                >
                    {getFieldDecorator(
                        name === 'supplier' ? 'supplier' : 'client',
                        {
                            getValueFromEvent: newCounterparty => {
                                if (from === 'return') {
                                    setSelectedProducts({
                                        newSelectedProducts: [],
                                    });
                                }
                                setFieldsValue({ contract: undefined });
                                updateContractDetails();
                                return newCounterparty;
                            },
                            rules: [requiredRule],
                        }
                    )(
                        <ProAsyncSelect
                            allowClear={false}
                            selectRequest={
                                name === 'supplier'
                                    ? ajaxSupplierSelectRequest
                                    : ajaxClientsSelectRequest
                            }
                            data={
                                name === 'supplier'
                                    ? id && invoiceInfo
                                        ? [
                                              {
                                                  id: invoiceInfo?.supplierId,
                                                  name:
                                                      invoiceInfo?.supplierName,
                                              },
                                              ...addedCounterparty,
                                              ...suppliers.filter(
                                                  supplier =>
                                                      supplier.id !==
                                                          invoiceInfo?.supplierId &&
                                                      !addedCounterparty
                                                          .map(({ id }) => id)
                                                          ?.includes(
                                                              supplier.id
                                                          )
                                              ),
                                          ]
                                        : [
                                              ...addedCounterparty,
                                              ...suppliers.filter(
                                                  supplier =>
                                                      !addedCounterparty
                                                          .map(({ id }) => id)
                                                          ?.includes(
                                                              supplier.id
                                                          )
                                              ),
                                          ]
                                    : id && invoiceInfo
                                    ? [
                                          {
                                              id: invoiceInfo?.clientId,
                                              name: invoiceInfo?.clientName,
                                          },
                                          ...addedCounterparty,
                                          ...clients.filter(
                                              client =>
                                                  client.id !==
                                                      invoiceInfo?.clientId &&
                                                  !addedCounterparty
                                                      .map(({ id }) => id)
                                                      ?.includes(client.id)
                                          ),
                                      ]
                                    : [
                                          ...addedCounterparty,
                                          ...clients.filter(
                                              client =>
                                                  !addedCounterparty
                                                      .map(({ id }) => id)
                                                      ?.includes(client.id)
                                          ),
                                      ]
                            }
                            disabled={
                                disabled ||
                                suppliersLoading ||
                                clientsLoading ||
                                ((invoiceInfo?.invoiceType !== 1 &&
                                    invoiceInfo?.invoiceType !== 10 &&
                                    invoiceInfo?.hasAnyRelatedOperation) ||
                                    ((invoiceInfo?.invoiceType === 1 ||
                                        invoiceInfo?.invoiceType === 10) &&
                                        (invoiceInfo?.isRelatedToCredit ||
                                            invoiceInfo?.hasAnyPayments ||
                                            invoiceInfo?.hasAnyTaxPayments)))
                            }
                        />
                    )}
                </ProFormItem>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    clients: state.newContactsReducer.clients,
    clientsLoading: state.loadings.fetchClients,
    suppliers: state.newContactsReducer.suppliers,
    suppliersLoading: state.loadings.fetchSuppliers,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export const Counterparty = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        updateContractDetails,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        fetchContacts,
    }
)(CounterpartyField);
