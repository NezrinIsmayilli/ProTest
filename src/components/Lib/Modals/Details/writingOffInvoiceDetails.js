import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import ReactToPrint from 'react-to-print';
import { Button, Table, Input, Tooltip } from 'antd';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
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

function WritingOffInvoiceDetails({
  row,
  visible,
  setVisible,
  isLoading,
  fetchSalesInvoiceInfo,
}) {
  const componentRef = useRef();
  const [filters, setFilters] = useState({
    productNames: [],
    serialNumbers: [],
  });
  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const { invoiceNumber, currencyCode, mainCurrencyCode, operationDate, createdAt } = detailsData;

  useEffect(() => {
    if (row.id) {
      fetchSalesInvoiceInfo({
        id: row.id,
        onSuccess: res => {
          if (res.data.invoiceProducts && res.data.invoiceProducts.content)
            setTableDatas([
              ...Object.keys(res.data.invoiceProducts.content).map(
                index => res.data.invoiceProducts.content[index]
              ),
            ]);
          setDetailsData(res.data);
        },
      });
    }
  }, [row.id]);

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
      render: value => value || '-',
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
    }
  }, [visible]);

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
              ? serialNumbers.includes(serialNumber)
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
          justifyContent: 'center',
          width: '100%',
          marginTop: 40,
        }}
      >
        <Button
          onClick={() => setVisible(false)}
          type="link"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#464A4B',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '16px',
          }}
        >
          <MdKeyboardArrowLeft size={20} style={{ marginRight: 8 }} />
          Qaimə Siyahısına qayıt
        </Button>
      </div>
      <div className={styles.exportBox}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '50px',
          }}
        >
          Qaimənin tərkibi
        </span>
      </div>

      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          <span
            style={{
              fontSize: 18,
              lineHeight: '16px',

              color: '#CBCBCB',
            }}
          >
            Silinmə
          </span>
          <HeaderItem name="Qaimə" secondary={invoiceNumber || '-'} />
          <HeaderItem name="Tarix" secondary={operationDate || '-'} />
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
          dataSource={getFilteredInvoices(tableDatas, filters)}
          loading={isLoading}
          className={styles.opInvoiceContentTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
      <FooterRow
        primary="Toplam"
        quantity={getFilteredInvoices(tableDatas, filters).reduce(
          (total, { quantity }) => math.add(total, Number(quantity) || 0),
          0
        )}
        secondary={`${formatNumberToLocale(
          defaultNumberFormat(
            getFilteredInvoices(tableDatas, filters).reduce(
              (total, { total: totalPrice }) =>
                math.add(total, Number(totalPrice) || 0),
              0
            )
          )
        )} ${mainCurrencyCode || '-'}`}
      />
    </div>
  );
}
const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceInfo }
)(WritingOffInvoiceDetails);
