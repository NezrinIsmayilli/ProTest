import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import {
  fetchCategoriesTrainings,
  fetchDirectionsTrainings,
} from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function TgDirectionFilter(props) {
  const {
    // props
    category,
    direction,
    onFilter,
    // actions
    fetchCategoriesTrainings,
    fetchDirectionsTrainings,
    // data
    categoriesTg,
    directions,
    loadings,
  } = props;

  useEffect(() => {
    if (!categoriesTg.length) {
      fetchCategoriesTrainings();
    }
  }, [fetchCategoriesTrainings, categoriesTg.length]);

  useEffect(() => {
    if (category) {
      fetchDirectionsTrainings(category);
    }
  }, [fetchDirectionsTrainings, category]);

  return (
    <JobsSidebarItemWrapper label="Sahə">
      <ProJobsSelect
        allowClear
        disabled={loadings.categoriesTg}
        loading={loadings.categoriesTg}
        value={category}
        onChange={value => {
          if (!value) {
            onFilter('category', undefined);
            onFilter('direction', undefined);
            return;
          }
          onFilter('category', value);
        }}
        placeholder="Kateqoriya"
        data={categoriesTg}
        size={defaultFormItemSize}
      />
      <ProJobsSelect
        allowClear
        data={directions}
        value={direction}
        onChange={value => onFilter('direction', value)}
        placeholder="Vəzifə"
        size={defaultFormItemSize}
        disabled={!category || loadings.directions}
        loading={loadings.directions}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  categoriesTg: state.parametersReducer.categoriesTg,
  directions: state.parametersReducer.directions,
  loadings: state.loadings,
});

export default connect(
  mapStateToProps,
  { fetchCategoriesTrainings, fetchDirectionsTrainings }
)(TgDirectionFilter);
