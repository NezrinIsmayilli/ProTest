import React, { useState } from 'react';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { SelectProduct, SelectProductByBarcode } from '../index.js';
import AddProduct from './AddProduct.js';
import styles from '../../styles.module.scss';

const AddProductsLayout = props => {
    const {
        productionInfo,
        handleProductNameChange,
        handleProductBarcodeChange,
        handleChangeSearch,
        barcodeInput,
        toggleCatalogModal,
        summaries,
    } = props;
    const [modalIsVisible, setModalIsVisible] = useState(false);
    return (
        <>
            <AddProduct
                visible={modalIsVisible}
                toggleVisible={setModalIsVisible}
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
                        summaries={summaries}
                        productionInfo={productionInfo}
                        handleProductNameChange={handleProductNameChange}
                    />
                    <SelectProductByBarcode
                        handleChangeSearch={handleChangeSearch}
                        handleProductBarcodeChange={handleProductBarcodeChange}
                        barcodeInput={barcodeInput}
                    />
                    {productionInfo &&
                    productionInfo.stockToId !== null ? null : (
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
                    )}
                </div>
                <Button
                    className={styles.catalogButton}
                    onClick={toggleCatalogModal}
                    type="primary"
                >
                    Kataloqdan seç
                </Button>
            </div>
        </>
    );
};

export const AddProducts = AddProductsLayout;
