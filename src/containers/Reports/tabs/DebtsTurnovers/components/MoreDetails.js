import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { MdPrint, MdClose } from 'react-icons/md';
import { Row, Modal, Col, Divider, Button } from 'antd';
import math from 'exact-math';
import styles from '../../styles.module.scss';

const Show = ({ title, subtitle, subClassName }) => {
  return (
    <Col span={12} style={{ marginBottom: 16 }}>
      <div className={styles.showBox}>
        <span className={styles.label}>{title}</span>
        <span className={subClassName || styles.subtitle}>
          {subtitle || '-'}
        </span>
      </div>
    </Col>
  );
};

class ComponentToPrint extends React.Component {
  render() {
    const {
      allBusinessUnits,
      profile,
      isDeletedForLog,
      data,
      tenant,
      isLog,
      isLogTransfer,
      productionInvoices,
    } = this.props;
    return (
      <div style={{ padding: 24, paddingBottom: 12 }}>
        <h6 className={styles.modalTitle}>Ətraflı - {data.documentNumber}</h6>
        <Row>
          {allBusinessUnits?.length > 1 &&
          profile.businessUnits?.length !== 1 ? (
            <Show
              title="Biznes blok"
              subtitle={
                data.businessUnitName === null
                  ? tenant?.name
                  : data.businessUnitName
              }
            />
          ) : null}
          <Show
            title={isLogTransfer ? 'Göndərən hesab' : 'Hesab'}
            subtitle={data.cashboxName}
          />
          <Show
            title="Əməliyyat növü"
            subtitle={
              data.operationDirectionName === 'Cash out'
                ? 'Məxaric'
                : data.operationDirectionName === 'Cash in'
                ? 'Mədaxil'
                : '-'
            }
          />
          {isLogTransfer ? (
            <Show title="Qəbul edən hesab" subtitle={data.toCashboxName} />
          ) : null}
          <Show
            subClassName={
              data.status === 'deleted'
                ? styles.subtitleRed
                : styles.subtitleGreen
            }
            title="Ödəniş statusu"
            subtitle={
              data.status === 'active' || isDeletedForLog
                ? 'aktiv'
                : data.status === 'deleted'
                ? 'silinib'
                : '-'
            }
          />
          <Show
            title="Xərc mərkəzi"
            subtitle={
              data.contractNo === null
                ? data.transactionType === 8 || data.transactionType === 6  || data.transactionType === 9
                  ? data.paymentInvoiceId === null
                    ? tenant?.name
                    : productionInvoices?.find(
                        item => item.id === data.paymentInvoiceId
                      )?.invoiceNumber
                  : '-'
                : data.contractNo
            }
          />
          <Show title="Kateqoriya" subtitle={data.categoryName} />
          <Show title="İcra tarixi" subtitle={data.createdAt} />
          <Show title="Alt Kateqoriya" subtitle={data.subCategoryName} />
          <Show title="Əməliyyat tarixi" subtitle={data.dateOfTransaction} />
          <Show title="Qarşı tərəf" subtitle={data.contactOrEmployee} />
          <Show
            title="Məsul şəxs"
            subtitle={`${data.createdByName} ${data.createdByLastname || ''}`}
          />
          <Show
            subClassName={
              data.operationDirectionName === 'Cash out' && styles.subtitleRed
            }
            title={isLog ? 'İlkin məbləğ' : 'Məbləğ'}
            subtitle={
              <>
                {data.operationDirectionName === 'Cash out'
                  ? isLog
                    ? `-${parseFloat(data.amount).toFixed(2)} ${
                        data.currencyCode
                      }`
                    : `-${parseFloat(data.amount).toFixed(2)}`
                  : isLog
                  ? `${parseFloat(data.amount).toFixed(2)} ${data.currencyCode}`
                  : parseFloat(data.amount).toFixed(2)}
              </>
            }
          />
          {data.transactionType === 9 && data.creditId !== null && (
            <>
              <Show
                title="Əsas borc ödənişi"
                subtitle={`${parseFloat(
                  math.sub(
                    Number(data.amount),
                    math.add(
                      Number(data.creditAmount),
                      Number(data.depositAmount)
                    )
                  )
                ).toFixed(2)} ${data.currencyCode}`}
              />
              <Show
                title="Faiz ödənişi"
                subtitle={`${parseFloat(data.creditAmount).toFixed(2)} ${
                  data.currencyCode
                }`}
              />
              <Show
                title="Depozit ödənişi"
                subtitle={`${parseFloat(data.depositAmount).toFixed(2)} ${
                  data.currencyCode
                }`}
              />
            </>
          )}
          {data.status === 'deleted' && (
            <Show title="Silinmə tarixi" subtitle={data.deletedAt || '-'} />
          )}
          {isLog ? (
            <Show
              title="Çevrilmiş məbləğ"
              subtitle={`${parseFloat(data.toAmount).toFixed(2)} ${
                data.toCurrency
              }`}
            />
          ) : (
            <Show title="Valyuta" subtitle={data.currencyCode} />
          )}
          {data.status === 'deleted' && (
            <Show
              title="Silinib"
              subtitle={`${data.deletedByName ||
                '-'} ${data.deletedByLastname || '-'}`}
            />
          )}
          <Show
            title="Məzənnə"
            subtitle={ data.invoicePaymentCustomRate !== null
                ? parseFloat(data.invoicePaymentCustomRate).toFixed(2)
                : '-'
            }
          />
          {data.status === 'deleted' && (
            <Show
              title="Silinmə səbəbi"
              subtitle={
                data.deletionReason === 'undefined' ? '-' : data.deletionReason
              }
            />
          )}
          <Show title="Ödəniş növü" subtitle={data.paymentTypeName} />
        </Row>

        <Divider style={{ marginBottom: 0 }} />
        <div className={styles.additionalInfo}>
          <span className={styles.label}>Əlavə məlumat</span>
          <p className={styles.subtitle}>{data.description || '-'}</p>
        </div>
      </div>
    );
  }
}

export function MoreDetails({
  allBusinessUnits,
  profile,
  isLogTransfer,
  isLog,
  isDeletedForLog,
  productionInvoices,
  details,
  setDetails,
  data,
  handlePrintOperation,
  tenant,
}) {
  const componentRef = useRef();
  return (
    <Modal
      className={styles.customModal}
      visible={details}
      footer={null}
      width={600}
      onCancel={() => setDetails(false)}
    >
      <ComponentToPrint
        allBusinessUnits={allBusinessUnits}
        profile={profile}
        ref={componentRef}
        data={data}
        productionInvoices={productionInvoices}
        isLogTransfer={isLogTransfer}
        isLog={isLog}
        isDeletedForLog={isDeletedForLog}
        tenant={tenant}
      />
      <div className={styles.modalAction}>
        <ReactToPrint
          trigger={() => (
            <Button
              style={{ marginRight: 6 }}
              className={styles.blueContainedButton}
            >
              <MdPrint size={18} style={{ marginRight: 4 }} />
              Çap et
            </Button>
          )}
          content={() => componentRef.current}
        />
        <Button onClick={handlePrintOperation} style={{ marginRight: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MdClose size={18} style={{ marginRight: 4 }} />
            Bağla
          </div>
        </Button>
      </div>
    </Modal>
  );
}
