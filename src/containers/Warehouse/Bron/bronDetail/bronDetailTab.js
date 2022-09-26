import React, { useRef } from 'react';
import { Collapse, Spin } from 'antd';
import moment from 'moment';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../../styles.module.scss';
import Detail from '../../Products/detail';

const { Panel } = Collapse;

function BronDetailTab(props) {
  const {
    isDeletedForLog,
    details,
    isLoading,
    getStatusType,
    invoiceLength,
    tableDatas,
    allBusinessUnits,
    profile,
  } = props;
  const {
    operatorName,
    operatorLastname,
    createdAt,
    clientName,
    deletedAt,
    deleted_by_lastname,
    deleted_by_name,
    isDeleted,
    contractNo,
    invoiceNumber,
    salesmanName,
    salesmanLastName,
    description,
    orderSerialNumber,
    orderDirection,
    stockFromName,
    bronEndDate,
    businessUnitId,
    totalQuantity,
  } = details;
  const componentRef = useRef();

  const createdAtDate = moment(createdAt, 'YYYY/MM/DD HH:mm:ss');
  const bronDate = moment(bronEndDate, 'YYYY/MM/DD HH:mm:ss');

  const diff = Math.abs(Math.floor(bronDate - createdAtDate) / 1000);
  const days = Math.floor(diff / (24 * 60 * 60 * 60 * 6));

  return (
    <div style={{ marginTop: 16, width: 'calc(100% + 32px)' }}>
      <div ref={componentRef} style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <span className={styles.modalTitle}>{clientName}</span>
        </div>

        <Spin spinning={isLoading}>
          <ul className={styles.detailsList}>
            {allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1 ? (
              <Detail
                primary="Biznes blok"
                secondary={
                  allBusinessUnits?.find(({ id }) => id === businessUnitId)
                    ?.name
                }
              />
            ) : null}
            <Detail
              primary="Əlavə olunub"
              secondary={`${operatorName || '-'} ${operatorLastname || '-'}`}
            />
            <Detail
              primary="İcra tarixi"
              secondary={
                createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail primary="Sənəd" secondary={invoiceNumber || '-'} />
            <Detail primary="Anbar" secondary={stockFromName || '-'} />
            <Detail primary="Qarşı tərəf" secondary={clientName || '-'} />
            <Detail
              primary="Məhsul miqdarı"
              secondary={totalQuantity? formatNumberToLocale(defaultNumberFormat(totalQuantity)): '-'}
            />
            <Detail primary="Müqavilə" secondary={contractNo || '-'} />
            <Detail
              primary="Sifariş"
              secondary={
                orderSerialNumber
                  ? orderDirection === 1
                    ? `SFD${moment(
                        createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                        'YYYY'
                      ).format('YYYY')}/${orderSerialNumber}`
                    : `SFX${moment(
                        createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                        'YYYY'
                      ).format('YYYY')}/${orderSerialNumber}`
                  : '-'
              }
            />
            <Detail
              primary="Başlama tarixi"
              secondary={
                createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail
              primary="Bitmə tarixi"
              secondary={
                bronEndDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') ||
                'Müddətsiz'
              }
            />
            <Detail
              primary="Bron müddəti"
              secondary={bronEndDate ? parseInt(days) + 1 : '-'}
            />
            <Detail
              primary="Status"
              secondary={getStatusType(isDeleted, bronEndDate)}
            />
            {isDeleted && !isDeletedForLog && (
              <>
                <Detail
                  primary="Silinib"
                  secondary={`${deleted_by_name} ${deleted_by_lastname}`}
                />
                <Detail primary="Silinmə tarixi" secondary={deletedAt} />
              </>
            )}
            <Detail
              primary="Satış meneceri"
              secondary={`${salesmanName || '-'} ${salesmanLastName || ''}`}
            />
            {description ? (
              <Collapse
                expandIconPosition="right"
                defaultActiveKey={['1']}
                className={styles.additionalCollapse}
              >
                <Panel header="Əlavə məlumat" key="1">
                  <p>{description}</p>
                </Panel>
              </Collapse>
            ) : (
              <Detail primary="Əlavə məlumat" secondary={description || '-'} />
            )}
          </ul>
        </Spin>
      </div>
    </div>
  );
}

export default BronDetailTab;
