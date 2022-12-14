/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Row, Col, Tooltip, Input } from 'antd';
import ExportJsonExcel from 'js-export-excel';

import {
  defaultNumberFormat,
  formatNumberToLocale,
  re_percent,
  re_amount,
} from 'utils';
import {
  setContentItems,
  updateOrder,
  changeStage,
} from 'store/actions/orders';
import styles from './styles.module.scss';
import IconButton from '../../../utils/IconButton/index';

const roundTo = require('round-to');
const math = require('exact-math');

const OrderContent = ({ selectedOrder, isLoading, visible = false }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);

  const handleDiscountChange = (type, value) => {
    if (type === 'percent' && re_percent.test(value) && value <= 100) {
      setDiscountPercentage(value);
      setDiscountAmount(
        roundTo(math.div(math.mul(Number(value), Number(totalPrice)), 100), 4)
      );
    }
    if (
      type === 'amount' &&
      re_amount.test(value) &&
      Number(value) <= Number(totalPrice)
    ) {
      setDiscountAmount(value);
      setDiscountPercentage(
        roundTo(
          math.div(math.mul(Number(value), 100), Number(totalPrice) || 1),
          4
        )
      );
    }
    if (value === '') {
      setDiscountPercentage(null);
      setDiscountAmount(null);
    }
  };

  const handleVatChange = (type, value) => {
    if (type === 'percent' && re_percent.test(value) && value <= 100) {
      setVatPercentage(value);
      setVatAmount(
        roundTo(math.div(math.mul(Number(value), Number(endPrice)), 100), 4)
      );
    }
    if (
      type === 'amount' &&
      re_amount.test(value) &&
      Number(value) <= Number(totalPrice)
    ) {
      setVatAmount(value);
      setVatPercentage(
        roundTo(
          math.div(math.mul(Number(value), 100), Number(endPrice) || 1),
          4
        )
      );
    }
    if (value === '') {
      setVatPercentage(null);
      setVatAmount(null);
    }
  };

  const columns = [
    {
      title: '???',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'M??hsul',
      dataIndex: 'name',
      width: 180,
      render: value => (
        <Tooltip title={value}>
          {value.length > 20 ? `${value.slice(0, 20)}...` : value}{' '}
        </Tooltip>
      ),
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      align: 'left',
      width: 130,
      render: (value, tableRow) =>
        formatNumberToLocale(defaultNumberFormat(value)),
    },
    {
      title: '??l???? vahidi',
      dataIndex: 'unitOfMeasurement',
      align: 'center',
      width: 150,
      render: value => value || '-',
    },
    {
      title: 'Vahidin qiym??ti',
      dataIndex: 'price',
      align: 'right',
      width: 140,
      render: (value, row) => formatNumberToLocale(Number(value)),
    },

    {
      title: 'Toplam qiym??t',
      dataIndex: 'price',
      align: 'right',
      width: 140,
      render: (value, row) =>
        formatNumberToLocale(
          defaultNumberFormat(math.mul(Number(row.quantity), Number(value)))
        ),
    },
  ];

  const handleExport = () => {
    const data = selectedOrder?.items?.[1] || '';
    const option = {};
    const dataTable = data.map(dataItem => ({
      Id: dataItem.id,
      Product: dataItem.name,
      Quantity: dataItem.quantity,
      'Unit of measurement': dataItem.unitOfMeasurementName,
      'Price per unit': dataItem.price,
      Total: `${dataItem.quantity * dataItem.price}`,
    }));

    option.fileName = 'order-content';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Product',
          'Quantity',
          'Unit of measurement',
          'Price per unit',
          'Total',
        ],
        sheetHeader: [
          'Id',
          'Product',
          'Quantity',
          'Unit of measurement',
          'Price per unit',
          'Total',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  useEffect(() => {
    setDiscountPercentage(selectedOrder.discountPercentage || 0);
    setVatPercentage(selectedOrder.vatPercentage || 0);
  }, [selectedOrder]);

  useEffect(() => {
    const totalPrice = selectedOrder?.items?.[1].reduce(
      (totalPrice, currentOrder) =>
        math.add(
          Number(totalPrice),
          math.mul(Number(currentOrder.quantity), Number(currentOrder.price))
        ),
      0
    );

    setTotalPrice(totalPrice);
  }, [selectedOrder?.items?.[1]]);

  useEffect(() => {
    if (discountPercentage) {
      handleDiscountChange('percent', Number(discountPercentage));
    }
  }, [totalPrice]);

  useEffect(() => {
    setEndPrice(
      roundTo(math.sub(Number(totalPrice), Number(discountAmount)), 4)
    );
  }, [discountAmount]);

  useEffect(() => {
    if (vatPercentage) {
      handleVatChange('percent', Number(vatPercentage));
    }
  }, [endPrice]);

  if (!visible) return null;
  return (
    <div className={styles.OrderContent}>
      <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
        <Col span={8} offset={16} align="end">
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={handleExport}
            buttonStyle={{ marginRight: '10px' }}
          />
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            onClick={window.print}
            className={styles.exportButton}
          />
        </Col>
      </Row>
      <Table
        loading={isLoading}
        className={styles.customWhiteTable}
        dataSource={selectedOrder?.items?.[1]}
        bordered={false}
        scroll={{ x: false, y: 450 }}
        columns={columns}
      />
      <div className={styles.invoiceTableFooterParent}>
        <div className={styles.invoiceTableFooter}>
          <span className={styles.subtitleStyle}>Toplam:</span>
          <span className={styles.subtitleStyle}>
            {formatNumberToLocale(defaultNumberFormat(totalPrice))}
            {selectedOrder.currencyCode}
          </span>
        </div>
        <div className={styles.invoiceTableFooter}>
          <span className={styles.subtitleStyle} style={{ color: '#55AB80' }}>
            Endirim:
          </span>
          <div className={styles.exportBox}>
            <Input
              className={styles.inputStyles}
              onChange={e => handleDiscountChange('percent', e.target.value)}
              value={discountPercentage}
              suffix="%"
              disabled
            />
            <Input
              className={styles.inputStyles}
              placeholder={null}
              onChange={e => handleDiscountChange('amount', e.target.value)}
              value={discountAmount}
              style={{ marginLeft: 10 }}
              suffix={selectedOrder.currencyCode}
              disabled
            />
          </div>
        </div>
        <div className={styles.invoiceTableFooter}>
          <span className={styles.subtitleStyle}>Son qiym??t:</span>
          <span className={styles.subtitleStyle}>
            {formatNumberToLocale(defaultNumberFormat(endPrice))}{' '}
            {selectedOrder.currencyCode}
          </span>
        </div>
        <div className={styles.invoiceTableFooter}>
          <span className={styles.subtitleStyle} style={{ color: '#0E65EB' }}>
            ??DV:
          </span>
          <div className={styles.exportBox}>
            <Input
              className={styles.inputStyles}
              onChange={e => handleVatChange('percent', e.target.value)}
              value={vatPercentage}
              suffix="%"
              disabled
            />
            <Input
              className={styles.inputStyles}
              onChange={e => handleVatChange('amount', e.target.value)}
              value={vatAmount}
              style={{ marginLeft: 10 }}
              suffix={selectedOrder.currencyCode}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  orders: state.orderReportReducer.orders,
  isLoading: state.orderReportReducer.isLoading,
  actionLoading: state.orderReportReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    updateOrder,
    changeStage,
    setContentItems,
  }
)(OrderContent);
