import React from 'react';
import { ProInput } from 'components/Lib';
import { Tooltip } from 'antd';
import styles from '../styles.module.scss';

const QuantityComponent = props => {
    const { value, row, handleQuantityChange, limit, serialModalIsVisible } = props;
    const { id, catalog } = row;

    const onChange = event => {
        handleQuantityChange(id, event.target.value, limit);
    };

    return (
        <Tooltip
            visible={Number(value || 0) < row.usedQuantity && !serialModalIsVisible}
            placement="right"
            title={`Məhsuldan istifadə olunduğu üçün say minimum ${row.usedQuantity} olaraq dəyişdirilə bilər.`}
        >
            <ProInput
                size="default"
                value={value}
                onChange={onChange}
                disabled={!catalog.isWithoutSerialNumber}
                className={`${
                    Number(value || 0) > 0 &&
                    Number(value || 0) >= (row.usedQuantity || 0)
                        ? {}
                        : styles.inputError
                } ${styles.tableInput}`}
            />
        </Tooltip>
    );
};

export const Quantity = QuantityComponent;
