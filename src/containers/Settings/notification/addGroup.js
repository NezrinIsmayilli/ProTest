/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal, ProSelect, ProInput, ProFormItem } from 'components/Lib';
import {
  addNotification,
  editNotification,
  fetchNotifications,
} from 'store/actions/settings/notification';
import { Button, Form } from 'antd';
import { requiredRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const AddGroupModal = props => {
  const {
    isVisible,
    form,
    addNotification,
    editNotification,
    fetchNotifications,
    toggleModal,
    notificationData,
    notification,
    selectedRowId,
    setSelectedRowId,
  } = props;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
  } = form;
  const [newSelectedNot, setNewSelectedNot] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  useEffect(() => {
    if (isVisible) {
      if (selectedRowId) {
        notification.map(not => {
          if (not.id === selectedRowId) {
            setSelectedRow(not);
          }
        });
      }
    } else {
      setSelectedRowId(undefined);
      setSelectedRow([]);
    }
  }, [selectedRowId, isVisible]);
  useEffect(() => {
    if (selectedRow && selectedRowId) {
      const selectedNot = notificationData?.filter(data => {
        if (selectedRow?.notifications?.includes(data.data)) {
          return true;
        }
        return false;
      });
      setNewSelectedNot(selectedNot);
      setFieldsValue({
        groupName: selectedRow.name,
        groupId: selectedRow.chatId,
      });
    } else {
      setNewSelectedNot([]);
      setFieldsValue({
        groupName: undefined,
        groupId: undefined,
      });
    }
  }, [selectedRow, selectedRowId]);

  const handleModal = () => {
    toggleModal();
  };

  const clearModal = () => {
    setNewSelectedNot([]);
    setFieldsValue({ groupName: undefined, groupId: undefined });
  };

  const addProduct = productIds => {
    const [productId] = productIds;
    const newProduct = notificationData.find(
      notification => notification.id === productId
    );
    setNewSelectedNot(prevNewSelectedProducts => [
      newProduct,
      ...prevNewSelectedProducts,
    ]);
  };
  const handleSelectedNotificationChange = notificationIds => {
    const newNotifications = newSelectedNot.filter(notification =>
      notificationIds.includes(notification.id)
    );
    setNewSelectedNot(newNotifications);
  };

  const handleCompleteOperation = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { groupId, groupName } = values;

        const data = {
          chat_id: groupId,
          name: groupName,
          notifications_ul: newSelectedNot.map(
            notification => notification.data
          ),
        };
        if (selectedRowId) {
          editNotification({
            id: selectedRowId,
            data,
            onSuccessCallback: () => {
              fetchNotifications();
              toggleModal();
            },
            onFailureCallback: error => {
              if (
                error?.error?.response?.data?.error?.message ===
                'This chat is already exists.'
              ) {
                return toast.error('Bu qrup ID artıq mövcuddur');
              }
            },
          });
        } else {
          addNotification({
            data,
            onSuccessCallback: () => {
              fetchNotifications();
              toggleModal();
            },
            onFailureCallback: error => {
              if (
                error?.error?.response?.data?.error?.message ===
                'This chat is already exists.'
              ) {
                return toast.error('Bu qrup ID artıq mövcuddur');
              }
            },
          });
        }
      }
    });
  };
  return (
    <ProModal
      maskClosable
      width={400}
      isVisible={isVisible}
      customStyles={styles.AddSerialNumbersModal}
      handleModal={handleModal}
    >
      <Form onSubmit={handleCompleteOperation}>
        <div className={styles.AddFromCatalog}>
          <h2>{selectedRowId ? 'Qrupa düzəliş et' : 'Qrup əlavə et'}</h2>
          <div className={styles.selectBox}>
            <ProFormItem
              label="Qrupun adı"
              help={getFieldError('groupName')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('groupName', {
                rules: [requiredRule],
              })(<ProInput placeholder="Yazın" />)}
            </ProFormItem>
          </div>
          <div className={styles.selectBox}>
            <ProFormItem
              label="Qrup ID"
              help={getFieldError('groupId')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('groupId', {
                rules: [requiredRule],
              })(<ProInput placeholder="Yazın" />)}
            </ProFormItem>
          </div>
          <div className={styles.selectBox}>
            <span className={styles.selectLabel}>Bildirişlər</span>
            <ProSelect
              mode="multiple"
              data={
                [...newSelectedNot].length > 0
                  ? notificationData.filter(
                      notification =>
                        ![
                          ...newSelectedNot.map(
                            newSelectedProduct => newSelectedProduct.id
                          ),
                        ].includes(notification.id)
                    )
                  : notificationData
              }
              value={undefined}
              onChange={addProduct}
            />
          </div>
          <div className={styles.selectBox}>
            <span className={styles.selectLabel}>Seçilmiş bildirişlər</span>
            <ProSelect
              mode="multiple"
              data={newSelectedNot}
              value={newSelectedNot.map(
                newSelectedProduct => newSelectedProduct.id
              )}
              onChange={handleSelectedNotificationChange}
            />
          </div>
          <div className={styles.button}>
            <Button
              type="primary"
              className={styles.confirmButton}
              htmlType="submit"
            >
              Təsdiq et
            </Button>
            <Button
              className={styles.cancelButton}
              type="danger"
              onClick={clearModal}
            >
              Sıfırla
            </Button>
          </div>
        </div>
      </Form>
    </ProModal>
  );
};
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {
    addNotification,
    editNotification,
    fetchNotifications,
  }
)(Form.create({ name: 'NotificationForm' })(AddGroupModal));
