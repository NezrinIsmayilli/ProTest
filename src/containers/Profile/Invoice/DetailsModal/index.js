/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';
import { fetchTenantId } from 'store/actions/subscription';
import DetailsTab from './Tabs/DetailsTab';
import PackageTab from './Tabs/PackageTab';
import PaymentsTab from './Tabs/PaymentsTab';

import styles from './styles.module.scss';

const DetailsModal = props => {
  const {
    data,
    tenantIdData,
    visible,
    setIsVisible,
    fetchTenantId,
    getPaymentStatus,
    getStatus,
  } = props;

  const [activeTab, setActiveTab] = useState(1);
  const handleChangeTab = value => setActiveTab(value);
  const id = data?.id;

  // Details Modal
  useEffect(() => {
    if (id) {
      fetchTenantId(id);
    }
  }, [id]);

  const getTabContent = () => {
    if (data) {
      switch (activeTab) {
        case 0:
          return (
            <DetailsTab
              getPaymentStatus={getPaymentStatus}
              getStatus={getStatus}
              data={data}
            />
          );
        case 1:
          return (
            <PaymentsTab
              invoiceData={tenantIdData}
              getPaymentStatus={getPaymentStatus}
              data={data}
            />
          );
        case 2:
          return <PackageTab data={data} />;
        default:
      }
    }
  };

  const ModalClose = () => {
    setIsVisible(false);
    setActiveTab(1);
  };

  return (
    <Modal
      visible={visible}
      onCancel={ModalClose}
      closable={false}
      width={1000}
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
        <div className={styles.headerInfo}>
          <div className={styles.profileRight}>
            <h5 className={styles.profileName}>
              {/* {data?.tenantName} */}
              Prospect Cloud ERP
            </h5>
          </div>
        </div>
        <div className={styles.detailsTab}>
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
          >
            Ətraflı
          </Button>
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
          >
            Ödəniş əməliyyatları ({`${tenantIdData.length}`})
          </Button>
          <Button
            size="large"
            type={activeTab === 2 ? 'primary' : ''}
            onClick={() => handleChangeTab(2)}
          >
            Paketlər
          </Button>
        </div>

        {getTabContent()}
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  tenantIdData: state.subscriptionReducer.tenantIdData,
});

export default connect(
  mapStateToProps,
  { fetchTenantId }
)(DetailsModal);
