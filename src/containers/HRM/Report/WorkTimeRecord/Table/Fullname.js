/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { Button } from 'antd';
import { InfoCard } from 'components/Lib';
import styles from '../styles.module.scss';

const Fullname = props => {
  const {
    employeeName,
    employeeSurname,
    employeePatronymic,
    employeeOccupationName,
    employeeAttachmentUrl,
    onDelete,
    isDeleteLoading,
    canDelete,
  } = props;

  const [isLoading, setLoading] = useState(() => isDeleteLoading);

  function handleClick(e) {
    e.stopPropagation();
    setLoading(true);
    onDelete();
  }

  useEffect(() => {
    if (!isDeleteLoading) {
      setLoading(false);
    }
  }, [isDeleteLoading]);

  return (
    <div className={`${styles.fullname} ${isLoading ? styles.active : ''}`}>
      <span className={styles.textWrap}>
        <InfoCard
          name={employeeName}
          surname={employeeSurname}
          patronymic={employeePatronymic}
          occupationName={employeeOccupationName}
          attachmentUrl={employeeAttachmentUrl}
          width="32px"
          height="32px"
        />
      </span>

      <Button
        type="link"
        icon="delete"
        className={styles.button}
        onClick={handleClick}
        loading={isLoading}
        style={{ visibility: canDelete ? 'visible' : 'hidden' }}
      />
    </div>
  );
};

export default Fullname;
