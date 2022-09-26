import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Col, Row } from 'antd';
import TabButton from 'containers/Orders/utils/TabButton/index';
import {
  changeStage,
  fetchStages,
  deleteOrder,
  clearSelectedOrder,
} from 'store/actions/orders';
import moment from 'moment';
import { orderTabs } from 'utils';
import Detail from '../tabs/Detail/index';
import Delivery from '../tabs/Delivery';
import InvoiceSent from '../tabs/InvoiceSent/index';
import InvoiceAccepted from '../tabs/InvoiceAccepted/index';
import OrderContent from '../tabs/OrderContent/index';
import Messages from '../tabs/Messages/index';
import Timeline from '../tabs/Timeline/index';
import styles from './styles.module.scss';

const MoreDetails = ({
  data,
  permissions,
  visible,
  setIsVisible,
  clearSelectedOrder,
  toggleFetchAction,
  isView,
}) => {
  const [currentTab, setCurrentTab] = useState(1);
  const handleTabChange = tab => {
    setCurrentTab(tab);
  };

  const hideModal = () => {
    setIsVisible(false);
    setCurrentTab(1);
    clearSelectedOrder();
  };
  return (
    <Modal
      visible={visible}
      footer={null}
      width={1050}
      closable={false}
      className={styles.customModal}
      onCancel={hideModal}
      maskClosable
    >
      <Button className={styles.closeButton} size="large" onClick={hideModal}>
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.OrderDetails}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '34px' }}>
          <Col
            span={6}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <span className={styles.contrparty}>{data?.partnerName}</span>
            <span className={styles.contract}>
              {data?.direction === 1
                ? `SFD${moment(
                    data?.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                    'YYYY'
                  ).format('YYYY')}/${data?.serialNumber}`
                : `SFX${moment(
                    data?.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                    'YYYY'
                  ).format('YYYY')}/${data?.serialNumber}`}
            </span>
          </Col>
        </Row>
        <Row style={{ marginBottom: '40px ' }}>
          {orderTabs.map(({ id, label }) => (
            <Col span={4} className={styles.tabContainer}>
              <TabButton
                key={id}
                onClick={() => handleTabChange(id)}
                active={currentTab === id}
                size="large"
                label={label}
              />
            </Col>
          ))}
        </Row>

        <Detail
          visible={currentTab === 1}
          permissions={permissions}
          selectedOrder={data}
          toggleFetchAction={toggleFetchAction}
        />
        <Delivery
          visible={currentTab === 7}
          permissions={permissions}
          toggleFetchAction={toggleFetchAction}
          isView={isView}
          selectedOrder={data}
        />
        <OrderContent
          visible={currentTab === 2}
          permissions={permissions}
          toggleFetchAction={toggleFetchAction}
          hideModal={hideModal}
          isView={isView}
          selectedOrder={data}
        />
        <InvoiceSent
          visible={currentTab === 3}
          permissions={permissions}
          toggleFetchAction={toggleFetchAction}
          isView={isView}
          selectedOrder={data}
        />
        <InvoiceAccepted
          visible={currentTab === 4}
          permissions={permissions}
          isView={isView}
          toggleFetchAction={toggleFetchAction}
          selectedOrder={data}
        />
        <Messages
          visible={currentTab === 5}
          permissions={permissions}
          toggleFetchAction={toggleFetchAction}
          selectedOrder={data}
        />
        <Timeline
          visible={currentTab === 6}
          permissions={permissions}
          isView={isView}
          selectedOrder={data}
        />
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  orders: state.ordersReducer.orders,
  // invoices: state.orderReportReducer.invoices,
});

export default connect(
  mapStateToProps,
  {
    changeStage,
    deleteOrder,
    fetchStages,
    clearSelectedOrder,
  }
)(MoreDetails);
