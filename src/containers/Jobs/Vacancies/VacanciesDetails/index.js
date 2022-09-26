import React, { useEffect } from 'react';
import { connect } from 'react-redux';

// actions
import {
  fetchVacancyById,
  setSelectedVacancy,
} from 'store/actions/jobs/vacancies';

// components
import { Affix, Spin } from 'antd';
import { InfoBox } from 'components/Lib';
import DisplayVacancyInfo from '../../Shared/DisplayVacanyInfo';

// utils
import { useVacanciesFilters } from '../Sidebar/FiltersContext';

function VacanciesDetails(props) {
  const {
    selectedVacancy,
    vacancy,
    vacancyLoading,
    fetchVacancyById,
    setSelectedVacancy,
  } = props;

  const { id, name } = selectedVacancy || {};

  const { filters } = useVacanciesFilters();

  useEffect(() => {
    if (id) {
      fetchVacancyById(id);
    }
  }, [id, fetchVacancyById]);

  useEffect(() => {
    setSelectedVacancy(null);
  }, [filters, setSelectedVacancy]);

  let vacancyInfoList = null;

  if (vacancy && !vacancyLoading) {
    vacancyInfoList = <DisplayVacancyInfo vacancy={vacancy} />;
  }

  if (selectedVacancy) {
    return (
      <Affix
        offsetTop={15}
        target={() => document.getElementById('vacanciescontainer-area')}
      >
        <div className="infoContainer scrollbar">
          <Spin spinning={vacancyLoading}>
            <InfoBox title={name}>{vacancyInfoList}</InfoBox>
          </Spin>
        </div>
      </Affix>
    );
  }

  return null;
}

const mapStateToProps = state => ({
  selectedVacancy: state.vacanciesReducer.selectedVacancy,
  vacancy: state.vacanciesReducer.vacancy,
  vacancyLoading: !!state.loadings.fetchVacancyById,
});

export default connect(
  mapStateToProps,
  { fetchVacancyById, setSelectedVacancy }
)(VacanciesDetails);
