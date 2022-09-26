/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ProFormItem,
    ProSelect,
    ProInput,
    ProDatePicker,
} from 'components/Lib';
import { cookies } from 'utils/cookies';
import { createContract, editContract } from 'store/actions/contracts';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import moment from 'moment';
import {
    Form,
    Button,
    Dropdown,
    Icon,
    Menu,
    Spin,
    Row,
    Col,
    Radio,
    Input,
    Checkbox,
    InputNumber,
    Tooltip,
} from 'antd';
import {
    requiredRule,
    minLengthRule,
    mediumTextMaxRule,
    longTextMaxRule,
    maxNumberRule,
} from 'utils/rules';

import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';

import { useHistory } from 'react-router-dom';
import pdfVector from 'assets/img/icons/filePdf.PNG';
import xslVector from 'assets/img/icons/fileXsl.PNG';
import imgVector from 'assets/img/icons/fileImg.PNG';
import docVector from 'assets/img/icons/fileWord.png';
import styles from '../../styles.module.scss';
import Upload from './#shared/fields/upload';
import ContactAdd from './ContactAdd';
import CashboxInfoButton from './CashboxInfoButton';

const { TextArea } = Input;
const ContactForm = ({
    form,
    createContract,
    editItemId,
    editContract,
    contract,
    contracts,
    users,
    contacts,
    currencies,
    isLoading,
    actionLoading,
    fetchCurrencies,
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    usersLoading,
    permissionsList,
}) => {
    const {
        submit,
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const history = useHistory();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const [documents, setDocuments] = useState([]);
    const [endLess, setEndless] = useState(false);
    const [limitless, setLimitless] = useState(false);
    const [contactItem, setContactItem] = useState({
        visible: false,
        name: undefined,
    });

    const [data, setData] = useState(undefined);

    useEffect(() => {
        if (data && data === 'counterparty') {
            setFieldsValue({
                counterparty: contacts[0]?.id,
            });
        } else if (data && data === 'relatedContacts') {
            const related =
                getFieldValue('relatedContacts') === undefined
                    ? []
                    : getFieldValue('relatedContacts');
            setFieldsValue({
                relatedContacts: [...related, contacts[0]?.id],
            });
        }

        if (contacts.length === 1) {
            setFieldsValue({
                counterparty: contacts[0]?.id,
            });
        }
        if (users.length === 1) {
            setFieldsValue({
                responsiblePerson: users[0]?.id,
            });
        }
    }, [contacts, users]);

    const handleContactItem = name => {
        setContactItem({
            visible: true,
            name,
        });
    };
    const handleEndlessCheckbox = checked => {
        if (checked) {
            setEndless(true);
            setFieldsValue({ endDate: undefined });
        } else {
            setEndless(false);
        }
    };

    function getFileAvatar(type, name) {
        if (type === 'application/zip') {
            if (name.split('.').pop() === 'xlsx') {
                return xslVector;
            }
            if (name.split('.').pop() === 'docx') {
                return docVector;
            }
        }
        if (
            type === 'image/png' ||
            type === 'image/jpeg' ||
            type === 'image/jpg' ||
            type === 'image/svg'
        )
            return imgVector;
        if (
            type === 'application/vnd.ms-excel' ||
            type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
            return xslVector;
        if (type === 'application/pdf') return pdfVector;
        if (
            type ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            type === 'application/msword'
        )
            return docVector;
        return '';
    }

    const handleLimitlessCheckbox = checked => {
        if (checked) {
            setLimitless(true);
            setFieldsValue({ amount: undefined });
        } else {
            setLimitless(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        currencies.length > 0 &&
            !contract?.currency &&
            setFieldsValue({ currency: currencies[0].id });
        // eslint-disable-next-line no-unused-expressions
        currencies.length <= 0 && fetchCurrencies();
    }, [currencies]);
    useEffect(() => {
        if (contract && editItemId) {
            setFieldsValue({
                contractType: contract.type,
                amount: contract.amount === 0 ? undefined : contract.amount,
                contractNo: contract.contract_no,
                startDate: contract.start_date
                    ? moment(contract.start_date, 'DD-MM-YYYY')
                    : undefined,
                relatedContacts:
                    contract.relatedContacts.map(contact => contact.id) || [],
                endDate: contract.end_date
                    ? moment(contract.end_date, 'DD-MM-YYYY')
                    : undefined,
                direction: contract.direction,
                counterparty: contract.counterparty_id,
                currency: contract.currency_id,
                description: contract.description,
                responsiblePerson: contract.responsible_person_id,
            });
            contract.attachments.length > 0 &&
                setDocuments(
                    contract.attachments.map(attachment => ({
                        id: attachment.id,
                        uid: attachment.id,
                        name: attachment.original_name,
                        type: attachment.mime_type,
                        thumbUrl: getFileAvatar(
                            attachment.mime_type,
                            attachment.original_name
                        ),
                        status: 'done',
                    }))
                );

            !contract.end_date && setEndless(true);
            !contract.amount && setLimitless(true);
        } else {
            setFieldsValue({
                contractType: 1,
                direction: 1,
                currency: currencies[0] ? currencies[0].id : null,
                startDate: moment(),
            });
        }
    }, [contract]);

    const signContract = isDraft => {
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    counterparty,
                    contractType,
                    direction,
                    contractNo,
                    responsiblePerson,
                    relatedContacts,
                    startDate,
                    endDate,
                    amount,
                    currency,
                    description,
                } = values;
                const data = {
                    counterparty,
                    contractType,
                    direction,
                    contractNo,
                    responsiblePerson,
                    startDate: moment(startDate).format('DD-MM-YYYY'),
                    endDate: endLess
                        ? null
                        : moment(endDate).format('DD-MM-YYYY'),
                    amount: limitless ? null : amount,
                    currency,
                    description: description || null,
                    isDraft: isDraft || false,
                    documents_ul:
                        documents.length > 0
                            ? documents.map(document => document.id)
                            : [],
                    relatedContacts_ul: relatedContacts || [],
                    tax: null,
                    taxCurrency: null,
                };
                createContract(
                    data,
                    () => {
                        toast.success('Əməliyyat uğurla tamamlandı.');
                        history.push('/sales/contracts');
                    },
                    () => {}
                );
            }
        });
    };

    const editContractReq = isDraft => {
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    counterparty,
                    contractType,
                    direction,
                    contractNo,
                    responsiblePerson,
                    relatedContacts,
                    startDate,
                    endDate,
                    amount,
                    currency,
                    description,
                } = values;
                const data = {
                    counterparty,
                    contractType,
                    direction,
                    contractNo,
                    responsiblePerson: responsiblePerson || [],
                    startDate: moment(startDate).format('DD-MM-YYYY'),
                    endDate: endLess
                        ? null
                        : moment(endDate).format('DD-MM-YYYY'),
                    amount: limitless ? null : amount,
                    currency,
                    description: description || null,
                    isDraft: isDraft || false,
                    documents_ul:
                        documents.length > 0
                            ? documents.map(document => document.id)
                            : [],
                    relatedContacts_ul: relatedContacts,
                    tax: null,
                    taxCurrency: null,
                };
                editContract(
                    editItemId,
                    data,
                    () => {
                        toast.success('Əməliyyat uğurla tamamlandı.');
                        history.goBack();
                    },
                    () => {}
                );
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
            <Spin spinning={isLoading}>
                <Form
                    onSubmit={editItemId ? editContractReq : signContract}
                    initialValues={{
                        contractType: 1,
                        direction: 1,
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                        }}
                    >
                        <Tooltip title="Əlaqə əlavə et">
                            <PlusIcon
                                style={
                                    editItemId && contract?.hasOperation
                                        ? {
                                              pointerEvents: 'none',
                                              fill: '#bbb',
                                          }
                                        : {}
                                }
                                className={styles.plusBtn}
                                onClick={() => {
                                    editItemId && contract?.hasOperation
                                        ? null
                                        : handleContactItem('counterparty');
                                }}
                            />
                        </Tooltip>
                        <ProFormItem
                            label="Qarşı tərəf"
                            help={getFieldError('counterparty')?.[0]}
                            customStyle={styles.formItem}
                        >
                            {getFieldDecorator('counterparty', {
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    data={contacts}
                                    disabled={
                                        editItemId
                                            ? contract?.hasOperation
                                            : false
                                    }
                                />
                            )}
                        </ProFormItem>
                        {getFieldValue('counterparty') &&
                            (permissionsList.transaction_recievables_report
                                .permission !== 0 &&
                            permissionsList.transaction_payables_report
                                .permission !== 0 ? (
                                <CashboxInfoButton
                                    fetchInfo={callback =>
                                        fetchInvoiceListByContactId(
                                            getFieldValue('counterparty'),
                                            callback
                                        )
                                    }
                                    fetchAdvance={callback =>
                                        fetchAdvancePaymentByContactId(
                                            getFieldValue('counterparty'),
                                            {
                                                businessUnitIds:
                                                    contract && editItemId
                                                        ? contracts?.find(
                                                              contract =>
                                                                  contract.id ==
                                                                  editItemId
                                                          )
                                                              ?.business_unit_id ===
                                                          null
                                                            ? [0]
                                                            : [
                                                                  contracts?.find(
                                                                      contract =>
                                                                          contract.id ==
                                                                          editItemId
                                                                  )
                                                                      ?.business_unit_id,
                                                              ]
                                                        :  BUSINESS_TKN_UNIT
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
                    </div>

                    <Row
                        gutter={12}
                        style={{ height: '20px', margin: '0px!important' }}
                    >
                        <Col span={12}>
                            <ProFormItem
                                label="Növü"
                                help={getFieldDecorator('contractType')?.[0]}
                                customStyle={styles.customFormItem}
                            >
                                {getFieldDecorator('contractType', {
                                    rules: [],
                                })(
                                    <Radio.Group style={{ fontSize: '14px' }}>
                                        <Radio value={1}>Məhsul</Radio>
                                        <Radio value={2}>Xidmət</Radio>
                                    </Radio.Group>
                                )}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="İstiqamət"
                                help={getFieldDecorator('direction')?.[0]}
                                customStyle={styles.customFormItem}
                            >
                                {getFieldDecorator('direction', {
                                    rules: [],
                                })(
                                    <Radio.Group
                                        style={{ fontSize: '14px' }}
                                        disabled={
                                            editItemId
                                                ? contract?.hasOperation
                                                : false
                                        }
                                    >
                                        <Radio value={1}>Alış</Radio>
                                        <Radio value={2}>Satış</Radio>
                                    </Radio.Group>
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>

                    <ProFormItem
                        label="Müqavilə nömrəsi"
                        help={getFieldError('contractNo')?.[0]}
                        customStyle={styles.formItem}
                    >
                        {getFieldDecorator('contractNo', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                mediumTextMaxRule,
                            ],
                        })(<ProInput placeholder="Yazın" />)}
                    </ProFormItem>
                    <ProFormItem
                        label="Məsul şəxs"
                        help={getFieldError('responsiblePerson')?.[0]}
                        customStyle={styles.formItem}
                    >
                        {getFieldDecorator('responsiblePerson', {
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                loading={usersLoading}
                                data={users}
                                keys={['name', 'lastName']}
                            />
                        )}
                    </ProFormItem>
                    <div
                        style={{
                            position: 'relative',
                        }}
                    >
                        <Tooltip title="Əlaqə əlavə et">
                            <PlusIcon
                                color="#FF716A"
                                className={styles.plusBtn}
                                onClick={() =>
                                    handleContactItem('relatedContacts')
                                }
                            />
                        </Tooltip>
                        <ProFormItem
                            label="Əlaqəli tərəflər"
                            help={getFieldError('relatedContacts')?.[0]}
                            customStyle={`${styles.formItem}`}
                        >
                            {getFieldDecorator('relatedContacts', {
                                rules: [],
                            })(<ProSelect data={contacts} mode="multiple" />)}
                        </ProFormItem>
                    </div>
                    <Row gutter={12}>
                        <Col
                            span={12}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <ProFormItem
                                label="Başlama tarixi"
                                help={getFieldError('startDate')?.[0]}
                                customStyle={styles.formItem}
                            >
                                {getFieldDecorator('startDate', {
                                    rules: [requiredRule],
                                })(<ProDatePicker />)}
                            </ProFormItem>
                        </Col>
                        <Col
                            span={12}
                            style={{ display: 'flex', flexDirection: 'column' }}
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
                                })(<ProDatePicker disabled={endLess} />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col
                            span={20}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <ProFormItem
                                label="Məbləğ"
                                help={getFieldError('amount')?.[0]}
                                customStyle={styles.formItem}
                            >
                                {getFieldDecorator('amount', {
                                    rules: limitless
                                        ? []
                                        : [requiredRule, maxNumberRule],
                                })(
                                    <InputNumber
                                        size="large"
                                        className={styles.select}
                                        placeholder="Yazın"
                                        disabled={limitless}
                                        style={{
                                            marginTop: '0px',
                                            width: '100%',
                                        }}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col
                            span={4}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <ProFormItem
                                label={
                                    <Checkbox
                                        style={{ margin: '0px!important' }}
                                        onChange={event =>
                                            handleLimitlessCheckbox(
                                                event.target.checked
                                            )
                                        }
                                        checked={limitless}
                                    >
                                        Limitsiz
                                    </Checkbox>
                                }
                                help={getFieldError('currency')?.[0]}
                                customStyle={styles.formItem}
                            >
                                {getFieldDecorator('currency', {
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        data={currencies}
                                        keys={['code']}
                                        disabled={
                                            editItemId
                                                ? contract?.hasOperation
                                                : false
                                        }
                                        allowClear={false}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <ProFormItem
                        label="Əlavə məlumat"
                        help={getFieldError('description')?.[0]}
                        customStyle={styles.formItem}
                        style={{ height: '100px' }}
                    >
                        {getFieldDecorator('description', {
                            rules: [longTextMaxRule],
                        })(
                            <TextArea
                                autoSize={{ minRows: 3, maxRows: 5 }}
                                style={{ marginTop: 0 }}
                                placeholder="Yazın"
                            />
                        )}
                    </ProFormItem>
                    <Upload documents={documents} setDocuments={setDocuments} />

                    <div style={{ marginTop: 20 }} className={styles.exportBox}>
                        {editItemId ? (
                            <Spin spinning={actionLoading}>
                                <Dropdown.Button
                                    overlayStyle={{
                                        boxShadow:
                                            '0px 2px 12px rgba(0,0,0,0.12)',
                                    }}
                                    placement="bottomRight"
                                    type="primary"
                                    onClick={() =>
                                        submit(() => {
                                            editContractReq(contract.isDraft);
                                        })
                                    }
                                    className={styles.saveDropDownButton}
                                    style={{ marginLeft: 10, paddingRight: 15 }}
                                    overlay={
                                        <Menu>
                                            <Menu.Item
                                                key="0"
                                                onClick={() =>
                                                    submit(() =>
                                                        editContractReq(true)
                                                    )
                                                }
                                                className={styles.menuItem}
                                            >
                                                <Icon
                                                    className={styles.menuIcon}
                                                    type="save"
                                                />
                                                <span
                                                    className={styles.menuText}
                                                >
                                                    Yadda saxla
                                                </span>
                                            </Menu.Item>
                                            <Menu.Item
                                                key="1"
                                                className={styles.menuItem}
                                                onClick={() =>
                                                    submit(() =>
                                                        editContractReq(false)
                                                    )
                                                }
                                            >
                                                <Icon
                                                    className={styles.menuIcon}
                                                    type="file-text"
                                                />
                                                <span
                                                    className={styles.menuText}
                                                >
                                                    Yadda saxla və kontraktı
                                                    imzala
                                                </span>
                                            </Menu.Item>
                                        </Menu>
                                    }
                                    icon={<Icon type="down" />}
                                >
                                    Təsdiq et
                                </Dropdown.Button>
                            </Spin>
                        ) : (
                            <>
                                <Button
                                    loading={actionLoading}
                                    className={styles.customButton}
                                    onClick={() =>
                                        submit(() => {
                                            signContract(false);
                                        })
                                    }
                                    type="primary"
                                >
                                    Əlavə et
                                </Button>

                                <Button
                                    className={styles.saveDraftButton}
                                    style={{ marginLeft: 10, paddingRight: 15 }}
                                    loading={actionLoading}
                                    onClick={() =>
                                        submit(() => {
                                            signContract(true);
                                        })
                                    }
                                >
                                    Qaralama
                                </Button>
                            </>
                        )}
                    </div>
                </Form>
            </Spin>
        </>
    );
};

const mapStateToProps = state => ({
    isLoading: state.contractsReducer.isLoading,
    actionLoading: state.contractsReducer.actionLoading,
    contract: state.contractsReducer.contractInfo,
    users: state.usersReducer.users,
    contacts: state.contactsReducer.contacts,
    currencies: state.kassaReducer.currencies,
    usersLoading: state.loadings.fetchUsers,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    contracts: state.contractsReducer.contracts,
});
export default connect(
    mapStateToProps,
    {
        createContract,
        editContract,
        fetchCurrencies,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
    }
)(Form.create({ name: 'ContactsForm' })(ContactForm));
