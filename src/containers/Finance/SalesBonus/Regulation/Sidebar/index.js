/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';

// actions
import {
  createBonusConfiguration,
  deleteBonusConfigurationById,
  fetchBonusConfigurations,
  setSelectedConfiguration,
} from 'store/actions/finance/salesBonus';
// components
import { Spin } from 'antd';
import { Sidebar, Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

import SidebarListItem from 'containers/HRM/#shared/SidebarListItem';
import AddInput from 'containers/HRM/#shared/AddInput';

import { toast } from 'react-toastify';
import errorMessages from 'utils/errors';
import styles from './styles.module.scss';

function SalesBonusSidebar(props) {
  const {
    setIsEdited,
    isEdited,
    selectedConfiguration,
    bonusConfiguration,
    isCreateLoading,
    isFetchLoading,

    // actions
    createBonusConfiguration,
    deleteBonusConfigurationById,
    fetchBonusConfigurations,
    setSelectedConfiguration,
  } = props;

  const selectedConfigurationId = selectedConfiguration?.id;
  const addInputRef = useRef(null);

  // on succesfull delete
  function onSucces(id) {
    addInputRef.current.clear();
    if (id === selectedConfigurationId) {
      setSelectedConfiguration(bonusConfiguration[0]);
    }
    fetchBonusConfigurations();
  }

  function handleDelete(id, stopLoading) {
    deleteBonusConfigurationById(
      id,
      () => {
        stopLoading();
        onSucces(id);
      },
      stopLoading
    );
  }

  // create new Calendar
  function createNewCalendar(name) {
    const data = {
      name,
    };

    createBonusConfiguration(
      data,
      ({ data }) => {
        fetchBonusConfigurations();
        setSelectedConfiguration({ attribute: { id: data?.id, name } });
        addInputRef.current.clear();
      },
      ({ error }) => {
        const errorKey = error?.response?.data?.error?.messageKey;
        if (errorKey !== null) {
          return toast.error(errorMessages[errorKey]);
        }
        if (
          error?.response?.data?.error?.message === 'Validation error.' &&
          error?.response?.data?.error?.errors?.name?.[0] ===
            'This value is too short. It should have 3 characters or more.'
        ) {
          return toast.error('Bonus növü adı 3 simvoldan çox olmalıdır');
        }
      }
    );
  }

  function onSubmit(value) {
    const term = value && value.trim();

    if (!isCreateLoading) {
      createNewCalendar(term);
    }
  }

  function selectCalendar(data) {
    setSelectedConfiguration({ attribute: data });
  }
  useEffect(() => {
    if (isEdited) {
      addInputRef.current.clear();
      setIsEdited(false);
    }
  }, [isEdited]);
  useEffect(() => {
    fetchBonusConfigurations();
  }, []);

  const List = bonusConfiguration.map(calendar => {
    const { id, name, isDeletable } = calendar;
    return (
      <SidebarListItem
        employee="employee"
        data={calendar}
        onDelete={stopLoading => handleDelete(id, stopLoading)}
        onSelect={selectCalendar}
        key={id}
        showDeleteButton={
          isDeletable &&
          abilities.can(
            accessTypes.manage,
            permissions.sales_bonus_configuration
          )
        }
        isSelected={selectedConfigurationId === id}
        mainTitle={name}
        secondTitle=""
      />
    );
  });

  return (
    <Sidebar title="Tənzimləmələr">
      <Can I={accessTypes.manage} a={permissions.sales_bonus_configuration}>
        <AddInput
          onSubmit={onSubmit}
          isCreateLoading={isCreateLoading}
          ref={addInputRef}
          label="Bonus növünü əlavə et"
          placeholder="Növün adı"
        />
      </Can>

      <ul className={styles.list}>
        <Spin spinning={isFetchLoading}>{List}</Spin>
      </ul>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  bonusConfiguration: state.bonusConfigurationReducer.bonusConfiguration,
  selectedConfiguration: state.bonusConfigurationReducer.selectedConfiguration,

  isCreateLoading: !!state.loadings.createBonusConfiguration,
  isFetchLoading: !!state.loadings.fetchBonusConfigurations,
});

export default connect(
  mapStateToProps,
  {
    createBonusConfiguration,
    deleteBonusConfigurationById,
    fetchBonusConfigurations,
    setSelectedConfiguration,
  }
)(SalesBonusSidebar);
