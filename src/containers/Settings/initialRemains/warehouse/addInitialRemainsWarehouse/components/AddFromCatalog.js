/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProModal, ProSelect, ProAsyncSelect } from 'components/Lib';
import {
    setSelectedProducts,
    clearProductsFromCatalog,
    clearSearchedCatalogs,
    fetchSalesPrices,
} from 'store/actions/sales-operation';
import { fetchProducts as fetchAllProducts } from 'store/actions/product';
import { Button, Checkbox } from 'antd';
import styles from '../styles.module.scss';

const AddFromCatalogModal = ({
    isVisible,
    form = {},
    priceTypesLoading = false,
    filteredProducts,
    products,
    catalogs,
    fetchCatalogs,
    selectedProducts,
    setSelectedProducts,
    fetchProducts,
    toggleModal,
    catalogsLoading,
    productsLoading,
    clearProductsFromCatalog,
    allProducts,
    fetchAllProducts,
    setSelectedCatalog = () => null,
    fetchProductFromCatalogs = () => null,
}) => {
    const dispatch = useDispatch();
    const { getFieldValue } = form;
    const [newSelectedProducts, setNewSelectedProducts] = useState([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState(undefined);
    const [allCatalogsSelected, setAllCatalogsSelected] = useState(false);
    const [selectedChildCatalogId, setSelectedChildCatalogId] = useState(
        undefined
    );

    const handleModal = () => {
        toggleModal();
    };

    const handleCatalogSelect = selectedCatalogId => {
        setSelectedCatalogId(selectedCatalogId);
        setSelectedCatalog(selectedCatalogId);
        setSelectedChildCatalogId(undefined);
        if (catalogs.children[selectedCatalogId].length > 0) {
            return;
        }
        fetchProductFromCatalogs(selectedCatalogId, 1, 20, '', 1);
    };

    const handleChildCatalogSelect = selectedChildCatalogId => {
        setSelectedChildCatalogId(selectedChildCatalogId);
        setSelectedCatalog(selectedChildCatalogId);
        fetchProductFromCatalogs(selectedChildCatalogId, 1, 20, '', 1);
        // fetchProducts(selectedChildCatalogId);
    };

    const clearModal = () => {
        setNewSelectedProducts([]);
        setSelectedCatalog(undefined);
        setSelectedCatalogId(undefined);
        setSelectedChildCatalogId(undefined);
        dispatch(clearProductsFromCatalog);
        setAllCatalogsSelected(false);
    };
    useEffect(() => {
        if (isVisible) {
            fetchCatalogs(1, 20, '', 1);
            fetchAllProducts({ filters: { type: 'product', isDeleted: 0 } });
        } else {
            clearModal();
        }
    }, [isVisible]);

    const handleConfirmClick = () => {
        if (allCatalogsSelected) {
            const productsWithPrices = allProducts
                .filter(
                    item =>
                        !selectedProducts.map(({ id }) => id).includes(item.id)
                )
                .map(product => ({
                    ...product,
                    catalog: {
                        isWithoutSerialNumber: product.isWithoutSerialNumber,
                    },
                    invoiceQuantity: product.invoiceQuantity
                        ? product.invoiceQuantity
                        : product.isWithoutSerialNumber
                        ? 1
                        : null,
                }));

            dispatch(
                setSelectedProducts({
                    newSelectedProducts: [
                        ...productsWithPrices,
                        ...selectedProducts,
                    ],
                })
            );
        } else {
            const productsWithPrices = newSelectedProducts.map(product => ({
                ...product,
                invoiceQuantity: product.invoiceQuantity
                    ? product.invoiceQuantity
                    : product.catalog.isWithoutSerialNumber
                    ? 1
                    : null,
            }));

            dispatch(
                setSelectedProducts({
                    newSelectedProducts: [
                        ...productsWithPrices,
                        ...selectedProducts,
                    ],
                })
            );
        }
        toggleModal();
    };

    const addProduct = productIds => {
        const [productId] = productIds;
        const newProduct = filteredProducts.find(product => product.id === productId);
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

    const handleAllCatalogs = event => {
        if (event.target.checked) {
            setAllCatalogsSelected(true);
            setSelectedCatalogId(undefined);
            setSelectedChildCatalogId(undefined);
            setNewSelectedProducts([]);
        } else {
            setAllCatalogsSelected(false);
        }
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
                <Checkbox
                    checked={allCatalogsSelected}
                    onChange={handleAllCatalogs}
                >
                    Bütün məhsulları seç
                </Checkbox>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Kataloqlar</span>
                    <ProAsyncSelect
                        allowClear={false}
                        selectRequest={fetchCatalogs}
                        data={catalogs.root || []}
                        value={selectedCatalogId}
                        valueOnChange={e => {
                            handleCatalogSelect(e);
                        }}
                        disabled={allCatalogsSelected}
                    />
                    {/* <ProSelect
                        allowClear={false}
                        loading={catalogsLoading}
                        data={catalogs.root || []}
                        value={selectedCatalogId}
                        onChange={handleCatalogSelect}
                        disabled={allCatalogsSelected}
                    /> */}
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
                        disabled={!selectedCatalogId || allCatalogsSelected}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Məhsullar</span>
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'quantityLabel']}
                        selectRequest={(
                            page,
                            limit,
                            search,
                            stateReset,
                            onSuccessCallback
                        ) => {
                            if (selectedCatalogId) {
                                fetchProductFromCatalogs(
                                    catalogs.children[selectedCatalogId]
                                        .length > 0
                                        ? selectedChildCatalogId
                                        : selectedCatalogId,
                                    page,
                                    limit,
                                    search,
                                    stateReset,
                                    onSuccessCallback
                                );
                            }
                        }}
                        data={
                            [...selectedProducts, ...newSelectedProducts]
                                .length > 0
                                ? filteredProducts.filter(
                                      product =>
                                          ![
                                              ...selectedProducts.map(
                                                  selectedProduct =>
                                                      selectedProduct?.id
                                              ),
                                              ...newSelectedProducts.map(
                                                  newSelectedProduct =>
                                                      newSelectedProduct?.id
                                              ),
                                          ].includes(product?.id)
                                  )
                                : filteredProducts
                        }
                        disabled={
                            !selectedCatalogId ||
                            allCatalogsSelected ||
                            (catalogs.children[selectedCatalogId].length > 0 &&
                                !selectedChildCatalogId)
                        }
                        value={undefined}
                        valueOnChange={e => {
                            addProduct(e);
                        }}
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
                            newSelectedProduct => newSelectedProduct?.id
                        )}
                        onChange={handleSelectedProductsChange}
                        disabled={allCatalogsSelected}
                    />
                </div>
                <div className={styles.button}>
                    <Button
                        type="primary"
                        className={styles.confirmButton}
                        onClick={handleConfirmClick}
                        loading={priceTypesLoading}
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
    // catalogs: state.salesOperation.catalogs,
    products: state.salesOperation.productsFromCatalog,
    selectedProducts: state.salesOperation.selectedProducts,
    catalogsLoading: state.loadings.fetchCatalogsByInvoiceType,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    productsLoading: state.loadings.fetchProductsFromCatalog,
    priceTypesLoading: state.loadings.fetchSalesPricesFromCatalog,
    allProducts: state.productReducer.products,
});

export const AddFromCatalog = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        clearProductsFromCatalog,
        clearSearchedCatalogs,
        fetchSalesPrices,
        fetchAllProducts,
    }
)(AddFromCatalogModal);
