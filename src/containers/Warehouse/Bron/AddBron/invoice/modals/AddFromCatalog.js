/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProAsyncSelect, ProModal, ProSelect } from 'components/Lib';
import {
    setSelectedProducts,
    clearProductsFromCatalog,
    clearSearchedCatalogs,
} from 'store/actions/sales-operation';
import { Button } from 'antd';
import styles from '../../styles.module.scss';

const AddFromCatalogModal = ({
    isVisible,
    products,
    catalogs,
    fetchCatalogs,
    selectedProducts,
    setSelectedProducts,
    fetchProducts,
    fetchAsyncProducts,
    toggleModal,
    catalogsLoading,
    productsLoading,
    clearProductsFromCatalog,
}) => {
    const dispatch = useDispatch();
    const [newSelectedProducts, setNewSelectedProducts] = useState([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState(undefined);
    const [selectedChildCatalogId, setSelectedChildCatalogId] = useState(
        undefined
    );

    const handleModal = () => {
        toggleModal();
    };

    const handleCatalogSelect = selectedCatalogId => {
        setSelectedCatalogId(selectedCatalogId);
        setSelectedChildCatalogId(undefined);
        if (catalogs.children[selectedCatalogId].length > 0) {
            return;
        }
        fetchProducts(selectedCatalogId);
    };

    const handleChildCatalogSelect = selectedChildCatalogId => {
        setSelectedChildCatalogId(selectedChildCatalogId);
        fetchProducts(selectedChildCatalogId);
    };

    const clearModal = () => {
        setNewSelectedProducts([]);
        setSelectedCatalogId(undefined);
        setSelectedChildCatalogId(undefined);
        dispatch(clearProductsFromCatalog);
    };
    useEffect(() => {
        if (isVisible) {
            fetchCatalogs(1, 20, '', 1);
        } else {
            clearModal();
        }
    }, [isVisible]);

    const handleConfirmClick = () => {
        dispatch(
            setSelectedProducts({
                newSelectedProducts: [
                    ...newSelectedProducts,
                    ...selectedProducts,
                ].map(product => ({
                    ...product,
                    invoiceQuantity: product.invoiceQuantity
                        ? product.invoiceQuantity
                        : product.catalog.isWithoutSerialNumber
                        ? 1
                        : null,
                })),
            })
        );
        toggleModal();
    };

    const addProduct = productIds => {
        const [productId] = productIds;
        const newProduct = products.find(product => product.id === productId);
        setNewSelectedProducts(prevNewSelectedProducts => [
            newProduct,
            ...prevNewSelectedProducts,
        ]);
    };
    const handleSelectedProductsChange = productIds => {
        const newProducts = newSelectedProducts.filter(product =>
            productIds.includes(product.id)
        );
        setNewSelectedProducts(newProducts);
    };

    return (
        <ProModal
            maskClosable
            width={400}
            isVisible={isVisible}
            customStyles={styles.AddSerialNumbersModal}
            handleModal={handleModal}
        >
            <div className={styles.AddFromCatalog}>
                <h2>Kataloqdan seç</h2>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Kataloqlar</span>
                    <ProAsyncSelect
                        allowClear={false}
                        selectRequest={fetchCatalogs}
                        data={catalogs.root || []}
                        value={selectedCatalogId}
                        valueOnChange={handleCatalogSelect}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Alt kataloqlar</span>
                    <ProSelect
                        loading={catalogsLoading}
                        value={selectedChildCatalogId}
                        data={
                            selectedCatalogId
                                ? catalogs.children[selectedCatalogId]
                                : []
                        }
                        onChange={handleChildCatalogSelect}
                        disabled={!selectedCatalogId}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Məhsullar</span>
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'quantityLabel']}
                        selectRequest={fetchAsyncProducts}
                        data={
                            [...selectedProducts, ...newSelectedProducts]
                                .length > 0
                                ? products.filter(
                                      product =>
                                          ![
                                              ...selectedProducts.map(
                                                  selectedProduct =>
                                                      selectedProduct.id
                                              ),
                                              ...newSelectedProducts.map(
                                                  newSelectedProduct =>
                                                      newSelectedProduct.id
                                              ),
                                          ].includes(product.id)
                                  )
                                : products
                        }
                        value={undefined}
                        valueOnChange={addProduct}
                        disabled={!selectedCatalogId}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>
                        Seçilmiş məhsullar
                    </span>
                    <ProSelect
                        mode="multiple"
                        data={newSelectedProducts}
                        value={newSelectedProducts.map(
                            newSelectedProduct => newSelectedProduct.id
                        )}
                        onChange={handleSelectedProductsChange}
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
    selectedProducts: state.salesOperation.selectedProducts,
    catalogsLoading: state.loadings.fetchBronCatalogs,
    productsLoading: state.loadings.fetchBronProductsFromCatalog,
});

export const AddFromCatalog = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        clearProductsFromCatalog,
        clearSearchedCatalogs,
    }
)(AddFromCatalogModal);
