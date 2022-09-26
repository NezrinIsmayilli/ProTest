/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ProSelect } from 'components/Lib';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import { fetchSalesReports } from 'store/actions/reports/sales-report';
import math from 'exact-math';
import styles from './styles.module.scss';
import SalesChart from './SalesChart';

export const types = {
  'sales-per-sales-managers': {
    id: 'sales-per-sales-managers',
    columnId: 'salesman_id',
    label_column: 'Menecerlər üzrə satışlar',
    columnName: 'salesman_name',
  },
  'sales-per-buyers': {
    columnId: 'client_id',
    id: 'sales-per-buyers',
    label_column: 'Alıcılar üzrə satışlar',
    columnName: 'client_name',
  },
  'sales-per-warehouse': {
    columnId: 'stock_from_id',
    id: 'sales-per-warehouse',
    label_column: 'Anbarlar üzrə satışlar',
    columnName: 'name',
  },
  'sales-per-catalog': {
    id: 'sales-per-catalog',
    columnId: 'catalog_id',
    label_column: 'Kataloqlar üzrə satışlar',
    columnName: 'name',
  },
};

const SalesFigures = props => {
  const {
    dateFrom,
    dateTo,
    salesReportsLoading,
    fetchSalesReports,
    salesReports,
    setFilter,
    businessUnitIds,
  } = props;
  const [type, setType] = useState('sales-per-sales-managers');

  const handleSalesTypeChange = salesType => {
    setType(salesType);
  };

  const getSalesReport = data => {
    if (data.length > 0 && data.find(item => Number(item?.revenue) > 0)) {
      const totalSales = data.reduce(
        (all, { revenue }) => all + Number(revenue),
        0
      );
      const sales_statistics = data.map(dataItem => ({
        id: dataItem[types[type].columnId],
        type: dataItem[types[type].columnName],
        columnId: types[type].columnId,
        value: math.mul(
          math.div(Number(dataItem.revenue), Number(totalSales)),
          100
        ),
      }));
      return sales_statistics;
    }
    return [
      {
        id: 'Satıcı 1',
        type: 'Satıcı 1',
        value: 500,
      },
      {
        id: 'Satıcı 2',
        type: 'Satıcı 2',
        value: 490,
      },
      {
        id: 'Satıcı 3',
        type: 'Satıcı 3',
        value: 44,
      },
      {
        id: 'Satıcı 4',
        type: 'Satıcı 4',
        value: 358,
      },
      {
        id: 'Satıcı 5',
        type: 'Satıcı 5',
        value: 313,
      },
    ];
  };

  useEffect(() => {
    fetchSalesReports(type, {
      dateFrom,
      dateTo,
      businessUnitIds,
    });
  }, [type, dateFrom, dateTo, businessUnitIds]);

  return (
    <div className={styles.SalesFigures}>
      <Row type="flex" align="middle">
        <Col span={8} style={{ fontSize: 17 }}>
          {Object.values(salesReports).length > 0
            ? 'Satış göstəriciləri'
            : 'Satış göstəriciləri (Nümunə)'}
        </Col>
        <Col span={10} offset={6}>
          <ProSelect
            size="middle"
            value={type}
            data={Object.values(types)}
            onChange={handleSalesTypeChange}
            keys={['label_column']}
            allowClear={false}
          />
        </Col>
      </Row>
      <Spin spinning={salesReportsLoading}>
        <SalesChart
          data={getSalesReport(Object.values(salesReports))}
          setFilter={setFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          businessUnitIds={businessUnitIds}
        />
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchDashboardSummary,
  salesReports: state.salesReport.salesReports,
  salesReportsLoading: state.loadings.fetchSalesReports,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesReports,
  }
)(SalesFigures);
