/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

// components
import { Icon } from 'antd';
import { Can } from 'components/Lib';
import EditInput from 'containers/HRM/#shared/EditInput';

// config
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

// actions
import {
  editWorkSchedule,
  fetchWorkSchedules,
} from 'store/actions/hrm/attendance/workSchedules';

import styles from '../workSchedule.module.scss';

function NameEdit(props) {
  const {
    selectedSchedule,
    workSchedules,
    isEditLoading,

    editWorkSchedule,
    fetchWorkSchedules,
  } = props;

  const { name, id } = selectedSchedule || {};
  const [error,setError]=useState(false);
  const [state, setState] = useState(() => ({
    isEdit: false,
    initialInputValue: name,
  }));

  const { isEdit, initialInputValue } = state;

  function setToEdit() {
    if (abilities.can(accessTypes.manage, permissions.work_schedule)) {
      setState({
        ...state,
        isEdit: true,
      });
    }
  }

  function handleEdit(value = '') {
    const name = value.trim();
    if (!isEditLoading && name.length > 2) {
      editWorkSchedule(id, { name }, () => onSuccess(name));
      setError(false)
    }
    else{
      setError(true)
    }
  }

  function onSuccess(name) {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
    fetchWorkSchedules();
  }

  function getSelectedScheduleName() {
    const selectedSchedule = workSchedules.find(item => item.id === id);
    return selectedSchedule?.name || '';
  }

  function cancelEdit() {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: getSelectedScheduleName(),
    });
  }

  useEffect(() => {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
  }, [id]);

  return (
    <div className={styles.header}>
      {isEdit ? <div>
        
        <EditInput
          name={initialInputValue}
          onSubmitEdit={handleEdit}
          isEditLoading={isEditLoading}
          handleCancel={cancelEdit}
        />
        {error&& <p style={{color:'red',fontSize:"12px"}}>Bu dəyər 3 simvoldan az olmamalıdır.</p>}
      
      </div> : (
        <button
          type="button"
          title="Redaktə et"
          className={styles.penButton}
          onClick={setToEdit}
        >
          <span className={styles.nameSpan}>{initialInputValue}</span>
          <Can I={accessTypes.manage} a={permissions.work_schedule}>
            <Icon type="edit" />
          </Can>
        </button>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  workSchedules: state.workSchedulesReducer.workSchedules,
  selectedSchedule: state.workSchedulesReducer.selectedSchedule,
  isEditLoading: !!state.loadings.editWorkSchedule,
});

export default connect(
  mapStateToProps,
  {
    fetchWorkSchedules,
    editWorkSchedule,
  }
)(NameEdit);
