/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { connect } from 'react-redux';

import { messages } from 'utils';
import { onSuccessAction } from 'utils/onSuccessAction';

// components
import { Modal, Input, Button } from 'antd';
import { ProFormItem } from 'components/Lib';

// actions
import {
  rejectAppeal,
  fetchAppeals,
  resetAppealsData,
} from 'store/actions/jobs/appeals';

// context
import { useAppealsFilters } from '../../Sidebar/FiltersContext';

import styles from './styles.module.scss';

function RejectReason(props, ref) {
  const {
    visible,
    setIsVisible,
    // parent
    type,

    // redux data
    selectedAppeal,
    isLoading,

    // actions
    rejectAppeal,
    fetchAppeals,
    resetAppealsData,
  } = props;

  const [state, setState] = useState({
    isDrawerOpen: false,
    description: '',
    error: '',
  });

  const { isDrawerOpen, description, error } = state;

  const { filters } = useAppealsFilters();

  // expose drawer handling to the parent without extra rerender
  useImperativeHandle(ref, () => ({
    open: openDrawer,
    close: closeDrawer,
  }));

  function closeDrawer() {
    setState({
      isDrawerOpen: false,
      description: '',
      error: '',
    });
  }

  function openDrawer() {
    setState({
      ...state,
      isDrawerOpen: true,
    });
  }

  function sendRejection() {
    if (selectedAppeal.id && description.trim()) {
      rejectAppeal(selectedAppeal.id, { description }, onSuccess);
    } else {
      setState({
        ...state,
        error: messages.requiredText,
      });
    }
  }

  // handle case after appeal was rejected succesfully
  function onSuccess() {
    closeDrawer(); // close drawer
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
    });
  }

  // close drawer if selected appeal/person changed
  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
    }
  }, [selectedAppeal]);

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
          <p className={styles.title}>İmtina səbəbi</p>

          <ProFormItem
            label="Qeyd"
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
  isLoading: !!state.loadings.rejectAppeal,
  selectedAppeal: state.appealsReducer.selectedAppeal,
});

export default connect(
  mapStateToProps,
  {
    rejectAppeal,
    fetchAppeals,
    resetAppealsData,
  },
  null,
  { forwardRef: true }
)(forwardRef(RejectReason));
