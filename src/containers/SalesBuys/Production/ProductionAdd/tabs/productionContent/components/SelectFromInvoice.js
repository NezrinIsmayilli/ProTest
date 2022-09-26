import React from 'react';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { Tooltip } from 'antd';
import styles from '../../../styles.module.scss';

const SelectIcon = props => {
    const {
        disabled = false,
        handleClick,
        quantity,
        selectedNumbers,
        isWithoutSerialNumber,
    } = props;

    const onClick = () => {
        if (disabled) {
            return;
        }
        handleClick();
    };
    return (
        <div>
            {!isWithoutSerialNumber ? (
                <Tooltip
                    placement="right"
                    title={
                        quantity === 0
                            ? 'Silinmə əməliyyatını tamamlamaq üçün seriya nömrəsi seçməlisiniz'
                            : `Silinmə əməliyyatını tamamlamaq üçün ilk öncə ${quantity} ədəd seriya nömrəsi seçməlisiniz.`
                    }
                >
                    <PlusIcon
                        width="16px"
                        height="16px"
                        onClick={onClick}
                        style={
                            selectedNumbers
                                ? selectedNumbers?.length < Number(quantity)
                                    ? { fill: 'red' }
                                    : {}
                                : { fill: 'red' }
                        }
                        className={`${styles.invoiceIcon} ${
                            disabled ? styles.invoiceIconDisabled : {}
                        }`}
                    />
                </Tooltip>
            ) : (
                <PlusIcon
                    width="16px"
                    height="16px"
                    onClick={onClick}
                    className={`${styles.invoiceIcon} ${
                        disabled ? styles.invoiceIconDisabled : {}
                    }`}
                />
            )}
        </div>
    );
};

export const SelectFromInvoice = SelectIcon;
