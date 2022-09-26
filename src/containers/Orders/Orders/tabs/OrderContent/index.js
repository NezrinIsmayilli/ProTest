/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Button, Row, Col, Tooltip, Spin, Input } from 'antd';
import ExportJsonExcel from 'js-export-excel';
import { toastHelper } from 'utils/toastHelper';
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
import ContentInput from '../../../utils/ContentInput/index';

const roundTo = require('round-to');
const math = require('exact-math');

const OrderContent = ({
  selectedOrder,
  updateOrder,
  contentItems,
  setContentItems,
  changeStage,
  isLoading,
  actionLoading,
  permissions,
  visible = false,
  toggleFetchAction,
  hideModal,
  isView,
}) => {
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
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Məhsul',
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
        permissions.invoiceContent?.write && !isView ? (
          <ContentInput
            saveClick={handleQuantityChange}
            value={tableRow.quantity}
            row={tableRow}
            type="quantity"
          />
        ) : (
          formatNumberToLocale(defaultNumberFormat(value))
        ),
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitOfMeasurement',
      align: 'center',
      width: 150,
      render: value => value || '-',
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'price',
      align: 'right',
      width: 140,
      render: (value, row) =>
        permissions.invoiceContent?.write && !isView ? (
          <ContentInput
            saveClick={handleQuantityChange}
            value={value}
            row={row}
            type="price"
          />
        ) : (
          formatNumberToLocale(Number(value))
        ),
    },

    {
      title: 'Toplam qiymət',
      dataIndex: 'price',
      align: 'right',
      width: 140,
      render: (value, row) =>
        formatNumberToLocale(
          defaultNumberFormat(math.mul(Number(row.quantity), Number(value)))
        ),
    },
    {
      title: '',
      dataIndex: 'trash',
      key: 'trash',
      width: 80,
      render: (value, row) =>
        permissions.invoiceContent?.write &&
        contentItems.length > 1 &&
        !isView && (
          <img
            width={16}
            height={16}
            src="/img/icons/trash.svg"
            alt="trash"
            className={styles.icon}
            style={{ cursor: 'pointer' }}
            onClick={() => removeItem(row)}
          />
        ),
    },
  ];

  const handleCompleteOperation = () => {
    const {
      deliveryman,
      deliverymanPhoneNumber,
      deliveryCarType,
      deliveryCarNumber,
    } = selectedOrder;

    const data = {
      status: 1,
      deliveryman,
      deliverymanPhoneNumber,
      deliveryCarType,
      deliveryCarNumber,
      discountPercentage: discountPercentage || null,
      vatPercentage: vatPercentage || null,
      items_ul: contentItems.map(({ id, quantity, price }) => ({
        product: id,
        quantity: quantity || 0,
        price: price || 0,
      })),
    };

    updateOrder(selectedOrder.id, data, () => {
      toggleFetchAction();
      toastHelper();
    });
  };

  const handleQuantityChange = (tableRow, value, type) => {
    const newOrderItems = contentItems.map(contentItem => {
      if (contentItem.id === tableRow.id) {
        return {
          ...contentItem,
          [type]: value || 1,
        };
      }
      return contentItem;
    });
    setContentItems(newOrderItems);
  };

  const handleStageChange = (newStage, id) => {
    changeStage(newStage, id, { description: null }, () => {
      toggleFetchAction();
      hideModal();
    });
  };

  const removeItem = tableRow => {
    const newItems = contentItems.filter(
      contentItem => contentItem.id !== tableRow.id
    );
    setContentItems(newItems);
  };

  const handleExport = () => {
    const data = contentItems || '';
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
    const totalPrice = contentItems.reduce(
      (totalPrice, currentOrder) =>
        math.add(
          Number(totalPrice),
          math.mul(Number(currentOrder.quantity), Number(currentOrder.price))
        ),
      0
    );

    setTotalPrice(totalPrice);
  }, [contentItems]);

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
      <Spin spinning={actionLoading}>
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
          dataSource={contentItems}
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
                disabled={isView || !permissions.invoiceContent?.write}
              />
              <Input
                className={styles.inputStyles}
                placeholder={null}
                onChange={e => handleDiscountChange('amount', e.target.value)}
                value={discountAmount}
                style={{ marginLeft: 10 }}
                suffix={selectedOrder.currencyCode}
                disabled={isView || !permissions.invoiceContent?.write}
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
                disabled={isView || !permissions.invoiceContent?.write}
              />
              <Input
                className={styles.inputStyles}
                onChange={e => handleVatChange('amount', e.target.value)}
                value={vatAmount}
                style={{ marginLeft: 10 }}
                suffix={selectedOrder.currencyCode}
                disabled={isView || !permissions.invoiceContent?.write}
              />
            </div>
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: '30px' }}>
          <Col className="gutter-row" span={5}>
            {permissions.invoiceContent?.write && !isView && (
              <Button
                style={{
                  backgroundColor: '#55AB80',
                  width: '100%',
                  fontSize: '14px',
                  height: '40px',
                  color: 'white',
                }}
                onClick={handleCompleteOperation}
                disabled={!permissions.invoiceContent?.write}
              >
                Təsdiq et
              </Button>
            )}
          </Col>
          {selectedOrder.stage === 1 && !isView && (
            <Col className="gutter-row" span={4}>
              <Button
                style={{
                  color: '#4E9CDF',
                  width: '80%',
                  fontSize: '14px',
                  height: '40px',
                  backgroundColor: '#EDF5FC',
                  border: '1px solid #4E9CDF',
                }}
                onClick={() => handleStageChange(2, selectedOrder.id)}
              >
                Aktiv et
              </Button>
            </Col>
          )}
        </Row>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  orders: state.ordersReducer.orders,
  selectedOrder: state.ordersReducer.selectedOrder,
  contentItems: state.ordersReducer.contentItems,
  isLoading: state.ordersReducer.isLoading,
  actionLoading: state.ordersReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    updateOrder,
    changeStage,
    setContentItems,
  }
)(OrderContent);
