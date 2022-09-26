import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Header, AddDescription, AddProducts } from './index';
import styles from '../styles.module.scss';

const InvoicePaper = props => {
  const {
    form,
    type = 'purchase',
    productionInfo,
    summaries,
    columns,
    priceTypesLoading = false,
    toggleCatalogModal,
    selectedProducts,
    handleProductNameChange,
    handleProductBarcodeChange,
    handleChangeSearch,
    barcodeInput,
    productSelectLoading,
    productQuantitiesLoading,
  } = props;

  const [descriptionModal, setDescriptionModal] = useState(false);

  const toggleDecsriptionModal = () => {
    setDescriptionModal(prevDescriptionModal => !prevDescriptionModal);
  };
  return (
    <>
      <AddDescription
        isVisible={descriptionModal}
        toggleModal={toggleDecsriptionModal}
      />
      <Header toggleDecsriptionModal={toggleDecsriptionModal} />
      <AddProducts
        productionInfo={productionInfo}
        summaries={summaries}
        handleChangeSearch={handleChangeSearch}
        handleProductBarcodeChange={handleProductBarcodeChange}
        barcodeInput={barcodeInput}
        handleProductNameChange={handleProductNameChange}
        toggleCatalogModal={toggleCatalogModal}
      />
      <Table
        className={styles.productTable}
        columns={columns}
        rowKey={row => row.id}
        loading={productQuantitiesLoading || priceTypesLoading}
        dataSource={
          selectedProducts?.length > 0
            ? [
                ...selectedProducts,
                {
                  isTotal: true,
                  id: 'Total count',
                },
              ]
            : selectedProducts
        }
      />
    </>
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
