import React, { useState } from 'react';
import { InfoBoxItem } from 'components/Lib';

import { ReactComponent as AppointmentIcon } from 'assets/img/icons/appoinment.svg';

import AppointmentForm from '../Shared/Operations/AppointmentForm';
import OperationDeleteModal from '../Shared/Operations/OperationDeleteModal';

import { ActionButtons } from './ActionButtons';

import styles from './styles.module.scss';

function AppointmentOperation(props) {
  const { infoData, removeOperationType } = props;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  function onOperationChangeCancel() {
    setEditInfo(false);
  }

  if (!editInfo) {
    const {
      orderNumber,
      note,
      startDate,
      endDate,
      contactName,
      createdByName,
      createdByLastname,
    } = infoData;

    return (
      <div className={styles.operationBox}>
        <div
          className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
        >
          <span className={`${styles.appointmentBg} ${styles.sharedStyle}`}>
            <AppointmentIcon />
          </span>
          <h3>İş görüşü</h3>
        </div>
        <div className={styles.padding24}>
          <InfoBoxItem label="Sənədin nömrəsi" text={orderNumber} />
          <InfoBoxItem label="Başlama tarixi" text={startDate} />
          <InfoBoxItem label="Bitmə tarixi" text={endDate} />
          <InfoBoxItem label="Görüşüləcək şəxs" text={contactName} />
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
      <AppointmentForm
        infoData={infoData}
        isEdit={editInfo}
        handleCancel={onOperationChangeCancel}
      />
    );
  }
}

export default AppointmentOperation;
