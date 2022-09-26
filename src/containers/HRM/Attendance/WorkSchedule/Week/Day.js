/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import moment from 'moment';
import { Checkbox, Switch } from 'antd';
import { ProTimeRangePicker } from 'components/Lib';
import { connect } from 'react-redux';
import styles from '../workSchedule.module.scss';

const format = 'HH:mm';

function isBetween(momentTime, end, start) {
  return end && start && momentTime
    ? momentTime.isBetween(end, start, null, '[]')
    : false;
}

function getValue(momentTime) {
  return momentTime ? momentTime.format(format) : undefined;
}

function getMoment(date) {
  return date ? moment(date, format) : undefined;
}

function Day(props) {
  const {
    day,
    weekdayNames,
    weekdaysTotalWorkHours,
    onCheckboxChange,
    onChange,
    permissionsByKeyValue,
  } = props;
  const { work_schedule } = permissionsByKeyValue;
  const isEditDisabled = work_schedule.permission !== 2;
  const { startsAt, endsAt, breakStartsAt, breakEndsAt, weekday } = day || {};

  const isDayOff = startsAt === null;
  const isBreakHave = breakStartsAt !== null;

  const startWorkHour = getMoment(startsAt);
  const endWorkHour = getMoment(endsAt);
  const startBreak = getMoment(breakStartsAt);
  const endBreak = getMoment(breakEndsAt);

  const dayName = weekdayNames.find(day => day.weekday === weekday).weekdayName;

  const totalHours = weekdaysTotalWorkHours.find(
    workHoursItem => workHoursItem.weekday === weekday
  ).hours;

  function resetBreak() {
    if (breakStartsAt === null) {
      return;
    }

    onChange(weekday, 'breakStartsAt', undefined);
    onChange(weekday, 'breakEndsAt', undefined);
  }

  return isDayOff ? (
    <tr className={styles.defaultHeight}>
      <td>{dayName}</td>
      <td>İstirahət günü</td>
      <td></td>
      <td></td>
      <td>
        <Switch
          disabled={isEditDisabled}
          className={isDayOff ? styles.switchColor : ''}
          checked={!isDayOff}
          defaultChecked
          onChange={checked =>
            onCheckboxChange(weekday, 'isNonWorkingDay', checked)
          }
        />
      </td>
    </tr>
  ) : (
    <tr>
      {/* Həftənin günü */}
      <td>{dayName}</td>

      {/* İş saatları */}
      <td>
        <div className={styles.flexRow}>
          <ProTimeRangePicker
            disabled={isEditDisabled}
            scrollAreaId="workSchedulesArea"
            startValue={startWorkHour}
            endValue={endWorkHour}
            id={`${startsAt}${endsAt}${weekday}`}
            onStartChange={momentTime => {
              if (
                !momentTime ||
                !isBetween(startBreak, momentTime, endWorkHour) ||
                !isBetween(endBreak, momentTime, endWorkHour)
              ) {
                resetBreak();
              }
              onChange(weekday, 'startsAt', getValue(momentTime));
            }}
            onEndChange={momentTime => {
              if (
                !momentTime ||
                !isBetween(startBreak, startWorkHour, momentTime) ||
                !isBetween(endBreak, startWorkHour, momentTime)
              ) {
                resetBreak();
              }
              onChange(weekday, 'endsAt', getValue(momentTime));
            }}
          />
        </div>
      </td>

      {/* Nahar fasiləsi  */}
      <td>
        <div className={styles.flexRow}>
          <Checkbox
            disabled={isEditDisabled}
            className={!isBreakHave ? styles.uncheckStyle : styles.labelMargin}
            checked={isBreakHave}
            onChange={({ target: { checked } }) => {
              onCheckboxChange(weekday, 'isBreak', checked);
            }}
          ></Checkbox>

          {isBreakHave ? (
            <div className={styles.flexRow}>
              <ProTimeRangePicker
                disabled={isEditDisabled}
                scrollAreaId="workSchedulesArea"
                startValue={startBreak}
                endValue={endBreak}
                id={`${breakStartsAt}${breakEndsAt}${weekday}`}
                onStartChange={momentTime => {
                  if (
                    momentTime &&
                    !isBetween(momentTime, startWorkHour, endWorkHour)
                  ) {
                    return;
                  }

                  onChange(weekday, 'breakStartsAt', getValue(momentTime));
                }}
                onEndChange={momentTime => {
                  if (
                    momentTime &&
                    !isBetween(momentTime, startWorkHour, endWorkHour)
                  ) {
                    return;
                  }

                  onChange(weekday, 'breakEndsAt', getValue(momentTime));
                }}
              />
            </div>
          ) : (
            'Nahar fasiləsi yoxdur'
          )}
        </div>
      </td>

      {/* Ümumi saat */}
      <td>{totalHours}</td>

      {/* Status */}
      <td>
        <Switch
          checked={!isDayOff}
          disabled={isEditDisabled}
          defaultChecked
          onChange={checked =>
            onCheckboxChange(weekday, 'isNonWorkingDay', checked)
          }
        />
      </td>
    </tr>
  );
}

const DayWithMemo = React.memo(
  Day,
  (prevProps, nextProps) =>
    prevProps.day &&
    prevProps.day.startsAt === nextProps.day.startsAt &&
    prevProps.day.endsAt === nextProps.day.endsAt &&
    prevProps.day.breakStartsAt === nextProps.day.breakStartsAt &&
    prevProps.day.breakEndsAt === nextProps.day.breakEndsAt
);

const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  null
)(DayWithMemo);
