import React, { useState } from 'react';
import { InfoBoxItem } from 'components/Lib';

import { ReactComponent as IllIcon } from 'assets/img/icons/illness.svg';

import SickLeaveForm from '../Shared/Operations/SickLeaveForm';
import OperationDeleteModal from '../Shared/Operations/OperationDeleteModal';

import { ActionButtons } from './ActionButtons';

import styles from './styles.module.scss';

function SickLeaveOperation(props) {
  const { infoData, removeOperationType } = props;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  function onOperationChangeCancel() {
    setEditInfo(false);
  }
  const {
    orderNumber,
    note,
    startDate,
    endDate,
    createdByName,
    createdByLastname,
  } = infoData;
  if (!editInfo) {
    return (
      <div className={styles.operationBox}>
        <div
          className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
        >
          <span className={`${styles.sickLeaveBg} ${styles.sharedStyle}`}>
            <IllIcon />
          </span>
          <h3>Xəstəlik</h3>
        </div>
        <div className={styles.padding24}>
          <InfoBoxItem label="Sənədin nömrəsi" text={orderNumber} />
          <InfoBoxItem label="Başlama tarixi" text={startDate} />
          <InfoBoxItem label="Bitmə tarixi" text={endDate} />
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
      <SickLeaveForm
        infoData={infoData}
        isEdit={editInfo}
        handleCancel={onOperationChangeCancel}
      />
    );
  }
}

export default SickLeaveOperation;
