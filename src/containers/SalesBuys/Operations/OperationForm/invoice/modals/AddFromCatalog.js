/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { ProModal, ProSelect, ProAsyncSelect } from 'components/Lib';
import {
    setSelectedProducts,
    clearProductsFromCatalog,
    clearSearchedCatalogs,
    fetchSalesPrices,
} from 'store/actions/sales-operation';
import { Button, Checkbox } from 'antd';
import math from 'exact-math';
import { roundToDown } from 'utils';
import styles from '../../styles.module.scss';

const AddFromCatalogModal = ({
    id,
    invoiceInfo,
    type = 'purchase',
    isVisible,
    form = {},
    priceTypesLoading = false,
    filteredProducts,
    products,
    catalogs,
    fetchCatalogs,
    selectedProducts,
    selectedExpenses,
    invoice_expense_rate,
    setSelectedProducts,
    fetchSalesPrices,
    toggleModal,
    catalogsLoading,
    productsLoading,
    clearProductsFromCatalog,
    getAllProducts,
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
        if (catalogs.children[selectedCatalogId]?.length > 0) {
            return;
        }
        fetchProductFromCatalogs(selectedCatalogId, 1, 20, '', 1);
    };

    const handleChildCatalogSelect = selectedChildCatalogId => {
        setSelectedChildCatalogId(selectedChildCatalogId);
        setSelectedCatalog(selectedChildCatalogId);
        fetchProductFromCatalogs(selectedChildCatalogId, 1, 20, '', 1);
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
        if (!isVisible) {
            clearModal();
        }
    }, [isVisible]);

    const handleConfirmClick = () => {
        if (type === 'sales') {
            fetchSalesPrices({
                filters: {
                    currency: getFieldValue('currency'),
                    products: newSelectedProducts.map(product => product.id),
                    businessUnitIds: id
                        ? invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId]
                        : cookies.get('_TKN_UNIT_')
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                },
                label: 'fetchSalesPricesFromCatalog',
                onSuccessCallback: ({ data: priceTypes }) => {
                    const productsWithPrices = newSelectedProducts.map(
                        product => {
                            const invoicePrice = priceTypes[product.id].default
                                .convertedAmount
                                ? Number(
                                      priceTypes[product.id].default
                                          .convertedAmount
                                  )
                                : undefined;

                            return {
                                ...product,
                                invoiceQuantity: product.invoiceQuantity
                                    ? product.invoiceQuantity
                                    : product.catalog.isWithoutSerialNumber
                                    ? 1
                                    : null,
                                prices: priceTypes[product.id],
                                invoicePrice,
                            };
                        }
                    );

                    dispatch(
                        setSelectedProducts({
                            newSelectedProducts: [
                                ...productsWithPrices,
                                ...selectedProducts,
                            ],
                        })
                    );
                    toggleModal();
                },
            });
        } else {
            if (type === 'transfer' && allCatalogsSelected) {
                const productsWithPrices = products
                    .filter(
                        product =>
                            ![
                                ...selectedProducts.map(
                                    selectedProduct => selectedProduct?.id
                                ),
                                ...newSelectedProducts.map(
                                    newSelectedProduct => newSelectedProduct?.id
                                ),
                            ].includes(product.id)
                    )
                    .map(product => ({
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
            } else {
                const total_expense_amount = selectedExpenses.reduce(
                    (total_amount, { expense_amount }) =>
                        math.add(
                            total_amount,
                            math.mul(
                                Number(expense_amount) || 0,
                                Number(invoice_expense_rate)
                            )
                        ),
                    0
                );
                const invoice_amount = [
                    ...selectedProducts,
                    newSelectedProducts,
                ].reduce(
                    (totalPrice, { invoiceQuantity, invoicePrice }) =>
                        math.add(
                            totalPrice,
                            math.mul(
                                Number(invoiceQuantity) || 0,
                                Number(invoicePrice) || 0
                            )
                        ),
                    0
                );

                const expense_amount_in_percentage = math.div(
                    math.mul(Number(total_expense_amount), 100),
                    Number(invoice_amount) || 1
                );

                dispatch(
                    setSelectedProducts({
                        newSelectedProducts: [
                            ...newSelectedProducts,
                            ...selectedProducts,
                        ].map(product => {
                            const expense_amount = math.div(
                                math.mul(
                                    Number(product.invoicePrice) || 0,
                                    Number(expense_amount_in_percentage) || 0
                                ),
                                100
                            );

                            return {
                                ...product,
                                invoiceQuantity: product.invoiceQuantity
                                    ? product.invoiceQuantity
                                    : product.catalog.isWithoutSerialNumber
                                    ? 1
                                    : null,
                                expense_amount_in_percentage: roundToDown(
                                    expense_amount_in_percentage
                                ),
                                expense_amount: roundToDown(expense_amount),
                                cost: roundToDown(
                                    math.add(
                                        Number(expense_amount) || 0,
                                        Number(product.invoicePrice) || 0
                                    )
                                ),
                            };
                        }),
                    })
                );
            }
            toggleModal();
        }
    };

    const addProduct = productIds => {
        const [productId] = productIds;
        const newProduct = filteredProducts.find(
            product => product.id === productId
        );
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
            setSelectedCatalog(undefined);
            setSelectedChildCatalogId(undefined);
            setNewSelectedProducts([]);
            getAllProducts();
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
                {type === 'transfer' ? (
                    <Checkbox
                        checked={allCatalogsSelected}
                        onChange={handleAllCatalogs}
                    >
                        Bütün məhsulları seç
                    </Checkbox>
                ) : null}
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Kataloqlar</span>
                    <ProAsyncSelect
                        allowClear={false}
                        selectRequest={fetchCatalogs}
                        data={catalogs.root || []}
                        disabled={allCatalogsSelected}
                        value={selectedCatalogId}
                        valueOnChange={e => {
                            handleCatalogSelect(e);
                        }}
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
                            if (selectedCatalogId && !allCatalogsSelected) {
                                fetchProductFromCatalogs(
                                    catalogs.children[selectedCatalogId]
                                        ?.length > 0
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
                            (catalogs.children[selectedCatalogId]?.length > 0 &&
                                !selectedChildCatalogId)
                        }
                        value={undefined}
                        valueOnChange={e => {
                            addProduct(e);
                        }}
                    />
                    {/* <ProSelect
                        mode="multiple"
                        loading={productsLoading}
                        keys={['name', 'quantityLabel']}
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
                        onChange={addProduct}
                        disabled={!selectedCatalogId || allCatalogsSelected}
                    /> */}
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
    products: state.salesOperation.productsFromCatalog,
    selectedProducts: state.salesOperation.selectedProducts,
    catalogsLoading: state.loadings.fetchCatalogsByInvoiceType,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    productsLoading: state.loadings.fetchProductsFromCatalog,
    priceTypesLoading: state.loadings.fetchSalesPricesFromCatalog,
});

export const AddFromCatalog = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        clearProductsFromCatalog,
        clearSearchedCatalogs,
        fetchSalesPrices,
    }
)(AddFromCatalogModal);
