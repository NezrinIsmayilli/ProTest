import React, { useEffect } from 'react';
import { connect } from 'react-redux';

// actions
import {
  fetchTrainingById,
  setSelectedTraining,
} from 'store/actions/jobs/training';

// components
import { Spin, Modal, Button } from 'antd';
import DisplayTrainingnfo from '../../Shared/DisplayTrainingnfo';
// utils
import { useTrainingsFilters } from '../Sidebar/FiltersContext';
// styles
import styles from './styles.module.scss';

function VacanciesDetails(props) {
  const {
    visible,
    setIsVisible,
    selectedTrainings,
    training,
    trainingLoading,
    fetchTrainingById,
    setSelectedTraining,
  } = props;

  const { id, name } = selectedTrainings || {};

  const { filters } = useTrainingsFilters();

  useEffect(() => {
    if (id) {
      fetchTrainingById(id);
    }
  }, [id, fetchTrainingById]);

  useEffect(() => {
    setSelectedTraining(null);
  }, [filters, setSelectedTraining]);

  let trainingsInfoList = null;

  if (training && !trainingLoading) {
    trainingsInfoList = <DisplayTrainingnfo training={training} />;
  }

  if (selectedTrainings) {
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
          <Spin spinning={trainingLoading}>
            <>
              <div className={styles.headerInfo}>
                <span>{name}</span>
              </div>
              {trainingsInfoList}
            </>
          </Spin>
        </div>
      </Modal>
    );
  }

  return null;
}

const mapStateToProps = state => ({
  selectedTrainings: state.trainingsReducer.selectedTrainings,
  training: state.trainingsReducer.training,
  trainingLoading: !!state.loadings.fetchTrainingById,
});

export default connect(
  mapStateToProps,
  { fetchTrainingById, setSelectedTraining }
)(VacanciesDetails);
