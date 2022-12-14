import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import useForm from 'react-hook-form';
import moment from 'moment';
import {
  ProFormItem,
  InfoCard,
  FormTextarea,
  ProDatePicker,
  FormInput,
} from 'components/Lib';
import { Button } from 'antd';
import { ReactComponent as IllIcon } from 'assets/img/icons/illness.svg';
import {
  createEmployeeActivitySickLeave,
  editEmployeeActivitySickLeave,
  infoEmployeeActivitySickLeave,
} from 'store/actions/employeeActivity/employeeActivitySickLeave';
import { fetchWorkers } from 'store/actions/hrm/workers';

import { history } from 'utils/history';
import { todayWithMinutes, dateFormat, toastHelper } from 'utils';

import styles from './styles.module.scss';

function SickLeaveForm(props) {
  const {
    id,
    handleCancel,
    infoData,
    createEmployeeActivitySickLeave,
    fetchWorkers,
    isLoading,
    isEdit,
    editEmployeeActivitySickLeave,
    infoEmployeeActivitySickLeave,
  } = props;

  const {
    register,
    unregister,
    errors,
    handleSubmit,
    setValue,
    getValues,
    reset,
  } = useForm();

  const returnUrl = '/hrm/employees/workers';
  const returnEditUrl = '/hrm/employees/operations';

  useEffect(() => {
    register({ name: 'startDate' });
    register({ name: 'endDate' });

    return () => {
      unregister({ name: 'startDate' });
      unregister({ name: 'endDate' });
    };
  }, [register, unregister]);

  useEffect(() => {
    if (isEdit && infoData) {
      setValue('orderNumber', infoData.orderNumber);
      setValue('startDate', infoData.startDate);
      setValue('endDate', infoData.endDate);
      setValue('note', infoData.note);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, infoData]);

  const { startDate, endDate } = getValues();

  const onChange = React.useCallback(
    event => {
      const { name, value = '' } = event.target || {};
      setValue(name, value, true);
    },
    [setValue]
  );

  function onSuccessCallBack(message) {
    return () => {
      fetchWorkers({
        filters: {
          lastEmployeeActivityType: 1,
        },
      });
      handleCancel(null);
      reset();
      return toastHelper(history, returnUrl, message);
    };
  }

  function onEditSuccessCallBack(message, id) {
    return () => {
      infoEmployeeActivitySickLeave(id);
      return toastHelper(history, returnEditUrl, message);
    };
  }

  const handleEmployeeActivityBusinessTrip = data => {
    const postData = {
      employee: id,
      orderNumber: data.orderNumber,
      startDate: data.startDate || moment().format('DD-MM-YYYY'),
      endDate: data.endDate || moment().format('DD-MM-YYYY'),
      note: data.note || null,
    };
    if (isEdit) {
      postData.employee = Number(infoData.employeeId);
      editEmployeeActivitySickLeave(
        infoData.id,
        postData,
        onEditSuccessCallBack(
          'X??st??lik d??vr??n?? d??yi??iklik edildi.',
          infoData.id
        )
      );
    } else {
      createEmployeeActivitySickLeave(
        postData,
        onSuccessCallBack('??????iy?? x??st??lik d??vr?? ??lav?? edildi.')
      );
    }
  };
  function disabledDate(current) {
    const dateObj = new Date(
      startDate && startDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
    );
    return current && current < moment(dateObj);
  }
  return (
    <div className={styles.operationBox}>
      <div className={styles.padding24}>
        <InfoCard
          name={infoData.name}
          surname={infoData.surname}
          patronymic={infoData.patronymic}
          occupationName={infoData.occupationName}
          attachmentUrl={infoData.attachmentUrl}
          width="48px"
          height="48px"
        />
      </div>
      <div
        className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
      >
        <IllIcon />
        <h3>X??st??lik</h3>
      </div>
      <form
        className={styles.padding24}
        onSubmit={handleSubmit(handleEmployeeActivityBusinessTrip)}
      >
        <FormInput
          required
          label="S??n??din n??mr??si"
          name="orderNumber"
          ref={register({ required: 'Bu d??y??r bo?? olmamal??d??r.' })}
          maxLength={30}
          message={errors.orderNumber && errors.orderNumber.message}
        />
        <ProFormItem label="Tarix">
          <p className={styles.disabledInput}>{todayWithMinutes}</p>
        </ProFormItem>

        <ProFormItem label="Ba??lama">
          <ProDatePicker
            name="startDate"
            disabledDate={d =>
              !d || d.isBefore(moment(infoData.hireDate, dateFormat))
            }
            value={startDate ? moment(startDate, dateFormat) : moment()}
            onChange={(_, selectedDate) => {
              onChange({
                target: {
                  name: 'startDate',
                  value: selectedDate,
                },
              });
            }}
          />
        </ProFormItem>

        <ProFormItem label="Bitm??">
          <ProDatePicker
            name="endDate"
            disabledDate={disabledDate}
            allowClear={false}
            defaultValue={moment()}
            value={endDate ? moment(endDate, dateFormat) : moment()}
            onChange={(_, selectedDate) => {
              onChange({
                target: {
                  name: 'endDate',
                  value: selectedDate,
                },
              });
            }}
          />
        </ProFormItem>
        <FormTextarea
          label="Qeyd"
          name="note"
          maxLength={170}
          ref={register({
            required: false,
            validate: value => {
              if (value.length && value.length < 3) {
                return 'Bu d??y??r 3 simvoldan az olmamal??d??r.';
              }
              return true;
            },
          })}
          message={errors.note && errors.note.message}
        />
        <div className={`${styles.txtRight} ${styles.marginTop36}`}>
          <Button
            className={styles.cancelBtnNoBordered}
            size="large"
            onClick={() => {
              handleCancel(null);
              reset();
            }}
          >
            ??mtina
          </Button>
          <Button
            disabled={false}
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
          >
            T??sdiq et
          </Button>
        </div>
      </form>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: !!state.loadings.employeeActivitySickLeave,
});

export default connect(
  mapStateToProps,
  {
    fetchWorkers,
    createEmployeeActivitySickLeave,
    editEmployeeActivitySickLeave,
    infoEmployeeActivitySickLeave,
  }
)(SickLeaveForm);
