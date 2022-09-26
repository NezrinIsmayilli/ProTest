/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, forwardRef } from 'react';
import { connect } from 'react-redux';

import { messages } from 'utils';
import { onSuccessAction } from 'utils/onSuccessAction';

// components
import { Modal, Input, Button } from 'antd';
import { ProFormItem } from 'components/Lib';

// actions
import {
  rejectAppealAll,
  fetchAppeals,
  resetAppealsData,
} from 'store/actions/jobs/appeals';

// context
import { useAppealsFilters } from '../../Sidebar/FiltersContext';

import styles from './styles.module.scss';

function RejectReasonAll(props) {
  const {
    visible,
    setIsVisible,
    isCheck,
    // parent
    type,

    // redux data
    isLoading,

    // actions
    rejectAppealAll,
    fetchAppeals,
    resetAppealsData,
  } = props;

  const [state, setState] = useState({
    description: '',
    error: '',
    appeals_ul: isCheck,
  });

  const { description, appeals_ul, error } = state;

  const { filters } = useAppealsFilters();

  function sendRejection() {
    if (isCheck && description.trim() && appeals_ul) {
      rejectAppealAll({ description, appeals_ul }, onSuccess);
    } else {
      setState({
        ...state,
        error: messages.requiredText,
      });
    }
  }

  // handle case after appeal was rejected succesfully
  function onSuccess() {
    resetAppealsData(); // reset redux data
    fetchAppeals({ filters, attribute: type }); // fetch again table
    onSuccessAction('İmtina edildi.', false);
    setIsVisible(false);
  }

  // handle textarea
  function handleChange(e) {
    setState({
      ...state,
      error: '',
      description: e.target.value.slice(0, 250),
      appeals_ul: isCheck,
    });
  }

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
        <div className={styles.tabContent}>
          <p className={styles.title}>Toplu imtina ({isCheck.length})</p>

          <ProFormItem
            label="İmtina səbəbi"
            validateStatus={error ? 'error' : ''}
            help={error}
          >
            <Input.TextArea
              rows={5}
              value={description}
              onChange={handleChange}
            />
          </ProFormItem>
        </div>
        <Button.Group size="large" className={styles.buttonGroup}>
          <Button
            size="large"
            type="primary"
            block
            onClick={sendRejection}
            loading={isLoading}
          >
            Qeyd et
          </Button>
        </Button.Group>
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  isLoading: !!state.loadings.rejectAppealAll,
  selectedAppeal: state.appealsReducer.selectedAppeal,
});

export default connect(
  mapStateToProps,
  {
    rejectAppealAll,
    fetchAppeals,
    resetAppealsData,
  },
  null,
  { forwardRef: true }
)(forwardRef(RejectReasonAll));
