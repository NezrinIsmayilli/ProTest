/* eslint-disable jsx-a11y/media-has-caption */
import React, { useMemo, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Checkbox } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FiBell } from 'react-icons/fi';
import { RiUserSharedFill, RiUserReceivedFill } from 'react-icons/ri';
import { MdDateRange } from 'react-icons/md';
import styles from './style.module.scss';

export const dotsStyle = {
  marginLeft: 1,
};
export const buttonHide = {
  WebkitAppearance: 'none',
  border: 'none',
  outline: 'none',
  background: 'transparent',
};

export const closeTools = {
  WebkitAppearance: 'none',
  border: 'none',
  width: 20,
  outline: 'none',
  background: 'transparent',
  right: 10,
};

export async function getAttachmentLink(id, callback) {
  try {
    const { data } = await axios.get(`/attachments/${id}/download?url=true`);
    callback(data.url);
  } catch (error) {
    console.log(error);
  }
}

export function TaskCard(props) {
  const { t } = useTranslation();

  const {
    tab,
    handleCheckTask,
    handleEditTask = () => {},
    moveToDoneHandle,
    task,
    deleteTaskHandle,
    profileId,
    type,
    willProgressAtResetHandle,
    willProgressAtSetHandle,
    taskDetailViewToggle,
    toTenanPersonPanelToggle,
    openEditPanel,
    children,
  } = props;
  const {
    title,
    status,
    deadlineAt,
    tenantPersonLastName,
    tenantPersonName,
    toTenantPersonName,
    priority,
    toTenantPersonLastName,
    attachment,
  } = task;

  return (
    <Row
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '12px',
      }}
      onDoubleClick={() => handleEditTask(task)}
    >
      <Col span={2}>
        <div className={styles.round}>
          <input
            type="checkbox"
            id={`checkbox-${task.id}`}
            key={task.id}
            checked={status === 2}
            onChange={event => handleCheckTask(task)}
          />
          <label htmlFor={`checkbox-${task.id}`}></label>
        </div>
        {/* <Checkbox
          size="large"
          checked={status === 2}
          onChange={event => handleCheckTask(task)}
        /> */}
      </Col>
      <Col span={20}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{title}</span>
          <span
            className={styles.deadlineAt}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color:
                deadlineAt &&
                moment(deadlineAt).diff(moment()) < 0 &&
                '#FF716A',
            }}
          >
            <MdDateRange style={{ marginRight: '5px' }} />
            {deadlineAt
              ? moment(deadlineAt).format('YYYY-MM-DD HH:mm:ss')
              : 'Təyin edilməyib'}
            {priority === 1 && (
              <span
                style={{
                  marginLeft: '5px',
                  backgroundColor: '#FF716A',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                }}
              >
                Təcili
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <RiUserSharedFill style={{ marginRight: '5px' }} />
            <span>
              {tenantPersonName} {tenantPersonLastName}
            </span>
          </span>
          {tab === 'daily' ? null : (
            <span
              style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <RiUserReceivedFill style={{ marginRight: '5px' }} />
              <span>
                {toTenantPersonName} {toTenantPersonLastName}
              </span>
            </span>
          )}

          {/* <span
            style={{
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <FiBell
              color="white"
              size={22}
              enableBackground
              style={{
                backgroundColor: '#ffa700',
                borderRadius: '50%',
                padding: '5px',
              }}
            />
          </span> */}
        </div>
      </Col>
      <Col span={2}>{children}</Col>
    </Row>
  );
}

TaskCard.propTypes = {
  task: PropTypes.object,
  moveToDoneHandle: PropTypes.func,
  deleteTaskHandle: PropTypes.func,
  profileId: PropTypes.number,
  type: PropTypes.string,
  willProgressAtResetHandle: PropTypes.func,
  willProgressAtSetHandle: PropTypes.func,
  taskDetailViewToggle: PropTypes.func,
  toTenanPersonPanelToggle: PropTypes.func,
  openEditPanel: PropTypes.func,
};
