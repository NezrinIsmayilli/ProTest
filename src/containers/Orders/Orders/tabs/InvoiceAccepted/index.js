/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Button, Input } from 'antd';
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
import ContentInput from '../../../utils/ContentInput/index';
import styles from './styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const InvoiceAccepted = ({
  updateOrder,
  selectedOrder,
  acceptedItems,
  isLoading,
  setAcceptedItems,
  toggleFetchAction,
  permissions,
  isView,
  actionLoading,
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
        permissions.invoiceAccepted.write && !isView ? (
          <ContentInput
            saveClick={handlePriceChange}
            value={row.quantity}
            row={row}
            type="quantity"
          />
        ) : (
          `${formatNumberToLocale(defaultNumberFormat(value))}`
        ),
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
      render: (value, tableRow) =>
        permissions.invoiceAccepted.write && !isView ? (
          <ContentInput
            saveClick={handlePriceChange}
            value={tableRow.price}
            row={tableRow}
            type="price"
          />
        ) : (
          `${formatNumberToLocale(defaultNumberFormat(value))}`
        ),
    },
    {
      title: 'Toplam qiymət',
      dataIndex: 'totalPrice',
      align: 'right',
      width: 150,
      render: (value, row) =>
        (Math.round(row.price * row.quantity * 100) / 100).toFixed(2),
    },
    {
      title: '',
      dataIndex: 'trash',
      width: 60,
      render: (value, tableRow) =>
        permissions.invoiceAccepted.write &&
        acceptedItems.length > 1 &&
        !isView && (
          <img
            width={16}
            height={16}
            src="/img/icons/trash.svg"
            alt="trash"
            className={styles.icon}
            onClick={() => removeItem(tableRow)}
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
    const newOrderItems = acceptedItems.map(acceptedItem => {
      if (acceptedItem.id === tableRow.id) {
        return {
          ...acceptedItem,
          [type]: value || 1,
        };
      }
      return acceptedItem;
    });
    setAcceptedItems(newOrderItems);
  };

  const removeItem = tableRow => {
    const newItems = acceptedItems.filter(
      acceptedItem => acceptedItem.id !== tableRow.id
    );
    setAcceptedItems(newItems);
  };

  const handleCompleteOperation = () => {
    const {
      deliveryman,
      deliverymanPhoneNumber,
      deliveryCarType,
      deliveryCarNumber,
    } = selectedOrder;
    const data = {
      status: 3,
      deliveryman: deliveryman || null,
      deliverymanPhoneNumber: deliverymanPhoneNumber || null,
      deliveryCarType: deliveryCarType || null,
      deliveryCarNumber: deliveryCarNumber || null,
      discountPercentage: discountPercentage || null,
      vatPercentage: vatPercentage || null,
      items_ul: acceptedItems.map(acceptedItem => ({
        product: acceptedItem.id,
        quantity: acceptedItem.quantity || 0,
        price: acceptedItem.price || 0,
      })),
    };

    updateOrder(selectedOrder.id, data, () => {
      toggleFetchAction();
    });
  };

  const handleExport = () => {
    const data = acceptedItems || '';
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
    const totalPrice = acceptedItems.reduce(
      (totalPrice, currentOrder) =>
        math.add(
          Number(totalPrice),
          math.mul(Number(currentOrder.quantity), Number(currentOrder.price))
        ),
      0
    );

    setTotalPrice(totalPrice);
  }, [acceptedItems]);

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
        dataSource={acceptedItems}
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
              disabled={isView || !permissions.invoiceAccepted?.write}
            />
            <Input
              className={styles.inputStyles}
              placeholder={null}
              onChange={e => handleDiscountChange('amount', e.target.value)}
              value={discountAmount}
              style={{ marginLeft: 10 }}
              suffix={selectedOrder.currencyCode}
              disabled={isView || !permissions.invoiceAccepted?.write}
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
              disabled={isView || !permissions.invoiceAccepted?.write}
            />
            <Input
              className={styles.inputStyles}
              onChange={e => handleVatChange('amount', e.target.value)}
              value={vatAmount}
              style={{ marginLeft: 10 }}
              suffix={selectedOrder.currencyCode}
              disabled={isView || !permissions.invoiceAccepted?.write}
            />
          </div>
        </div>
      </div>

      {permissions.invoiceAccepted.write && !isView && (
        <Row gutter={16} style={{ marginTop: '30px' }}>
          <Col className="gutter-row" span={5}>
            <Button
              style={{
                backgroundColor: '#55AB80',
                width: '100%',
                fontSize: '14px',
                height: '40px',
                color: 'white',
              }}
              onClick={handleCompleteOperation}
              disabled={isLoading || actionLoading}
              loading={actionLoading}
            >
              Əlavə et
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  orders: state.ordersReducer.orders,
  acceptedItems: state.ordersReducer.acceptedItems,
  selectedOrder: state.ordersReducer.selectedOrder,
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
