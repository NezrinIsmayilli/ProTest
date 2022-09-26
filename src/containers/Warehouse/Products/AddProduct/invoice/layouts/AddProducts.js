import React from 'react';
import { Button, Row, Col } from 'antd';
import { SelectProduct, SelectProductByBarcode } from '../index.js';
import styles from '../../styles.module.scss';

const AddProductsLayout = props => {
    const {
        ids,
        handleProductNameChange,
        handleProductBarcodeChange,
        handleChangeSearch,
        barcodeInput,
        toggleCatalogModal,
        summaries,
    } = props;
    return (
        <div className={styles.addProductTerkib}>
            <Row
                type="flex"
                align="middle"
                gutter={16}
                style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '0',
                }}
            >
                <Col
                    lg={16}
                    md={20}
                    sm={24}
                    xs={24}
                    style={{ paddingLeft: '0' }}
                >
                    <Col lg={10} md={10} sm={24} xs={24}>
                        <SelectProduct
                            ids={ids}
                            summaries={summaries}
                            handleProductNameChange={handleProductNameChange}
                        />
                    </Col>
                    <Col lg={10} md={10} sm={24} xs={24}>
                        <SelectProductByBarcode
                            ids={ids}
                            handleChangeSearch={handleChangeSearch}
                            handleProductBarcodeChange={
                                handleProductBarcodeChange
                            }
                            barcodeInput={barcodeInput}
                        />
                    </Col>
                </Col>
                <Col
                    lg={4}
                    md={4}
                    sm={24}
                    xs={24}
                    className={styles.catalogBtnColumn}
                >
                    <Button
                        className={styles.catalogButton}
                        onClick={toggleCatalogModal}
                        type="primary"
                    >
                        Kataloqdan seç
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export const AddProducts = AddProductsLayout;
