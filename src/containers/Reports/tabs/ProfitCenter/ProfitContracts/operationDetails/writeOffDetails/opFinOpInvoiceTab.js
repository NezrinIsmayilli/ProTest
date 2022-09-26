import React, { useRef, useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import { MdInfo } from 'react-icons/md';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';
import OpFinOpInvoiceTableAction from './opFinOpInvoiceTableAction';

const math = require('exact-math');

const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => (
  <div className={styles.columnDetailItem} style={{ marginLeft: 56 }}>
    <label
      style={{
        marginBottom: gutterBottom ? 12 : 0,
      }}
    >
      {name}
    </label>

    {secondary ? <span>{secondary}</span> : children}
  </div>
);

function OpFinOpInvoiceTab(props) {
  const componentRef = useRef();
  const { details, filteredList, mainCurrencyCode, row } = props;

  const {
    invoiceType,
    counterparty,
    counterpartyName,
    counterpartySurname,
    taxAmount,
    paidTaxAmount,
    contractNo,
    invoiceNumber,
    operationDate,
    statusOfOperation,
    endPrice,
    paidAmount,
    recieved,
  } = details;
  const [total, setTotal] = useState(0);
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
      render: value => value,
      width: 100,
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
      align: 'left',
      width: 120,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 100,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.currencyCode
        }`,
    },

    {
      title: `Məbləğ (${mainCurrencyCode?.code})`,
      dataIndex: 'amountConvertedToMainCurrency',
      key: 'amountConvertedToMainCurrency',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrencyCode?.code
        }`,
      align: 'right',
      width: 160,
    },
    {
      title: 'Əməliyyat növü',
      dataIndex: 'paymentTypeName',
      align: 'left',
      width: 120,
    },
    {
      title: 'Əlavə məlumat',
      dataIndex: 'description',
      align: 'left',
      width: 80,
      ellipsis: {
        showTitle: false,
      },
      render: info => (
        <Tooltip placement="left" title={info}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {info !== null && (
              <MdInfo
                style={{ color: '#464A4B', position: 'absolute', left: 0 }}
                size={20}
              />
            )}
            <p style={{ paddingLeft: 28, marginBottom: 0 }}>{info}</p>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '',
      dataIndex: 'id',
      width: 64,
      align: 'right',
      render: (id, row) => (
        <OpFinOpInvoiceTableAction row={row} productId={id} />
      ),
    },
  ];
  useEffect(() => {
    if (filteredList.length > 0) {
      let tmp = 0;
      filteredList.map(
        ({ amountConvertedToMainCurrency }) =>
          (tmp = Number(amountConvertedToMainCurrency) + tmp)
      );

      setTotal(formatNumberToLocale(defaultNumberFormat(tmp)));
    } else {
      setTotal(0);
    }
  }, [filteredList]);
  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          <div className={styles.columnDetailItem}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '24px',
                marginBottom: 10,
                color: '#373737',
              }}
            >
              {invoiceType === 10 && row.isVat
                ? counterpartyName
                : counterparty}
            </label>

            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',

                color: '#CBCBCB',
              }}
            >
              {invoiceType === 1
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
                : 'Qaralama'}
            </span>
          </div>
          <HeaderItem name="Müqavilə" secondary={contractNo || '-'} />
          <HeaderItem
            name="Qaimə"
            secondary={
              row.isVat ? `${invoiceNumber} (VAT)` || '-' : invoiceNumber || '-'
            }
          />
          <HeaderItem
            name="Tarix"
            secondary={operationDate?.split('  ') || '-'}
          />

          <HeaderItem
            name="Qalıq"
            secondary={
              invoiceType === 5 || invoiceType === 6
                ? '-'
                : row.isVat
                ? formatNumberToLocale(
                    defaultNumberFormat(
                      math.sub(
                        Number(taxAmount) || 0,
                        Number(paidTaxAmount) || 0
                      )
                    )
                  )
                : formatNumberToLocale(
                    defaultNumberFormat(
                      math.sub(
                        Number(endPrice) || 0,
                        Number(paidAmount) || Number(recieved) || 0
                      )
                    )
                  )
            }
          />

          <HeaderItem gutterBottom={false} name="Status">
            {statusOfOperation === 1 ? (
              <span
                className={styles.chip}
                style={{
                  color: '#F3B753',
                  background: '#FDF7EA',
                  marginTop: 4,
                }}
              >
                Aktiv
              </span>
            ) : statusOfOperation === 2 ? (
              <span
                style={{
                  color: '#B16FE4',
                  background: '#F6EEFC',
                  marginTop: 4,
                }}
                className={styles.chip}
              >
                Qaralama
              </span>
            ) : statusOfOperation === 3 ? (
              <span
                style={{
                  color: '#C4C4C4',
                  background: '#F8F8F8',
                  marginTop: 4,
                }}
                className={styles.chip}
              >
                Silinib
              </span>
            ) : (
              '-'
            )}
          </HeaderItem>
        </div>

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
          />

          <Button
            className={styles.customSquareButton}
            shape="circle"
            icon="file-excel"
          /> */}
        </div>
      </div>

      <div
        className={styles.opInvTable}
        style={{
          width: 'calc(100% + 30px)',
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
          marginRight: -16,
        }}
      >
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={filteredList}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>

      {filteredList.length === 0 ? (
        ''
      ) : (
        <div
          style={{
            width: 'calc(100% + 36px)',
            fontSize: 14,
            color: '#7c7c7c',
            lineHeight: '16px',
            display: 'flex',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <div style={{ width: 97 }} className={styles.tdPadding}>
            <strong>Toplam</strong>
          </div>
          <div style={{ width: 178 }} className={styles.tdPadding} />
          <div style={{ width: 178 }} className={styles.tdPadding} />
          <div
            style={{ width: 200, textAlign: 'right' }}
            className={styles.tdPadding}
          >
            <strong>{`${total} ${mainCurrencyCode?.code}`}</strong>
          </div>
          <div style={{ width: 177 }} className={styles.tdPadding} />
          <div style={{ width: 120 }} className={styles.tdPadding} />
        </div>
      )}
    </div>
  );
}

export default OpFinOpInvoiceTab;
