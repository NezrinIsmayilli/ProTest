import React, { useRef } from 'react';
import { Collapse, Spin } from 'antd';
import { defaultNumberFormat, formatNumberToLocale, roundToDown } from 'utils';
import styles from 'containers/Warehouse/styles.module.scss';
import Detail from 'containers/Warehouse/Products/detail';

const math = require('exact-math');

const { Panel } = Collapse;

function OpDetailTab(props) {
  const { details, isLoading } = props;
  const {
    amount,
    agentName,
    agentSurname,
    operatorName,
    operatorLastname,
    operationDate,
    createdAt,
    deletedAt,
    deleted_by_lastname,
    deleted_by_name,
    isDeleted,
    counterparty,
    contractNo,
    invoiceNumber,
    recieved,
    paidAmount,
    currencyCode,
    discountAmount,
    taxCurrencyCode,
    taxAmount,
    endPrice,
    mainCurrencyCode,
    endPriceInMainCurrency,
    salesmanName,
    salesmanLastName,
    description,
    statusOfOperation,
    invoiceType,
    paymentStatus,
    stockFromName,
    stockToName,
    stockName,
  } = details;
  const componentRef = useRef();

  const getStatusType = statusOfOperation => {
    switch (statusOfOperation) {
      case 1:
        return (
          <span
            className={styles.chip}
            style={{
              color: '#F3B753',
              background: '#FDF7EA',
            }}
          >
            Aktiv
          </span>
        );
      case 2:
        return (
          <span
            style={{
              color: '#B16FE4',
              background: '#F6EEFC',
            }}
            className={styles.chip}
          >
            Qaralama
          </span>
        );
      case 3:
        return (
          <span
            style={{
              color: '#C4C4C4',
              background: '#F8F8F8',
            }}
            className={styles.chip}
          >
            Silinib
          </span>
        );
      default:
        break;
    }
  };
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
          <span className={styles.modalTitle}>{counterparty}</span>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* <ReactToPrint
              trigger={() => (
                <Button
                  className={styles.customSquareButton}
                  style={{ marginRight: 10 }}
                  shape="circle"
                  icon="printer"
                />
              )}
              content={() => componentRef.current}
            /> */}
          </div>
        </div>

        <Spin spinning={isLoading}>
          <ul className={styles.detailsList}>
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
            <Detail
              primary="Əməliyyatın tarixi"
              secondary={operationDate?.split('  ') || '-'}
            />
            <Detail
              primary="Əməliyyatın statusu"
              secondary={getStatusType(statusOfOperation)}
            />
            {isDeleted && (
              <>
                <Detail
                  primary="Silinib"
                  secondary={`${deleted_by_name} ${deleted_by_lastname}`}
                />
                <Detail primary="Silinmə tarixi" secondary={deletedAt} />
              </>
            )}

            <Detail
              primary="Əməliyyat növü"
              secondary={
                invoiceType === 1
                  ? 'Alış'
                  : invoiceType === 2
                  ? 'Satış'
                  : invoiceType === 3
                  ? 'Geri alma'
                  : invoiceType === 4
                  ? 'Geri qaytarma'
                  : invoiceType === 5
                  ? 'Transfer'
                  : invoiceType === 6
                  ? 'Silinmə'
                  : invoiceType === 10
                  ? 'İdxal alışı'
                  : invoiceType === 11
                  ? 'İstehsalat'
                  : 'Qaralama'
              }
            />

            <Detail primary="Qarşı tərəf" secondary={counterparty || '-'} />
            <Detail primary="Müqavilə" secondary={contractNo || '-'} />
            {invoiceType === 5 ? (
              <>
                <Detail
                  primary="Anbar(Haradan)"
                  secondary={stockFromName || '-'}
                />
                <Detail
                  primary="Anbar(Haraya)"
                  secondary={stockToName || '-'}
                />
              </>
            ) : (
              <Detail primary="Anbar" secondary={stockName || '-'} />
            )}
            <Detail primary="Qaimə" secondary={invoiceNumber || '-'} />
            <Detail
              primary="Ödəniş statusu"
              secondary={
                isDeleted === true || statusOfOperation === 2 ? (
                  <span
                    className={styles.chip}
                    style={{
                      fontWeight: 'normal',
                    }}
                  >
                    -
                  </span>
                ) : paymentStatus === 3 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#55AB80',
                      background: '#EBF5F0',
                    }}
                  >
                    Ödənilib
                  </span>
                ) : paymentStatus === 1 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#4E9CDF',
                      background: '#EAF3FB',
                    }}
                  >
                    Açıq
                  </span>
                ) : paymentStatus === 2 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#4E9CDF',
                      background: '#EAF3FB',
                    }}
                  >
                    Qismən ödənilib
                  </span>
                ) : (
                  '-'
                )
              }
            />
            <Detail
              primary="Ödənilməlidir"
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(
                        Number(endPrice) -
                          Number(
                            invoiceType === 1 || invoiceType === 3
                              ? paidAmount
                              : recieved || 0
                          )
                      )
                    )} ${currencyCode}`
              }
            />

            <Detail
              primary="Məbləğ"
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : amount
                  ? `${formatNumberToLocale(
                      defaultNumberFormat(amount)
                    )} ${currencyCode}`
                  : '-'
              }
            />
            <Detail
              primary={`Endirim(${formatNumberToLocale(
                defaultNumberFormat(
                  roundToDown(
                    math.div(
                      math.mul(Number(discountAmount || 0) || 0, 100),
                      amount || 0
                    ),
                    4
                  )
                )
              ) || ''}%)`}
              secondary={
                discountAmount
                  ? `${formatNumberToLocale(
                      defaultNumberFormat(discountAmount)
                    )} ${currencyCode}`
                  : '-'
              }
            />
            {invoiceType === 10 ? null : (
              <Detail
                primary={`Vergi(${formatNumberToLocale(
                  defaultNumberFormat(
                    roundToDown(
                      math.div(
                        math.mul(Number(taxAmount || 0) || 0, 100),
                        endPrice || 0
                      ),
                      4
                    )
                  )
                ) || ''}%)`}
                secondary={
                  taxAmount
                    ? `${formatNumberToLocale(
                        defaultNumberFormat(taxAmount)
                      )} ${taxCurrencyCode}`
                    : '-'
                }
              />
            )}

            <Detail
              primary="Son qiymət"
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(endPrice)
                    )} ${currencyCode || ''}`
              }
            />
            <Detail
              primary={`Son qiymət (${mainCurrencyCode || ''})`}
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(endPriceInMainCurrency)
                    )} ${mainCurrencyCode || currencyCode}`
              }
            />
            <Detail
              primary="Satış meneceri"
              secondary={`${salesmanName || '-'} ${salesmanLastName || ''}`}
            />
            <Detail
              primary="Agent"
              secondary={`${agentName || '-'} ${agentSurname || ''}`}
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

export default OpDetailTab;
