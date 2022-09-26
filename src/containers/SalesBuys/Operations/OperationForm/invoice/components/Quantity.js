import React from 'react';
import { ProInput } from 'components/Lib';
import { Tooltip } from 'antd';
import styles from '../../styles.module.scss';

const QuantityComponent = props => {
    const {
        value,
        row,
        handleQuantityChange,
        limit,
        invoiceInfo,
        selectedProducts,
        serialModalIsVisible,
        scrolled,
        setScrolled = () => {},
    } = props;
    const { id, catalog } = row;

    const onChange = event => {
        setScrolled(false);
        handleQuantityChange(id, event.target.value, limit);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
                visible={
                    Number(value || 0) < row.usedQuantity &&
                    !serialModalIsVisible &&
                    !scrolled
                }
                placement="right"
                title={`Məhsuldan istifadə olunduğu üçün say minimum ${row.usedQuantity} olaraq dəyişdirilə bilər.`}
            >
                <ProInput
                    size="default"
                    value={value}
                    onChange={onChange}
                    disabled={
                        !catalog.isWithoutSerialNumber ||
                        (invoiceInfo &&
                            invoiceInfo?.isUsedByAnotherInvoice &&
                            Number(row.usedQuantity) > 0 &&
                            !catalog.isServiceType &&
                            invoiceInfo?.invoiceType !== 1)
                    }
                    className={`${
                        Number(value || 0) > 0 &&
                        Number(value || 0) >= (row.usedQuantity || 0)
                            ? {}
                            : styles.inputError
                    } ${styles.tableInput}`}
                />
            </Tooltip>

            {selectedProducts?.filter(
                ({ usedQuantity }) => Number(usedQuantity) > 0
            )?.length > 0 ? (
                invoiceInfo &&
                invoiceInfo?.isUsedByAnotherInvoice &&
                Number(row.usedQuantity) > 0 &&
                !catalog.isServiceType &&
                invoiceInfo?.invoiceType !== 1 &&
                !serialModalIsVisible ? (
                    <Tooltip
                        title="Məhsulun sayı qaimədən seç hissəsindən dəyişdirilə bilər."
                        placement="right"
                    >
                        <img
                            // className={styles.detailIcon}
                            width={16}
                            height={16}
                            style={{ marginLeft: '10px' }}
                            src="/img/icons/info.svg"
                            alt="trash"
                        />
                    </Tooltip>
                ) : (
                    <div
                        style={{
                            width: '20px',
                            height: '16px',
                            marginLeft: '10px',
                        }}
                    ></div>
                )
            ) : null}
        </div>
    );
};

export const Quantity = QuantityComponent;
