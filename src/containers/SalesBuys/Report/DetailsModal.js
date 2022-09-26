import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { Row, Col, Modal, Spin } from 'antd';
import { InfoBoxItem } from 'components/Lib';
import { parseDate } from 'utils/parseDate';

const productsListStyle = {
  height: 320,
  overflow: 'auto',
};

// prevent table rendering in report page when Modal open/close
const DetailsModal = forwardRef((props, ref) => {
  const { invoiceLoading, invoiceInfo } = props;

  const [visible, setVisible] = useState(false);

  // open modal from parent
  useImperativeHandle(ref, () => ({
    openModal() {
      setVisible(true);
    },
  }));

  function closeModal() {
    setVisible(false);
  }

  // extract field values from invoiceInfo
  const {
    invoiceNumber,
    createdAt,
    operationDate,
    operatorName,
    operatorLastName,
    warehousemanName,
    warehousemanLastName,
    currencyCode,
    description,
    invoiceProducts,
    stockToName,
    stockFromName,
    invoiceType,
  } = invoiceInfo;

  // evaluating correct values
  const stockman = `${warehousemanName || ''} ${warehousemanLastName || ''}`;
  const operator = `${operatorName || ''} ${operatorLastName || ''}`;
  const stock = invoiceType === 2 ? stockFromName : stockToName;
  const date = operationDate && operationDate.substring(0, 10);

  // geting product list of invoiceInfo
  const products = Object.keys(invoiceProducts || {}).map(item => {
    const { productId, productName, quantity } = invoiceProducts[item];
    return (
      <InfoBoxItem
        key={productId}
        label={productName}
        text={`${quantity} ədəd`}
      />
    );
  });

  return (
    <Modal
      title={invoiceNumber || <b>&nbsp;</b>}
      visible={visible}
      onCancel={closeModal}
      footer={null}
      centered
    >
      <Spin spinning={invoiceLoading}>
        <Row gutter={24} type="flex" align="stretch">
          <Col span={12}>
            <InfoBoxItem label="Yaranma tarixi" text={parseDate(createdAt)} />
            <InfoBoxItem label="İcra tarixi" text={date} />
            <InfoBoxItem label="İcraçı" text={operator} />
            <InfoBoxItem label="Anbar" text={stock} />
            <InfoBoxItem label="Anbardar" text={stockman} />
            <InfoBoxItem label="Valyuta" text={currencyCode || ''} />
            <InfoBoxItem label="Ətraflı" text={description || ''} />
          </Col>
          <Col span={12}>
            <div className="scrollbar" style={productsListStyle}>
              {products}
            </div>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
});

export default DetailsModal;
