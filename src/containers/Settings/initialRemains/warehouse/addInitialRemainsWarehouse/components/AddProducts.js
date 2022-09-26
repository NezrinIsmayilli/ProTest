import React, { useState } from 'react';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { SelectProduct } from './SelectProduct';
import { SelectProductByBarcode } from './SelectProductByBarcode';
import AddProduct from './AddProduct.js';
import styles from '../styles.module.scss';

const AddProductsLayout = props => {
    const {
        selectProductIsDisabled,
        handleProductNameChange,
        handleProductBarcodeChange,
        handleChangeSearch,
        barcodeInput,
        catalogModalIsDisabled,
        toggleCatalogModal,
        fetchCatalogs,
        selectedStock,
    } = props;

    const [modalIsVisible, setModalIsVisible] = useState(false);

    return (
        <>
            <AddProduct
                visible={modalIsVisible}
                toggleVisible={setModalIsVisible}
                fetchCatalogs={fetchCatalogs}
                selectedStock={selectedStock}
            />
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
                        disabled={selectProductIsDisabled}
                        handleProductNameChange={handleProductNameChange}
                    />
                    <SelectProductByBarcode
                        disabled={selectProductIsDisabled}
                        handleChangeSearch={handleChangeSearch}
                        handleProductBarcodeChange={handleProductBarcodeChange}
                        barcodeInput={barcodeInput}
                    />
                    <div className={styles.greenButton}>
                        <ButtonGreen
                            onClick={() => setModalIsVisible(true)}
                            icon={
                                <FaPlus
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
                <Button
                    className={styles.catalogButton}
                    onClick={
                        catalogModalIsDisabled ? () => {} : toggleCatalogModal
                    }
                    disabled={catalogModalIsDisabled}
                    type="primary"
                >
                    Kataloqdan seç
                </Button>
            </div>
        </>
    );
};

export const AddProducts = AddProductsLayout;
