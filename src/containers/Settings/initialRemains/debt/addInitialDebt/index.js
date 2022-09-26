import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Button, Form, Checkbox, Spin, Modal } from 'antd';
import { ProDatePicker, ProFormItem, ProSelect } from 'components/Lib';
import axios from 'axios';

// utils
import { fullDateTimeWithSecond } from 'utils';
import { requiredRule } from 'utils/rules';

// actions
import { fetchContacts } from 'store/actions/relations';
import {
    fetchInitialDebtList,
    fetchInitialDebtCount,
    createInitialDebt,
} from 'store/actions/salesAndBuys';
import moment from 'moment';
import styles from '../styles.module.scss';

const AddInitialDebt = props => {
    const {
        form,
        // actions
        fetchContacts,
        contactsLoading,
        contacts,
        fetchInitialDebtList,
        fetchInitialDebtCount,
        currencies,
        businessUnits,
        selectedRow,
        setSelectedRow,
        createInitialDebt,
        toggleModal,
        mainCurrency,
        filters,
        setModalIsVisible,
        modalIsVisible,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
        resetFields,
    } = form;

    const [selectedContacts, setSelectedContacts] = useState([]);
    const [allContactsSelected, setAllContactsSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addModal, setAddModal] = useState(false);

    const disabledDate = current => current && current > moment().endOf('day');
    const disabledDateEdit = current =>
        current &&
        current > moment(selectedRow.operationDate, fullDateTimeWithSecond);

    const handleAllContacts = event => {
        if (event.target.checked) {
            setAllContactsSelected(true);
            setSelectedContacts([]);
        } else {
            setAllContactsSelected(false);
        }
    };

    useEffect(() => {
        if (selectedRow) {
            if (selectedRow.businessUnitId === null) {
                cookies.set('_TKN_UNIT_', 0);
            } else {
                cookies.set('_TKN_UNIT_', selectedRow.businessUnitId);
            }
        }
        setFieldsValue({
            dateOfTransaction: selectedRow
                ? moment(selectedRow.operationDate, fullDateTimeWithSecond)
                : moment(),
        });
    }, [selectedRow]);
    useEffect(() => {
        if (modalIsVisible) {
            if (
                cookies.get('_TKN_UNIT_') &&
                cookies.get('_TKN_UNIT_') !== 'undefined'
            ) {
                fetchContacts({
                    filters: {
                        businessUnitIds:
                            cookies.get('_TKN_UNIT_') !== '0'
                                ? [cookies.get('_TKN_UNIT_')]
                                : undefined,
                        initialDebt: 1,
                    },
                });
            } else {
                fetchContacts({});
            }
        }
    }, [cookies.get('_TKN_UNIT_'), modalIsVisible]);

    useEffect(() => {
        if (!modalIsVisible) {
            setSelectedRow(undefined);
            setSelectedContacts([]);
            cookies.remove('_TKN_UNIT_');
            setAllContactsSelected(false);
        }
    }, [modalIsVisible]);

    const onSuccessCallback = () => {
        fetchInitialDebtList({ filters });
        fetchInitialDebtCount({ filters });
        resetFields();
        setModalIsVisible(false);
        setFieldsValue({
            dateOfTransaction: moment(),
        });
    };
    const addContact = contactIds => {
        const [contactId] = contactIds;
        const newContact = contacts.find(contact => contact.id === contactId);
        setSelectedContacts(prevNewSelectedContacts => [
            newContact,
            ...prevNewSelectedContacts,
        ]);
    };
    const handleSelectedContactsChange = contactIds => {
        const newContacts = selectedContacts.filter(contact =>
            contactIds.includes(contact.id)
        );
        setSelectedContacts(newContacts);
    };
    const handleSubmit = e => {
        e.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { dateOfTransaction } = values;

                const debtData = selectedRow
                    ? {
                          operationDate: dateOfTransaction.format(
                              fullDateTimeWithSecond
                          ),
                          contact: selectedRow.contact,
                          receivablesAmount: selectedRow.receivablesAmount,
                          receivablesTenantCurrency:
                              selectedRow.receivablesTenantCurrency,
                          receivablesTaxAmount:
                              selectedRow.receivablesTaxAmount,
                          receivablesTaxTenantCurrency:
                              selectedRow.receivablesTaxTenantCurrency,
                          payablesAmount: selectedRow.payablesAmount,
                          payablesTenantCurrency:
                              selectedRow.payablesTenantCurrency,
                          payablesTaxAmount: selectedRow.payablesTaxAmount,
                          payablesTaxTenantCurrency:
                              selectedRow.payablesTaxTenantCurrency,
                      }
                    : allContactsSelected
                    ? contacts?.map(selectedContact => ({
                          contact: selectedContact.id,
                          receivablesAmount: '0',
                          receivablesTenantCurrency: mainCurrency?.id,
                          receivablesTaxAmount: '0',
                          receivablesTaxTenantCurrency: mainCurrency?.id,
                          payablesAmount: '0',
                          payablesTenantCurrency: mainCurrency?.id,
                          payablesTaxAmount: '0',
                          payablesTaxTenantCurrency: mainCurrency?.id,
                          operationDate: dateOfTransaction.format(
                              fullDateTimeWithSecond
                          ),
                      }))
                    : selectedContacts?.map(selectedContact => ({
                          contact: selectedContact.id,
                          receivablesAmount: '0',
                          receivablesTenantCurrency: mainCurrency?.id,
                          receivablesTaxAmount: '0',
                          receivablesTaxTenantCurrency: mainCurrency?.id,
                          payablesAmount: '0',
                          payablesTenantCurrency: mainCurrency?.id,
                          payablesTaxAmount: '0',
                          payablesTaxTenantCurrency: mainCurrency?.id,
                          operationDate: dateOfTransaction.format(
                              fullDateTimeWithSecond
                          ),
                      }));

                if (selectedRow) {
                    createInitialDebt(debtData, onSuccessCallback);
                } else {
                    create(debtData);
                }
            }
        });
    };
    async function create(debtData) {
        setLoading(true);
        if (debtData.length > 4) {
            setAddModal(true);
        }
        for (let i = 0; i < debtData.length; i++) {
            await call(debtData[i]);
        }
        setLoading(false);
        setAddModal(false);
        onSuccessCallback();
    }

    async function call(value) {
        const resp1 = await axios.post('/sales/invoices/initial-debts', value);
    }

    return (
        <>
            <Modal
                maskClosable
                width={600}
                visible={addModal}
                closable={false}
                footer={null}
                style={{ marginTop: '100px' }}
            >
                <div className={styles.addContacts}>
                    <h3>Qarşı tərəflər əlavə olunur....</h3>
                    <div className={styles.addContacts_text}>
                        Əlavə olunma prosesi 1-2 dəqiqə davam edə bilər....
                    </div>
                    <Spin
                        size="large"
                        spinning
                        style={{ marginBottom: '20px' }}
                    />
                </div>
            </Modal>
            <div className={styles.modalHeader}>
                <p>{selectedRow ? 'Düzəliş et' : 'Əlavə et'}</p>
            </div>

            <Form onSubmit={handleSubmit} className={styles.form} noValidate>
                <Spin spinning={loading}>
                    <ProFormItem
                        label="İlkin qalıq tarixi"
                        help={getFieldError('dateOfTransaction')?.[0]}
                    >
                        {getFieldDecorator('dateOfTransaction', {
                            rules: [requiredRule],
                        })(
                            <ProDatePicker
                                size="large"
                                format={fullDateTimeWithSecond}
                                allowClear={false}
                                disabledDate={
                                    selectedRow &&
                                    (Number(selectedRow.receivablesPaidAmount) >
                                        0 ||
                                        Number(selectedRow.payablesPaidAmount) >
                                            0 ||
                                        Number(
                                            selectedRow.receivablesPaidTaxAmount
                                        ) > 0 ||
                                        Number(
                                            selectedRow.payablesPaidTaxAmount
                                        ) > 0)
                                        ? disabledDateEdit
                                        : disabledDate
                                }
                                placeholder="İlkin Qalıq"
                            />
                        )}
                    </ProFormItem>
                    {selectedRow ? null : (
                        <>
                            <div className={styles.selectBox}>
                                <span className={styles.selectLabel}>
                                    Əlaqələr
                                </span>
                                <ProSelect
                                    mode="multiple"
                                    loading={contactsLoading}
                                    data={contacts?.filter(
                                        ({ id }) =>
                                            ![...selectedContacts]
                                                .map(({ id }) => id)
                                                .includes(id)
                                    )}
                                    value={undefined}
                                    onChange={addContact}
                                    disabled={
                                        allContactsSelected || contactsLoading
                                    }
                                />
                                <Checkbox
                                    checked={allContactsSelected}
                                    onChange={handleAllContacts}
                                >
                                    Bütün əlaqələr
                                </Checkbox>
                            </div>
                            <div className={styles.selectBox}>
                                <span className={styles.selectLabel}>
                                    Seçilmiş əlaqələr
                                </span>
                                <ProSelect
                                    mode="multiple"
                                    data={selectedContacts}
                                    onChange={handleSelectedContactsChange}
                                    value={selectedContacts.map(({ id }) => id)}
                                    disabled={allContactsSelected}
                                />
                            </div>
                        </>
                    )}
                    <div className={styles.buttonsBox}>
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            disabled={
                                !selectedRow &&
                                selectedContacts.length === 0 &&
                                !allContactsSelected
                            }
                        >
                            Təstiq et
                        </Button>
                    </div>
                </Spin>
            </Form>
        </>
    );
};

const mapStateToProps = state => ({
    currencies: state.currenciesReducer.currencies,
    businessUnits: state.businessUnitReducer.businessUnits,
    contacts: state.contactsReducer.contacts,
    contactsLoading: state.loadings.fetchContacts,
});

export default connect(
    mapStateToProps,
    {
        // fetchBusinessUnitList,
        fetchContacts,
        createInitialDebt,
        fetchInitialDebtList,
        fetchInitialDebtCount,
    }
)(Form.create({ name: 'InitialDebtForm' })(AddInitialDebt));
