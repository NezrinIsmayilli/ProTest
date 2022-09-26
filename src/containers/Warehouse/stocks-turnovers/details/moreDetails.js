/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Collapse, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import Detail from 'containers/Warehouse/Products/detail';
import { CustomerTypeDetail } from 'containers/Warehouse/Products/customerTypeDetail';
import styles from '../../styles.module.scss';

const { Panel } = Collapse;

function MoreDetails(props) {
    const { row, isLoading, product } = props;
    const componentRef = useRef();

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
                    <Detail
                        primary="Anbar qalığı"
                        secondary={
                            row?.quantity && row.quantity !== null
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
    {}
)(MoreDetails);
