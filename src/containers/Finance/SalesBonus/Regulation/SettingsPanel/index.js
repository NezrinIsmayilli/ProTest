/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

// components
import { Row, Col, Icon } from 'antd';
import { Can } from 'components/Lib';
import { FaPlus } from 'react-icons/fa';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import EditInput from 'containers/HRM/#shared/EditInput';

// utils

import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

// actions
import {
  fetchBonusConfigurations,
  editBonusConfiguration,
} from 'store/actions/finance/salesBonus';
import { toast } from 'react-toastify';
import errorMessages from 'utils/errors';
import AddProduct from './addProduct';
import styles from '../styles.module.scss';

function SettingsPanel(props) {
  const {
    setDefaultExpand,
    defaultExpand,
    setIsEdited,
    selected,
    setSelected,
    selectedConfiguration,
    bonusConfiguration,
    isEditLoading,

    fetchBonusConfigurations,
    editBonusConfiguration,
  } = props;
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const { name, id, isDeletable } = selectedConfiguration || {};

  const [state, setState] = useState(() => ({
    isEdit: false,
    initialInputValue: name,
  }));

  const { isEdit, initialInputValue } = state;

  function setToEdit() {
    if (
      abilities.can(accessTypes.manage, permissions.sales_bonus_configuration)
    ) {
      setState({
        ...state,
        isEdit: true,
      });
    }
  }

  function handleEdit(value) {
    const name = value.trim();
    if (!isEditLoading) {
      editBonusConfiguration(
        id,
        { name },
        () => onSuccess(name),
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
  }

  function onSuccess(name) {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
    setIsEdited(true);
    fetchBonusConfigurations();
  }

  function getSelectedCalendarName() {
    const selectedCalendar = bonusConfiguration.find(item => item.id === id);
    return selectedCalendar?.name || '';
  }

  function cancelEdit() {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: getSelectedCalendarName(),
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
        title="Redaktə et"
        className={styles.penButton}
        disabled={!isDeletable}
        onClick={setToEdit}
      >
        <span className={styles.nameSpan}>{initialInputValue}</span>
        <Can I={accessTypes.manage} a={permissions.sales_bonus_configuration}>
          {isDeletable && <Icon type="edit" />}
        </Can>
      </button>
    );
  }

  useEffect(() => {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
  }, [id]);

  return (
    <>
      <AddProduct
        setDefaultExpand={setDefaultExpand}
        defaultExpand={defaultExpand}
        selected={selected}
        setSelected={setSelected}
        visible={modalIsVisible}
        toggleVisible={setModalIsVisible}
      />
      <Row gutter={12} className={styles.settingsWrap}>
        <Col span={17} className={styles.textColsWrap}>
          <div className={styles.infoText}>{renderTitle}</div>
        </Col>
        <Can I={accessTypes.manage} a={permissions.sales_bonus_configuration}>
          <Col span={7} className={styles.newButton}>
            <ButtonGreen
              onClick={() => setModalIsVisible(true)}
              title="Məhsul əlavə et"
              icon={
                <FaPlus
                  style={{ width: '10px', height: '10px', marginRight: '5px' }}
                />
              }
            />
          </Col>
        </Can>
      </Row>
    </>
  );
}

const mapStateToProps = state => ({
  bonusConfiguration: state.bonusConfigurationReducer.bonusConfiguration,
  selectedConfiguration: state.bonusConfigurationReducer.selectedConfiguration,
  isEditLoading: !!state.loadings.editBonusConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchBonusConfigurations,
    editBonusConfiguration,
  }
)(SettingsPanel);
