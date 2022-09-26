/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProModal, ProSelect } from 'components/Lib';
import { Button } from 'antd';
import { fetchPartnerGoods, clearPartnerGoods } from 'store/actions/goods';
import styles from './styles.module.scss';

export const AddProductsFromCatalog = ({
  visible,
  handleModal,
  catalogs,
  tableProducts,
  clearPartnerGoods,
  handleProductAdd,
  fetchPartnerGoods,
  selectedCounterparty,
  productsLoading,
  catalogsLoading,
  products,
}) => {
  const dispatch = useDispatch();
  const [selectedRootCatalogId, setSelectedRootCatalogId] = useState(undefined);
  const [selectedSubCatalogId, setSelectedSubCatalogId] = useState(undefined);
  const [selectedProducts, setSelectedProducts] = useState([]);
  useEffect(() => {
    if (!visible) {
      clearModal();
    }
  }, [visible]);
  const addProduct = productIds => {
    const product = products.find(({ id }) => productIds[0] === id);
    setSelectedProducts(prevSelectedProducts => [
      ...prevSelectedProducts,
      product,
    ]);
  };

  const deleteProduct = productIds => {
    setSelectedProducts(prevSelectedProducts =>
      prevSelectedProducts.filter(({ id }) => productIds.includes(id))
    );
  };

  const handleCatalogChange = catalogId => {
    setSelectedSubCatalogId(undefined);

    if (catalogs.children[catalogId]) {
      setSelectedRootCatalogId(catalogId);
      if (catalogs.children[catalogId].length > 0) {
        return;
      }
      fetchPartnerGoods({
        filters: {
          parentCatalogIds: [catalogId],
          partnerId: selectedCounterparty.isTenant
            ? null
            : selectedCounterparty.id,
        },
      });
    }

    setSelectedRootCatalogId(catalogId);
  };

  const handleSubCatalogChange = catalogId => {
    if (catalogId) {
      setSelectedSubCatalogId(catalogId);
      fetchPartnerGoods({
        filters: {
          parentCatalogIds: [selectedRootCatalogId],
          catalogIds: [catalogId],
          partnerId: selectedCounterparty.isTenant
            ? null
            : selectedCounterparty.id,
        },
      });
    } else {
      setSelectedSubCatalogId(undefined);
    }
  };

  const clearModal = () => {
    setSelectedProducts([]);
    setSelectedRootCatalogId(undefined);
    setSelectedSubCatalogId(undefined);
    dispatch(clearPartnerGoods());
  };

  const confirmModal = () => {
    handleProductAdd(
      selectedProducts.map(product => ({
        ...product,
        quantity: product.invoiceQuantity ? product.invoiceQuantity + 1 : 1,
      }))
    );

    handleModal();
    clearModal();
  };

  return (
    <ProModal
      maskClosable
      width={400}
      isVisible={visible}
      customStyles={styles.AddSerialNumbersModal}
      handleModal={handleModal}
    >
      <div className={styles.AddFromCatalog}>
        <h2>Kataloqdan seç</h2>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Kataloqlar</span>
          <ProSelect
            allowClear={false}
            loading={catalogsLoading}
            data={catalogs.root || []}
            value={selectedRootCatalogId}
            onChange={handleCatalogChange}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Alt kataloqlar</span>
          <ProSelect
            loading={catalogsLoading}
            value={selectedSubCatalogId}
            data={
              selectedRootCatalogId
                ? catalogs.children[selectedRootCatalogId]
                : []
            }
            onChange={catalogIds => handleSubCatalogChange(catalogIds)}
            disabled={!selectedRootCatalogId}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Məhsullar</span>
          <ProSelect
            mode="multiple"
            loading={productsLoading}
            keys={['label']}
            data={products
              ?.filter(
                ({ id }) =>
                  ![...tableProducts, ...selectedProducts]
                    .map(({ id }) => id)
                    .includes(id)
              )
              .map(product => ({
                ...product,
                label: `${product.name} (${product.stockAmount ||
                  0} ${product.unitOfMeasurementName || 'ədəd'})`,
              }))}
            value={undefined}
            onChange={addProduct}
            disabled={!selectedRootCatalogId}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Seçilmiş məhsullar</span>
          <ProSelect
            mode="multiple"
            data={selectedProducts.map(product => ({
              ...product,
              label: `${product.name} (${
                product.stockAmount
              } ${product.unitOfMeasurementName || 'ədəd'})`,
            }))}
            onChange={deleteProduct}
            value={selectedProducts.map(({ id }) => id)}
            keys={['label']}
          />
        </div>
        <div className={styles.button}>
          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={confirmModal}
          >
            Təsdiq et
          </Button>
          <Button
            className={styles.cancelButton}
            type="danger"
            onClick={clearModal}
          >
            Sıfırla
          </Button>
        </div>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  catalogs: state.catalogsReducer.filteredCatalogs,
  products: state.goodsReducer.partnerGoods,
  selectedProducts: state.salesOperation.selectedProducts,
  catalogsLoading: state.catalogsReducer.isLoading,
  productsLoading: state.loadings.partnerGoods,
});

export const AddFromCatalog = connect(
  mapStateToProps,
  {
    fetchPartnerGoods,
    clearPartnerGoods,
  }
)(AddProductsFromCatalog);
