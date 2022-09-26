import { ProCollapse, ProPanel } from 'components/Lib';
import { CustomerTypeDetail } from 'containers/Jobs/Announcements/CustomerTypeDetail';
import React from 'react';
import { GenderStatus, FamilyStatus } from 'utils';
import Detail from './detail';
import styles from './styles.module.scss';
// utils

export default function DisplayVacancyInfo(props) {
  const { vacancy } = props;

  const {
    companyName,
    city,
    category,
    position,
    minSalary,
    maxSalary,
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
    viewsCount,
    familyStatus,
    minExperience,
    maxExperience,
    workGraphic,
    fromAge,
    toAge,
  } = vacancy;

  return (
    <div className={styles.detailsList}>
      <Detail primary="Şəhər" secondary={city?.name || ''} />
      <Detail primary="Şirkət" secondary={companyName || ''} />
      <Detail primary="Kateqoriya" secondary={category?.name || ''} />
      <Detail primary="Vəzifə" secondary={position?.name || ''} />
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
        secondary={`${minExperience ? `${minExperience}` : ' '} ${'-'} ${
          maxExperience ? `${maxExperience} il` : ' '
        }`}
      />
      <Detail
        primary="Yaş aralığı"
        secondary={`${fromAge || ''} ${'-'} ${toAge || ' '}`}
      />
      <Detail primary="İş qrafiki" secondary={workGraphic?.name || '-'} />
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
        secondary={languages.map(lang => lang.name).join(', ')}
      />

      {description ? (
        <ProCollapse defaultActiveKey="1">
          <ProPanel header="Ətraflı" key="1">
            <CustomerTypeDetail text={description} />
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Ətraflı" secondary="-" />
      )}
      {requirements ? (
        <ProCollapse defaultActiveKey="2">
          <ProPanel header="Tələblər" key="2">
            <CustomerTypeDetail text={requirements} />
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Tələblər" secondary="-" />
      )}
    </div>
  );
}
