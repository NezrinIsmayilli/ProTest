/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';

import InvoiceTab from './Tabs/InvoiceTab';
import PaymentsTab from './Tabs/PaymentsTab';
import styles from './styles.module.scss';

const GetBalance = props => {
  const {
    data,
    invoices,
    paymentBalance,

    visible,
    setIsVisible,
    getPaymentStatus,

    getStatus,
  } = props;

  const [activeTab, setActiveTab] = useState(0);
  const handleChangeTab = value => setActiveTab(value);

  const getTabContent = () => {
    if (invoices) {
      switch (activeTab) {
        case 0:
          return (
            <InvoiceTab
              getPaymentStatus={getPaymentStatus}
              getStatus={getStatus}
              invoices={invoices}
            />
          );
        case 1:
          return <PaymentsTab paymentBalance={paymentBalance} />;
        default:
      }
    }
  };

  const ModalClose = () => {
    setIsVisible(false);
    setActiveTab(0);
  };

  return (
    <Modal
      visible={visible}
      onCancel={ModalClose}
      closable={false}
      width={1300}
      footer={null}
      className={styles.customModal}
      destroyOnClose
      maskClosable={false}
    >
      <Button className={styles.closeButton} size="large" onClick={ModalClose}>
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '20px 40px',
        }}
      >
        <div className={styles.detailsTab}>
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
          >
            Qaimələr ({`${invoices.length}`})
          </Button>
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
          >
            Ödənişlər ({`${paymentBalance.length}`})
          </Button>
        </div>

        {getTabContent()}
      </div>
    </Modal>
  );
};

export default GetBalance;
