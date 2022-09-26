import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table, Input, Checkbox, Tooltip } from 'antd';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import styles from './styles.module.scss';

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
const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong>{quantity}</strong>
    <strong>{secondary}</strong>
  </div>
);

function OpInvoiceContentTab({
  details,
  visible,
  isLoading,
  tableDatas,
  setInvoiceLength,
}) {
  const componentRef = useRef();
  const [filters, setFilters] = useState({
    productNames: [],
    serialNumbers: [],
  });
  const [checked, setChecked] = useState(false);
  const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
  const {
    invoiceType,
    counterparty,
    contractNo,
    invoiceNumber,
    currencyCode,
    operationDate,
    taxCurrencyCode,
    taxAmount,
    amount,
    endPrice,
    discountAmount,
  } = details;

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'productName',
      width: 180,
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'pricePerUnit',
      width: 100,
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Say ',
      dataIndex: 'quantity',
      align: 'center',
      width: 80,
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },
    {
      title: 'Seriya nömrəsi',
      dataIndex: 'serialNumber',
      align: 'center',
      width: 140,
      render: value =>
        value ? (
          checked && value.length > 1 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {value[0]}
              <Tooltip
                placement="right"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {value.map(serialNumber => (
                      <span>{serialNumber}</span>
                    ))}
                  </div>
                }
              >
                <span className={styles.serialNumberCount}>{value.length}</span>
              </Tooltip>
            </div>
          ) : (
            value
          )
        ) : (
          '-'
        ),
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitOfMeasurementName',
      align: 'center',
      width: 150,
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      width: 90,
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode} `,
    },
  ];
  useEffect(() => {
    if (!visible) {
      setFilters({ productNames: [], serialNumbers: [] });
      setChecked(false);
    }
  }, [visible]);
  useEffect(() => {
    if (checked) {
      setInvoiceLength(
        getFilteredInvoices(mergedInvoiceContent, filters).reduce(
          (total, { quantity }) => total + Number(quantity),
          0
        )
      );
    } else {
      setInvoiceLength(
        getFilteredInvoices(tableDatas, filters).reduce(
          (total, { quantity }) => total + Number(quantity),
          0
        )
      );
    }
  }, [checked, filters, mergedInvoiceContent, tableDatas]);
  useEffect(() => {
    let tmp = {};
    if (checked && tableDatas.length > 0) {
      tableDatas.forEach((value, index) => {
        if (tmp[value.productId]) {
          tmp = {
            ...tmp,
            [value.productId]: {
              ...tmp[value.productId],
              quantity: tmp[value.productId].quantity + Number(value.quantity),
              total: tmp[value.productId].total + Number(value.total),
              serialNumber: value.serialNumber
                ? [...tmp[value.productId].serialNumber, value.serialNumber]
                : undefined,
            },
          };
        } else {
          tmp[value.productId] = {
            id: index + 1,
            product: value.productId,
            productName: value.productName,
            catalogName: value.catalogName,
            serialNumber: value.serialNumber ? [value.serialNumber] : undefined,
            quantity: Number(value.quantity),
            pricePerUnit: value.pricePerUnit,
            unitOfMeasurementName: value.unitOfMeasurementName,
            currencyCode: value.currencyCode,
            total: Number(value.total),
          };
        }
      });
      setMergedInvoiceContent(Object.values(tmp));
    } else {
      setMergedInvoiceContent([]);
    }
  }, [checked, tableDatas]);
  const handleCheckbox = checked => {
    if (checked) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  };
  const filterDuplicates = (tableDatas, field) => {
    const data = [];
    return tableDatas.reduce((total, current) => {
      if (data.includes(current[field])) {
        return total;
      }
      data.push(current[field]);
      return [...total, { name: current[field] }];
    }, []);
  };
  const filterSerialNumber = (tableDatas, field) =>
    tableDatas.reduce((total, current) => {
      if (current[field] === null) {
        return total;
      }
      return [...total, { name: current[field] }];
    }, []);

  const handleFilter = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value,
    }));
  };
  const getFilteredInvoices = (tableData, { productNames, serialNumbers }) => {
    if (productNames.length > 0 || serialNumbers.length > 0) {
      const newtableDatas = tableData.filter(
        ({ productName, serialNumber }) => {
          if (
            (productNames.length > 0
              ? productNames.includes(productName)
              : true) &&
            (serialNumbers.length > 0
              ? checked
                ? serialNumber?.some(serialNum =>
                    serialNumbers.includes(serialNum)
                  )
                : serialNumbers.includes(serialNumber)
              : true)
          ) {
            return true;
          }
          return false;
        }
      );
      return newtableDatas;
    }
    return tableData;
  };
  return (
    <div ref={componentRef} style={{ width: '100%' }}>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          {counterparty ? (
            <div
              className={styles.columnDetailItem}
              style={{ marginBottom: 6 }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: '24px',
                  marginBottom: 10,
                  color: '#373737',
                }}
              >
                {counterparty}
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
                  : invoiceType === 11
                  ? 'İstehsalat'
                  : 'Qaralama'}
              </span>
            </div>
          ) : (
            ''
          )}
          <HeaderItem name="Müqavilə" secondary={contractNo || '-'} />
          <HeaderItem name="Qaimə" secondary={invoiceNumber || '-'} />
          <HeaderItem
            name="Tarix"
            secondary={`${operationDate?.split('  ')}` || '-'}
          />
        </div>
        <ReactToPrint
          trigger={() => (
            <Button
              className={styles.customSquareButton}
              style={{ marginRight: 10, marginTop: 10 }}
              shape="circle"
              icon="printer"
            />
          )}
          content={() => componentRef.current}
        />
      </div>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div style={{ display: 'flex', width: '70%' }}>
          <Input.Group style={{ width: '30%' }}>
            <span className={styles.filterName}>Məhsul adı</span>
            <ProSelect
              mode="multiple"
              id={false}
              size="medium"
              value={filters.productNames}
              data={filterDuplicates(tableDatas, 'productName')}
              onChange={values => handleFilter('productNames', values)}
            />
          </Input.Group>
          <Input.Group style={{ marginLeft: '5px', width: '30%' }}>
            <span className={styles.filterName}>Seriya nömrəsi</span>
            <ProSelect
              mode="multiple"
              id={false}
              size="medium"
              value={filters.serialNumbers}
              data={filterSerialNumber(tableDatas, 'serialNumber')}
              onChange={values => handleFilter('serialNumbers', values)}
            />
          </Input.Group>
        </div>
        {invoiceType === 5 || invoiceType === 6 ? null : (
          <Checkbox
            onChange={event => handleCheckbox(event.target.checked)}
            checked={checked}
          >
            Qruplaşdır
          </Checkbox>
        )}
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
          dataSource={
            checked
              ? getFilteredInvoices(mergedInvoiceContent, filters)
              : getFilteredInvoices(tableDatas, filters)
          }
          loading={isLoading}
          className={styles.opInvoiceContentTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
      {[5, 6].includes(invoiceType) ? null : (
        <>
          <FooterRow
            primary="Total"
            quantity={
              checked
                ? getFilteredInvoices(mergedInvoiceContent, filters).reduce(
                    (total, { quantity }) =>
                      math.add(total, Number(quantity) || 0),
                    0
                  )
                : getFilteredInvoices(tableDatas, filters).reduce(
                    (total, { quantity }) =>
                      math.add(total, Number(quantity) || 0),
                    0
                  )
            }
            secondary={`${
              checked
                ? formatNumberToLocale(
                    defaultNumberFormat(
                      getFilteredInvoices(mergedInvoiceContent, filters).reduce(
                        (total, { total: totalPrice }) =>
                          math.add(total, Number(totalPrice) || 0),
                        0
                      )
                    )
                  )
                : formatNumberToLocale(
                    defaultNumberFormat(
                      getFilteredInvoices(tableDatas, filters).reduce(
                        (total, { total: totalPrice }) =>
                          math.add(total, Number(totalPrice) || 0),
                        0
                      )
                    )
                  )
            } ${currencyCode || '-'}`}
          />
          {/* <FooterRow primary='Discount(%)' secondary={discount} color='#55AB80'/> */}
          {/* <FooterRow primary='Discount(Amount)'  secondary={`${discountAmount} ${currencyCode|| ''}`} color='#55AB80'/> */}
          {invoiceType === 10 ? null : (
            <>
              <FooterRow
                primary={`Endirim (${roundToDown(
                  math.div(
                    math.mul(Number(discountAmount || 0) || 0, 100),
                    amount || 0
                  ),
                  4
                ) || ''}%)`}
                secondary={
                  discountAmount
                    ? `${formatNumberToLocale(
                        defaultNumberFormat(discountAmount)
                      )} ${currencyCode}`
                    : '-'
                }
                color="#55AB80"
              />
              <FooterRow
                primary="Son qiymət"
                secondary={`${formatNumberToLocale(
                  defaultNumberFormat(endPrice)
                )} ${currencyCode || '-'}`}
              />
              <FooterRow
                primary={`Vergi(${roundToDown(
                  math.div(
                    math.mul(Number(taxAmount || 0) || 0, 100),
                    endPrice || 0
                  ),
                  4
                ) || ''}%)`}
                secondary={
                  taxAmount
                    ? `${formatNumberToLocale(
                        defaultNumberFormat(taxAmount)
                      )} ${taxCurrencyCode}`
                    : '-'
                }
                color="#0E65EB"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default OpInvoiceContentTab;
