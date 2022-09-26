/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Form, Modal } from 'antd';
import { ProFormItem, ProSelect } from 'components/Lib';
import MaskedInput from 'antd-mask-input';
import {
  fetchCustomerTypes,
  createContact,
  fetchClients,
  remove_phone_numbers,
} from 'store/actions/contacts-new';
import swal from '@sweetalert/with-react';
import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';
import { contactTypes, contactCategories } from 'utils';
import styles from '../styles.module.scss';

const NewContact = ({
  form,
  visible,
  toggleVisible,
  newContactLoading,
  removeContactLOading,
  fetchCustomerTypes,
  createContact,
  fetchClients,
  setData,
  remove_phone_numbers,
}) => {
  const {
    getFieldDecorator,
    getFieldValue,
    getFieldError,
    validateFields,
  } = form;

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const handleCreateContact = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const {
          type,
          category,
          name,
          position,
          voen,
          priceType,
          manager,
          company,
          address,
          description,
          phone,
        } = values;

        const newContact = {
          type,
          status: 1,
          category_ul: category,
          name: name || null,
          position: position || null,
          voen: voen || null,
          priceType: priceType || null,
          manager: manager || null,
          company: company || null,
          phoneNumbers_ul: phone ? [phone] : null,
          emails_ul: null,
          websites_ul: null,
          socialNetworkIds_ul: [],
          address: address || null,
          description: description || null,
          partnerToken: null,
        };
        return createContact(
          newContact,
          () => {
            toggleVisible(false);
            fetchClients();
            setData(newContact);
          },
          error => {
            let errorString = '';
            if (
              error?.response?.data?.error?.messageKey ===
              'same_phone_number'
          ) {
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
              form.setFields({
                  phone: {
                      name: 'phone',
                      value: getFieldValue('phone'),
                      errors: ['Bu nömrə artıq istifadə olunub.'],
                  },
              });
          } else if (
              error?.response?.data?.error?.messageKey ===
              'contact_is_already_exists'
            ) {
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
    });
  };
  const completeOperation = e => {
    e.preventDefault();
    handleCreateContact();
  };

  const options = [];
  Object.values(contactCategories).map(i => {
    options.push({
      id: i.id,
      name: i.name,
      disabled: i.id === 1,
    });
  });

  return (
    <Modal
      visible={visible}
      onCancel={() => toggleVisible(false)}
      closable={false}
      centered
      footer={null}
      className={styles.customModal}
      destroyOnClose
      // maskClosable={false}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => toggleVisible(false)}
      >
        <img
          id="warehouse"
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.contactAddModal}>
        <div style={{ marginBottom: '20px' }}>
          <span className={styles.header}>Yeni Əlaqə</span>
        </div>
        <Form onSubmit={completeOperation} className={styles.form} noValidate>
          <ProFormItem
            label="Əlaqə adı"
            name="name"
            help={getFieldError('name')?.[0]}
            customStyle={styles.formItem}
          >
            {getFieldDecorator('name', {
              rules: [requiredRule, minLengthRule, mediumTextMaxRule],
            })(
              <Input
                size="large"
                className={styles.select}
                placeholder="Yazın"
              />
            )}
          </ProFormItem>
          <ProFormItem
            label="Əlaqə tipi"
            help={getFieldError('type')?.[0]}
            customStyle={styles.formItem}
          >
            {getFieldDecorator('type', {
              rules: [requiredRule],
            })(<ProSelect data={contactTypes} />)}
          </ProFormItem>
          <ProFormItem
            label="Kateqoriya"
            help={getFieldError('category')?.[0]}
            customStyle={styles.formItem}
          >
            {getFieldDecorator('category', {
              rules: [requiredRule],
              initialValue: [options[0].id],
            })(
              <ProSelect
                className={styles.selected}
                mode="multiple"
                keys={['name']}
                data={options}
                allowClear={false}
              />
            )}
          </ProFormItem>
          <ProFormItem
              label="Mobil telefon"
              help={getFieldError(`phone`)?.[0]}
              customStyle={styles.formItem}
          >
              <div
                  style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                  }}
              >
                  {getFieldDecorator(`phone`, {
                      rules: [
                          {
                              min: 12,
                              message:
                                  'Nömrə düzgün daxil edilməyib.',
                              transform: value => {
                                  if (value) {
                                      const number = String(value)
                                          .replace(/ /g, '')
                                          .replace(/_/g, '')
                                          .replace(/-/g, '')
                                          .replace('(', '')
                                          .replace(')', '');
                                      if (number) return number;
                                  }
                                  return `(111) 11 111 11 11`;
                              },
                          },
                      ],
                  })(
                      <MaskedInput
                          size="large"
                          mask="(111) 11 111 11 11"
                          className={`${styles.select} ${styles.addNumber}`}
                          placeholder="(xxx) xx xxx xx xx"
                      />
                  )}
              </div>
          </ProFormItem>
          <Button
            size="large"
            style={{ width: '100%' }}
            className={styles.button}
            htmlType="submit"
            loading={newContactLoading || removeContactLOading}
          >
            Əlavə et
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  newContactLoading: state.loadings.newContact,
  removeNumberLoading: state.loadings.removePhoneNumber,
  customerTypes: state.newContactsReducer.customerTypes,
});
export default connect(
  mapStateToProps,
  {
    fetchCustomerTypes,
    createContact,
    fetchClients,
    remove_phone_numbers,
  }
)(Form.create({ name: 'ContactsForm' })(NewContact));
