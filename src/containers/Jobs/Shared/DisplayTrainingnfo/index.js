import React from 'react';
import { ProCollapse, ProPanel } from 'components/Lib';
import { CustomerTypeDetail } from 'containers/Jobs/Announcements/CustomerTypeDetail';
import Detail from './detail';
import styles from './styles.module.scss';

export default function DisplayVacancyInfo(props) {
  const { training } = props;

  const {
    educator,
    city,
    category,
    direction,
    minPrice,
    maxPrice,
    currency,
    hours,
    formats,
    languages,
    certification,
    stations,
    description,
    phoneNumber,
    email,
    address,
  } = training;

  return (
    <div className={styles.detailsList}>
      <Detail primary="Təlimçi" secondary={educator} />
      <Detail primary="Təlim Kateqoriyası" secondary={category?.name || ''} />
      <Detail primary="Təlim istiqaməti" secondary={direction?.name || ''} />
      <Detail
        primary="Təlim qiyməti"
        secondary={` ${minPrice || ''}${' '}
        ${
          !minPrice && !maxPrice
            ? 'Ödənişsiz'
            : minPrice && maxPrice === null
            ? ' '
            : minPrice === null && maxPrice
            ? ' '
            : '-'
        }${' '}
        ${maxPrice || ''}${' '}
        ${
          minPrice && maxPrice && currency
            ? currency.name
            : !minPrice && !maxPrice
            ? ''
            : 'AZN'
        }`}
      />
      <Detail
        primary="Sertifikatlaşdırma"
        secondary={`${certification ? 'Xeyr' : 'Bəli'}`}
      />
      <Detail
        primary="Cəmi təlim saatları"
        secondary={`${hours || ''} ${hours ? 'saat' : ''}`}
      />
      <Detail
        primary="Təlim formatı"
        secondary={formats.map(format => format.name).join(', ')}
      />
      <Detail
        primary="Təlim dili"
        secondary={languages.map(lang => lang.name).join(', ')}
      />
      <Detail primary="Şəhər" secondary={city?.name} />

      <Detail
        primary="Yaxın metro stansiyası"
        secondary={stations.map(station => station.name).join(', ') || '-'}
      />
      {description ? (
        <ProCollapse defaultActiveKey="1">
          <ProPanel header="Təlim haqqında məlumat" key="1">
            <CustomerTypeDetail text={description} />
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Təlim haqqında məlumat" secondary="-" />
      )}
      <Detail primary="Telefon" secondary={phoneNumber || '-'} />
      <Detail primary="Email" secondary={email || '-'} />
      <Detail primary="Ünvan" secondary={address || '-'} />
    </div>
  );
}
