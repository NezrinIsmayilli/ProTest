import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Modal, Form } from 'antd';
import { ProFormItem, AddButton } from 'components/Lib';
import {
  createApplyType,
  fetchApplyTypes,
  editApplyType,
} from 'store/actions/settings/applyTypes';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import { toast } from 'react-toastify';
import errorMessages from 'utils/errors';
import styles from './styles.module.scss';

const UpdateApplyType = props => {
  const {
    form,
    isVisible,
    setIsVisible,
    type,
    fetchApplyTypes,
    editApplyType,
    createApplyType,
    actionLoading,
    parentApplyTypeId,
    parentApplyTypeName,
    onSuccessAddModal,
    selectedItemForUpdate,
    setParentApplyTypeName,
    editApplyTypeDefaults,
    edit,
  } = props;

  const {
    getFieldDecorator,
    getFieldValue,
    getFieldError,
    validateFields,
    setFieldsValue,
    resetFields,
    setFields,
  } = form;

  const addApplyType = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { name } = values;
        const newApplyType = {
          name,
          parent: type === 'catalog' ? null : parentApplyTypeId,
        };

        if (edit === 'edit') {
          editApplyType(
            selectedItemForUpdate,
            newApplyType,
            () => {
              setIsVisible(false);
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'appeal_type.update.duplicate.name'
              ) {
                setFields({
                  name: {
                    value: getFieldValue('name'),
                    errors: [
                      new Error(
                        type === 'catalog'
                          ? 'Bu müraciət növü artıq mövcuddur'
                          : 'Bu alt müraciət növü artıq mövcuddur'
                      ),
                    ],
                  },
                });
              }
            }
          );
        } else {
          createApplyType(
            newApplyType,
            ({ data }) => {
              toast.success('Əməliyyat uğurla tamamlandı.');
              setIsVisible(false);
              fetchApplyTypes({
                onSuccessCallback: () => {
                  onSuccessAddModal(data);
                  type === 'catalog' && setParentApplyTypeName(name);
                },
              });

              resetFields();
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'appeal_type.create.duplicate.name'
              ) {
                setFields({
                  name: {
                    value: getFieldValue('name'),
                    errors: [
                      new Error(
                        type === 'catalog'
                          ? 'Bu müraciət növü artıq mövcuddur'
                          : 'Bu alt müraciət növü artıq mövcuddur'
                      ),
                    ],
                  },
                });
              }
            }
          );
        }
      }
    });
  };

  useEffect(() => {
    if (edit === 'edit') {
      setFieldsValue({
        name: editApplyTypeDefaults.name,
      });
    } else {
      setFieldsValue({
        name: null,
      });
    }
  }, [isVisible]);
  return (
    <Modal
      closable={false}
      confirmLoading
      footer={null}
      className={styles.customModal}
      style={{ marginTop: '100px' }}
      onCancel={() => setIsVisible(false)}
      visible={isVisible}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>

      <div className={styles.addCatalogModal}>
        <h2>
          {edit === 'edit'
            ? type === 'catalog'
              ? 'Müraciət növünə düzəliş et'
              : `Alt  müraciət növünə düzəliş et`
            : type === 'catalog'
            ? 'Yeni müraciət növü'
            : `Yeni alt müraciət növü - ${parentApplyTypeName}`}
        </h2>

        <Form onSubmit={event => addApplyType(event)}>
          <ProFormItem
            label={type === 'catalog' ? `Müraciət adı` : `Alt müraciət adı`}
            customStyle={styles.formItem}
            help={getFieldError('name')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('name', {
              rules: [requiredRule, minLengthRule, shortTextMaxRule],
            })(<Input size="large" placeholder="Yazın" />)}
          </ProFormItem>
          <AddButton
            loading={actionLoading}
            htmlType="submit"
            label="Əlavə et"
          />
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.applyTypesReducer.isLoading,
  actionLoading: state.applyTypesReducer.actionLoading,
});
export const UpdateApplyModal = connect(
  mapStateToProps,
  { createApplyType, fetchApplyTypes, editApplyType }
)(Form.create({ name: 'ApplyTypeForm' })(UpdateApplyType));
