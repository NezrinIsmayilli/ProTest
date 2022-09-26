import React, { useEffect, useReducer } from 'react';
import { connect } from 'react-redux';

import { Checkbox, InputNumber, Skeleton, Modal, Spin } from 'antd';

// actions
import { fetchFinesSettings, editFinesSettings } from 'store/actions/hrm/fines';

import { createReducer } from 'utils';

import styles from '../styles.module.scss';

const checkboxesNames = {
  dailyLatenessMinuteLimitCheckbox: 'dailyLatenessMinuteLimit',
  monthlyLatenessMinuteLimitCheckbox: 'monthlyLatenessMinuteLimit',
};

const initialState = {
  values: {
    dailyLatenessMinuteLimit: null,
    monthlyLatenessMinuteLimit: null,
    penaltyAmountForMinute: null,
  },

  changed: false,

  dailyLatenessMinuteLimitCheckbox: false,
  monthlyLatenessMinuteLimitCheckbox: false,
};

const reducer = createReducer(initialState, {
  inputChangeHandle: (state, action) => ({
    ...state,
    changed: true,
    values: {
      ...state.values,
      [action.name]: action.value,
    },
  }),

  checkboxChangeHandle: (state, action) => ({
    ...state,
    changed: true,
    [action.name]: action.checked,

    values: {
      ...state.values,
      [checkboxesNames[action.name]]: action.checked
        ? action.settings[checkboxesNames[action.name]]
        : null,
    },
  }),

  setInitValues: (state, action) => ({
    values: action.settings,
    dailyLatenessMinuteLimitCheckbox: !!action.settings
      .dailyLatenessMinuteLimit,
    monthlyLatenessMinuteLimitCheckbox: !!action.settings
      .monthlyLatenessMinuteLimit,
  }),

  reset: () => initialState,
});

function ModalBody(props) {
  const {
    filters,
    yearAndMonth,
    modalOpen,
    handleCancel,
    // data
    settings,
    settingsLoading,
    // actions
    // fetchFinesSettings,
    editFinesSettings,
  } = props;

  useEffect(
    () => () => {
      dispatch({ type: 'reset' });
    },
    []
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    values: {
      dailyLatenessMinuteLimit,
      monthlyLatenessMinuteLimit,
      penaltyAmountForMinute,
    },
    dailyLatenessMinuteLimitCheckbox,
    monthlyLatenessMinuteLimitCheckbox,

    changed,
  } = state;

  useEffect(() => {
    if (settings && modalOpen) {
      dispatch({ type: 'setInitValues', settings });
    }
  }, [settings, modalOpen]);

  const checkboxChangeHandle = event => {
    const {
      target: { checked, name },
    } = event;

    dispatch({
      type: 'checkboxChangeHandle',
      name,
      checked,
      settings,
    });
  };

  const inputChangeHandle = (value, name) => {
    dispatch({
      type: 'inputChangeHandle',
      name,
      value,
    });
  };

  const onCancel = () => {
    if (changed) {
      editFinesSettings(
        state.values,
        yearAndMonth.year,
        yearAndMonth.month,
        filters
      );
    }
    handleCancel();
  };

  return (
    <Modal
      className={styles.modal}
      title={<div className={styles.modalTitle}>Tənzimləmələr</div>}
      footer={null}
      centered
      width={470}
      bodyStyle={{ padding: '32px 24px' }}
      visible={modalOpen}
      onCancel={onCancel}
    >
      {!settings ? (
        <Skeleton title={false} active paragraph={{ rows: 4 }} />
      ) : (
        <Spin spinning={settingsLoading}>
          <div className={styles.modalBody}>
            <div className={styles.modalBodyItem}>
              <Checkbox
                name="dailyLatenessMinuteLimitCheckbox"
                checked={dailyLatenessMinuteLimitCheckbox}
                onChange={checkboxChangeHandle}
              />

              <div className={styles.modalBodyText}>
                Gündəlik icazəli gecikmə limiti, dəqiqə
              </div>

              <InputNumber
                value={dailyLatenessMinuteLimit}
                onChange={value =>
                  inputChangeHandle(value, 'dailyLatenessMinuteLimit')
                }
                min={1}
                max={1440}
                maxLength={4}
                disabled={!dailyLatenessMinuteLimitCheckbox}
                className={styles.modalBodyInput}
              />
            </div>
            <div className={styles.modalBodyItem}>
              <Checkbox
                name="monthlyLatenessMinuteLimitCheckbox"
                checked={monthlyLatenessMinuteLimitCheckbox}
                onChange={checkboxChangeHandle}
              />

              <div className={styles.modalBodyText}>
                Aylıq icazəli gecikmə limiti, dəqiqə
              </div>

              <InputNumber
                value={monthlyLatenessMinuteLimit}
                onChange={value =>
                  inputChangeHandle(value, 'monthlyLatenessMinuteLimit')
                }
                min={1}
                max={45000}
                maxLength={5}
                disabled={!monthlyLatenessMinuteLimitCheckbox}
                className={styles.modalBodyInput}
              />
            </div>
            <div className={styles.modalBodyItem}>
              <div className={styles.modalBodyText}>
                Cərimə məbləği hər bir dəqiqəyə görə/AZN
              </div>

              <InputNumber
                value={penaltyAmountForMinute}
                onChange={value =>
                  inputChangeHandle(value, 'penaltyAmountForMinute')
                }
                className={styles.modalBodyInput}
                min={0}
                maxLength={8}
              />
            </div>
          </div>
        </Spin>
      )}
    </Modal>
  );
}

const mapStateToProps = state => ({
  settings: state.hrmFinesReducer.settings,
  settingsLoading: !!state.loadings.fetchFinesSettings,
});

export default connect(
  mapStateToProps,
  { fetchFinesSettings, editFinesSettings }
)(ModalBody);
