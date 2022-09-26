import React, { useRef, useState, useEffect } from 'react';
import { Table, Button, Input, Checkbox, Tooltip } from 'antd';
import ReactToPrint from 'react-to-print';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { connect } from 'react-redux';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import styles from './styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

function ReInvoiceContent({
  tableDatas,
  isLoading,
  restInvoiceData,
  setInvoiceLength,
}) {
  const componentRef = useRef();
  const [filters, setFilters] = useState({
    productNames: [],
    serialNumbers: [],
  });
  const [checked, setChecked] = useState(false);
  const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'productName',
      width: 220,
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: 'Maya dəyəri',
      dataIndex: 'cost',
      align: 'center',
      width: 140,
      render: value => formatNumberToLocale(defaultNumberFormat(value)),
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      align: 'center',
      width: 140,
      render: value => formatNumberToLocale(defaultNumberFormat(value)),
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
      render: value => value || '-',
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      width: 165,
      align: 'right',
      render: total =>
        `${formatNumberToLocale(defaultNumberFormat(total))} ${
          restInvoiceData?.currencyCode
        }`,
    },
  ];
  useEffect(() => {
    if (checked) {
      setInvoiceLength(
        getFilteredInvoices(mergedInvoiceContent, filters).reduce(
          (total, { quantity }) => math.add(total || 0, Number(quantity) || 0),
          0
        )
      );
    } else {
      setInvoiceLength(
        getFilteredInvoices(tableDatas, filters).reduce(
          (total, { quantity }) => math.add(total || 0, Number(quantity) || 0),
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
                quantity: math.add(
                    tmp[value.productId].quantity || 0,
                    Number(value.quantity) || 0
                ),
                total: math.add(
                    tmp[value.productId].total || 0,
                    Number(value.total) || 0
                ),
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
            quantity: roundTo(Number(value.quantity), 2),
            cost: roundTo(Number(value.cost), 4),
            pricePerUnit: roundTo(Number(value.pricePerUnit), 2),
            unitOfMeasurementName: value.unitOfMeasurementName,
            currencyCode: value.currencyCode,
            total: roundTo(Number(value.total), 4),
          };
        }
      });
      setMergedInvoiceContent(Object.values(tmp));
    } else {
      setMergedInvoiceContent([]);
    }
  }, [checked, tableDatas]);
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
      return newtableDatas.sort(function(a, b) {
        return a.productId - b.productId;
    });
    }
    return tableData.sort(function(a, b) {
      return a.productId - b.productId;
  });
  };
  const handleCheckbox = checked => {
    if (checked) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  };
  return (
    <div
      ref={componentRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 6,
        width: '100%',
      }}
    >
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            className={styles.columnDetailItem}
            style={{ marginBottom: 6, marginRight: 10 }}
          >
            <label
              style={{
                fontWeight: 600,
                fontSize: 22,
                lineHeight: '24px',
                color: '#373737',
              }}
            >
              {restInvoiceData.clientName || 'Daxili sifariş'}
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div className={styles.columnDetailItem} style={{ marginLeft: 30 }}>
              <label style={{ marginBottom: 12 }}>Anbar(Haraya)</label>
              <span>{restInvoiceData ? restInvoiceData.stockToName : '-'}</span>
            </div>
            <div className={styles.columnDetailItem} style={{ marginLeft: 24 }}>
              <label style={{ marginBottom: 12 }}>İstehsal tarixi</label>
              <span>
                {restInvoiceData && restInvoiceData.operationDate
                  ? restInvoiceData.operationDate
                  : '-'}
              </span>
            </div>
          </div>
        </div>{' '}
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
        {' '}
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
        <Checkbox
          onChange={event => handleCheckbox(event.target.checked)}
          checked={checked}
        >
          Qruplaşdır
        </Checkbox>
      </div>
      <div
        className={styles.opInvTable}
        style={{
          width: 'calc(100% + 30px)',
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 24,
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
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
      <table className={styles.recivedTableFooter}>
        <tr>
          <td width={200} style={{ paddingLeft: 0 }}>
            Toplam
          </td>
          <td width={150} align="right" />
          <td width={120} align="right">
            {checked
              ? getFilteredInvoices(mergedInvoiceContent, filters).reduce(
                  (total, { quantity }) => math.add(total || 0, Number(quantity) || 0),
                  0
                )
              : getFilteredInvoices(tableDatas, filters).reduce(
                  (total, { quantity }) => math.add(total || 0, Number(quantity) || 0),
                  0
                )}
          </td>
          <td width={150} align="right" />
          <td width={150} align="right" />
          <td
            width={150}
            style={{
              paddingRight: 10,
            }}
            align="right"
          >
            {`${
              checked
                ? formatNumberToLocale(
                    defaultNumberFormat(
                      getFilteredInvoices(mergedInvoiceContent, filters).reduce(
                        (total, { total: totalPrice }) =>
                          math.add(total || 0, Number(totalPrice) || 0),
                        0
                      )
                    )
                  )
                : formatNumberToLocale(
                    defaultNumberFormat(
                      getFilteredInvoices(tableDatas, filters).reduce(
                        (total, { total: totalPrice }) =>
                          math.add(total || 0, Number(totalPrice) || 0),
                        0
                      )
                    )
                  )
            } ${restInvoiceData?.currencyCode || '-'}`}
          </td>
        </tr>
      </table>
    </div>
  );
}

const mapStateToProps = state => ({});
export default connect(
  mapStateToProps,
  { fetchSalesInvoiceInfo }
)(ReInvoiceContent);
