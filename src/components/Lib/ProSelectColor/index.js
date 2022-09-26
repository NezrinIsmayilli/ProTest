import React from 'react';
import PropTypes from 'prop-types';
import { Select, Icon } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { decToRgb } from 'utils';

import styles from './styles.module.scss';

const { Option } = Select;

export const ProSelectWithoutMemo = React.forwardRef(function ProSelect(
  props,
  ref
) {
  const {
    data = [],
    // keys = ['name'],
    showFirstEmptyOption = false,
    hasError = false,
    notFoundContent = 'Məlumat tapılmadı',
    loading = false,
    disabled = false,
    ...rest
  } = props;

  return (
    <Select
      {...rest}
      loading={loading}
      notFoundContent={notFoundContent}
      className={`${styles.select} ${hasError ? styles.selectError : ''} ${
        disabled ? styles.disabled : ''
      }`}
      dropdownClassName={styles.dropdown}
      optionFilterProp="children"
      getPopupContainer={trigger => trigger.parentNode}
      suffixIcon={!loading && <Icon component={DownArrow} />}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      disabled={disabled}
      ref={ref}
    >
      {showFirstEmptyOption && <Option value="all">Hamısı</Option>}
      {data.map((element, index) => (
        <Option
          key={`${element.name || ''}${index}`}
          disabled={element.disabled}
          value={element.name || ''}
        >
          <div style={decToRgb(element.name, '5px')}></div>
        </Option>
      ))}
    </Select>
  );
});

export const ProSelectColor = React.memo(
  ProSelectWithoutMemo,
  (prevProps, nextProps) =>
    prevProps.data &&
    prevProps.data.length === nextProps.data &&
    nextProps.data.length &&
    prevProps.value === nextProps.value &&
    prevProps.hasError === nextProps.hasError &&
    !prevProps.notUseMemo
);

ProSelectColor.propTypes = {
  hasError: PropTypes.bool,
  loading: PropTypes.bool,
  data: PropTypes.array,
  keys: PropTypes.array,
  showFirstEmptyOption: PropTypes.bool,
};
