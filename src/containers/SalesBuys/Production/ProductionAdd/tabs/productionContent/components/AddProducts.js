import React from 'react';
import { Button } from 'antd';
import { SelectProduct } from './SelectProduct';
import { SelectProductByBarcode } from './SelectProductByBarcode';
import styles from '../../../styles.module.scss';

const AddProductsLayout = props => {
  const {
    selectProductIsDisabled,
    handleProductNameChange,
    handleProductBarcodeChange,
    handleChangeSearch,
    barcodeInput,
    catalogModalIsDisabled,
    toggleCatalogModal,
    selectedProducts,
    setSelectedProducts
  } = props;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SelectProduct
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          disabled={selectProductIsDisabled}
          handleProductNameChange={handleProductNameChange}
        />
        <SelectProductByBarcode
          disabled={selectProductIsDisabled}
          handleChangeSearch={handleChangeSearch}
          handleProductBarcodeChange={handleProductBarcodeChange}
          barcodeInput={barcodeInput}
        />
      </div>
      <Button
        className={styles.catalogButton}
        onClick={catalogModalIsDisabled ? () => {} : toggleCatalogModal}
        disabled={catalogModalIsDisabled}
        type="primary"
      >
        Kataloqdan seç
      </Button>
    </div>
  );
};

export const AddProducts = AddProductsLayout;
