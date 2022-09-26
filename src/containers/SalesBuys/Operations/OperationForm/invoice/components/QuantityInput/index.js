import React from 'react';
import { re_amount } from 'utils';
import { Tooltip } from 'antd';
import styles from './styles.module.scss';

const math = require('exact-math');

export const QuantityInput = ({
    value = '',
    product = {},
    disabled = false,
    onChange,
    selectedProduct,
}) => {
    const { quantity = 0 } = product;

    const increase = () => {
        if (math.sub(Number(quantity || 0), Number(value || 0)) < 1) {
            return;
        }
        onChange(Number(value) + 1, product);
    };

    const decrease = () => {
        if (Number(value || 0) < 1) {
            return;
        }
        onChange(Number(value) - 1, product);
    };

    const handleChange = newInvoiceQuantity => {
        if (
            re_amount.test(newInvoiceQuantity) &&
            Number(newInvoiceQuantity) <= Number(quantity)
        ) {
            return onChange(newInvoiceQuantity, product);
        }
        if (newInvoiceQuantity === '') {
            onChange(null, product);
        }
    };

    return (
        <Tooltip
            visible={Number(value || 0) < selectedProduct?.[0]?.usedQuantity}
            placement="right"
            title={`Məhsuldan istifadə olunduğu üçün say minimum ${selectedProduct?.[0]?.usedQuantity} olaraq dəyişdirilə bilər.`}
        >
            <div className={styles.quantityInput}>
                <button
                    type="button"
                    className={styles.decrease}
                    onClick={decrease}
                    disabled={disabled}
                >
                    <img
                        width={10}
                        height={2}
                        src="/img/icons/decrease.svg"
                        alt="trash"
                        className={styles.icon}
                    />
                </button>
                <input
                    type="text"
                    className={styles.value}
                    value={value}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="0"
                    disabled={disabled}
                />
                <button
                    type="button"
                    className={styles.increase}
                    onClick={increase}
                    disabled={disabled}
                >
                    <img
                        width={10}
                        height={10}
                        src="/img/icons/increase.svg"
                        alt="trash"
                        className={styles.icon}
                    />
                </button>
            </div>
        </Tooltip>
    );
};
