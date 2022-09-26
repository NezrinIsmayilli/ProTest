import React from 'react';
import { connect } from 'react-redux';

import { ProWarningModal } from 'components/Lib';
import { FaRegTrashAlt } from 'react-icons/fa';
import { toastHelper } from 'utils';
import {
  fetchEmployeeActivities,
  deleteEmployeeActivity,
} from 'store/actions/employeeActivity/employeeActivity';
import { history } from 'utils/history';

import styles from './styles.module.scss';

const returnUrl = '/hrm/employees/workers';

function OperationDeleteModal(props) {
  const {
    isOpenDeleteModal,
    setIsOpenDeleteModal,
    id,
    fetchEmployeeActivities,
    dateFrom,
    dateTo,
    deleteEmployeeActivity,
    removeOperationType,
    isLoadingDelete,
  } = props;

  function deleteHandle() {
    deleteEmployeeActivity(id, onSuccesCallBack('Əməliyyat silindi.'));
  }
  function onSuccesCallBack(message) {
    return () => {
      setIsOpenDeleteModal(false);
      removeOperationType();
      fetchEmployeeActivities(dateFrom, dateTo);
      toastHelper(history, returnUrl, message);
    };
  }
  return (
    <ProWarningModal
      open={isOpenDeleteModal}
      titleIcon={
        <div className={styles.rounded}>
          <FaRegTrashAlt />
        </div>
      }
      header="Əməliyyatı silmək"
      cancelText="Geri"
      continueText="Sil"
      okFunc={deleteHandle}
      onCancel={setIsOpenDeleteModal}
      isLoading={isLoadingDelete}
    />
  );
}

const mapStateToProps = state => ({
  dateFrom: state.employeeActivitiesReducer.dateFrom,
  dateTo: state.employeeActivitiesReducer.dateTo,
  isLoadingDelete: !!state.loadings.deleteEmployeeActivity,
});

export default connect(
  mapStateToProps,
  {
    fetchEmployeeActivities,
    deleteEmployeeActivity,
  }
)(OperationDeleteModal);
