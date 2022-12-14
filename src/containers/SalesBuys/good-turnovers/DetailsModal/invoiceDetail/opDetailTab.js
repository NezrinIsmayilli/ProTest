import React, { useRef } from 'react';
import { Collapse, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import styles from 'containers/Warehouse/styles.module.scss';
import Detail from 'containers//Warehouse/Products/detail';

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
    discount,
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
    cost,
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
              primary="??lav?? olunub"
              secondary={`${operatorName || '-'} ${operatorLastname || '-'}`}
            />
            <Detail
              primary="??cra tarixi"
              secondary={
                createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail
              primary="??m??liyyat??n tarixi"
              secondary={operationDate?.split(' ')[0] || '-'}
            />
            <Detail
              primary="??m??liyyat??n statusu"
              secondary={getStatusType(statusOfOperation)}
            />
            {isDeleted && (
              <>
                <Detail
                  primary="Silinib"
                  secondary={`${deleted_by_name} ${deleted_by_lastname}`}
                />
                <Detail primary="Silinm?? tarixi" secondary={deletedAt} />
              </>
            )}

            <Detail
              primary="??m??liyyat n??v??"
              secondary={
                invoiceType === 1
                  ? 'Al????'
                  : invoiceType === 2
                  ? 'Sat????'
                  : invoiceType === 3
                  ? 'Geri alma'
                  : invoiceType === 4
                  ? 'Geri qaytarma'
                  : invoiceType === 5
                  ? 'Transfer'
                  : invoiceType === 6
                  ? 'Silinm??'
                  : 'Qaralama'
              }
            />

            <Detail primary="Qar???? t??r??f" secondary={counterparty || '-'} />
            <Detail primary="M??qavil??" secondary={contractNo || '-'} />
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
            <Detail primary="Qaim??" secondary={invoiceNumber || '-'} />
            <Detail
              primary="??d??ni?? statusu"
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
                    ??d??nilib
                  </span>
                ) : paymentStatus === 1 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#4E9CDF',
                      background: '#EAF3FB',
                    }}
                  >
                    A????q
                  </span>
                ) : paymentStatus === 2 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#4E9CDF',
                      background: '#EAF3FB',
                    }}
                  >
                    Qism??n ??d??nilib
                  </span>
                ) : (
                  '-'
                )
              }
            />
            <Detail
              primary="??d??nilm??lidir"
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
              primary="M??bl????"
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
            {invoiceType === 10 ? null : (
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
            )}
            {Number(endPrice) ? (
              <Detail
                primary={`Vergi(${
                  cost !== null
                    ? formatNumberToLocale(
                        defaultNumberFormat(
                          roundToDown(
                            math.div(
                              math.mul(Number(taxAmount || 0) || 0, 100),
                              cost || 0
                            ),
                            4
                          )
                        )
                      )
                    : formatNumberToLocale(
                        defaultNumberFormat(
                          roundToDown(
                            math.div(
                              math.mul(Number(taxAmount || 0) || 0, 100),
                              endPrice || 0
                            ),
                            4
                          )
                        )
                      ) || ''
                }%)`}
                secondary={
                  taxAmount
                    ? `${formatNumberToLocale(
                        defaultNumberFormat(taxAmount)
                      )} ${taxCurrencyCode}`
                    : '-'
                }
              />
            ) : null}
            <Detail
              primary="Son qiym??t"
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(endPrice)
                    )} ${currencyCode || ''}`
              }
            />
            <Detail
              primary={`Son qiym??t (${mainCurrencyCode || ''})`}
              secondary={
                invoiceType === 5 || invoiceType === 6
                  ? '-'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(endPriceInMainCurrency)
                    )} ${mainCurrencyCode || currencyCode}`
              }
            />
            <Detail
              primary="Sat???? meneceri"
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
                <Panel header="??lav?? m??lumat" key="1">
                  <p>{description}</p>
                </Panel>
              </Collapse>
            ) : (
              <Detail primary="??lav?? m??lumat" secondary={description || '-'} />
            )}
          </ul>
        </Spin>
      </div>
    </div>
  );
}

export default OpDetailTab;
