/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { Checkbox, Icon, Button, Input, Tooltip } from 'antd';
import { Table, Can, InfoCard } from 'components/Lib';
// actions
import {
  fetchFinesSettings,
  setSelectedPerson,
  resetHrmFinesData,
  editHrmPenaltiesApply,
  addManualPenalty,
  deleteManualPenaltyById,
  fetchHrmPenalties,
} from 'store/actions/hrm/fines';

// utils
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';
import { useDebouncedCallback } from 'use-debounce';
import { isValidNumber, formatToLocaleString } from 'utils';

import styles from '../styles.module.scss';

const stopPropagationHandle = e => {
  if (e) e.stopPropagation();
};

const PenaltyEditable = ({
  fetchHrmPenalties,
  yearAndMonth,
  filters,
  totalPenalty,
  manualPenalty,
  addManualPenalty,
  deleteManualPenaltyById,
  id,
  isArchived,
}) => {
  const [editable, setEditable] = useState(false);
  const [penalty, setPenalty] = useState(undefined);

  const editableToggle = e => {
    stopPropagationHandle(e);
    setEditable(prevState => !prevState);
    setPenalty(formatValue(manualPenalty || totalPenalty));
  };

  const checkKeyCode = e => {
    stopPropagationHandle(e);

    const { key } = e;

    if (key === 'Escape') {
      editableToggle(e);
      return;
    }

    if (key === 'Enter') {
      saveHandle(e);
    }
  };

  const inputHandle = e => {
    stopPropagationHandle(e);
    const { value } = e.target;

    if (isValidNumber(value)) {
      setPenalty(value);
    }
  };
  const saveHandle = e => {
    stopPropagationHandle(e);
    addManualPenalty(
      {
        employee: id,
        amount: +penalty,
      },
      () => {
        fetchHrmPenalties({
          year: yearAndMonth.year,
          month: yearAndMonth.month,
          filters,
        });
      }
    );
    editableToggle();
  };

  const deleteManual = e => {
    stopPropagationHandle(e);
    deleteManualPenaltyById(id, () => {
      fetchHrmPenalties({
        year: yearAndMonth.year,
        month: yearAndMonth.month,
        filters,
      });
    });
  };

  const formatValue = value => Number(value).toFixed(2);

  return (
    <div className={styles.editableBox}>
      <div className={styles.editable}>
        {editable ? (
          <Input
            autoFocus
            onChange={inputHandle}
            onKeyDown={checkKeyCode}
            onClick={stopPropagationHandle}
            defaultValue={formatValue(totalPenalty)}
            value={penalty}
            maxLength={9}
            suffix={
              <Tooltip title="Yadda saxla">
                <Icon onClick={saveHandle} type="save" />
              </Tooltip>
            }
          />
        ) : (
          <>
            <div>{formatToLocaleString(manualPenalty || totalPenalty)}</div>
            <div className={styles.buttonsGroup}>
              <Can I={accessTypes.manage} a={permissions.lateness_report}>
                {() => (
                  <Tooltip title="Dəyiş">
                    <Button
                      onClick={editableToggle}
                      type="link"
                      className={styles.editButton}
                      style={isArchived ? { padding: '0' } : null}
                      disabled={isArchived}
                    >
                      <Icon type="edit" theme="filled" />
                    </Button>
                  </Tooltip>
                )}
              </Can>
              {manualPenalty && (
                <Tooltip title="Avtomatik hesabla">
                  <Button
                    onClick={deleteManual}
                    type="link"
                    style={isArchived ? { padding: '0' } : null}
                    className={styles.editButton}
                    disabled={isArchived}
                  >
                    <Icon type="reload" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PenaltyApplyCheckbox = ({
  value,
  id,
  editHrmPenaltiesApply,
  isArchived,
}) => {
  const [debouncedCallback] = useDebouncedCallback(
    // function
    e => {
      stopPropagationHandle(e);
      onChangeHandle(e);
    },
    // delay in ms
    600
  );

  const onChangeHandle = e => {
    const { checked } = e.target;

    editHrmPenaltiesApply({
      employee: id,
      apply: checked,
    });
  };

  const disabled = abilities.can(
    accessTypes.manage,
    permissions.lateness_report
  );

  return (
    <Checkbox
      onChange={debouncedCallback}
      onClick={stopPropagationHandle}
      defaultChecked={value}
      disabled={!disabled || isArchived}
    />
  );
};

function FinesTable(props) {
  const {
    penalties,
    // penaltiesCount,
    penaltiesLoading,
    settings,
    settingsLoading,
    manualLoading,
    editFinesSettingsLoading,
    // actions
    fetchFinesSettings,
    setSelectedPerson,
    resetHrmFinesData,
    editHrmPenaltiesApply,
    addManualPenalty,
    deleteManualPenaltyById,
    fetchHrmPenalties,
    yearAndMonth,
    filters,
    onFilter,
  } = props;

  useEffect(() => () => resetHrmFinesData(), []);

  useEffect(() => {
    if (!settings) {
      fetchFinesSettings();
    }
  }, [settings, fetchFinesSettings]);

  useEffect(() => {
    if (penalties.length > 0) {
      setSelectedPerson({ data: penalties[0] });
    }
  }, [penalties]);
  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };
  const totalPenaltyTitle = `Məbləğ ${
    settings?.penaltyAmountForMinute
      ? `(1 dəq - ${Number(settings?.penaltyAmountForMinute).toFixed(2)} AZN)`
      : ''
  }`;

  const LastTitle = <div>ƏH tədbiq olunsun</div>;

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      render: (_value, _row, index) => index + 1,
      width: 60,
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      width: 280,
      key: 'name',
      render: (value, row) => (
        <InfoCard
          name={row.name}
          surname={row.surname}
          patronymic={row.patronymic}
          occupationName={row.occupationName}
          attachmentUrl={row.attachmentUrl}
          width="32px"
          height="32px"
        />
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span> Ay ərzində, dəq.</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'totalMinutes' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalMinutes', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'totalMinutes' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalMinutes', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'totalMinutes',
      width: 200,
      align: 'center',
      render: value => value || '-',
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span> {totalPenaltyTitle}</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'totalPenalty' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalPenalty', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'totalPenalty' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalPenalty', 'desc')}
            />
          </div>
        </div>
      ),
      width: 200,
      dataIndex: 'totalPenalty',
      align: 'center',
      render: (value, row) => (
        <PenaltyEditable
          yearAndMonth={yearAndMonth}
          filters={filters}
          totalPenalty={value}
          manualPenalty={row.manualPenalty}
          id={row.id}
          isArchived={row.isArchived}
          {...{ addManualPenalty, deleteManualPenaltyById, fetchHrmPenalties }}
        />
      ),
    },
    {
      title: LastTitle,
      dataIndex: 'deductFromSalary',
      align: 'center',
      width: 150,
      render: (value, row) => (
        <PenaltyApplyCheckbox
          value={value}
          id={row.id}
          isArchived={row.isArchived}
          editHrmPenaltiesApply={editHrmPenaltiesApply}
        />
      ),
    },
  ];

  // on row click handle
  const onRowClickHandle = useCallback(
    data => ({
      onClick: () => setSelectedPerson({ data }),
    }),
    [setSelectedPerson]
  );

  return (
    <Table
      rowClassName={styles.row}
      className={styles.table}
      loading={
        penaltiesLoading ||
        settingsLoading ||
        manualLoading ||
        editFinesSettingsLoading
      }
      dataSource={penalties}
      columns={columns}
      rowKey={record => record.id}
      onRow={onRowClickHandle}
    />
  );
}

const mapStateToProps = state => ({
  penalties: state.hrmFinesReducer.penalties,
  settings: state.hrmFinesReducer.settings,
  settingsLoading: !!state.loadings.fetchFinesSettings,
  penaltiesLoading: !!state.loadings.fetchHrmPenalties,
  editFinesSettingsLoading: !!state.loadings.editFinesSettings,
  manualLoading: !!state.loadings.hrmManualPenalty,
});

export default connect(
  mapStateToProps,
  {
    fetchFinesSettings,
    setSelectedPerson,
    resetHrmFinesData,
    editHrmPenaltiesApply,
    addManualPenalty,
    deleteManualPenaltyById,
    fetchHrmPenalties,
  }
)(FinesTable);
