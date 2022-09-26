/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { ProModal, ProSelect } from 'components/Lib';
import { clearProductsFromCatalog } from 'store/actions/sales-operation';
import {
  fetchProductConfiguration,
  setSelectedProductConfiguration,
} from 'store/actions/finance/salesBonus';
import { fetchProducts } from 'store/actions/product';
import { toast } from 'react-toastify';
import { fetchCatalogs } from 'store/actions/catalog';

import styles from '../styles.module.scss';

const AddProduct = props => {
  const {
    setDefaultExpand,
    visible,
    toggleVisible,
    products,
    catalogs,
    selectedConfiguration,
    selected,
    setSelected,

    fetchCatalogs,
    fetchProducts,

    catalogsLoading,
    productsLoading,
  } = props;

  const [newSelectedProducts, setNewSelectedProducts] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(undefined);
  const [selectedChildCatalog, setSelectedChildCatalog] = useState(undefined);

  const handleModal = () => {
    toggleVisible();
  };
  const handleCatalogSelect = selectedCatalogId => {
    const catalog = catalogs.root.filter(
      catalog => catalog.id === selectedCatalogId
    );
    setSelectedCatalog(catalog);
    setSelectedChildCatalog(undefined);
    if (catalogs.children[selectedCatalogId].length > 0) {
      return;
    }
    fetchProducts({ filters: { catalogId: selectedCatalogId, isDeleted: 0 } });
  };

  const handleChildCatalogSelect = selectedChildCatalogId => {
    const childCatalog = catalogs.children[(selectedCatalog?.[0].id)].filter(
      catalog => catalog.id === selectedChildCatalogId
    );
    setSelectedChildCatalog(childCatalog);
    fetchProducts({ filters: { catalogId: selectedChildCatalogId, isDeleted: 0 } });
  };

  const clearModal = () => {
    setNewSelectedProducts([]);
    setSelectedCatalog(undefined);
    setSelectedChildCatalog(undefined);
  };
  useEffect(() => {
    if (visible) {
      fetchCatalogs();
    } else {
      clearModal();
    }
  }, [visible]);
  const addProduct = productIds => {
    const newProduct = products.filter(product => product.id === productIds);
    setNewSelectedProducts(newProduct);
  };
  const handleConfirmClick = () => {
    const elem = selected.find(
      item =>
        item.catalogId === (selectedCatalog?.[0]?.id || null) &&
        item.subCatalogId === (selectedChildCatalog?.[0]?.id || null) &&
        item.productId === (newSelectedProducts?.[0]?.id || null)
    );
    const isDouble = selected.filter(selectedItem => {
      return selectedItem.children.some(({ bonusAmount, id }) => {
        if (!id && !bonusAmount && !bonusAmount > 0) {
          return true;
        }
        return false;
      });
    });
    if (isDouble && isDouble.length > 0) {
      toast.error('Cədvəldə bonusu əlavə olunmamış məhsul mövcuddur');
    } else {
      if (elem) {
        setSelected(prevSelected =>
          prevSelected.map(selected => {
            if (
              selected.configurationProductId === elem.configurationProductId
            ) {
              if (selected?.hasOwnProperty('children')) {
                setDefaultExpand([selected?.id]);
                return {
                  ...selected,
                  salesBonusConfiguration: selectedConfiguration?.id,
                  children: [
                    ...selected.children,
                    {
                      catalogName: selected?.catalogName,
                      configurationProductId: selected?.configurationProductId,
                      productName: selected?.productName,
                      subCatalogName: selected?.subCatalogName,
                      turnoverUnitOfMeasurement:
                        selected?.turnoverUnitOfMeasurement,
                      bonusUnitOfMeasurement: selected?.bonusUnitOfMeasurement,
                      minTurnoverAmount:
                        selected?.turnoverUnitOfMeasurement === 1 ? 1 : 0,
                      bonusAmount: 0,
                    },
                  ],
                };
              }
              return {
                ...selected,
                bonusAmount: 0,
                salesBonusConfiguration: selectedConfiguration?.id,
                minTurnoverAmount:
                  selected?.turnoverUnitOfMeasurement === 1 ? 1 : 0,
              };
            }
            return selected;
          })
        );
      } else {
        const data = {
          salesBonusConfiguration: selectedConfiguration?.id,
          catalogId: selectedCatalog?.[0]?.id || null,
          catalogName: selectedCatalog?.[0]?.name || null,
          subCatalogId: selectedChildCatalog?.[0]?.id || null,
          subCatalogName: selectedChildCatalog?.[0]?.name || null,
          productId: newSelectedProducts?.[0]?.id || null,
          productName: newSelectedProducts?.[0]?.name || null,
          children: [],
          minTurnoverAmount: 0,
          bonusAmount: 0,
          turnoverUnitOfMeasurement: 2,
          bonusUnitOfMeasurement: 1,
          configurationProductId: `${selectedCatalog?.[0]?.id}_${
            selectedChildCatalog?.[0]?.id ? selectedChildCatalog?.[0]?.id : 0
          }_${newSelectedProducts?.[0]?.id ? newSelectedProducts?.[0]?.id : 0}`,
        };
        setSelected([...selected, data]);
      }
      handleModal();
    }
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
            value={selectedCatalog?.[0].id}
            onChange={handleCatalogSelect}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Alt kataloqlar</span>
          <ProSelect
            loading={catalogsLoading}
            value={selectedChildCatalog?.[0]?.id}
            data={
              selectedCatalog
                ? catalogs.children[(selectedCatalog?.[0].id)]
                : []
            }
            onChange={handleChildCatalogSelect}
            disabled={!selectedCatalog}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Məhsullar</span>
          <ProSelect
            loading={productsLoading}
            keys={['name']}
            data={
              [...selected, newSelectedProducts].length > 0
                ? products.filter(
                    product =>
                      ![
                        ...selected.map(selectedProduct => selectedProduct.id),
                        newSelectedProducts.id,
                      ].includes(product.id)
                  )
                : products
            }
            value={newSelectedProducts.map(
              newSelectedProduct => newSelectedProduct.id
            )}
            onChange={addProduct}
            disabled={!selectedCatalog}
          />
        </div>
        <div className={styles.button}>
          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={handleConfirmClick}
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
  catalogs: state.catalogsReducer.catalogs,
  products: state.productReducer.products,
  selectedProducts: state.salesOperation.selectedProducts,
  selectedConfiguration: state.bonusConfigurationReducer.selectedConfiguration,
  selectedProductConfiguration:
    state.bonusConfigurationReducer.selectedProductConfiguration,
  catalogsLoading: state.loadings.catalogs,
  selectedExpenses: state.salesOperation.selectedExpenses,
  invoice_expense_rate: state.salesOperation.invoice_expense_rate,
  productsLoading: state.loadings.products,
});

export default connect(
  mapStateToProps,
  {
    clearProductsFromCatalog,
    fetchCatalogs,
    fetchProducts,
    fetchProductConfiguration,
    setSelectedProductConfiguration,
  }
)(AddProduct);
