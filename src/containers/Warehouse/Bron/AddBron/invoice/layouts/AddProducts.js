import React from 'react';
import { Button, Row, Col } from 'antd';
import { SelectProduct, SelectProductByBarcode } from '../index.js';
import styles from '../../styles.module.scss';

const AddProductsLayout = props => {
    const {
        selectProductIsDisabled,
        handleProductNameChange,
        handleProductBarcodeChange,
        barcodeInput,
        handleChangeSearch,
        catalogModalIsDisabled,
        toggleCatalogModal,
    } = props;
    return (
        <Row
            gutter={16}
            type="flex"
            align="middle"
            style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0',
            }}
        >
            <Col lg={18} md={18} sm={24} xs={24} style={{ paddingLeft: '0' }}>
                <Col lg={9} md={12} sm={24} xs={24}>
                    <SelectProduct
                        disabled={selectProductIsDisabled}
                        handleProductNameChange={handleProductNameChange}
                    />
                </Col>
                <Col lg={9} md={12} sm={24} xs={24}>
                    <SelectProductByBarcode
                        handleChangeSearch={handleChangeSearch}
                        disabled={selectProductIsDisabled}
                        handleProductBarcodeChange={handleProductBarcodeChange}
                        barcodeInput={barcodeInput}
                    />
                </Col>
            </Col>
            <Col
                lg={4}
                md={6}
                sm={24}
                xs={24}
                className={styles.catalogBtnColumn}
            >
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
            </Col>
        </Row>
    );
};

export const AddProducts = AddProductsLayout;
