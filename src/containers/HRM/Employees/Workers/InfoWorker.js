import React from 'react';
import { InfoBoxItem, InfoCard } from 'components/Lib';

import styles from './styles.module.scss';

const employmentTypes = {
  1: 'Tam ştat',
  2: 'Yarım ştat',
  3: 'Ştatdan kənar',
};

function InfoWorker(props) {
  const { infoData } = props;
  const {
    name,
    surname,
    patronymic,
    occupationName,
    attachmentUrl,
    hireDate,
    contractNumber,
    workScheduleName,
    calendarName,
    finCode,
    gender,
    birthday,
    employmentType,
    currencyCode,
    email,
    mobileNumber,
    address,
    note,
    tenantPersonId,
    tenantPersonFullName,
  } = infoData;
  return (
    <div className={styles.infoBox}>
      <div className={`${styles.padding24} ${styles.header}`}>
        <InfoCard
          name={name}
          surname={surname}
          patronymic={patronymic}
          occupationName={occupationName}
          attachmentUrl={attachmentUrl}
          width="48px"
          height="48px"
        />
      </div>
      <div className={styles.padding24}>
        <InfoBoxItem label="İşə başlama tarixi" text={hireDate} />
        <InfoBoxItem label="Əmək müqaviləsi nömrəsi" text={contractNumber} />
        <InfoBoxItem label="İş qrafiki" text={workScheduleName} />
        <InfoBoxItem label="Təqvim adı" text={calendarName} />
        <InfoBoxItem label="Fin kod" text={finCode} />
        <InfoBoxItem label="Cinsi" text={gender === 1 ? 'Kişi' : 'Qadın'} />
        <InfoBoxItem label="Doğum tarixi" text={birthday} />
        <InfoBoxItem label="Ştat növü" text={employmentTypes[employmentType]} />
        <InfoBoxItem label="Ödəniş valyutası" text={currencyCode} />
        <InfoBoxItem label="Email" text={email} />
        <InfoBoxItem label="Telefon" text={mobileNumber} />
        <InfoBoxItem label="Yaşadığı ünvan" text={address} />
        <InfoBoxItem
          label="Bağlı olduğu istifadəçi"
          text={tenantPersonId ? tenantPersonFullName : '- Daxil edilməmişdir.'}
        />
        <InfoBoxItem label="Qeyd" text={note} />
      </div>
    </div>
  );
}

export default InfoWorker;
