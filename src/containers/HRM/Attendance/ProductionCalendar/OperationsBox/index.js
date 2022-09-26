/* eslint-disable react-hooks/exhaustive-deps */
import React, {  useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { Button, Affix, Form } from 'antd';
import { ProDatePicker, ProFormItem, ProSelect, Can } from 'components/Lib';

// actions
import { fetchNonWorkingDays } from 'store/actions/hrm/attendance/nonWorkingDays';
import {
  fetchCalendarNonWorkingDaysByCalendarId,
  createCalendarNonWorkingDays,
  editCalendarNonWorkingDays,
  deleteCalendarNonWorkingDaysById,
  setIsEditible,
} from 'store/actions/hrm/calendars';

// utils
import moment from 'moment';
import { dateFormat, messages } from 'utils';
import { permissions, accessTypes } from 'config/permissions';

import styles from '../styles.module.scss';

const baseRules = [
  {
    required: true,
    message: messages.requiredText,
  },
];

function OperationsBox(props) {
  const {
    form,
    // data
    calendarNonWorkingDays,
    selectedCalendarDay,
    selectedCalendar,
    nonWorkingDays,
    createLoading,
    isEditible,
    setIsEditible,
    deleteLoading,
    // actions
    fetchNonWorkingDays,
    fetchCalendarNonWorkingDaysByCalendarId,
    createCalendarNonWorkingDays,
    editCalendarNonWorkingDays,
    deleteCalendarNonWorkingDaysById,
  } = props;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    resetFields,
  } = form;

  const { id: calendarId } = selectedCalendar || {};

  useEffect(() => {
    if (nonWorkingDays.length === 0) {
      fetchNonWorkingDays();
    }
  }, []);

  const successCallback = () => {
    resetFields();
    setIsEditible({attribute: false});
    fetchCalendarNonWorkingDaysByCalendarId(calendarId);
  };

  const handleSubmit = e => {
    e.preventDefault();

    validateFields((errors, values) => {
      if (!errors) {
        const { startDate, endDate, nonWorkingDayId } = values;
        const data = {
          nonWorkingDayId,
          calendarId,
          startDate: moment(startDate).format(dateFormat),
          endDate: moment(endDate).format(dateFormat),
        };
        isEditible
          ? editCalendarNonWorkingDays(nonWorkingDay.id, data, successCallback)
          : createCalendarNonWorkingDays(data, successCallback);
      }
    });
  };

  const nonWorkingDay = useMemo(
    () =>
      calendarNonWorkingDays.find(({ startDate, endDate }) =>
        moment(selectedCalendarDay, dateFormat).isBetween(
          moment(startDate, dateFormat),
          moment(endDate, dateFormat),
          'day',
          '[]'
        )
      ),
    [selectedCalendarDay]
  );

  useEffect(() => {
    if (nonWorkingDay) {
      const { startDate, endDate, nonWorkingDayId } = nonWorkingDay;

      setFieldsValue({
        startDate: moment(startDate, dateFormat),
        endDate: moment(endDate, dateFormat),
        nonWorkingDayId,
      });
    } else {
      resetFields();
    }
  }, [nonWorkingDay]);

  const handleEditClick = () => {
    if (isEditible) {
    } else {
      setIsEditible({attribute: true});
    }
  };
  const deleteNonWorkingDay = e => {
    e.preventDefault();

    deleteCalendarNonWorkingDaysById(nonWorkingDay.id, successCallback);
  };

  const areInputsDisabled = !!nonWorkingDay;

  if (!selectedCalendar) {
    return null;
  }

  return (
    <Affix
      offsetTop={10}
      target={() => document.getElementById('ProductionCalendarMainArea')}
    >
      <div className={`${styles.operationWrap} infoContainer scrollbar`}>
        <Form onSubmit={handleSubmit} hideRequiredMark noValidate>
          <ProFormItem label="Başlama" help={getFieldError('startDate')?.[0]}>
            {getFieldDecorator('startDate', {
              rules: baseRules,
              initialValue: selectedCalendarDay
                ? moment(selectedCalendarDay, dateFormat)
                : undefined,
            })(
              <ProDatePicker
                disabled={nonWorkingDay ? !isEditible : areInputsDisabled}
              />
            )}
          </ProFormItem>

          <ProFormItem label="Bitmə" help={getFieldError('endDate')?.[0]}>
            {getFieldDecorator('endDate', {
              rules: baseRules,
              initialValue: selectedCalendarDay
                ? moment(selectedCalendarDay, dateFormat)
                : undefined,
            })(
              <ProDatePicker
                disabled={nonWorkingDay ? !isEditible : areInputsDisabled}
              />
            )}
          </ProFormItem>

          <ProFormItem
            label="Qeyri iş günü"
            help={getFieldError('nonWorkingDayId')?.[0]}
          >
            {getFieldDecorator('nonWorkingDayId', {
              rules: baseRules,
            })(
              <ProSelect
                disabled={nonWorkingDay ? !isEditible : areInputsDisabled}
                data={nonWorkingDays}
              />
            )}
          </ProFormItem>

          {/* <ProFormItem label="Açıqlama" autoHeight>
            <Input.TextArea rows={4} />
          </ProFormItem> */}
          <Can I={accessTypes.manage} a={permissions.calendar}>
            <div className={styles.alignRight}>
              {nonWorkingDay ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isEditible && (
                    <Button
                      type="primary"
                      size="large"
                      style={{ marginRight: '10px' }}
                      loading={deleteLoading}
                      htmlType="submit"
                    >
                      Yadda saxla
                    </Button>
                  )}
                  {!isEditible && (
                    <Button
                      type="primary"
                      size="large"
                      style={{ marginRight: '10px' }}
                      loading={deleteLoading}
                      onClick={handleEditClick}
                    >
                      Düzəliş et
                    </Button>
                  )}
                  <Button
                    type="danger"
                    size="large"
                    loading={deleteLoading}
                    onClick={deleteNonWorkingDay}
                  >
                    Sil
                  </Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={createLoading}
                >
                  Əlavə et
                </Button>
              )}
            </div>
          </Can>
        </Form>
      </div>
    </Affix>
  );
}

const mapStateToProps = state => ({
  calendarNonWorkingDays: state.hrmCalendarReducer.calendarNonWorkingDays,
  selectedCalendarDay: state.hrmCalendarReducer.selectedCalendarDay,
  selectedCalendar: state.hrmCalendarReducer.selectedCalendar,
  isEditible: state.hrmCalendarReducer.isEditible,
  nonWorkingDays: state.nonWorkingDaysReducer.nonWorkingDays,
  createLoading: !!state.loadings.createCalendarNonWorkingDay,
  deleteLoading: !!state.loadings.deleteCalendarNonWorkingDayById,
});

export default connect(
  mapStateToProps,
  {
    fetchNonWorkingDays,
    fetchCalendarNonWorkingDaysByCalendarId,
    createCalendarNonWorkingDays,
    editCalendarNonWorkingDays,
    deleteCalendarNonWorkingDaysById,
    setIsEditible,
  }
)(Form.create({ name: 'OperationsBox' })(OperationsBox));
