/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { Row, Col, Button, Spin } from 'antd';
import { Can } from 'components/Lib';

import { createWorkScheduleDays } from 'store/actions/hrm/attendance/workScheduleDays';

import useForm from 'react-hook-form';
import { permissions, accessTypes } from 'config/permissions';

import Day from './Day';

import styles from '../workSchedule.module.scss';

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

const startsAt = '10:00:00';
const endsAt = '19:00:00';
const breakStartsAt = '13:00:00';
const breakEndsAt = '14:00:00';
const hours = '8s. 0d.';

const defaultData = {
  weekdayNames: [],
  weekdaysWorkHours: [],
  weekdaysTotalWorkHours: [],
};

const { weekdayNames, weekdaysWorkHours, weekdaysTotalWorkHours } = defaultData;

const weekdays = moment.weekdays(true);

weekdays.forEach((weekdayName, index) => {
  const weekday = Number(index) + 1;
  const isSunday = weekday === 7;

  weekdayNames.push({
    weekday,
    weekdayName,
  });

  weekdaysWorkHours.push({
    weekday,
    startsAt: isSunday ? null : startsAt,
    endsAt: isSunday ? null : endsAt,
    breakStartsAt: isSunday ? null : breakStartsAt,
    breakEndsAt: isSunday ? null : breakEndsAt,
  });

  weekdaysTotalWorkHours.push({
    weekday,
    hours: isSunday ? 0 : hours,
  });
});

function Week(props) {
  const {
    workScheduleDays,
    isUpdating,
    createWorkScheduleDays,

    selectedSchedule,
    isFetching,
  } = props;

  const editingWorkScheduleId = selectedSchedule?.id;
  const workScheduleDaysCount = workScheduleDays.length;

  const { register, setValue, getValues } = useForm();
  const { weekdays_ul, weekdays_totalWorkHours } = getValues();

  useEffect(() => {
    register({ name: 'weekdays_ul' });
    register({ name: 'weekdays_totalWorkHours' });

    if (workScheduleDays && workScheduleDaysCount > 0) {
      const copy = clone(workScheduleDays);
      const totalWorkHours = [];

      copy.forEach(item => {
        const calculatedTotalWorkHours = calculateTotalWorkHours(item);
        totalWorkHours.push({
          weekday: item.weekday,
          hours: calculatedTotalWorkHours,
        });
      });

      setValue('weekdays_totalWorkHours', totalWorkHours);
      setValue('weekdays_ul', copy);
    } else {
      const copyWorkHours = clone(weekdaysWorkHours);

      setValue('weekdays_ul', copyWorkHours);
      const copyWeekDaysTotalWorkHours = clone(weekdaysTotalWorkHours);

      setValue('weekdays_totalWorkHours', copyWeekDaysTotalWorkHours);
    }
  }, [workScheduleDays, workScheduleDaysCount]);

  function onChange(weekday, dayKey, value) {
    const weekCopy = clone(getValues().weekdays_ul);

    const dayIndex = weekCopy.findIndex(
      item => item.weekday === Number(weekday)
    );

    weekCopy[dayIndex][dayKey] = value ? `${value}:00` : undefined;
    setValue('weekdays_ul', weekCopy);

    weekdays_totalWorkHours[dayIndex].hours = calculateTotalWorkHours(
      weekCopy[dayIndex]
    );
    setValue('weekdays_totalWorkHours', weekdays_totalWorkHours);
  }

  function onCheckboxChange(weekday, key, value) {
    const weekCopy = clone(getValues().weekdays_ul);

    const dayIndex = weekCopy.findIndex(
      item => item.weekday === Number(weekday)
    );

    if (value === true) {
      weekCopy[dayIndex].breakStartsAt = undefined;
      weekCopy[dayIndex].breakEndsAt = undefined;

      if (key === 'isNonWorkingDay') {
        weekCopy[dayIndex].breakStartsAt = breakStartsAt;
        weekCopy[dayIndex].breakEndsAt = breakEndsAt;
        weekCopy[dayIndex].startsAt = startsAt;
        weekCopy[dayIndex].endsAt = endsAt;
      }
    } else {
      weekCopy[dayIndex].breakStartsAt = null;
      weekCopy[dayIndex].breakEndsAt = null;

      if (key === 'isNonWorkingDay') {
        weekCopy[dayIndex].startsAt = null;
        weekCopy[dayIndex].endsAt = null;
      }
    }
    setValue('weekdays_ul', weekCopy);
    weekdays_totalWorkHours[dayIndex].hours = calculateTotalWorkHours(
      weekCopy[dayIndex]
    );
    setValue('weekdays_totalWorkHours', weekdays_totalWorkHours);
  }

  function handleSubmit() {
    const copyOfWeekdDaysUl = clone(getValues().weekdays_ul);

    copyOfWeekdDaysUl.forEach(item => {
      if (item.startsAt && item.startsAt.length === 5) {
        item.startsAt += ':00';
      }
      if (item.endsAt && item.endsAt.length === 5) {
        item.endsAt += ':00';
      }
      if (item.breakStartsAt && item.breakStartsAt.length === 5) {
        item.breakStartsAt += ':00';
      }
      if (item.breakEndsAt && item.breakEndsAt.length === 5) {
        item.breakEndsAt += ':00';
      }

      // null it if values undefined
      if (item.breakStartsAt === undefined) {
        item.breakStartsAt = null;
      }
      if (item.breakEndsAt === undefined) {
        item.breakEndsAt = null;
      }
      if (item.startsAt === undefined) {
        item.startsAt = null;
      }
      if (item.endsAt === undefined) {
        item.endsAt = null;
      }
    });

    createWorkScheduleDays({
      workSchedule: editingWorkScheduleId,
      weekdays_ul: copyOfWeekdDaysUl,
    });
  }

  function cancelEvent() {
    if (workScheduleDays && workScheduleDaysCount > 0) {
      const copy = clone(workScheduleDays);
      const totalWorkHours = [];

      copy.forEach(item => {
        const calculatedTotalWorkHours = calculateTotalWorkHours(item);

        totalWorkHours.push({
          weekday: item.weekday,
          hours: calculatedTotalWorkHours,
        });
      });

      setValue('weekdays_totalWorkHours', totalWorkHours);
      setValue('weekdays_ul', copy);
    } else {
      const copyWorkHours = clone(weekdaysWorkHours);
      const copyWeekDaysTotalWorkHours = clone(weekdaysTotalWorkHours);

      setValue('weekdays_ul', copyWorkHours);
      setValue('weekdays_totalWorkHours', copyWeekDaysTotalWorkHours);
    }
  }

  function calculateTotalWorkHours(weekDay) {
    const { startsAt, endsAt, breakStartsAt, breakEndsAt } = weekDay;

    let totalMinutesExceptLunch = 0;
    let totalBreakMinutes = 0;
    let calculatedMinutes = 0;

    if (startsAt && endsAt) {
      const endTime = moment(endsAt, 'HH:mm:ss');
      const startTime = moment(startsAt, 'HH:mm:ss');
      const duration = moment.duration(endTime.diff(startTime));
      totalMinutesExceptLunch = duration.asMinutes();
    }

    if (breakStartsAt && breakEndsAt) {
      const endBreakTime = moment(breakEndsAt, 'HH:mm:ss');
      const startBreakTime = moment(breakStartsAt, 'HH:mm:ss');
      const duration = moment.duration(endBreakTime.diff(startBreakTime));
      totalBreakMinutes = duration.asMinutes();
    }

    if (totalMinutesExceptLunch && endsAt && breakStartsAt && breakEndsAt) {
      calculatedMinutes = totalMinutesExceptLunch - totalBreakMinutes;
    }

    if (
      totalMinutesExceptLunch &&
      endsAt &&
      breakStartsAt === null &&
      breakEndsAt === null
    ) {
      calculatedMinutes = totalMinutesExceptLunch;
    }

    const hours = Math.floor(calculatedMinutes / 60);
    const minutes = calculatedMinutes % 60;

    return `${hours}s. ${minutes}d.`;
  }

  return (
    <Row>
      <Col span={22}>
        <Spin spinning={isFetching}>
          <table className={styles.table}>
            <thead className="ant-table-thead">
              <tr>
                <th>Həftənin günü</th>
                <th style={{textAlign: 'center'}}>İş saatları</th>
                <th style={{textAlign: 'center'}}>Nahar fasiləsi</th>
                <th style={{textAlign: 'center'}}>Ümumi saat</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody className="ant-table-tbody">
              {weekdays_ul &&
                weekdays_ul.length > 0 &&
                weekdays_ul.map((item, i) => (
                  <Day
                    key={`${item.weekday}${i}`}
                    day={item}
                    weekdayNames={weekdayNames}
                    onCheckboxChange={onCheckboxChange}
                    onChange={onChange}
                    weekdaysTotalWorkHours={weekdays_totalWorkHours}
                  />
                ))}
            </tbody>
          </table>
          <Can I={accessTypes.manage} a={permissions.work_schedule}>
            <div className={styles.btnLayer}>
              <Button
                type="link"
                className={styles.cancelButton}
                onClick={cancelEvent}
              >
                İmtina et
              </Button>

              <Button
                loading={isUpdating}
                onClick={handleSubmit}
                type="primary"
                size="large"
              >
                Yadda saxla
              </Button>
            </div>
          </Can>
        </Spin>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  workScheduleDays: state.workScheduleDaysReducer.workScheduleDays,
  workSchedules: state.workSchedulesReducer.workSchedules,

  selectedSchedule: state.workSchedulesReducer.selectedSchedule,
  isFetching:
    !!state.loadings.fetchWorkScheduleDays ||
    !!state.loadings.fetchWorkSchedules,
  isUpdating: !!state.loadings.createWorkScheduleDays,
});

export default connect(
  mapStateToProps,
  {
    createWorkScheduleDays,
  }
)(Week);
