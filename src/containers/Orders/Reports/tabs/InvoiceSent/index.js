/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import { Input, Row, Col, Spin } from 'antd';
import { Table } from 'components/Lib';
import {
  setSentItems,
  setAcceptedItems,
  updateOrder,
  changeStage,
  setSelectedOrder,
} from 'store/actions/orders';
import ExportJsonExcel from 'js-export-excel';
import {
  re_percent,
  re_amount,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import IconButton from '../../../utils/IconButton/index';
import styles from './styles.module.scss';

const roundTo = require('round-to');
const math = require('exact-math');

const InvoiceSent = ({
  selectedOrder,
  visible = false,
  isLoading,
  actionLoading,
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [deliveryman, setDeliveryman] = useState(undefined);
  const [deliverymanPhoneNumber, setDeliverymanPhoneNumber] = useState(
    undefined
  );
  const [deliveryCarType, setDeliveryCarType] = useState(undefined);
  const [deliveryCarNumber, setDeliveryCarNumber] = useState(undefined);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      render: (value, row) => formatNumberToLocale(defaultNumberFormat(value)),
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitOfMeasurement',
      key: 'unitOfMeasurement',
      width: 160,
      render: value => value || '-',
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'price',
      align: 'right',
      width: 120,
      render: (value, tableRow) =>
        formatNumberToLocale(defaultNumberFormat(value)),
    },
    {
      title: 'Toplam qiymət',
      dataIndex: 'totalPrice',
      align: 'right',
      width: 120,
      render: (value, { quantity, price }) =>
        formatNumberToLocale(
          defaultNumberFormat(math.mul(Number(quantity), Number(price)))
        ),
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
    const data = selectedOrder?.items?.[2] || '';
    const option = {};
    const dataTable = data.map(dataItem => ({
      Id: dataItem.id,
      Product: dataItem.name,
      Quantity: dataItem.quantity,
      'Unit of measurement': dataItem.unitOfMeasurementName,
      'Price per unit': dataItem.price,
      Total: `${dataItem.quantity * dataItem.price}`,
    }));

    option.fileName = 'invoice-sent';
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
    setDiscountPercentage(selectedOrder.discountPercentageSent || 0);
    setVatPercentage(selectedOrder.vatPercentageSent || 0);
    setDeliveryman(selectedOrder.deliveryman);
    setDeliverymanPhoneNumber(selectedOrder.deliverymanPhoneNumber);
    setDeliveryCarType(selectedOrder.deliveryCarType);
    setDeliveryCarNumber(selectedOrder.deliveryCarNumber);
  }, [selectedOrder]);

  useEffect(() => {
    setTotalPrice(
      selectedOrder?.items?.[2].reduce((a, b) => a + b.quantity * b.price, 0)
    );
  }, [selectedOrder?.items?.[2]]);

  useEffect(() => {
    if (discountPercentage) {
      handleDiscountChange('percent', discountPercentage);
    }
  }, [totalPrice]);

  useEffect(() => {
    setEndPrice(
      roundTo(math.sub(Number(totalPrice), Number(discountAmount)), 4)
    );
  }, [discountAmount]);

  useEffect(() => {
    if (vatPercentage) {
      handleVatChange('percent', vatPercentage);
    }
  }, [endPrice]);

  if (!visible) return null;
  return (
    <div className={styles.InvoiceSent}>
      <Spin spinning={actionLoading}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '24px' }}>
          <Col span={8}>
            <span className={styles.header}>Çatdırılma məlumatı</span>
          </Col>
          <Col span={8} offset={8} align="end">
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
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col className="gutter-row" span={6}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>
              Sürücü
            </span>
            <Input
              style={{ width: '100%', fontSize: '14px' }}
              size="large"
              placeholder="Yazın"
              value={deliveryman}
              onChange={e => setDeliveryman(e.target.value)}
              disabled
            />
          </Col>
          <Col className="gutter-row" span={6}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>
              Mobil nömrə
            </span>
            <Input
              style={{ fontSize: '14px' }}
              size="large"
              placeholder="Yazın"
              value={deliverymanPhoneNumber}
              onChange={e => setDeliverymanPhoneNumber(e.target.value)}
              disabled
            />
          </Col>
          <Col className="gutter-row" span={6}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>
              Nəqliyyat növü
            </span>
            <Input
              placeholder="Yazın"
              size="large"
              value={deliveryCarType}
              onChange={e => setDeliveryCarType(e.target.value)}
              disabled
              style={{ fontSize: '14px' }}
            />
          </Col>
          <Col className="gutter-row" span={6}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>
              Qeydiyyat nişanı
            </span>
            <Input
              placeholder="Yazın"
              size="large"
              style={{ fontSize: '14px' }}
              value={deliveryCarNumber}
              onChange={e => setDeliveryCarNumber(e.target.value)}
              disabled
            />
          </Col>
        </Row>

        <Table
          loading={isLoading}
          dataSource={selectedOrder?.items?.[2]}
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
                disabled
                suffix="%"
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
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  // selectedOrder: state.ordersReducer.selectedOrder,
  isLoading: state.ordersReducer.isLoading,
  actionLoading: state.ordersReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    setSelectedOrder,
    setSentItems,
    setAcceptedItems,
    updateOrder,
    changeStage,
  }
)(InvoiceSent);
