import React from 'react';
import { AutoComplete } from 'antd';

import styles from './styles.module.scss';

export const ProAutoComplete = ({ ...rest }) => (
    <AutoComplete
        size="large"
        placeholder="Yazın"
        className={styles.ProAutoComplete}
        filterOption={(inputValue, option) =>
            option.key.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }
        {...rest}
    />
);
