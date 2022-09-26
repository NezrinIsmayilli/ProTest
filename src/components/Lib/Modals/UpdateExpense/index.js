/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Form, Radio } from 'antd';
import { ProFormItem, AddButton, ProModal } from 'components/Lib';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import { updateExpenseCatalog } from 'store/actions/expenseCatalog';
import { updateExpenseItem } from 'store/actions/expenseItem';
import errorMessages from 'utils/errors';
import { apiErrorMessageResolver, expenseTypes } from 'utils';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const UpdateExpense = props => {
  const {
    defaultUpdateData,
    isVisible = false,
    isLoading = false,
    handleModal,
    updateExpenseCatalog,
    updateExpenseItem,
    onSuccessCatalogUpdate,
    onSuccessItemUpdate,
    form,
    // Loadings
    creatingExpenseCatalog,
    editingExpenseCatalog,
    creatingExpenseItem,
    editingExpenseItem,
  } = props;

  const {
    id,
    parentId,
    parentName,
    type = 'catalog',
    expenseType = 1,
    name,
    editType = 'new',
  } = defaultUpdateData;

  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    setFields,
    getFieldValue,
    resetFields,
  } = form;

  const getHeaderName = (type, editType) => {
    if (type === 'catalog' && editType === 'new') {
      return 'Yeni xərc maddəsi';
    }
    if (type === 'item' && editType === 'new') {
      return 'Yeni xərc adı';
    }
    if (type === 'catalog' && editType === 'edit') {
      return 'Xərc maddəsinə düzəliş et';
    }
    if (type === 'item' && editType === 'edit') {
      return 'Xərc adına düzəliş et';
    }
  };

  const handleError = (error, fieldName) => {
    const errorKey = error?.response?.data?.error?.messageKey;
    if (errorKey) {
      setFields({
        name: {
          value: getFieldValue(fieldName),
          errors: [new Error(errorMessages[errorKey])],
        },
      });
    } else {
      toast.error(apiErrorMessageResolver(error));
    }
  };
  const handleExpenseSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { name, type: expenseType } = values;
        const newExpenseData = {
          name,
        };
        if (type === 'catalog') {
          updateExpenseCatalog(
            id,
            { ...newExpenseData, type: expenseType },
            data => {
              onSuccessCatalogUpdate(data);
              resetFields();
            },
            ({ error }) => {
              handleError(error, 'name');
            }
          );
        } else {
          updateExpenseItem(
            id,
            { ...newExpenseData, transactionCatalog: parentId },
            data => {
              onSuccessItemUpdate(data);
              resetFields();
            },
            ({ error }) => {
              handleError(error, 'name');
            }
          );
        }
      }
    });
  };

  useEffect(() => {
    if (name) {
      setFieldsValue({ name, type: expenseType });
    } else {
      setFieldsValue({ name: undefined, type: expenseType });
    }
  }, [isVisible]);

  return (
    <ProModal
      maskClosable
      isVisible={isVisible}
      width={600}
      isLoading={isLoading}
      handleModal={handleModal}
    >
      <div className={styles.modalContainer}>
        <h2>
          {getHeaderName(type, editType)}
          {parentName ? ` - ${parentName}` : ''}
        </h2>
        <Form onSubmit={handleExpenseSubmit}>
          <ProFormItem
            label={type === 'catalog' ? `Xərc maddəsi adı` : `Xərc adı`}
            customStyle={styles.formItem}
            help={getFieldError('name')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('name', {
              rules: [requiredRule, minLengthRule, shortTextMaxRule],
            })(<Input size="large" placeholder="Yazın" />)}
          </ProFormItem>
          <ProFormItem
            label="Xərc növü"
            help={getFieldError('type')?.[0]}
            customStyle={styles.formItem}
            hidden={type === 'item'}
          >
            {getFieldDecorator('type', {
              rules: [],
            })(
              <Radio.Group style={{ fontSize: '14px' }}>
                {expenseTypes.map(({ id, label }) => (
                  <Radio value={id} key={id}>
                    {label}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </ProFormItem>
          <AddButton
            loading={
              creatingExpenseCatalog ||
              creatingExpenseItem ||
              editingExpenseCatalog ||
              editingExpenseItem
            }
            htmlType="submit"
            label={editType === 'new' ? 'Əlavə et' : 'Düzəliş et '}
          />
        </Form>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.catalogsReducer.isLoading,
  actionLoading: state.catalogsReducer.actionLoading,
  creatingExpenseCatalog: state.loadings.createExpenseCatalog,
  editingExpenseCatalog: state.loadings.editExpenseCatalog,
  creatingExpenseItem: state.loadings.createExpenseItem,
  editingExpenseItem: state.loadings.editExpenseItem,
});

export const UpdateExpenseModal = connect(
  mapStateToProps,
  {
    updateExpenseCatalog,
    updateExpenseItem,
  }
)(Form.create({ name: 'ExpenseForm' })(UpdateExpense));
