import React from 'react';
import { connect } from 'react-redux';

import { Row } from 'antd';

// utils
import moment from 'moment';

import RenderMonth from './RenderMonth';

window.moment = moment;
const getStartOfMonth = (selectedYear, monthNumber) =>
  moment()
    .year(selectedYear)
    .month(monthNumber)
    .startOf('month');

const getEndOfMonth = (selectedYear, monthNumber) =>
  moment()
    .year(selectedYear)
    .month(monthNumber)
    .endOf('month');

/** Calendar */
function ProductionCalendar(props) {
  const { calendarSelectedYear } = props;

  return (
    <Row gutter={[24, 24]}>
      {Array.from(Array(12).keys()).map(monthNumber => {
        const startOfMonth = getStartOfMonth(calendarSelectedYear, monthNumber);
        const endOfMonth = getEndOfMonth(calendarSelectedYear, monthNumber);

        return (
          <RenderMonth
            key={`${calendarSelectedYear}${monthNumber}`}
            monthNumber={monthNumber}
            startOfMonth={startOfMonth}
            endOfMonth={endOfMonth}
            selectedYear={calendarSelectedYear}
          />
        );
      })}
    </Row>
  );
}

const mapStateToProps = state => ({
  calendarSelectedYear: state.hrmCalendarReducer.calendarSelectedYear,
});

export default connect(mapStateToProps)(ProductionCalendar);
