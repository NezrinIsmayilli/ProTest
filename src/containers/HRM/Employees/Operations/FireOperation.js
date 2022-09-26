import React, { useState } from 'react';
import { InfoBoxItem } from 'components/Lib';

import { ReactComponent as TerminationIcon } from 'assets/img/icons/workend.svg';

import FireForm from '../Shared/Operations/FireForm';
import OperationDeleteModal from '../Shared/Operations/OperationDeleteModal';

import { ActionButtons } from './ActionButtons';

import styles from './styles.module.scss';

function FireOperation(props) {
  const { infoData, removeOperationType } = props;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  function onOperationChangeCancel() {
    setEditInfo(false);
  }
  const {
    orderNumber,
    fireReasonName,
    note,
    startDate,
    createdByName,
    createdByLastname,
  } = infoData;
  if (!editInfo) {
    return (
      <div className={styles.operationBox}>
        <div
          className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
        >
          <span className={`${styles.fireBg} ${styles.sharedStyle}`}>
            <TerminationIcon />
          </span>

          <h3>Ə.M Xitam</h3>
        </div>
        <div className={styles.padding24}>
          <InfoBoxItem label="Sənədin nömrəsi" text={orderNumber} />
          <InfoBoxItem label="Əmrin Tarixi" text={startDate} />
          <InfoBoxItem label="Səbəb" text={fireReasonName} />
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
      <FireForm
        infoData={infoData}
        isEdit={editInfo}
        handleCancel={onOperationChangeCancel}
      />
    );
  }
}

export default FireOperation;
