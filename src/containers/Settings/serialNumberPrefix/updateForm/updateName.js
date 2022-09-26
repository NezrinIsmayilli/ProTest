import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import { documentTextMaxRule, minLengthRule } from 'utils/rules';
import {
  fetchSalesBuysForms,
  updateForms,
} from 'store/actions/settings/serialNumberPrefix';
import { ProFormItem, ProButton, ProInput } from 'components/Lib';
import styles from './styles.module.scss';

const UpdateNameModal = props => {
  const {
    form,
    selectedRow,
    updateForms,
    toggleNameModal,
    setSelectedRow,
    fetchSalesBuysForms,
  } = props;
  const {
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    validateFields,
  } = form;
  const [newName, setNewName] = useState('');
  const handleInputChange = event => {
    setNewName(event.target.value);
  };
  useEffect(() => {
    if (selectedRow) {
      setNewName(selectedRow.name);
      setFieldsValue({ name: selectedRow.name });
    }
  }, [selectedRow]);
  const handleCreateUnitStocks = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { name } = values;
        const data = {
          name: name,
          type: selectedRow.invoiceType,
          attachment: null,
        };
        updateForms({
          data,
          id: Number(selectedRow.id),
          onSuccessCallback: () => {
            fetchSalesBuysForms();
            toggleNameModal();
            setSelectedRow([]);
          },
        });
      }
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Sənəd adı</h2>
      <Form onSubmit={handleCreateUnitStocks}>
        <ProFormItem
          label=""
          help={getFieldError('name')?.[0]}
          style={{ marginBottom: '20px' }}
        >
          {getFieldDecorator('name', {
            rules: [minLengthRule, documentTextMaxRule],
          })(<ProInput value={newName} onChange={handleInputChange} />)}
        </ProFormItem>
        <div>
          <ProButton htmlType="submit">Təsdiq et</ProButton>
        </div>
      </Form>
    </div>
  );
};

const mapStateToProps = state => ({});

export const UpdateName = connect(
  mapStateToProps,
  {
    fetchSalesBuysForms,
    updateForms,
  }
)(Form.create({ name: 'AddProduct' })(UpdateNameModal));
