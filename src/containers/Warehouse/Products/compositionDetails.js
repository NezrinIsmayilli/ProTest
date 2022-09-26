import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Table, Input } from 'antd';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

function CompositionDetails({ data, row, activeTab }) {
  const componentRef = useRef();
  const [filters, setFilters] = useState({
    productNames: [],
  });
  useEffect(() => {
    if (!activeTab) {
      setFilters({ productNames: [] });
    }
  }, [activeTab]);

  const handleFilter = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value,
    }));
  };

  const getFilteredComposition = (data, { productNames }) => {
    if (productNames.length > 0) {
      const newtableDatas = data.filter(({ product }) => {
        if (
          productNames.length > 0 ? productNames.includes(product.name) : true
        ) {
          return true;
        }
        return false;
      });
      return newtableDatas;
    }
    return data;
  };

  const filterDuplicates = (data, field) => {
    const data1 = [];
    return data.reduce((total, current) => {
      if (data1.includes(current?.product[field])) {
        return total;
      }
      data1.push(current?.product[field]);
      return [...total, { name: current?.product[field] }];
    }, []);
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 50,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'name',
      width: 200,
      render: (value, row) => row.product?.name,
    },
    {
      title: 'Miqdar ',
      dataIndex: 'quantity',
      align: 'center',
      width: 80,
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },
    {
      title: 'Ölçü vahidi ',
      dataIndex: 'product',
      align: 'center',
      width: 80,
      render: (value, row) => row.product?.unitOfMeasurement?.name || '-',
    },
  ];

  return (
    <div
      ref={componentRef}
      style={{ width: '100%' }}
      className={styles.invoiceContainer}
    >
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          {row ? (
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
                {row.name}
              </label>
            </div>
          ) : (
            ''
          )}
        </div>
        <ReactToPrint
          pageStyle
          trigger={() => (
            <Button
              className={`${styles.customSquareButton} printButton`}
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
          <Input.Group
            style={{ width: '50%' }}
            className={styles.productNameSelect}
          >
            <span className={styles.filterName}>Məhsul adı</span>
            <ProSelect
              mode="multiple"
              id={false}
              size="medium"
              value={filters.productNames}
              data={filterDuplicates(data, 'name')}
              onChange={values => handleFilter('productNames', values)}
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
          dataSource={getFilteredComposition(data, filters)}
          className={styles.opInvoiceContentTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

export default CompositionDetails;
