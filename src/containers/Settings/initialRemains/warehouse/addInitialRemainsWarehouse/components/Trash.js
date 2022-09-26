import React from 'react';
import { Button } from 'antd';
import { ReactComponent as TrashIcon } from 'assets/img/icons/trash-main.svg';
import styles from '../styles.module.scss';

const TrashComponent = props => {
    const { value, handleProductRemove, disabled } = props;

    const onClick = () => {
        handleProductRemove(value);
    };

    return (
        <Button
            style={{ background: 'transparent', border: 'none' }}
            onClick={onClick}
            disabled={disabled}
        >
            <TrashIcon className={styles.trashIcon} />
        </Button>
    );
};

export const Trash = TrashComponent;
