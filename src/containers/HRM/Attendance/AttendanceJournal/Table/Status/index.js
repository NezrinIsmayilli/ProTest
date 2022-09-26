import React from 'react';

// utils
import { employeeActivityTypes } from 'utils';

import { Tag } from 'antd';

// icons
import { ReactComponent as CheckFill } from 'assets/img/icons/checkfilled.svg';
import { ReactComponent as Permission } from 'assets/img/icons/permission.svg';
import { ReactComponent as Vacation } from 'assets/img/icons/vacation.svg';
import { ReactComponent as Businesstrip } from 'assets/img/icons/businesstrip.svg';
import { ReactComponent as Illness } from 'assets/img/icons/illnessred.svg';
import { ReactComponent as Appointment } from 'assets/img/icons/appoinment.svg';

import styles from './status.module.scss';

const {
  CAME, // 1
  DIDNOTCOME, // 2
  TIME_OFF, // 3
  VACATION, // 4
  BUSINESS_TRIP, // 5
  SICK_LEAVE, // 6
  APPOINTMENT, // 7
} = employeeActivityTypes;

const renderStatus = {
  [CAME]: value => (
    <span className={`${styles.came} ${styles.shared}`}>
      <CheckFill />
      {value}
    </span>
  ),

  [DIDNOTCOME]: value => (
    <Tag color="#EB5757" className={styles.tag}>
      {value}
    </Tag>
  ),

  [TIME_OFF]: value => (
    <span className={`${styles.permission} ${styles.shared}`}>
      <Permission /> {value}
    </span>
  ),

  [VACATION]: value => (
    <span className={`${styles.vacation} ${styles.shared}`}>
      <Vacation /> {value}
    </span>
  ),

  [BUSINESS_TRIP]: value => (
    <span className={`${styles.trip} ${styles.shared}`}>
      <Businesstrip /> {value}
    </span>
  ),

  [SICK_LEAVE]: value => (
    <span className={`${styles.sick} ${styles.shared}`}>
      <Illness /> {value}
    </span>
  ),

  [APPOINTMENT]: value => (
    <span className={`${styles.appointment} ${styles.shared}`}>
      <Appointment /> {value}
    </span>
  ),
};

export default function Status(props) {
  const { value, type } = props;
  return renderStatus[type](value);
}
