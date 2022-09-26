import React, { useState } from 'react';

import { InfoBoxItem } from 'components/Lib';

import { ReactComponent as BusinessTripIcon } from 'assets/img/icons/businesstrip.svg';

import BusinessTripForm from '../Shared/Operations/BusinessTripForm';
import OperationDeleteModal from '../Shared/Operations/OperationDeleteModal';

import { ActionButtons } from './ActionButtons';

import styles from './styles.module.scss';

function BusinessTripOperation(props) {
  const { infoData, removeOperationType } = props;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  function onOperationChangeCancel() {
    setEditInfo(false);
  }

  function countVacationDays(startDate, endDate) {
    const startDateObj = new Date(
      startDate && startDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
    );
    const endDateObj = new Date(
      endDate && endDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
    );
    const timeDiff = (endDateObj - startDateObj) / (3600 * 24 * 1000) + 1;
    return <span>{timeDiff} gun</span>;
  }
  const {
    orderNumber,
    note,
    startDate,
    endDate,
    businessTripReasonName,
    address,
    createdByName,
    createdByLastname,
  } = infoData;
  if (!editInfo) {
    return (
      <div className={styles.operationBox}>
        <div
          className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
        >
          <span className={`${styles.businessTripBg} ${styles.sharedStyle}`}>
            <BusinessTripIcon />
          </span>
          <h3>Ezamiyyət</h3>
        </div>
        <div className={styles.padding24}>
          <InfoBoxItem label="Sənədin nömrəsi" text={orderNumber} />
          <div className={styles.days}>
            <InfoBoxItem label="Başlama tarixi" text={startDate} />
            <div className={styles.dayCount}>
              {countVacationDays(startDate, endDate)}
            </div>
            <InfoBoxItem label="Bitmə tarixi" text={endDate} />
          </div>
          <InfoBoxItem label="Səbəb" text={businessTripReasonName} />
          <InfoBoxItem label="Ezam olunacaq ünvan" text={address} />
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
      <BusinessTripForm
        infoData={infoData}
        isEdit={editInfo}
        handleCancel={onOperationChangeCancel}
      />
    );
  }
}

export default BusinessTripOperation;
