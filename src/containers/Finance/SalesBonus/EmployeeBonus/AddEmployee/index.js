/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Modal, Spin } from 'antd';
import {
  fetchEmployeeBonuses,
  createEmployeeConfiguration,
} from 'store/actions/finance/salesBonus';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { ProButton, ProSelect } from 'components/Lib';
import { toast } from 'react-toastify';
import styles from '../../styles.module.scss';

const AddEmployee = props => {
  const {
    visible,
    toggleVisible,
    fetchEmployeeBonuses,
    createEmployeeConfiguration,
    fetchWorkers,
    workersLoading,
    selected,
    setSelected,
    workers,
    bonusConfiguration,
    filters,
    selectedYearandMonth,
  } = props;
  const [newSelectedEmployees, setNewSelectedEmployees] = useState([]);
  const [newData, setNewData] = useState([]);

  const addEmployee = employeeIds => {
    if (bonusConfiguration.length === 1) {
      const [employeeId] = employeeIds;
      const newEmployee = workers.find(worker => worker.id === employeeId);
      setNewSelectedEmployees(prevNewSelectedEmployees => [
        newEmployee,
        ...prevNewSelectedEmployees,
      ]);
    } else {
      const newEmployee = workers.filter(worker => worker.id === employeeIds);
      setNewSelectedEmployees(newEmployee);
    }
  };
  const handleSelectedEmployeesChange = employeeIds => {
    const newEmployees = newSelectedEmployees.filter(employee =>
      employeeIds.includes(employee.id)
    );
    setNewSelectedEmployees(newEmployees);
  };
  const onClick = () => {
    const data = newSelectedEmployees.map(newSelectedEmployee => {
      if (bonusConfiguration?.length === 1) {
        return {
          employee: newSelectedEmployee.id,
          salesBonusConfiguration: bonusConfiguration?.[0]?.id,
          turnoverType: newSelectedEmployee?.tenantPersonId !== null ? 1 : 2,
        };
      }
      return {
        id: newSelectedEmployee.id,
        applyToSalary: false,
        bonusAmount: 0,
        currencyCode: newSelectedEmployee.currencyCode,
        editedBonusAmount: 0,
        name: newSelectedEmployee.name,
        occupationName: newSelectedEmployee.occupationName,
        patronymic: newSelectedEmployee.patronymic,
        saleBonusTurnover: newSelectedEmployee?.tenantPersonId !== null ? 1 : 2,
        surname: newSelectedEmployee.surname,
      };
    });
    const isDouble = selected.filter(({ saleBonusConfigurationId }) => {
      if (!saleBonusConfigurationId) {
        return true;
      }
      return false;
    });
    if (isDouble && isDouble.length > 0) {
      toast.error('Cədvəldə bonus növü əlavə olunmamış əməkdaş mövcuddur');
    } else if (bonusConfiguration?.length === 1) {
      data.map(item => {
        createEmployeeConfiguration({
          data: item,
          onSuccessCallback: ({ data }) => {
            fetchEmployeeBonuses({
              filters,
              year: selectedYearandMonth.selectedYear,
              month: selectedYearandMonth.selectedMonth,
            });
            clearModal();
            toggleVisible(false);
          },
          onFailureCallback: ({ error }) => {
            if (
              error?.response?.data?.error?.messageKey ===
              'employee_is_not_related_to_tenant_person'
            ) {
              return toast.error(
                'Seçilmiş əməkdaş heç bir istifadəçiyə bağlanmayıb.'
              );
            }
          },
        });
      });
    } else {
      setNewData([...data]);
      clearModal();
      toggleVisible(false);
    }
  };
  useEffect(() => {
    if (newData) {
      setSelected([...newData, ...selected]);
    }
  }, [newData]);

  const clearModal = () => {
    setNewSelectedEmployees([]);
  };
  useEffect(() => {
    if (visible) {
      fetchWorkers({ filters: { lastEmployeeActivityType: 1 } });
    } else {
      clearModal();
    }
  }, [visible]);
  return (
    <Modal
      visible={visible}
      onCancel={() => toggleVisible(false)}
      closable={false}
      footer={null}
      className={styles.customModal}
      destroyOnClose
      maskClosable
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => toggleVisible(false)}
      >
        <img
          id="warehouse"
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.AddEmployeeModal}>
        {/* <Spin spinning={actionLoading}> */}
        <div style={{ marginBottom: '20px' }}>
          <span className={styles.header}>Əlavə et</span>
        </div>
        <div>
          <span className={styles.selectLabel}>Əməkdaşlar</span>
          <ProSelect
            mode={bonusConfiguration?.length === 1 ? 'multiple' : null}
            loading={workersLoading}
            keys={['name', 'surname', 'patronymic']}
            data={
              bonusConfiguration.length === 1
                ? [...selected, ...newSelectedEmployees].length > 0
                  ? workers.filter(
                      worker =>
                        ![
                          ...selected.map(data => data.id),
                          ...newSelectedEmployees.map(data => data.id),
                        ].includes(worker.id)
                    )
                  : workers
                : [...selected, newSelectedEmployees].length > 0
                ? workers.filter(
                    worker =>
                      ![
                        ...selected.map(data => data.id),
                        newSelectedEmployees.id,
                      ].includes(worker.id)
                  )
                : workers
            }
            value={
              bonusConfiguration.length === 1
                ? undefined
                : newSelectedEmployees.map(
                    newSelectedEmployee => newSelectedEmployee.id
                  )
            }
            onChange={addEmployee}
          />
        </div>
        {bonusConfiguration?.length === 1 ? (
          <div>
            <span className={styles.selectLabel}>Seçilmiş əməkdaşlar</span>
            <ProSelect
              mode="multiple"
              keys={['name', 'surname', 'patronymic']}
              data={newSelectedEmployees}
              value={newSelectedEmployees.map(
                newSelectedEmployee => newSelectedEmployee.id
              )}
              onChange={handleSelectedEmployeesChange}
            />
          </div>
        ) : null}
        <div style={{ margin: '10px 0' }}>
          <ProButton onClick={onClick} style={{ marginRight: '10px' }}>
            Təsdiq et
          </ProButton>
        </div>
        {/* </Spin> */}
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  workers: state.workersReducer.workers,
  workersLoading: state.loadings.fetchWorkers,
  isLoading: state.stockReducer.isLoading,
  actionLoading: state.stockReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  { fetchWorkers, fetchEmployeeBonuses, createEmployeeConfiguration }
)(Form.create({ name: 'AddEmployee' })(AddEmployee));
