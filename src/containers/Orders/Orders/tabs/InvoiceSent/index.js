/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import { Input, Row, Col, Button, Spin } from 'antd';
import { Table } from 'components/Lib';
import {
  setSentItems,
  setAcceptedItems,
  updateOrder,
  changeStage,
  setSelectedOrder,
} from 'store/actions/orders';
import { editPartner } from 'store/actions/partners';
import ExportJsonExcel from 'js-export-excel';
import {
  re_percent,
  re_amount,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import IconButton from '../../../utils/IconButton/index';
import ContentInput from '../../../utils/ContentInput/index';
import styles from './styles.module.scss';

const roundTo = require('round-to');
const math = require('exact-math');

const InvoiceSent = ({
  editPartner,
  partners,
  selectedOrder,
  sentItems,
  setSentItems,
  updateOrder,
  visible = false,
  isLoading,
  actionLoading,
  toggleFetchAction,
  permissions,
  isView,
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [deliveryman, setDeliveryman] = useState(undefined);
  const [deliveryAddress, setDeliveryAddress] = useState(undefined);
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
      render: (value, row) =>
        !isView && permissions.invoiceSent.write ? (
          <ContentInput
            saveClick={handlePriceChange}
            value={row.quantity}
            row={row}
            type="quantity"
          />
        ) : (
          formatNumberToLocale(defaultNumberFormat(value))
        ),
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
        !isView && permissions.invoiceSent.write ? (
          <ContentInput
            saveClick={handlePriceChange}
            value={tableRow.price}
            row={tableRow}
            type="price"
          />
        ) : (
          formatNumberToLocale(defaultNumberFormat(value))
        ),
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
    {
      title: '',
      dataIndex: 'trash',
      key: 'trash',
      width: 60,
      render: (value, row) =>
        permissions.invoiceSent.write &&
        sentItems.length > 1 && (
          <img
            width={16}
            height={16}
            src="/img/icons/trash.svg"
            alt="trash"
            className={styles.icon}
            onClick={() => removeItem(row)}
          />
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

  const handlePriceChange = (tableRow, value, type) => {
    const newOrderItems = sentItems.map(sentItem => {
      if (sentItem.id === tableRow.id) {
        return {
          ...sentItem,
          [type]: value || 1,
        };
      }
      return sentItem;
    });
    setSentItems(newOrderItems);
  };

  const handleCompleteOperation = () => {
    const data = {
      status: 2,
      deliveryman: deliveryman || null,
      deliverymanPhoneNumber: deliverymanPhoneNumber || null,
      deliveryCarType: deliveryCarType || null,
      deliveryCarNumber: deliveryCarNumber || null,
      discountPercentage: discountPercentage || null,
      vatPercentage: vatPercentage || null,
      items_ul: sentItems.map(sentItem => ({
        product: sentItem.id,
        quantity: sentItem.quantity || 0,
        price: sentItem.price || 0,
      })),
    };

    const newPartner = {
      email: partners?.find(partner => partner.id === selectedOrder.partnerId)
        .email,
      contact: partners?.find(partner => partner.id === selectedOrder.partnerId)
        .contactId,
      deliveryAddress:
        deliveryAddress ||
        partners?.find(partner => partner.id === selectedOrder.partnerId)
          .deliveryAddress,
      showPrices: partners?.find(
        partner => partner.id === selectedOrder.partnerId
      ).showPrices,
      priceType: partners?.find(
        partner => partner.id === selectedOrder.partnerId
      ).priceTypeId,
      description: partners?.find(
        partner => partner.id === selectedOrder.partnerId
      ).description,
    };
    editPartner({
      id: partners?.find(partner => partner.id === selectedOrder.partnerId).id,
      data: newPartner,
      showToast: false,
    });

    updateOrder(selectedOrder.id, data, () => {
      toggleFetchAction();
    });
  };

  const removeItem = tableRow => {
    const newItems = sentItems.filter(sentItem => sentItem.id !== tableRow.id);
    setSentItems(newItems);
  };

  const handleExport = () => {
    const data = sentItems || '';
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
    setDeliveryman(
      selectedOrder.deliveredByTenantPerson || selectedOrder.deliveryman
    );
    setDeliveryAddress(selectedOrder.deliveryAddress);
    setDeliverymanPhoneNumber(selectedOrder.deliverymanPhoneNumber);
    setDeliveryCarType(selectedOrder.deliveryCarType);
    setDeliveryCarNumber(selectedOrder.deliveryCarNumber);
  }, [selectedOrder]);

  useEffect(() => {
    setTotalPrice(sentItems.reduce((a, b) => a + b.quantity * b.price, 0));
  }, [sentItems]);

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
              disabled={!permissions.invoiceSent.write || isView}
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
              disabled={!permissions.invoiceSent.write || isView}
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
              disabled={!permissions.invoiceSent.write || isView}
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
              disabled={!permissions.invoiceSent.write || isView}
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>
              Çatdırılma ünvanı
            </span>
            <Input
              style={{ width: '100%', fontSize: '14px' }}
              size="large"
              placeholder="Yazın"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              disabled={!permissions.invoiceSent.write || isView}
            />
          </Col>
        </Row>
        <Table
          loading={isLoading}
          dataSource={sentItems}
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
                disabled={!permissions.invoiceSent.write || isView}
              />
              <Input
                className={styles.inputStyles}
                placeholder={null}
                onChange={e => handleDiscountChange('amount', e.target.value)}
                value={discountAmount}
                style={{ marginLeft: 10 }}
                suffix={selectedOrder.currencyCode}
                disabled={!permissions.invoiceSent.write || isView}
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
                disabled={!permissions.invoiceSent.write || isView}
                suffix="%"
              />
              <Input
                className={styles.inputStyles}
                onChange={e => handleVatChange('amount', e.target.value)}
                value={vatAmount}
                style={{ marginLeft: 10 }}
                suffix={selectedOrder.currencyCode}
                disabled={!permissions.invoiceSent.write || isView}
              />
            </div>
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: '30px' }}>
          <Col className="gutter-row" span={5}>
            {permissions.invoiceSent.write && !isView && (
              <Button
                style={{
                  backgroundColor: '#55AB80',
                  width: '100%',
                  fontSize: '14px',
                  height: '40px',
                  color: 'white',
                }}
                onClick={handleCompleteOperation}
              >
                Təsdiq et
              </Button>
            )}
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  partners: state.partnersReducer.partners,
  sentItems: state.ordersReducer.sentItems,
  selectedOrder: state.ordersReducer.selectedOrder,
  isLoading: state.ordersReducer.isLoading,
  actionLoading: state.ordersReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    setSelectedOrder,
    setSentItems,
    setAcceptedItems,
    editPartner,
    updateOrder,
    changeStage,
  }
)(InvoiceSent);
