/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
// content
import { ProFormItem, ProWrapper, ProSelect, ProAsyncSelect } from 'components/Lib';
import { Row, Col, Input, Button, Checkbox, Spin, Form, Tooltip } from 'antd';
import { Link, useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { fetchContacts, fetchCustomerTypes } from 'store/actions/contacts-new';
import {
    createPartner,
    getPartner,
    editPartner,
    resetSelectedPartner,
} from 'store/actions/partners';
import {
    requiredRule,
    emailRule,
    minLengthRule,
    shortTextMaxRule,
    longTextMaxRule,
} from 'utils/rules';
import ContactAdd from './ContactAdd';
import styles from './styles.module.scss';

// eslint-disable-next-line no-unused-vars
const NewPartner = ({
    form,
    actionLoading,
    selectedPartner,
    getPartner,
    customerTypes = [],
    contacts,
    editPartner,
    createPartner,
    fetchContacts,
    fetchCustomerTypes,
    resetSelectedPartner,
}) => {
    const { id } = useParams();
    const history = useHistory();

    const [contactItem, setContactItem] = useState(false);
    const [data, setData] = useState(undefined);
    const [Contacts, setContacts] = useState([]);
    const [SelectedContacts, setSelectedContacts] = useState(undefined);
    const [allData, setAllData] = useState(undefined);
    const [defaultSelectedContact, setDefaultSelectedContact] = useState(
        undefined
    );

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        if (data) {
            setFieldsValue({
                contact: data ? Contacts[0]?.id : undefined,
                email:null,
                deliveryAddress:null
            });
        } else if(!SelectedContacts) {
            setFieldsValue({
                  contact:Contacts.length === 1? Contacts[0]?.id:undefined,
              })}
    }, [contacts]);

    const handleContactItem = () => {
        setContactItem(true);
    };

    useEffect(() => {
        fetchContacts(true);
        fetchContacts(false, { limit: 1000 }, ({ data }) => {
            setAllData(data);
        });
        fetchCustomerTypes();
        if (Number(id)) getPartner(Number(id));
        return () => {
            resetSelectedPartner();
        };
    }, []);

    const handleContactChange = id => {
        const selectedContact = Contacts.filter(
            contact => contact.id === id
        )[0];
        setSelectedContacts(selectedContact);
        return setFieldsValue({
            email:
                selectedContact?.emails.length > 0
                    ? selectedContact?.emails[0]
                    : null,
            deliveryAddress: selectedContact?.address,
        });
    };
    const completeOperation = e => {
        e.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    contact,
                    email,
                    priceType,
                    showPrices,
                    description,
                    deliveryAddress,
                } = values;
                const newPartner = {
                    email: email || null,
                    contact: contact || null,
                    deliveryAddress: deliveryAddress || null,
                    showPrices: showPrices || false,
                    priceType: priceType || null,
                    description: description || null,
                };
                return Number(id)
                    ? editPartner({
                        id,
                        data: newPartner,
                        callback: () => history.goBack(),
                        onFailure: handleFailure,
                    })
                    : createPartner(
                        newPartner,
                        () => history.push('/relations/partners'),
                        handleFailure
                    );
            }
        });
    };

    useEffect(() => {
        if (id && allData) {
            setDefaultSelectedContact(
                allData.filter(item => item.id === selectedPartner.contactId)
            );
            const partner = {
                email: selectedPartner.email,
                contact: selectedPartner.contactId,
                deliveryAddress: selectedPartner.deliveryAddress,
                showPrices: selectedPartner.showPrices,
                description: selectedPartner.description || null,
                priceType: selectedPartner.priceTypeId || 0,
            };
            setFieldsValue(partner);
        }
    }, [id, selectedPartner, allData]);


    useEffect(() => {
        if (!id) {
            if (Contacts.length === 1) {
                setFieldsValue({
                    contact: Contacts[0].id,
                    email:
                        Contacts[0].emails.length > 0
                            ? Contacts[0].emails[0]
                            : null,
                    deliveryAddress: Contacts[0].address
                })
            }

            else if (!SelectedContacts) {
                setFieldsValue({
                    contact: undefined,
                    email: undefined,
                    deliveryAddress: undefined
                });
            }
        }
    }, [Contacts.length]);

    const ajaxContactSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
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
                setContacts(appendList);
            } else {
                setContacts(Contacts.concat(appendList));
            }
        });
    };

    const handleFailure = error =>
        toast.error(error.error.response.data.error.message);
    return (
        <>
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                setData={setData}
                ajaxContactSelectRequest={ajaxContactSelectRequest}
            />

            <ProWrapper>
                <section className="operationsWrapper paper">
                    <div className={styles.salesContainer}>
                        <Spin spinning={actionLoading}>
                            <Row>
                                <Col
                                    span={24}
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
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
                                        Partnyorlar siyahısı
                                    </a>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '40px' }}>
                                <Col span={24} className={styles.flexBox}>
                                    <span className={styles.label}>
                                        {id
                                            ? 'Partnyora düzəliş'
                                            : 'Yeni partnyor'}
                                    </span>
                                    {/* <div className={styles.checkboxContainer}>
                  <span className={styles.mode}>Passiv</span>
                  <Switch
                    style={{ margin: '0 16px' }}
                    checked={status}
                    onChange={checked => setStatus(checked)}
                  />
                  <span className={styles.mode}>Aktiv</span>
                </div> */}
                                </Col>
                            </Row>
                            <Form
                                onSubmit={completeOperation}
                                className={styles.form}
                                noValidate
                            >
                                <Row
                                    className={styles.sectionHeader}
                                    style={{ marginTop: '30px' }}
                                >
                                    <span>Əsas məlumatlar</span>
                                </Row>
                                <Row style={{ marginTop: '23px' }} gutter={32}>
                                    <Col
                                        sm={24}
                                        md={12}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                        }}
                                    >
                                        <Tooltip title="Əlaqə əlavə et">
                                            <PlusIcon
                                                color="#FF716A"
                                                className={styles.plusBtn}
                                                onClick={handleContactItem}
                                            />
                                        </Tooltip>
                                        <ProFormItem
                                            label="Əlaqə adı"
                                            help={getFieldError('contact')?.[0]}
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator('contact', {
                                                rules: [requiredRule],
                                            })(
                                                <ProAsyncSelect
                                                    onChange={
                                                        handleContactChange
                                                    }
                                                    selectRequest={ajaxContactSelectRequest}
                                                    data={
                                                        defaultSelectedContact
                                                            ? [
                                                                ...defaultSelectedContact,
                                                                ...Contacts.filter(
                                                                    item =>
                                                                        !defaultSelectedContact
                                                                            .map(({ id }) => id)
                                                                            ?.includes(item.id)
                                                                ),
                                                            ]
                                                            : Contacts
                                                    }
                                                    keys={['name']}
                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                    <Col
                                        sm={24}
                                        md={12}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <ProFormItem
                                            label="Email"
                                            name="email"
                                            help={getFieldError('email')?.[0]}
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator('email', {
                                                rules: [
                                                    requiredRule,
                                                    emailRule,
                                                    minLengthRule,
                                                    shortTextMaxRule,
                                                ],
                                            })(
                                                <Input
                                                    size="large"
                                                    className={styles.select}
                                                    placeholder="Yazın"
                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        sm={24}
                                        md={12}
                                        className={styles.deliveryAddress}
                                    >
                                        <ProFormItem
                                            label="Çatdırılma ünvanı"
                                            name="deliveryAddress"
                                            help={
                                                getFieldError(
                                                    'deliveryAddress'
                                                )?.[0]
                                            }
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator(
                                                'deliveryAddress',
                                                {
                                                    rules: [requiredRule],
                                                }
                                            )(
                                                <Input
                                                    size="large"
                                                    className={styles.select}
                                                    placeholder="Yazın"
                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>
                                <Row className={styles.sectionHeader}>
                                    <span>Qiymət</span>
                                </Row>
                                <Row style={{ marginTop: '23px' }}>
                                    <Col
                                        sm={24}
                                        md={12}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <ProFormItem
                                            help={
                                                getFieldError('showPrices')?.[0]
                                            }
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator('showPrices', {
                                                rules: [],
                                            })(
                                                <Checkbox
                                                    className={styles.checkbox}
                                                    checked={getFieldValue(
                                                        'showPrices'
                                                    )}
                                                    style={{
                                                        color: 'black',
                                                        fontWeight: 500,
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    Göstər
                                                </Checkbox>
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        sm={24}
                                        md={12}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <ProFormItem
                                            label="Qiymət tipi"
                                            name="priceType"
                                            help={
                                                getFieldError('priceType')?.[0]
                                            }
                                            hidden={
                                                !getFieldValue('showPrices')
                                            }
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator('priceType', {
                                                rules: [],
                                            })(
                                                <ProSelect
                                                    data={[
                                                        {
                                                            id: 0,
                                                            name: 'Satış',
                                                        },
                                                        ...customerTypes,
                                                    ]}
                                                    allowClear={false}
                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>

                                <Row className={styles.sectionHeader}>
                                    <span>Əlavə məlumat</span>
                                </Row>
                                <Row>
                                    <Col
                                        sm={24}
                                        md={12}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <ProFormItem
                                            name="Əlavə məlumat"
                                            help={
                                                getFieldError(
                                                    'description'
                                                )?.[0]
                                            }
                                            customStyle={styles.formItem}
                                            style={{ height: '100px' }}
                                        >
                                            {getFieldDecorator('description', {
                                                rules: [minLengthRule, longTextMaxRule],
                                            })(
                                                <Input.TextArea
                                                    style={{
                                                        width: '100%',
                                                        marginTop: '4px',
                                                        fontSize: '14px',
                                                    }}
                                                    rows={4}
                                                    placeholder="Yazın"

                                                />
                                            )}
                                        </ProFormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <Button
                                            size="large"
                                            className={styles.button}
                                            htmlType="submit"
                                        >
                                            Təsdiq et
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </div>
                </section>
            </ProWrapper>
        </>
    );
};

const mapStateToProps = state => ({
    actionLoading: state.partnersReducer.actionLoading,
    selectedPartner: state.partnersReducer.selectedPartner,
    customerTypes: state.newContactsReducer.customerTypes,
    contacts: state.newContactsReducer.contacts,
});
export default connect(
    mapStateToProps,
    {
        getPartner,
        editPartner,
        fetchContacts,
        fetchCustomerTypes,
        createPartner,
        resetSelectedPartner,
    }
)(Form.create({ name: 'PartnerForm' })(NewPartner));
