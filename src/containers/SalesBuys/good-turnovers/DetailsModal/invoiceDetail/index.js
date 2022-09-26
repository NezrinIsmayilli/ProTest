/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { Button } from 'antd';
import styles from './styles.module.scss';
import OpDetailTab from './opDetailTab';
import OpInvoiceContentTab from './opInvoiceContentTab';

function InvoiceMoreDetails(props) {
  const {
    activeTab,
    setActiveTab,
    visible,
    row,
    fetchSalesInvoiceInfo,
    invoiceInfoLoading,
  } = props;

  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const [invoiceLength, setInvoiceLength] = useState(undefined);
  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpDetailTab isLoading={invoiceInfoLoading} details={detailsData} />
        );
      case 1:
        return (
          <OpInvoiceContentTab
            setInvoiceLength={setInvoiceLength}
            details={detailsData}
            visible={visible}
            isLoading={invoiceInfoLoading}
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
    setActiveTab(0);
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
  }, [row.id, row.isVat]);
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
          disabled={invoiceInfoLoading}
        >
          Əlavə məlumat
        </Button>

        <Button
          size="large"
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
          disabled={invoiceInfoLoading}
        >
          Qaimənin tərkibi (
          {invoiceLength ||
            tableDatas.reduce(
              (total, { quantity }) => total + Number(quantity),
              0
            )}
          )
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  invoiceInfoLoading: state.loadings.invoicesInfo,
});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceInfo }
)(InvoiceMoreDetails);
