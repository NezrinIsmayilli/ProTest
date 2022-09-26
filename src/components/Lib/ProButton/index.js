import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export const ProButton = props => {
    const { size = 'middle', type = 'primary', children, ...rest } = props;
    return (
        <Button size={size} type={type} className={styles.ProButton} {...rest}>
            {children}
        </Button>
    );
};
