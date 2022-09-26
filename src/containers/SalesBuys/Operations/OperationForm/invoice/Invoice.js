import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Spin } from 'antd';
import styles from '../styles.module.scss';
import {
  Header,
  Footer,
  ActionButtons,
  AddDescription,
  AddProducts,
} from './index';

const InvoicePaper = props => {
  const {
    form,
    type = 'purchase',
    isDraft,
    columns,
    invoiceType,
    activePayments,
    invoiceInfoLoading = false,
    catalogModalIsDisabled,
    selectProductIsDisabled,
    priceTypesLoading = false,
    toggleCatalogModal,
    selectedProducts,
    handleProductNameChange,
    handleProductBarcodeChange,
    handleChangeSearch,
    barcodeInput,
    productSelectLoading,
    handleNewInvoice,
    handleDraftInvoice,
    productQuantitiesLoading,
    loader=false,
  } = props;

  const [descriptionModal, setDescriptionModal] = useState(false);

  const toggleDecsriptionModal = () => {
    setDescriptionModal(prevDescriptionModal => !prevDescriptionModal);
  };

  return (
    <div className={styles.parentBox}>
      <div className={styles.paper}>
        <Spin spinning={invoiceInfoLoading}>
          <AddDescription
            isVisible={descriptionModal}
            toggleModal={toggleDecsriptionModal}
          />
          <Header
            disabled={catalogModalIsDisabled}
            toggleDecsriptionModal={toggleDecsriptionModal}
            toggleCatalogModal={toggleCatalogModal}
            productSelectLoading={productSelectLoading}
          />
          <AddProducts
            selectProductIsDisabled={selectProductIsDisabled}
            handleChangeSearch={handleChangeSearch}
            handleProductBarcodeChange={handleProductBarcodeChange}
            barcodeInput={barcodeInput}
            handleProductNameChange={handleProductNameChange}
            catalogModalIsDisabled={catalogModalIsDisabled}
            toggleCatalogModal={toggleCatalogModal}
            type={type}
          />
          <Table
            // isWhiteTable
            columns={columns}
            rowKey={row => row.id}
            loading={productQuantitiesLoading || priceTypesLoading}
            dataSource={selectedProducts}
          />
          {type === 'transfer' || type === 'writingOff' ? null : (
            <Footer invoiceInfoLoading={invoiceInfoLoading} form={form} type={type} />
          )}
          {activePayments?.length === 0 && type !== 'import-purchase' ? (
            <ActionButtons
              form={form}
              invoiceType={invoiceType}
              type={type}
              isDraft={isDraft}
              handleNewInvoice={handleNewInvoice}
              handleDraftInvoice={handleDraftInvoice}
              loader={loader}
            />
          ) : null}
        </Spin>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  productQuantitiesLoading: state.loadings.fetchEditProductsFromCatalog,
  priceTypesLoading: state.loadings.fetchSalesPrices,
  invoiceInfoLoading: state.loadings.invoicesInfo,
  activePayments: state.salesOperation.activePayments,
  selectedProducts: state.salesOperation.selectedProducts,
});
export const Invoice = connect(
  mapStateToProps,
  null
)(InvoicePaper);
