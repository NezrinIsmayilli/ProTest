import React, { useEffect } from 'react';
import { connect } from 'react-redux';

// actions
import {
  fetchVacancyById,
  setSelectedVacancy,
} from 'store/actions/jobs/vacancies';

// components
import { Spin, Modal, Button } from 'antd';
import DisplayVacancyInfo from '../../Shared/DisplayVacanyInfo';
// utils
import { useVacanciesFilters } from '../Sidebar/FiltersContext';
// styles
import styles from './styles.module.scss';

function VacanciesDetails(props) {
  const {
    visible,
    setIsVisible,
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
      <Modal
        visible={visible}
        footer={null}
        width={700}
        closable={false}
        className={styles.customModal}
        onCancel={() => setIsVisible(false)}
      >
        <Button
          className={styles.closeButton}
          size="large"
          onClick={() => setIsVisible(false)}
        >
          <img
            width={14}
            height={14}
            src="/img/icons/X.svg"
            alt="trash"
            className={styles.icon}
          />
        </Button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '32px 24px',
          }}
        >
          <Spin spinning={vacancyLoading}>
            <>
              <div className={styles.headerInfo}>
                <span>{name}</span>
              </div>
              {vacancyInfoList}
            </>
          </Spin>
        </div>
      </Modal>
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
