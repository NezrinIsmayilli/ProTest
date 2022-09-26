import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Spin, Button, Tooltip, Icon } from 'antd';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { deleteModalHelper } from 'utils';
import { Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { deleteNotifications } from 'store/actions/settings/notification';
import AddGroupModal from './addGroup';
import styles from '../index.module.sass';

function Telegram(props) {
  const { isLoading, notification, deleteNotifications } = props;
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(undefined);
  const notificationData = [
    {
      id: 1,
      name: 'Müqavilə',
      data: 'contract',
    },
    {
      id: 2,
      name: 'Ticarət',
      data: 'sales',
    },
    {
      id: 3,
      name: 'Mədaxil',
      data: 'cash_in',
    },
    {
      id: 4,
      name: 'Məxaric',
      data: 'cash_out',
    },
    {
      id: 5,
      name: 'Sifariş',
      data: 'order',
    },
  ];
  const toggleCatalogModal = () => {
    setCatalogModalIsVisible(prevValue => !prevValue);
  };
  const deleteHandle = useCallback(
    id => deleteModalHelper(() => deleteNotifications(id)),
    []
  );
  const editHandle = id => {
    setSelectedRowId(id);
    toggleCatalogModal();
  };
  return (
    <div>
      <AddGroupModal
        isVisible={catalogModalIsVisible}
        toggleModal={toggleCatalogModal}
        notificationData={notificationData}
        notification={notification}
        selectedRowId={selectedRowId}
        setSelectedRowId={setSelectedRowId}
      />
      <div className={styles.body}>
        <Can I={accessTypes.manage} a={permissions.telegram_notifications}>
          <div className={styles['btn-container']}>
            <Button
              onClick={toggleCatalogModal}
              disabled={notification.length > 3}
              icon="plus"
              size="large"
              type="primary"
            >
              Yeni qrup
            </Button>
          </div>
        </Can>
      </div>
      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={`${styles['table-msk']} ${
                styles['table-msk-notification']
              }`}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>Qrup adı</th>
                  <th>Qrup İD</th>
                  <th>Bildirişlər</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {notification.map(
                  ({ id, name, chatId, notifications }, index) => (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{name}</td>
                      <td>{chatId}</td>
                      <td>
                        {notifications ? (
                          notifications.length > 1 ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              {notificationData.map(data =>
                                data.data === notifications[0]
                                  ? data.name
                                  : null
                              )}
                              <Tooltip
                                placement="right"
                                title={
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                    }}
                                  >
                                    {notifications.map(name =>
                                      notificationData.map(data =>
                                        data.data === name ? (
                                          <span>{data.name}</span>
                                        ) : null
                                      )
                                    )}
                                  </div>
                                }
                              >
                                <span className={styles.serialNumberCount}>
                                  {notifications.length}
                                </span>
                              </Tooltip>
                            </div>
                          ) : (
                            notificationData.map(data =>
                              data.data === notifications[0] ? data.name : null
                            )
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Can
                          I={accessTypes.manage}
                          a={permissions.telegram_notifications}
                        >
                          <Button
                            type="link"
                            onClick={() => deleteHandle(id)}
                            className={styles.delete}
                          >
                            <Icon component={FaTrash} />
                          </Button>
                          <Button
                            type="link"
                            onClick={() => editHandle(id)}
                            className={styles.edit}
                          >
                            <Icon component={FaPencilAlt} />
                          </Button>
                        </Can>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.notificationsReducer.isLoading,
  notification: state.notificationsReducer.notification,
});

export default connect(
  mapStateToProps,
  { deleteNotifications }
)(Telegram);
