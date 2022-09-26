import React from 'react';
import { GenderStatus, FamilyStatus } from 'utils';
import Detail from '../detail';
import styles from '../styles.module.scss';

// utils

export default function OriginTab(props) {
  const { vacancy, title } = props;
  const {
    companyName,
    city,
    category,
    position,
    minAndMaxSalary,
    maxSalary,
    minSalary,
    website,
    currency,
    education,
    email,
    // experience,
    gender,
    languages,
    phoneNumber,
    requirements,
    description,
    familyStatus,
    minAndMaxExperience,
  } = vacancy;

  return (
    <div style={{ margin: '5px' }}>
      <ul className={styles.detailsList}>
        <Detail primary="Vakansiya" secondary={title} />
        <Detail primary="Şirkət" secondary={companyName || '-'} />
        <Detail primary="Kateqoriya" secondary={category?.name || '-'} />
        <Detail primary="Vəzifə" secondary={position?.name || '-'} />
        <Detail primary="Şəhər" secondary={city?.name || '-'} />
        <Detail
          primary="Əmək haqqı"
          secondary={` ${minSalary || ''}${' '}
        ${!minSalary && !maxSalary ? '-' : !maxSalary ? ' ' : '-'}${' '}
        ${maxSalary || ''}${' '}
        ${
          minSalary && maxSalary && currency
            ? currency.name
            : !minSalary && !maxSalary
            ? ''
            : 'AZN'
        }`}
        />
        <Detail
          primary="İş təcrübəsi"
          secondary={`${minAndMaxExperience || '-'}`}
        />
        <Detail primary="Təhsil" secondary={education?.name || '-'} />
        <Detail primary="Email" secondary={email || '-'} />
        <Detail primary="Cins" secondary={GenderStatus?.[gender] || '-'} />
        <Detail
          primary="Ailə vəziyyəti"
          secondary={FamilyStatus?.[familyStatus] || '-'}
        />
        <Detail primary="Telefon" secondary={phoneNumber || '-'} />
        <Detail primary="Veb sayt" secondary={website || '-'} />
        <Detail
          primary="Dil bilikləri"
          secondary={languages.map(lang => lang.name).join(', ') || '-'}
        />
        <Detail primary="Ətraflı" secondary={description || '-'} />
        <Detail primary="Tələblər" secondary={requirements || '-'} />
      </ul>
    </div>
  );
}
