import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import Detail from '../detail';
import styles from '../styles.module.scss';

export default function DetailsTab({ data, getPaymentStatus, getStatus }) {
  return (
    <div style={{ margin: '5px' }}>
      <ul className={styles.detailsList}>
        <Detail primary="Ödəniş tarixi" secondary={data.startsAt} />
        <Detail
          primary="Qarşı tərəf"
          secondary="Prospect Cloud ERP"
          // {data.tenantName || '-'}
        />
        <Detail
          primary="Qaimə"
          secondary={
            `${'ABS'}${new Date().getFullYear()}/${data.serialNumber}` || '-'
          }
        />
        <Detail
          primary="Ödəniş statusu"
          secondary={getPaymentStatus(data.paymentStatus)}
        />
        <Detail
          primary="Məbləğ"
          secondary={
            `${formatNumberToLocale(
              defaultNumberFormat(data.price)
            )} ${'AZN'}` || '-'
          }
        />
        <Detail
          primary="Ödənilib"
          secondary={`${formatNumberToLocale(
            defaultNumberFormat(data.paidAmount) || 0
          )} ${'AZN'}`}
        />
        <Detail
          primary="Qalıq"
          secondary={`${formatNumberToLocale(
            defaultNumberFormat(data.balance)
          )} ${'AZN'}`}
        />

        <Detail primary="Gecikmə (gün)" secondary={data.latenessDays} />
        <Detail primary="Status" secondary={getStatus(data.status)} />
      </ul>
    </div>
  );
}
