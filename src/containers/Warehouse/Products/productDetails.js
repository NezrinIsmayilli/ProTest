/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { fetchProduct } from 'store/actions/product';
import { connect } from 'react-redux';
import { Collapse, Spin, Modal } from 'antd';
import { DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import Detail from './detail';
import styles from '../styles.module.scss';
import { CustomerTypeDetail } from './customerTypeDetail';

const { Panel } = Collapse;

function ProductDetails(props) {
    const { row, fetchProduct, isLoading, product } = props;
    const componentRef = useRef();
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => row?.id && fetchProduct({ id: row.id }), [row]);

    const {
        name,
        currencyCode,
        catalogName,
        barcode,
        productCode,
        description,
        productPrices,
        unitOfMeasurementName,
        salesPrice,
        isServiceType,
        parentCatalogName,
        isWithoutSerialNumber,
        quantity,
    } = product;

    return (
        <div ref={componentRef} style={{ padding: 16 }}>
            <Modal
                closable={false}
                visible={previewVisible}
                // title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img
                    alt="example"
                    style={{ width: '100%' }}
                    src={row.attachmentUrl}
                />
            </Modal>
            <Spin spinning={isLoading}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}
                >
                    <span className={styles.modalTitle}>{name}</span>

                    <div
                        style={{ display: 'flex', alignItems: 'center' }}
                    ></div>
                </div>

                <ul className={styles.detailsList}>
                    <Detail
                        primary="Məhsul Tipi"
                        secondary={isServiceType ? 'Servis' : 'Məhsul'}
                    />
                    <Detail
                        primary="Seriya Nömrəsi"
                        secondary={isWithoutSerialNumber ? 'Yox' : 'Hə'}
                    />
                    <Detail primary="Barkod" secondary={barcode || '-'} />
                    <Detail
                        primary="Məhsul kodu"
                        secondary={productCode || '-'}
                    />
                    <Detail
                        primary="Kataloq"
                        secondary={parentCatalogName || '-'}
                    />
                    <Detail
                        primary="Alt kataloq"
                        secondary={
                            catalogName === parentCatalogName
                                ? '-'
                                : catalogName
                        }
                    />
                    <Detail primary="Məhsul adı" secondary={name || '-'} />
                    {row?.attachmentId !== null ? (
                        <Collapse
                            expandIconPosition="right"
                            defaultActiveKey={['1']}
                            className={styles.additionalCollapse}
                        >
                            <Panel header="Fotoşəkil" key="1">
                                <div className={styles.fileIcon}>
                                    <img
                                        alt="example"
                                        style={{
                                            height: '110px',
                                            objectFit: 'contain',
                                            width: '100px',
                                            position: 'relaltive',
                                        }}
                                        src={row.attachmentUrl}
                                    />
                                    <div className={styles.description}>
                                        <div
                                            className={styles.descriptionIcons}
                                        >
                                            <DetailButton
                                                className={
                                                    styles.descriptionIcon
                                                }
                                                onClick={() =>
                                                    setPreviewVisible(true)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </Collapse>
                    ) : null}
                    <Detail
                        primary="Anbar qalığı"
                        secondary={
                            row.quantity && row.quantity !== null
                                ? formatNumberToLocale(
                                      defaultNumberFormat(row.quantity)
                                  )
                                : '-'
                        }
                    />
                    <Detail
                        primary="Ölçü vahidi"
                        secondary={unitOfMeasurementName || '-'}
                    />
                    <Detail
                        primary="Satış qiyməti"
                        secondary={
                            Number(salesPrice)
                                ? `${formatNumberToLocale(
                                      defaultNumberFormat(salesPrice)
                                  )} ${currencyCode || ''}`
                                : '-'
                        }
                    />
                    <Detail
                        primary="Status"
                        secondary={
                         row.isDeleted?   (
                                <span
                                  style={{
                                    color: '#C4C4C4',
                                    background: '#F8F8F8',
                                  }}
                                  className={styles.chip}
                                >
                                  Silinib
                                </span>
                              ) : (
                                <span
                                  className={styles.chip}
                                  style={{
                                    color: '#F3B753',
                                    background: '#FDF7EA',
                                  }}
                                >
                                  Aktiv
                                </span>
                              ) || '-'}
                    />

                    {productPrices
                        ?.filter(productPrice => productPrice.amount)
                        .map((type, key) => (
                            <CustomerTypeDetail
                                key={key}
                                name={type.price_type_name}
                                currency={product.currencyCode}
                                price={
                                    type.amount === null
                                        ? salesPrice
                                        : type.amount
                                }
                                discount={
                                    type.amount === null
                                        ? 0
                                        : 100 - (type.amount * 100) / salesPrice
                                }
                            />
                        ))}

                    <Collapse
                        expandIconPosition="right"
                        defaultActiveKey={['1']}
                        className={styles.additionalCollapse}
                    >
                        <Panel header="Əlavə məlumat" key="1">
                            <p>{description}</p>
                        </Panel>
                    </Collapse>
                </ul>
            </Spin>
        </div>
    );
}

const mapStateToProps = state => ({
    product: state.productReducer.product,
    isLoading: state.productReducer.isLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchProduct,
    }
)(ProductDetails);
