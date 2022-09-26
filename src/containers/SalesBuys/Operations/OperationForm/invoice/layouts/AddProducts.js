import React, { useState } from 'react';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { SelectProduct, SelectProductByBarcode } from '../index.js';
import styles from '../../styles.module.scss';
import AddProduct from './AddProduct.js';

const AddProductsLayout = props => {
    const {
        selectProductIsDisabled,
        handleProductNameChange,
        handleProductBarcodeChange,
        handleChangeSearch,
        barcodeInput,
        catalogModalIsDisabled,
        toggleCatalogModal,
        type,
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
                        {type === 'import-purchase' || type === 'purchase' ? (
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
                        ) : null}
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
