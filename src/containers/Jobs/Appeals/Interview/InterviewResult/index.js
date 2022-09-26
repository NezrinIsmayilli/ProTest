/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { connect } from 'react-redux';

// components
import { Modal, Input, Button, Icon } from 'antd';
import { ProFormItem, ProJobsSelect } from 'components/Lib';

// utils
import { InterviewResultOptions, messages } from 'utils';
import { onSuccessAction } from 'utils/onSuccessAction';

// actions
import { fetchAppeals, resetAppealsData } from 'store/actions/jobs/appeals';
import { resultInterview } from 'store/actions/jobs/interview';

// context
import { useAppealsFilters } from '../../Sidebar/FiltersContext';

import styles from './styles.module.scss';

const { requiredText } = messages;

const InterviewResult = forwardRef((props, ref) => {
  const {
    visible,
    setIsVisible,
    // redux data
    // interview,
    selectedAppeal,
    isLoading,
    // isInterviewEnd,

    // actions
    resultInterview,
    fetchAppeals,
    resetAppealsData,
  } = props;

  const [state, setState] = useState({
    isDrawerOpen: false,
    note: '',
    status: undefined,
    noteError: '',
    statusError: '',
  });

  const { isDrawerOpen, note, status, noteError, statusError } = state;

  const { filters } = useAppealsFilters();
  const { typeId } = selectedAppeal || {};

  useImperativeHandle(ref, () => ({
    open: openDrawer,
    close: closeDrawer,
  }));

  function closeDrawer() {
    setState({
      isDrawerOpen: false,
      note: '',
      status: undefined,
      noteError: '',
      statusError: '',
    });
  }

  function openDrawer() {
    setState({
      ...state,
      isDrawerOpen: true,
    });
  }

  function submitResult() {
    if (typeId && note.trim() && status) {
      return resultInterview(
        typeId,
        {
          status,
          note,
        },
        onSuccess
      );
    }

    setState({
      ...state,
      noteError: note.trim() ? '' : requiredText,
      statusError: status ? '' : requiredText,
    });
  }

  // handle case after interview was resulted succesfully
  function onSuccess() {
    closeDrawer(); // close drawer
    resetAppealsData(); // reset redux data
    fetchAppeals({ filters, attribute: 'interview' }); // fetch again table
    onSuccessAction(undefined, false);
  }

  // handle textarea
  function handleChange(e) {
    setState({
      ...state,
      noteError: '',
      note: e.target.value.slice(0, 250),
    });
  }

  // handle select
  function handleSelect(value) {
    setState({
      ...state,
      status: value,
      statusError: '',
    });
  }

  // close drawer if selected appeal/person changed
  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
    }
  }, [selectedAppeal]);

  // useEffect(() => {
  //   if (interview && isInterviewEnd) {
  //     openDrawer();
  //   }
  // }, [interview]);

  return (
    <Modal
      visible={visible}
      footer={null}
      width={400}
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
        <div className={`${styles.tabContent} scrollbar`}>
          <p className={styles.title}>Müsahibənin vaxtı bitmişdir.</p>

          <ProFormItem
            validateStatus={statusError ? 'error' : ''}
            label={
              <span>
                <Icon
                  type="info-circle"
                  theme="twoTone"
                  twoToneColor="#55AB80"
                />{' '}
                Müsahibənin nəticəsini daxil edin
              </span>
            }
          >
            <ProJobsSelect
              size="default"
              value={status}
              onChange={handleSelect}
              data={InterviewResultOptions}
            />
          </ProFormItem>

          <ProFormItem label="Qeyd" validateStatus={noteError ? 'error' : ''}>
            <Input.TextArea rows={5} value={note} onChange={handleChange} />
          </ProFormItem>
        </div>
        <Button.Group size="large" className={styles.buttonGroup}>
          <Button
            size="large"
            type="primary"
            block
            onClick={submitResult}
            loading={isLoading}
          >
            Qeyd et
          </Button>
        </Button.Group>
      </div>
    </Modal>
  );
});

const mapStateToProps = state => ({
  isLoading: !!state.loadings.resultInterview,
  interview: state.interviewReducer.interview,
  isInterviewEnd: true, // state.interviewReducer.isInterviewEnd,
  selectedAppeal: state.appealsReducer.selectedAppeal,
});

export default connect(
  mapStateToProps,
  {
    resultInterview,
    fetchAppeals,
    resetAppealsData,
  },
  null,
  { forwardRef: true }
)(InterviewResult);
