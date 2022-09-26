import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchCountries, fetchCities } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function RegionFilter(props) {
  const {
    // props
    city,
    onFilter,
    // actions
    fetchCountries,
    fetchCities,
    // data
    countries,
    cities,
    countriesLoading,
    citiesLoading,
  } = props;

  const [country, setCountry] = useState(undefined);

  useEffect(() => {
    if (!countries.length) {
      fetchCountries();
    }
  }, [fetchCountries, countries.length]);

  useEffect(() => {
    if (country) {
      fetchCities(country);
    }
  }, [fetchCities, country]);

  return (
    <JobsSidebarItemWrapper label="Ərazi">
      <ProJobsSelect
        allowClear
        loading={countriesLoading}
        value={country}
        onChange={value => {
          if (!value) {
            setCountry(undefined);
            onFilter('city', []);
            return;
          }

          setCountry(value);
        }}
        placeholder="Ölkə"
        data={countries}
        size={defaultFormItemSize}
      />
      <ProJobsSelect
        allowClear
        mode="multiple"
        loading={citiesLoading}
        data={cities}
        value={city}
        onChange={value => onFilter('city', value)}
        placeholder="Şəhər"
        size={defaultFormItemSize}
        disabled={!country || citiesLoading}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  countries: state.parametersReducer.countries,
  cities: state.parametersReducer.cities,
  countriesLoading: !!state.loadings.countries,
  citiesLoading: !!state.loadings.cities,
});

export default connect(
  mapStateToProps,
  { fetchCountries, fetchCities }
)(RegionFilter);
