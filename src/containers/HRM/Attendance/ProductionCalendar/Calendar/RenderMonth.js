import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Calendar, Col, Tooltip } from 'antd';

// actions
import {
  setSelectedCalendarDay,
  setIsEditible,
} from 'store/actions/hrm/calendars';

// utils
import moment from 'moment';
import { today, dateFormat } from 'utils';
import { hrmNonWorkingColorsValues } from 'utils/hrmConstants';

import styles from '../styles.module.scss';

/** Header */
const RenderHeader = ({ monthNumber }) => {
  const monthName = useMemo(() => moment(monthNumber + 1, 'M').format('MMMM'), [
    monthNumber,
  ]);

  return <div className={styles.calendarHeader}>{monthName}</div>;
};

/** Day */
const RenderCell = ({
  date,
  selectedCalendarDay,
  filteredNonWorkingDays,
  startOfMonth,
  endOfMonth,
}) => {
  const formattedDate = moment(date).format(dateFormat);

  const isNonWorkingDay = filteredNonWorkingDays.find(day =>
    moment(date).isBetween(
      moment(day.startDate, dateFormat),
      moment(day.endDate, dateFormat),
      'day',
      '[]'
    )
  );

  const isBetweenMonth = moment(date).isBetween(startOfMonth, endOfMonth);

  const isSelected = formattedDate === selectedCalendarDay;

  const isToday = formattedDate === today;

  const day = moment(date).format('D');

  const className = `
  ${styles.calendarCell}
  ${!isBetweenMonth ? styles.isNotBetween : ''}
  ${isToday ? styles.calendarToday : ''}
  ${isSelected ? styles.isColorfull : ''}`;

  const style = isNonWorkingDay
    ? {
        background: hrmNonWorkingColorsValues[(isNonWorkingDay?.color)],
        color: '#ffffff',
      }
    : {};

  if (isNonWorkingDay) {
    return (
      <Tooltip title={isNonWorkingDay.nonWorkingDayName}>
        <div style={style} className={className}>
          {day}
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={style} className={className}>
      {day}
    </div>
  );
};

/** Month */
const RenderMonth = ({
  monthNumber,
  startOfMonth,
  endOfMonth,
  selectedYear,
  // store
  selectedCalendarDay,
  calendarNonWorkingDays,
  setIsEditible,
  // actions
  setSelectedCalendarDay,
}) => {
  const defaultValue = moment()
    .year(selectedYear)
    .month(monthNumber);

  const validRange = [startOfMonth, endOfMonth];

  const onSelectDay = date => {
    setIsEditible({ attribute: false });
    setSelectedCalendarDay({ attribute: moment(date).format(dateFormat) });
  };

  const filteredNonWorkingDays = calendarNonWorkingDays.filter(day => {
    if (
      moment(day.startDate, dateFormat).isBetween(
        startOfMonth,
        endOfMonth,
        'day'
      ) ||
      moment(day.endDate, dateFormat).isBetween(startOfMonth, endOfMonth, 'day')
    ) {
      return day;
    }
    return false;
  });

  return (
    <Col style={{ fontSize: 12 }} xl={8} xxl={6}>
      <Calendar
        className={styles.calendarMonth}
        fullscreen={false}
        defaultValue={defaultValue}
        validRange={validRange}
        onSelect={onSelectDay}
        headerRender={() => <RenderHeader monthNumber={monthNumber} />}
        dateFullCellRender={date => (
          <RenderCell
            date={date}
            monthNumber={monthNumber}
            selectedYear={selectedYear}
            selectedCalendarDay={selectedCalendarDay}
            filteredNonWorkingDays={filteredNonWorkingDays}
            startOfMonth={startOfMonth}
            endOfMonth={endOfMonth}
          />
        )}
      />
    </Col>
  );
};

/**
 * if selected day is between current month then re-render month
 */
const getSelectedDay = state => state.hrmCalendarReducer.selectedCalendarDay;

const getRange = (state, { startOfMonth, endOfMonth }) => ({
  startOfMonth,
  endOfMonth,
});

const getCalculatedDay = createSelector(
  [getSelectedDay, getRange],
  (selectedDay, range) =>
    moment(selectedDay, dateFormat).isBetween(
      range.startOfMonth,
      range.endOfMonth,
      'day',
      '[]'
    )
      ? selectedDay
      : undefined
);

const mapStateToProps = (state, { startOfMonth, endOfMonth }) => ({
  calendarNonWorkingDays: state.hrmCalendarReducer.calendarNonWorkingDays,
  selectedCalendarDay: getCalculatedDay(state, { startOfMonth, endOfMonth }),
});

export default connect(
  mapStateToProps,
  {
    setSelectedCalendarDay,
    setIsEditible,
  }
)(RenderMonth);
