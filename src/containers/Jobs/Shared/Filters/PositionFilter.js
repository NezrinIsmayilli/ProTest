import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchCategories, fetchPositions } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function PositionFilter(props) {
  const {
    // props
    category,
    position,
    onFilter,
    // actions
    fetchCategories,
    fetchPositions,
    // data
    categories,
    positions,
    positionsLoading,
    categoriesLoading,
  } = props;

  useEffect(() => {
    if (!categories.length) {
      fetchCategories();
    }
  }, [fetchCategories, categories.length]);

  useEffect(() => {
    if (category) {
      fetchPositions(category);
    }
  }, [fetchPositions, category]);

  return (
    <JobsSidebarItemWrapper label="Sahə">
      <ProJobsSelect
        allowClear
        loading={categoriesLoading}
        value={category}
        onChange={value => {
          if (!value) {
            onFilter('category', undefined);
            onFilter('position', undefined);
            return;
          }
          onFilter('category', value);
        }}
        placeholder="Kateqoriya"
        data={categories}
        size={defaultFormItemSize}
      />
      <ProJobsSelect
        allowClear
        loading={positionsLoading}
        data={positions}
        value={position}
        onChange={value => onFilter('position', value)}
        placeholder="Vəzifə"
        size={defaultFormItemSize}
        disabled={!category || positionsLoading}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  categories: state.parametersReducer.categories,
  positions: state.parametersReducer.positions,
  categoriesLoading: !!state.loadings.categories,
  positionsLoading: !!state.loadings.positions,
});

export default connect(
  mapStateToProps,
  { fetchCategories, fetchPositions }
)(PositionFilter);
