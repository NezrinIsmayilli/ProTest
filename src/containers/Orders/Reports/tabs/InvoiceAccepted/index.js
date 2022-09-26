/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Input } from 'antd';
import { Table } from 'components/Lib';
import ExportJsonExcel from 'js-export-excel';
import {
  setAcceptedItems,
  updateOrder,
  changeStage,
} from 'store/actions/orders';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  re_amount,
  re_percent,
} from 'utils';
import IconButton from '../../../utils/IconButton/index';
import styles from './styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const InvoiceAccepted = ({
  updateOrder,
  selectedOrder,
  isLoading,
  setAcceptedItems,
  toggleFetchAction,
  visible = false,
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul',
      dataIndex: 'name',
      width: 160,
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      width: 140,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))}`,
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitOfMeasurement',
      align: 'center',
      width: 130,
      render: value => value || '-',
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'price',
      align: 'right',
      width: 150,
      render: value => `${formatNumberToLocale(defaultNumberFormat(value))}`,
    },
    {
      title: 'Toplam qiymət',
      dataIndex: 'totalPrice',
      align: 'right',
      width: 150,
      render: (value, row) =>
        (Math.round(row.price * row.quantity * 100) / 100).toFixed(2),
    },
  ];

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

  const handleExport = () => {
    const data = selectedOrder?.items?.[3] || '';
    const option = {};
    const dataTable = data.map(dataItem => ({
      Id: dataItem.id,
      Product: dataItem.name,
      Quantity: dataItem.quantity,
      'Unit of measurement': dataItem.unitOfMeasurementName,
      'Price per unit': dataItem.price,
      Total: `${dataItem.quantity * dataItem.price}`,
    }));

    option.fileName = 'invoice-accepted';
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
    setDiscountPercentage(selectedOrder.discountPercentageAccepted || 0);
    setVatPercentage(selectedOrder.vatPercentageAccepted || 0);
  }, [selectedOrder]);

  useEffect(() => {
    const totalPrice = selectedOrder?.items?.[3].reduce(
      (totalPrice, currentOrder) =>
        math.add(
          Number(totalPrice),
          math.mul(Number(currentOrder.quantity), Number(currentOrder.price))
        ),
      0
    );

    setTotalPrice(totalPrice);
  }, [selectedOrder?.items?.[3]]);

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

  return (
    <div
      className={styles.InvoiceAccepted}
      style={visible ? {} : { display: 'none' }}
    >
      <Row type="flex" style={{ alignItems: 'center', margin: '0 0 25px 0' }}>
        <Col span={8} offset={16} align="end">
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            buttonStyle={{ marginRight: '10px' }}
            onClick={handleExport}
          />
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={window.print}
          />
        </Col>
      </Row>

      <Table
        loading={isLoading}
        dataSource={selectedOrder?.items?.[3]}
        className={styles.customWhiteTable}
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
          <span className={styles.subtitleStyle}>Son qiymət:</span>
          <span className={styles.subtitleStyle}>
            {formatNumberToLocale(defaultNumberFormat(endPrice))}{' '}
            {selectedOrder.currencyCode}
          </span>
        </div>
        <div className={styles.invoiceTableFooter}>
          <span className={styles.subtitleStyle} style={{ color: '#0E65EB' }}>
            ƏDV:
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
  orders: state.ordersReducer.orders,
  isLoading: state.ordersReducer.isLoading,
  actionLoading: state.loadings.ordersActions,
});

export default connect(
  mapStateToProps,
  {
    setAcceptedItems,
    updateOrder,
    changeStage,
  }
)(InvoiceAccepted);
