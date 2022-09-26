/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { Popover, Badge, Tooltip, List } from 'antd';

import { FaBell } from 'react-icons/fa';

// actions
import { readNotificationById } from 'store/actions/apiNotifications';

import { CustomLink } from './CustomLink';

import styles from './style.module.sass';

const notificationPaths = {
  task: 'https://task.prospectsmb.com/tasks',
  appeals: '/recruitment/appeals',
  vacancy: '/recruitment/appeals',
};

const notificationTypes = {
  create: '',
  open: '/new',
  interview: '/interview',
  result: '/result',
};

function Notification({ id, text, createdAt, module, action }) {
  const dispatch = useDispatch();

  const notificationReadHandle = () => {
    dispatch(readNotificationById(id));
  };

  const modulePath = notificationPaths[module] || '';
  const tabPath = notificationTypes[action] || '';

  return (
    <CustomLink to={`${modulePath}${tabPath}`}>
      <List.Item onClick={notificationReadHandle}>
        <List.Item.Meta
          avatar={<span className={styles.gear_icon}>{<FaBell />}</span>}
          title={text}
          description={moment(createdAt).fromNow()}
        />
      </List.Item>
    </CustomLink>
  );
}

function NotificationList({ notifications, NumOfNotifications }) {
  if (NumOfNotifications === 0) {
    return <div className={styles.noNotification}>Yeni bildiriş yoxdur</div>;
  }

  return (
    <List
      className={`scrollbar ${styles.tool_popover_list}`}
      itemLayout="horizontal"
      // dataSource={[
      //   {
      //     id: 'sdkjlfks',
      //     title: 'dsdlkfjsldkfj',
      //     createdAt: '2019-07-23 03:46:41',
      //   },
      // ]}
      dataSource={notifications}
      renderItem={props => <Notification {...props} />}
    />
  );
}

function Notifications() {
  const notifications = useSelector(
    state => state.apiNotificationsReducer.notifications
  );
  const NumOfNotifications = notifications.length;

  return (
    <Popover
      placement="bottom"
      title="Bildirişlər"
      content={
        <NotificationList
          notifications={notifications}
          NumOfNotifications={NumOfNotifications}
        />
      }
      trigger="focus"
      getPopupContainer={trigger => trigger.parentNode}
      overlayClassName={styles.icon_popover_content}
    >
      <span tabIndex={0} className={styles.tool_icon}>
        <Tooltip
          placement="left"
          overlayStyle={{ fontSize: 12 }}
          title="Bildirişlər"
        >
          <Badge count={NumOfNotifications}>
            <FaBell style={{ fontSize: 22 }} />
          </Badge>
        </Tooltip>
      </span>
    </Popover>
  );
}

export default Notifications;
