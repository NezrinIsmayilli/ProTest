/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import styles from './styles.module.scss';
import GoodTurnoverDetail from './goodTurnoverDetail';
import IncomeInvoice from './incomeInvoice';

function DetailsModal(props) {
  const {
    visible,
    row,
    setIsVisible,
    filters,
    isLoading,
    isLoadingInvoiceList,
    fetchSalesInvoiceList,
    fetchMainCurrency,
    mainCurrency,
  } = props;
  const [incomeInvoice, setIncomeInvoice] = useState({});
  const [incomeInvoiceLength, setIncomeInvoiceLength] = useState(0);
  const [excludedGoodsInvoice, setExcludedGoodsInvoice] = useState(0);
  const [excludedGoodsInvoiceLength, setExcludedGoodsInvoiceLength] = useState(
    0
  );
  const [activeTab, setActiveTab] = useState(0);
  const handleChangeTab = value => setActiveTab(value);
  useEffect(() => {
    fetchMainCurrency();
  }, []);
  useEffect(() => {
    if (incomeInvoice.length >= 0) {
      setIncomeInvoiceLength(getFilteredInvoices(incomeInvoice).length);
    }
  }, [incomeInvoice]);
  useEffect(() => {
    if (excludedGoodsInvoice.length >= 0) {
      setExcludedGoodsInvoiceLength(
        getFilteredInvoices(excludedGoodsInvoice).length
      );
    }
  }, [excludedGoodsInvoice]);
  const getFilteredInvoices = invoice => {
    if (invoice && invoice === incomeInvoice) {
      const newtableDatas = invoice.filter(({ stockToId }) => {
        if (stockToId ? stockToId === row.stock_id : true) {
          return true;
        }
        return false;
      });
      return newtableDatas;
    }
    if (invoice && invoice === excludedGoodsInvoice) {
      const newtableDatas = invoice.filter(({ stockFromId }) => {
        if (stockFromId ? stockFromId === row.stock_id : true) {
          return true;
        }
        return false;
      });
      return newtableDatas;
    }
    return invoice;
  };
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <GoodTurnoverDetail filters={filters} row={row} />;
      case 1:
        return (
          <IncomeInvoice
            mainCurrency={mainCurrency}
            details={getFilteredInvoices(incomeInvoice)}
          />
        );
      case 2:
        return (
          <IncomeInvoice
            details={getFilteredInvoices(excludedGoodsInvoice)}
            mainCurrency={mainCurrency}
          />
        );
      default:
    }
  };

  useEffect(() => {
    if (row.product_id) {
      fetchSalesInvoiceList({
        filters: {
          invoiceTypes: [1, 3, 5, 7, 10, 11],
          products: [row.product_id],
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          serialNumber: filters.serialNumber,
          stocks: [row.stock_id],
          isDeleted: 0,
          limit: 1000,
        },
        onSuccess: res => {
          setIncomeInvoice(res.data);
        },
      });
      fetchSalesInvoiceList({
        filters: {
          invoiceTypes: [2, 4, 5, 6],
          products: [row.product_id],
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          serialNumber: filters.serialNumber,
          stocks: [row.stock_id],
          isDeleted: 0,
          limit: 1000,
        },
        onSuccess: res => {
          setExcludedGoodsInvoice(res.data);
        },
        label: 'invoiceList',
      });
    }
  }, [row]);

  return (
    <Modal
      visible={visible}
      footer={null}
      width={1100}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
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
          padding: '32px 24px',
        }}
      >
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
            disabled={isLoading}
          >
            Daxil olma ({incomeInvoiceLength})
          </Button>
          <Button
            size="large"
            type={activeTab === 2 ? 'primary' : ''}
            onClick={() => handleChangeTab(2)}
            disabled={isLoadingInvoiceList}
          >
            Xaric olma ({excludedGoodsInvoiceLength})
          </Button>
        </div>

        {getTabContent()}
      </div>
    </Modal>
  );
}
const mapStateToProps = state => ({
  mainCurrency: state.kassaReducer.mainCurrency,
  isLoading: state.salesAndBuysReducer.isLoading,
  isLoadingInvoiceList: state.loadings.invoiceList,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceList,
    fetchMainCurrency,
  }
)(DetailsModal);
