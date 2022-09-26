import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Button, Collapse } from 'antd';
import styles from '../../../Warehouse/styles.module.scss';
import Detail from '../../../Warehouse/Products/detail';

const { Panel } = Collapse;

function OpFinOpInvoiceMoreDetails({ onCancel, row }) {
  const {
    cashboxName,
    status,
    dateOfTransaction,
    createdAt,
    createdByName,
    createdByLastname,
    operationDirectionName,
    categoryName,
    subCategoryName,
    contactOrEmployee,
    amount,
    currencyCode,
    invoicePaymentRate,
    invoicePaymentCustomRate,
    paymentTypeName,
    description,
  } = row;
  const componentRef = useRef();
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Button
        onClick={onCancel}
        type="link"
        style={{
          alignSelf: 'flex-start',
          marginLeft: -24,
        }}
        className={styles.backBtn}
      >
        <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
        Ətraflı məlumat
      </Button>
      <div
        style={{
          marginTop: 16,
          width: 'calc(100% + 32px)',
        }}
      >
        <div ref={componentRef} style={{ padding: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span className={styles.modalTitle}>Əlavə məlumat</span>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ReactToPrint
                trigger={() => (
                  <Button
                    className={styles.customSquareButton}
                    style={{ marginRight: 10 }}
                    shape="circle"
                    icon="printer"
                  />
                )}
                content={() => componentRef.current}
              />

              <Button
                className={styles.customSquareButton}
                shape="circle"
                icon="file-excel"
              />
            </div>
          </div>

          <ul className={styles.detailsList}>
            <Detail primary="Hesab" secondary={cashboxName || '-'} />
            <Detail
              primary="Əməliyyatın tipi"
              secondary={
                status === 'deleted' ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#C4C4C4',
                      background: '#F8F8F8',
                    }}
                  >
                    Silinib
                  </span>
                ) : (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#F3B753',
                      background: '#FDF7EA',
                    }}
                  >
                    Aktiv
                  </span>
                )
              }
            />

            <Detail primary="Tarix" secondary={dateOfTransaction || '-'} />
            <Detail primary="Yaradılma tarixi" secondary={createdAt || '-'} />
            <Detail
              primary="Yaradıb"
              secondary={`${createdByName} ${createdByLastname || ''}`}
            />
            <Detail
              primary="Əməliyyatın tipi"
              secondary={
                operationDirectionName === 'Cash in'
                  ? 'Mədaxil'
                  : 'Məxaric' || '-'
              }
            />
            <Detail primary="Kateqoriya" secondary={categoryName || '-'} />

            <Detail
              primary="Alt kateqoriya"
              secondary={subCategoryName || '-'}
            />
            <Detail
              primary="Qarşı tərəf"
              secondary={contactOrEmployee || '-'}
            />
            <Detail
              primary="Qiymət"
              secondary={
                operationDirectionName === 'Cash out'
                  ? `-${parseFloat(amount).toFixed(2)}`
                  : parseFloat(amount).toFixed(2)
              }
            />

            <Detail primary="Valyuta" secondary={currencyCode} />
            <Detail
              primary="Valyuta dəyəri"
              secondary={invoicePaymentCustomRate !== null
                  ? parseFloat(invoicePaymentCustomRate).toFixed(2)
                  : '-'
              }
            />
            <Detail primary="Ödəniş növü" secondary={paymentTypeName} />

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
              <Detail primary="Əlavə məlumat" secondary="-" />
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default OpFinOpInvoiceMoreDetails;
