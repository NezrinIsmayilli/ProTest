import React from 'react';
import PropTypes from 'prop-types';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

import { defaultFormItemSize } from 'utils';

function CommonFilterComponent({
  onFilter,
  filterName,
  filterValue,
  mode = 'default',
  placeholder = '',
  data,
  label,
}) {
  return (
    <JobsSidebarItemWrapper label={label}>
      <ProJobsSelect
        allowClear
        mode={mode}
        value={filterValue}
        onChange={value => onFilter(filterName, value)}
        placeholder={placeholder}
        data={data}
        size={defaultFormItemSize}
      />
    </JobsSidebarItemWrapper>
  );
}

CommonFilterComponent.propTypes = {
  onFilter: PropTypes.func,
  filterName: PropTypes.string,
  filterValue: PropTypes.any,
  mode: PropTypes.string,
  placeholder: PropTypes.string,
  data: PropTypes.array,
  label: PropTypes.string,
};

export default React.memo(CommonFilterComponent);
