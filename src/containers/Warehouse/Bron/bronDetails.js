/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { Button } from 'antd';
import styles from '../styles.module.scss';
import BronDetailTab from './bronDetail/bronDetailTab';
import BronInvoiceContentTab from './bronDetail/bronContentTab';

const math = require('exact-math');

const BronDetails = props => {
  const {
    isDeletedForLog,
    activeTab,
    setActiveTab,
    visible,
    row,
    fetchSalesInvoiceInfo,
    isLoading,
    getStatusType,
    allBusinessUnits,
    profile,
  } = props;

  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const [invoiceLength, setInvoiceLength] = useState(undefined);
  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <BronDetailTab
            isDeletedForLog={isDeletedForLog}
            profile={profile}
            isLoading={isLoading}
            details={detailsData}
            tableDatas={tableDatas}
            getStatusType={getStatusType}
            invoiceLength={invoiceLength}
            allBusinessUnits={allBusinessUnits}
          />
        );
      case 1:
        return (
          <BronInvoiceContentTab
            setInvoiceLength={setInvoiceLength}
            details={detailsData}
            visible={visible}
            isLoading={isLoading}
            tableDatas={tableDatas}
          />
        );
      default:
    }
  };

  useEffect(() => {
    if (!visible) {
      setDetailsData([]);
      setInvoiceLength(undefined);
    }
  }, [visible]);

  useEffect(() => {
    if (row.id) {
      fetchSalesInvoiceInfo({
        id: row.id,
        onSuccess: res => {
          if (res.data.invoiceProducts && res.data.invoiceProducts.content)
            setTableDatas([
              ...Object.keys(res.data.invoiceProducts.content).map(
                index => res.data.invoiceProducts.content[index]
              ),
            ]);
          setDetailsData(res.data);
        },
      });
    }
  }, [row.id]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
          disabled={isLoading}
        >
          Əlavə məlumat
        </Button>
        <Button
          size="large"
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
          disabled={isLoading}
        >
          Qaimənin tərkibi (
          {invoiceLength ||
            tableDatas.reduce(
              (total, { quantity }) =>  math.add(total, Number(quantity) || 0),
              0
            )}
          )
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.invoicesInfo,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceInfo }
)(BronDetails);
