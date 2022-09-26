import React, { useState } from 'react';

import { InfoBoxItem } from 'components/Lib';

import { ReactComponent as PermissionIcon } from 'assets/img/icons/permission.svg';

import TimeOffForm from '../Shared/Operations/TimeOffForm';
import OperationDeleteModal from '../Shared/Operations/OperationDeleteModal';

import { ActionButtons } from './ActionButtons';

import styles from './styles.module.scss';

function TimeOffOperation(props) {
  const { infoData, removeOperationType } = props;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  function onOperationChangeCancel() {
    setEditInfo(false);
  }

  if (!editInfo) {
    const {
      orderNumber,
      timeOffReasonName,
      note,
      startDate,
      endDate,
      createdByName,
      createdByLastname,
    } = infoData;

    return (
      <div className={styles.operationBox}>
        <div
          className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
        >
          <span className={`${styles.permissionBg} ${styles.sharedStyle}`}>
            <PermissionIcon />
          </span>

          <h3>İcazə</h3>
        </div>
        <div className={styles.padding24}>
          <InfoBoxItem label="Sənədin nömrəsi" text={orderNumber} />
          <InfoBoxItem label="Başlama tarixi" text={startDate} />
          <InfoBoxItem label="Bitmə tarixi" text={endDate} />
          <InfoBoxItem label="Səbəb" text={timeOffReasonName} />
          <InfoBoxItem label="Qeyd" text={note} />
          <InfoBoxItem
            label="Əməliyyatçı"
            text={`${createdByName}  ${createdByLastname}`}
          />

          <ActionButtons
            setIsOpenDeleteModal={() => setIsOpenDeleteModal(true)}
            setEditInfo={() => setEditInfo(true)}
          />
        </div>
        <OperationDeleteModal
          isOpenDeleteModal={isOpenDeleteModal}
          id={infoData.id}
          setIsOpenDeleteModal={() => setIsOpenDeleteModal(false)}
          removeOperationType={removeOperationType}
        />
      </div>
    );
  }
  if (editInfo) {
    return (
      <TimeOffForm
        infoData={infoData}
        isEdit={editInfo}
        handleCancel={onOperationChangeCancel}
      />
    );
  }
}

export default TimeOffOperation;
