/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Select, Icon, Spin } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

const { Option } = Select;

export const ProSelect = React.forwardRef((props, ref) => {
    const { t } = useTranslation();
    const {
        loading = false,
        disabled = false,
        showArrow = true,
        showSearch = true,
        hasError = false,
        allowClear = true,
        disabledBusinessUnit = false,
        data = [],
        keys = ['name'],
        id = true,
        className = '',
        suffixIcon = <Icon component={DownArrow} />,
        notFoundContent = 'Məlumat tapılmadı',
        size = 'large', // large used in most cases
        ...rest
    } = props;
    

    return (
        <Select
            showSearch={showSearch}
            allowClear={allowClear}
            notFoundContent={notFoundContent}
            className={`${styles.select} ${className} ${
                hasError ? styles.selectError : ''
            } ${disabled ? styles.disabled : ''} ${
                disabledBusinessUnit ? styles.disabledBusinessUnit : ''
            }`}
            dropdownClassName={styles.dropdown}
            optionFilterProp="children"
            getPopupContainer={trigger => trigger.parentNode}
            suffixIcon={loading ? <Spin size="small" /> : suffixIcon}
            placeholder={t('select')}
            showArrow={showArrow}
            filterOption={(input, option) =>
                option.props.children
                    .replace('İ', 'I')
                    .toLowerCase()
                    .includes(input.replace('İ', 'I').toLowerCase())
            }
            disabled={disabled || loading}
            // dropdownAlign={{
            //   points: ['tl', 'bl'], // align dropdown bottom-left to top-left of input element
            //   offset: [0, 0], // align offset
            //   overflow: {
            //     adjustX: 0,
            //     adjustY: 0, // do not auto flip in y-axis
            //   },
            // }}
            size={size}
            ref={ref}
            {...rest}
            
        >
            {/* {showFirstEmptyOption && <Option value="all">Hamısı</Option>} */}
            {data
                .filter(element => element !== undefined)
                .map((element, index) => (
                    <Option
                        title={`${element[keys[0]]} ${element[keys[1]] ||
                            ''} ${element[keys[2]] || ''}`}
                        key={`${element.id || ''}${index}`}
                        disabled={element.disabled}
                        value={id ? element?.id : element?.name}
                        className={styles.dropdown}
                    >
                        {`${element[keys[0]]} ${element[keys[1]] ||
                            ''} ${element[keys[2]] || ''}`}
                    </Option>
                ))}
        </Select>
    );
});
