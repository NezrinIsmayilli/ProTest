import React, { useRef } from 'react';
import { Spin } from 'antd';
import moment from 'moment';
import {
  defaultNumberFormat,
  formatNumberToLocale,
  fullDateTimeWithSecond,
} from 'utils';
import styles from '../../../Warehouse/styles.module.scss';
import Detail from '../../../Warehouse/Products/detail';

const math = require('exact-math');

function OpDetailTab(props) {
  const {
    details,
    isLoading,
    isDeletedForLog,
    mainCurrencyCode,
    allBusinessUnits,
    profile,
  } = props;
  const {
    startDate,
    endDate,
    createdAt,
    deletedAt,
    deleted_by_lastname,
    deleted_by_name,
    isDeleted,
    contractNo,
    invoiceNumber,
    clientId,
    clientName,
    salesmanName,
    salesmanLastName,
    stockToId,
    statusOfOperation,
    planned_cost,
    cost,
    deleteReason,
    businessUnitId,
    totalQuantity,
  } = details;
  const componentRef = useRef();

  const getStatusType = (statusOfOperation, stockToId) => {
    if (statusOfOperation === 1 || isDeletedForLog) {
      if (stockToId === null) {
        return (
          <span
            className={styles.chip}
            style={{
              color: '#FFF',
              background: '#2980b9',
            }}
          >
            ─░stehsalatda
          </span>
        );
      }
      return (
        <span
          className={styles.chip}
          style={{
            color: '#FFF',
            background: '#f39c12',
          }}
        >
          Anbarda
        </span>
      );
    }
    return (
      <span
        style={{
          color: '#C4C4C4',
          background: '#3b4557',
        }}
        className={styles.chip}
      >
        Silinib
      </span>
    );
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
          <span className={styles.modalTitle}>
            {clientId ? clientName : 'Daxili sifari┼č'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center' }}></div>
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
              primary="─░cra tarixi"
              secondary={
                createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail
              primary="Sifari┼č├ži"
              secondary={clientName || 'Daxili sifari┼č'}
            />
            <Detail primary="S╔Ön╔Öd" secondary={invoiceNumber || '-'} />
            <Detail
              primary="Ba┼člama tarixi"
              secondary={
                startDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail
              primary="Bitm╔Ö tarixi"
              secondary={endDate === null? 'M├╝dd╔Ötsiz':
                endDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1') || '-'
              }
            />
            <Detail
              primary="─░stehsalat tap┼č─▒r─▒─č─▒n─▒n m├╝dd╔Öti, g├╝n"
              secondary={
                endDate
                  ? math.round(
                      math.div(
                        Number(
                          moment(endDate, fullDateTimeWithSecond).diff(
                            moment(startDate, fullDateTimeWithSecond)
                          )
                        ),
                        86400000
                      )
                    ) + 1
                  : '-'
              }
            />
            {endDate !== null && <Detail
              primary="Gecikm╔Ö, g├╝n"
              secondary={
                stockToId !== null || isDeleted
                  ? '-'
                  : math.round(
                      math.div(
                        Number(
                          moment().diff(moment(endDate, fullDateTimeWithSecond))
                        ),
                        86400000
                      )
                    ) > 0
                  ? math.round(
                      math.div(
                        Number(
                          moment().diff(moment(endDate, fullDateTimeWithSecond))
                        ),
                        86400000
                      )
                    )
                  : '-'
              }
            />}
            <Detail
              primary="Menecer"
              secondary={`${salesmanName || '-'} ${salesmanLastName || ''}`}
            />
            <Detail primary="M├╝qavil╔Ö" secondary={contractNo || '-'} />
            <Detail
              primary={`Planla┼čd─▒r─▒lm─▒┼č maya d╔Öy╔Öri, ${mainCurrencyCode}`}
              secondary={formatNumberToLocale(
                defaultNumberFormat(planned_cost || 0)
              )}
            />
            <Detail
              primary={`Faktiki maya d╔Öy╔Öri, ${mainCurrencyCode}`}
              secondary={formatNumberToLocale(defaultNumberFormat(cost || 0))}
            />
            <Detail
              primary={`Yay─▒nma, ${mainCurrencyCode}`}
              secondary={formatNumberToLocale(
                defaultNumberFormat(math.sub(planned_cost || 0, cost || 0))
              )}
            />
            <Detail
              primary="Yay─▒nma, %"
              secondary={
                planned_cost > 0
                  ? formatNumberToLocale(
                      defaultNumberFormat(
                        math.mul(
                          math.div(
                            math.sub(planned_cost || 0, cost || 0),
                            planned_cost
                          ),
                          100
                        )
                      )
                    )
                  : formatNumberToLocale(defaultNumberFormat(0))
              }
            />
            <Detail
              primary={'M╔Öhsul miqdar─▒'}
              secondary={formatNumberToLocale(
                defaultNumberFormat(totalQuantity|| 0)
              )}
            />
            <Detail
              primary="Status"
              secondary={getStatusType(statusOfOperation, stockToId)}
            />
            {isDeleted && !isDeletedForLog && (
              <>
                <Detail
                  primary="Sil╔Ön t╔Ör╔Öf"
                  secondary={`${deleted_by_name} ${deleted_by_lastname}`}
                />
                <Detail primary="Silinm╔Ö tarixi" secondary={deletedAt} />
                <Detail
                  primary="Silinm╔Ö s╔Öb╔Öbi"
                  secondary={deleteReason === 'undefined' ? '-' : deleteReason}
                />
              </>
            )}
          </ul>
        </Spin>
      </div>
    </div>
  );
}

export default OpDetailTab;
