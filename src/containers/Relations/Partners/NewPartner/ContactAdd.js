/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Form, Modal } from 'antd';
import { ProFormItem, ProSelect } from 'components/Lib';

import {
  fetchCustomerTypes,
  createContact,
  fetchContacts,
} from 'store/actions/contacts-new';
import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';
import { contactTypes, contactCategories } from 'utils';
import styles from './styles.module.scss';

const NewContact = ({
  form,
  visible,
  toggleVisible,
  newContactLoading,
  removeContactLOading,
  fetchCustomerTypes,
  createContact,
  fetchContacts,
  ajaxContactSelectRequest,
  setData,
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
          phoneNumbers_ul: null,
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
            fetchContacts(true);
            ajaxContactSelectRequest(1, 20, '', 1);
            setData(newContact);
          },
          error => {
            if (
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
      <div className={styles.WarehouseModal}>
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
            })(
              <ProSelect
                mode="multiple"
                data={Object.values(contactCategories)}
              />
            )}
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
    fetchContacts,
  }
)(Form.create({ name: 'ContactsForm' })(NewContact));
