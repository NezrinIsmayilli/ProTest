/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

// components
import { Row, Col, Icon } from 'antd';
import { ExcelButton, Can } from 'components/Lib';

// utils
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';
import { exportFileDownloadHandle } from 'utils';

// actions
import {
  fetchTimecardArchivesByDate,
  editTimecardReportArchive,
  fetchTimecardReportArchive,
} from 'store/actions/hrm/timecard';

import EditInput from '../../../#shared/EditInput';

import styles from '../styles.module.scss';

function SettingsPanel(props) {
  const {
    selectedArchive,
    timecardReportArchive,

    isEditLoading,
    isLoadingExport,

    selectedYear,
    selectedMonth,
    isDefaultSelected,

    fetchTimecardArchivesByDate,
    editTimecardReportArchive,
    fetchTimecardReportArchive,

    exportFileDownloadHandle,
    filter,
  } = props;

  const canEdit = abilities.can(
    accessTypes.manage,
    permissions.timecard_report
  );

  const { name, id } = selectedArchive;

  const [state, setState] = useState(() => ({
    isEdit: false,
    initialInputValue: name,
  }));

  const { isEdit, initialInputValue } = state;

  function setToEdit() {
    if (canEdit) {
      setState({
        ...state,
        isEdit: true,
      });
    }
  }

  function handleEdit(name) {
    if (!isEditLoading) {
      editTimecardReportArchive({ name }, id, () => onSuccess(name));
    }
  }

  function onSuccess(name) {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
    fetchTimecardReportArchive();
  }

  function getSelectedArchiveName() {
    const selectedArchive = timecardReportArchive.find(item => item.id === id);
    return selectedArchive?.name || '';
  }

  function cancelEdit() {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: getSelectedArchiveName(),
    });
  }

  let renderTitle = null;

  if (isEdit) {
    renderTitle = (
      <div>
        <EditInput
          name={initialInputValue}
          onSubmitEdit={handleEdit}
          isEditLoading={isEditLoading}
          handleCancel={cancelEdit}
        />
      </div>
    );
  } else {
    renderTitle = (
      <button
        type="button"
        className={styles.penButton}
        onClick={setToEdit}
        disabled={isDefaultSelected}
      >
        <span className={styles.nameSpan}>{initialInputValue}</span>
        {!isDefaultSelected && canEdit && <Icon type="edit" />}
      </button>
    );
  }

  useEffect(() => {
    fetchTimecardArchivesByDate(selectedYear, selectedMonth, filter);
  }, [selectedYear, selectedMonth, filter]);

  useEffect(() => {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
  }, [id]);

  return (
    <Row gutter={12} className={styles.settingsWrap}>
      <Col span={17} className={styles.textColsWrap}>
        <div className={styles.infoText}>{renderTitle}</div>
      </Col>

      <Col span={7} className={styles.alignRight}>
        <Can I={accessTypes.manage} a={permissions.timecard_report}>
          <ExcelButton
            loading={isLoadingExport}
            onClick={() =>
              exportFileDownloadHandle(
                'exportFileDownloadHandle',
                `/hrm/report/timecard/export/${selectedYear}/${selectedMonth}`
              )
            }
          />
        </Can>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  selectedArchive: state.hrmTimecardReducer.selectedArchive,
  timecardReportArchive: state.hrmTimecardReducer.timecardReportArchive,
  selectedYear: state.hrmTimecardReducer.selectedYear,
  selectedMonth: state.hrmTimecardReducer.selectedMonth,
  isDefaultSelected: state.hrmTimecardReducer.isDefaultSelected,
  isEditLoading: !!state.loadings.editTimecardReportArchive,
  isLoadingExport: !!state.loadings.exportFileDownloadHandle,
});

export default connect(
  mapStateToProps,
  {
    fetchTimecardArchivesByDate,
    editTimecardReportArchive,
    fetchTimecardReportArchive,
    exportFileDownloadHandle,
  }
)(SettingsPanel);
