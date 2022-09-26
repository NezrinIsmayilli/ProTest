/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Switch, Button, Form, Tooltip, Tabs } from 'antd';
import { ProWrapper } from 'components/Lib';
import { Link, useHistory } from 'react-router-dom';
import { fetchUsers } from 'store/actions/users';
import swal from '@sweetalert/with-react';
import {
    fetchCustomerTypes,
    createContact,
    remove_phone_numbers,
} from 'store/actions/contacts-new';
import { editRequisites } from 'store/actions/profile/requisites';
import MainInfo from './MainInfo';
import Requisites from './Requisites';
import styles from './styles.module.scss';

const { TabPane } = Tabs;

const NewContact = ({
    form,
    customerTypes = [],
    newContactLoading,
    removeContactLOading,
    users,
    fetchCustomerTypes,
    fetchUsers,
    remove_phone_numbers,
    createContact,
}) => {
    const {
        getFieldDecorator,
        getFieldValue,
        getFieldError,
        validateFields,
        setFieldsValue,
    } = form;
    const history = useHistory();
    const [status, setStatus] = useState(true);
    const [activeTab, setActiveTab] = useState('1');
    const [contactInformation, setContactInformation] = useState({
        numbers: [null],
        emails: [null],
        websites: [null],
    });

    const handleActiveTabChange = newTab => {
        setActiveTab(newTab);
    };

    useEffect(() => {
        fetchCustomerTypes();
        fetchUsers({});
        setFieldsValue({
            numbers: [null],
            emails: [null],
            websites: [null],
        });
    }, []);

    const handleAddValue = type => {
        const values = getFieldValue(type);
        if (values.length <= 10) {
            setFieldsValue({
                [type]: [...values, null],
            });
            setContactInformation({
                ...contactInformation,
                [type]: [...values, null],
            });
        }
    };

    const handleDeleteValue = (type, id) => {
        const newNumbers = getFieldValue(type).filter(
            (_, index) => index !== id
        );
        setFieldsValue({
            [type]: newNumbers,
        });
        setContactInformation({ ...contactInformation, [type]: newNumbers });
    };

    const getFreshNumbers = numbers =>
        numbers.map(number =>
            number
                .replace(/\(/g, '')
                .replace(/\)/g, '')
                .replace(/_/g, '')
                .replace(/ /g, '')
        );

    const checkValues = (values, type) => {
        const newValues = values.filter(
            value => value !== null && value !== undefined && value !== ''
        );
        if (newValues.length === 0) return null;
        return newValues;
    };

    const handleCreateContact = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    type,
                    category,
                    name,
                    position,
                    voen,
                    customerType,
                    manager,
                    company,
                    numbers,
                    emails,
                    websites,
                    address,
                    description,
                    // Requisites data
                    officialName,
                    generalDirector,
                    companyVoen,
                    bankName,
                    bankVoen,
                    bankCode,
                    correspondentAccount,
                    settlementAccount,
                    swift,
                } = values;
                const newContact = {
                    type,
                    status: status ? 1 : 2,
                    category_ul: category,
                    name: name || null,
                    position: position || null,
                    voen: voen || null,
                    priceType: customerType || null,
                    manager: manager || null,
                    company: company || null,
                    phoneNumbers_ul: checkValues(numbers, 'number'),
                    emails_ul: checkValues(emails),
                    websites_ul: checkValues(websites),
                    address: address || null,
                    description: description || null,
                    partnerToken: null,
                    socialNetworkIds_ul: [],
                    // Requisites data
                    officialName: officialName || null,
                    generalDirector: generalDirector || null,
                    companyVoen: companyVoen || null,
                    bankName: bankName || null,
                    bankVoen: bankVoen || null,
                    bankCode: bankCode || null,
                    correspondentAccount: correspondentAccount || null,
                    settlementAccount: settlementAccount || null,
                    swift: swift || null,
                };
                console.log(newContact, "salam");
                return createContact(
                    newContact,
                    () => history.push('/relations'),
                    error => {
                        let errorString = '';
                        if (
                            error?.response?.data?.error?.messageKey ===
                            'same_phone_number'
                        ) {
                            setActiveTab('1');
                            const phone_numbers = form.getFieldValue('numbers');
                            const already_exists_phone_numbers = Object.keys(
                                error.response.data.error.errors.data
                            ).map(phoneNumber => ({
                                number: phoneNumber,
                                ...error.response.data.error.errors.data[
                                phoneNumber
                                ],
                            }));
                            already_exists_phone_numbers.forEach(
                                ({ number, name }, key) => {
                                    if (key === 0) {
                                        errorString += `${number} nömrəsi ${name} əlaqəsində`;
                                    } else {
                                        errorString += `, ${number} nömrəsi ${name} əlaqəsində`;
                                    }
                                }
                            );
                            swal({
                                title: 'Diqqət!',
                                content: (
                                    <p style={{ color: 'black' }}>
                                        <span style={{ fontWeight: 700 }}>
                                            {errorString}
                                        </span>{' '}
                                        artıq qeydiyyatdadır. Əməliyyatı təsdiq
                                        etsəniz, nömrə(lər) həmin əlaqə(lər)in
                                        tərkibindən silinəcək. Davam etmək
                                        istədiyinizə əminsiniz?
                                    </p>
                                ),
                                buttons: ['Ləğv et', 'Təsdiq et'],
                                dangerMode: true,
                            }).then(isConfirmed => {
                                if (isConfirmed) {
                                    remove_phone_numbers(
                                        {
                                            ids: already_exists_phone_numbers.map(
                                                ({ phoneNumberId }) =>
                                                    phoneNumberId
                                            ),
                                        },
                                        () => {
                                            handleCreateContact();
                                        }
                                    );
                                }
                            });
                            const errors = {};
                            already_exists_phone_numbers.forEach(
                                ({ number }) => {
                                    errors[
                                        `numbers[${phone_numbers.indexOf(
                                            number
                                        )}]`
                                    ] = {
                                        name: `numbers[${phone_numbers.indexOf(
                                            number
                                        )}]`,
                                        value: getFieldValue(
                                            `numbers[${phone_numbers.indexOf(
                                                number
                                            )}]`
                                        ),
                                        errors: [
                                            'Bu nömrə artıq istifadə olunub.',
                                        ],
                                    };
                                }
                            );
                            form.setFields(errors);
                        } else if (
                            error?.response?.data?.error?.messageKey ===
                            'duplicate_phone_number'
                        ) {
                            setActiveTab('1');
                            const already_exists_phone_numbers = Object.keys(
                                error.response.data.error.errors.data
                            ).map(index => ({
                                number:
                                    error.response.data.error.errors.data[
                                    index
                                    ],
                                index,
                                ...error.response.data.error.errors.data[index],
                            }));
                            const errors = {};
                            already_exists_phone_numbers.forEach(
                                ({ index }) => {
                                    errors[`numbers[${index}]`] = {
                                        name: `numbers[${index}]`,
                                        value: getFieldValue(
                                            `numbers[${index}]`
                                        ),
                                        errors: [
                                            'Eyni nömrə təkrar daxil edilə bilməz.',
                                        ],
                                    };
                                }
                            );
                            form.setFields(errors);
                        } else if (
                            error?.response?.data?.error?.messageKey ===
                            'contact_is_already_exists'
                        ) {
                            setActiveTab('1');
                            form.setFields({
                                name: {
                                    name: 'name',
                                    value: getFieldValue('name'),
                                    errors: ['Bu əlaqə adı artıq mövcuddur.'],
                                },
                            });
                        }
                    }
                );
            }
            if (
                errors.type !== undefined ||
                errors.category !== undefined ||
                errors.name !== undefined ||
                errors.position !== undefined ||
                errors.voen !== undefined ||
                errors.priceType !== undefined ||
                errors.manager !== undefined ||
                errors.company !== undefined ||
                errors.numbers !== undefined ||
                errors.emails !== undefined ||
                errors.websites !== undefined ||
                errors.address !== undefined ||
                errors.description !== undefined
            ) {
                setActiveTab('1');
            } else if (
                errors.officialName !== undefined ||
                errors.generalDirector !== undefined ||
                errors.companyVoen !== undefined ||
                errors.bankName !== undefined ||
                errors.bankVoen !== undefined ||
                errors.bankCode !== undefined ||
                errors.correspondentAccount !== undefined ||
                errors.settlementAccount !== undefined ||
                errors.swift !== undefined
            ) {
                setActiveTab('2');
            }
        });
    };
    const completeOperation = e => {
        e.preventDefault();
        handleCreateContact();
    };

    return (
        <ProWrapper>
            <section
                className="operationsWrapper paper"
                style={{ marginBottom: 110 }}
            >
                <div className={styles.salesContainer}>
                    <Form
                        scrollToFirstError
                        onSubmit={completeOperation}
                        className={styles.form}
                        noValidate
                    >
                        <Row>
                            <Col
                                span={24}
                                style={{ fontSize: '14px', fontWeight: '500' }}
                            >
                                <a onClick={history.goBack}>
                                    <img
                                        width={8}
                                        height={13}
                                        src="/img/icons/left-arrow.svg"
                                        alt="trash"
                                        className={styles.icon}
                                        style={{ marginRight: '12px' }}
                                    />
                                    Əlaqələr siyahısına qayıt
                                </a>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: '40px' }}>
                            <Col>
                                <div className={styles.checkboxContainer}>
                                    <span className={styles.mode}>Aktiv</span>
                                    <Tooltip title="Əlaqə statusu">
                                        <Switch
                                            style={{ margin: '0 16px' }}
                                            checked={status}
                                            onChange={checked =>
                                                setStatus(checked)
                                            }
                                        />
                                    </Tooltip>
                                    <span className={styles.mode}>Deaktiv</span>
                                </div>
                            </Col>
                            <Col>
                                <Tabs
                                    className={styles.tabs}
                                    type="card"
                                    activeKey={activeTab}
                                    onTabClick={handleActiveTabChange}
                                >
                                    <TabPane
                                        tab="Əsas məlumat"
                                        key="1"
                                        forceRender
                                    >
                                        <MainInfo
                                            form={form}
                                            users={users}
                                            fetchCustomerTypes={fetchCustomerTypes}
                                            fetchUsers={fetchUsers}
                                            contactInformation={
                                                contactInformation
                                            }
                                            handleAddValue={handleAddValue}
                                            handleDeleteValue={
                                                handleDeleteValue
                                            }
                                            customerTypes={customerTypes}
                                        />
                                    </TabPane>
                                    <TabPane
                                        tab="Rekvizitlər"
                                        key="2"
                                        forceRender
                                    >
                                        <Requisites form={form} />
                                    </TabPane>
                                </Tabs>
                            </Col>
                        </Row>
                        <div className={styles.formAction}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={
                                    newContactLoading || removeContactLOading
                                }
                            >
                                Əlavə et
                            </Button>
                            <a onClick={history.goBack}>
                                <Button>İmtina et</Button>
                            </a>
                        </div>
                    </Form>
                </div>
            </section>
        </ProWrapper>
    );
};

const mapStateToProps = state => ({
    newContactLoading: state.loadings.newContact,
    removeNumberLoading: state.loadings.removePhoneNumber,
    customerTypes: state.newContactsReducer.customerTypes,
    users: state.usersReducer.users,
});
export default connect(
    mapStateToProps,
    {
        fetchCustomerTypes,
        fetchUsers,
        createContact,
        remove_phone_numbers,
    }
)(Form.create({ name: 'ContactsForm' })(NewContact));
