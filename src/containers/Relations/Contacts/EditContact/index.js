/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
// content
import { Row, Col, Switch, Button, Form, Tabs } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ProWrapper } from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import swal from '@sweetalert/with-react';
import { connect } from 'react-redux';
import {
  getContact,
  fetchCustomerTypes,
  editContact,
  remove_phone_numbers,
} from 'store/actions/contacts-new';

import MainInfoEdit from './MainInfoEdit';
import RequisitesEdit from './RequisitesEdit';
import styles from './styles.module.scss';

const { TabPane } = Tabs;

// eslint-disable-next-line no-unused-vars
const EditContact = ({
  form,
  customerTypes = [],
  getContact,
  editContactLoading,
  removeNumberLoading,
  users,
  fetchCustomerTypes,
  fetchUsers,
  remove_phone_numbers,
  editContact,
}) => {
  const { id } = useParams();
  const history = useHistory();
  const container = useRef();

  const [activeTab, setActiveTab] = useState('1');

  const {
    getFieldDecorator,
    getFieldValue,
    getFieldError,
    validateFields,
    setFieldsValue,
  } = form;

  const handleActiveTabChange = newTab => {
    setActiveTab(newTab);
  };

  const [contact, setContact] = useState({});
  const [contactInformation, setContactInformation] = useState({
    numbers: [null, null, null, null, null, null, null, null, null, null],
    emails: [null, null, null, null, null, null, null, null, null, null],
    websites: [null, null, null, null, null, null, null, null, null, null],
  });

  const [status, setStatus] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(undefined);
  const [selectedCustomerType, setSelectedCustomerType] = useState(undefined);

  const handleCategoryIds = categories => {
    const categoryIds = categories.map(category => {
      if (category === 'Client') return 1;
      if (category === 'Seller') return 2;
      if (category === 'Supplier') return 4;
      return 8;
    });
    return categoryIds;
  };

  // The contact with this id may already be deleted.

  const handleTypeId = type => {
    if (type === 'Person') return 1;
    return 2;
  };

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
    const newNumbers = getFieldValue(type).filter((_, index) => index !== id);
    setFieldsValue({
      [type]: newNumbers,
    });
    setContactInformation({ ...contactInformation, [type]: newNumbers });
  };

  const checkValues = values => {
    const newValues = values.filter(
      value => value !== null && value !== undefined && value !== ''
    );
    if (newValues.length === 0) return null;
    return newValues;
  };

  

  const handleEditContact = () => {
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
          facebook,
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

        const editedContact = {
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
          facebook: facebook || null,
          socialNetworkIds_ul: contact?.socialNetworkIds,

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

        return editContact(
          id,
          editedContact,
          () => history.goBack(),
          error => {
            let errorString = '';
            if (
              error?.response?.data?.error?.messageKey === 'same_phone_number'
            ) {
              setActiveTab('1');
              const phone_numbers = form.getFieldValue('numbers');
              const already_exists_phone_numbers = Object.keys(
                error.response.data.error.errors.data
              ).map(phoneNumber => ({
                number: phoneNumber,
                ...error.response.data.error.errors.data[phoneNumber],
              }));
              already_exists_phone_numbers.forEach(({ number, name }, key) => {
                if (key === 0) {
                  errorString += `${number} nömrəsi ${name} əlaqəsində`;
                } else {
                  errorString += `, ${number} nömrəsi ${name} əlaqəsində`;
                }
              });
              swal({
                title: 'Diqqət!',
                content: (
                  <p style={{ color: 'black' }}>
                    <span style={{ fontWeight: 700 }}>{errorString}</span> artıq
                    qeydiyyatdadır. Əməliyyatı təsdiq etsəniz, nömrə(lər) həmin
                    əlaqə(lər)in tərkibindən silinəcək. Davam etmək istədiyinizə
                    əminsiniz?
                  </p>
                ),
                buttons: ['Ləğv et', 'Təsdiq et'],
                dangerMode: true,
              }).then(isConfirmed => {
                if (isConfirmed) {
                  remove_phone_numbers(
                    {
                      ids: already_exists_phone_numbers.map(
                        ({ phoneNumberId }) => phoneNumberId
                      ),
                    },
                    () => {
                      handleEditContact();
                    }
                  );
                }
              });
              const errors = {};
              already_exists_phone_numbers.forEach(({ number }) => {
                errors[`numbers[${phone_numbers.indexOf(number)}]`] = {
                  name: `numbers[${phone_numbers.indexOf(number)}]`,
                  value: getFieldValue(
                    `numbers[${phone_numbers.indexOf(number)}]`
                  ),
                  errors: ['Bu nömrə artıq istifadə olunub.'],
                };
              });
              form.setFields(errors);
            } else if (
              error?.response?.data?.error?.messageKey ===
              'duplicate_phone_number'
            ) {
              setActiveTab('1');
              const already_exists_phone_numbers = Object.keys(
                error.response.data.error.errors.data
              ).map(index => ({
                number: error.response.data.error.errors.data[index],
                index,
                ...error.response.data.error.errors.data[index],
              }));
              const errors = {};
              already_exists_phone_numbers.forEach(({ index }) => {
                errors[`numbers[${index}]`] = {
                  name: `numbers[${index}]`,
                  value: getFieldValue(`numbers[${index}]`),
                  errors: ['Eyni nömrə təkrar daxil edilə bilməz.'],
                };
              });
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
    handleEditContact();
  };

  useEffect(() => {
    fetchCustomerTypes();
    fetchUsers({});
    getContact({ ids: [id] }, ({ data }) => {
      setContact(data[0]);
    });
    
  }, []);

  useEffect(() => {
    if (contact.type) {
      setContactInformation({
        numbers:
          contact.phoneNumbers.length === 0 ? [null] : contact.phoneNumbers,
        emails: contact.emails.length === 0 ? [null] : contact.emails,
        websites: contact.websites.length === 0 ? [null] : contact.websites,
      });

      setFieldsValue({
        type: handleTypeId(contact.type),
        status: contact.status === 'Active',
        category: contact.categories
          ? handleCategoryIds(contact.categories)
          : [],
        name: contact.name || null,
        position: contact.position || null,
        voen: contact.voen || null,
        customerType: contact.priceTypeId || 0,
        manager: contact.managerId || undefined,
        company: contact.companyId || null,
        numbers:
          contact.phoneNumbers.length === 0 ? [null] : contact.phoneNumbers,
        emails: contact.emails.length === 0 ? [null] : contact.emails,
        websites: contact.websites.length === 0 ? [null] : contact.websites,
        address: contact.address || null,
        description: contact.description || null,
        partnerToken: contact.partnerToken || null,
        facebook: contact.facebook || null,

        // Requisites data
        officialName: contact.officialName || null,
        generalDirector: contact.generalDirector || null,
        companyVoen: contact.companyVoen || null,
        bankName: contact.bankName || null,
        bankVoen: contact.bankVoen || null,
        bankCode: contact.bankCode || null,
        correspondentAccount: contact.correspondentAccount || null,
        settlementAccount: contact.settlementAccount || null,
        swift: contact.swift || null,
      });
      setStatus(contact.status === 'Active');
      if(contact.managerId){
        fetchUsers({filters:{ids:[contact.managerId ]},
          onSuccessCallback: data => {
            setSelectedUsers(data.data);
        },});
      }
      if(contact.priceTypeId){
      fetchCustomerTypes({filters:{ids:[contact.priceTypeId ]},
        onSuccessCallback: data => {
          setSelectedCustomerType(data.data);
      }
      })}
    }
  }, [contact]);

  return (
    <ProWrapper>
      <section className="operationsWrapper paper">
        <div className={styles.salesContainer} ref={container}>
          <Form
            scrollToFirstError
            onSubmit={completeOperation}
            className={styles.form}
            noValidate
          >
            <Row>
              <Col span={24} style={{ fontSize: '14px', fontWeight: '500' }}>
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
              <Col span={24} className={styles.flexBox}>
                <span className={styles.label}>Əlaqəyə düzəliş et</span>
                <div className={styles.checkboxContainer}>
                  <span className={styles.mode}>Deaktiv</span>
                  <Switch
                    style={{ margin: '0 16px' }}
                    checked={status}
                    onChange={checked => setStatus(checked)}
                  />
                  <span className={styles.mode}>Aktiv</span>
                </div>
              </Col>
              <Col>
                <Tabs
                  className={styles.tabs}
                  type="card"
                  activeKey={activeTab}
                  onTabClick={handleActiveTabChange}
                >
                  <TabPane tab="Əsas məlumat" key="1" forceRender>
                    <MainInfoEdit
                      form={form}
                      selectedUsers={selectedUsers}
                      selectedCustomerType={selectedCustomerType}
                      contactInformation={contactInformation}
                      handleAddValue={handleAddValue}
                      handleDeleteValue={handleDeleteValue}
                      customerTypes={customerTypes}
                      getFieldError={getFieldError}
                      fetchUsers={fetchUsers}
                      fetchCustomerTypes={fetchCustomerTypes}
                    />
                  </TabPane>
                  <TabPane tab="Rekvizitlər" key="2" forceRender>
                    <RequisitesEdit form={form} />
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
            <div className={styles.formAction}>
              <Button
                type="primary"
                htmlType="submit"
                loading={editContactLoading || removeNumberLoading}
              >
                Düzəliş et
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
  isLoading: state.newContactsReducer.isLoading,
  actionIsLoading: state.newContactsReducer.actionIsLoading,
  editContactLoading: state.loadings.editContact,
  removeNumberLoading: state.loadings.removePhoneNumber,
  customerTypes: state.newContactsReducer.customerTypes,
  users: state.usersReducer.users,
  contact: state.newContactsReducer.contact,
});
export default connect(
  mapStateToProps,
  {
    fetchCustomerTypes,
    getContact,
    fetchUsers,
    remove_phone_numbers,
    editContact,
  }
)(Form.create({ name: 'ContactsForm' })(EditContact));
