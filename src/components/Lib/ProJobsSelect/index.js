/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Select, Icon, Spin } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';

import styles from './styles.module.scss';

const { Option } = Select;

export const ProJobsSelect = React.forwardRef((props, ref) => {
  const {
    loading = false,
    disabled = false,
    showArrow = true,
    showSearch = true,
    hasError = false,
    allowClear = true,
    data = [],
    keys = ['name'],
    id = true,
    className = '',
    suffixIcon = <Icon component={DownArrow} />,
    notFoundContent = 'Məlumat tapılmadı',
    placeholder = 'Seçin',
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
      } ${disabled ? styles.disabled : ''}`}
      dropdownClassName={styles.dropdown}
      optionFilterProp="children"
      getPopupContainer={trigger => trigger.parentNode}
      suffixIcon={loading ? <Spin size="small" /> : suffixIcon}
      placeholder={placeholder}
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
            key={`${element.id || ''}${index}`}
            disabled={element.disabled}
            value={id ? element?.id || element?.value : element?.name}
            className={styles.dropdown}
          >
            {element?.value
              ? `${element?.label || ''}`
              : `${element[keys[0]]} ${element[keys[1]] || ''} ${element[
                  keys[2]
                ] || ''} `}
          </Option>
        ))}
    </Select>
  );
});
