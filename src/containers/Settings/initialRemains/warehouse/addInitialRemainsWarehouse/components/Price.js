import React from 'react';
import { ProInput } from 'components/Lib';
import { Tooltip } from 'antd';
import styles from '../styles.module.scss';

const PriceComponent = props => {
    const { value, row, handlePriceChange } = props;
    const { id } = row;

    const onChange = event => {
        handlePriceChange(id, event.target.value);
    };
    return (
        <ProInput
            size="default"
            value={value}
            onChange={onChange}
            className={`${Number(value || 0) > 0 ? {} : styles.inputError} ${
                styles.tableInput
            }`}
        />
    );
};

export const Price = PriceComponent;
