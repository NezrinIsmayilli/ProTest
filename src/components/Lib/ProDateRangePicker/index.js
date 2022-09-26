/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { DatePicker, Button, Row, Col } from 'antd';
import PropTypes from 'prop-types';

import { dateFormat } from 'utils';
import moment from 'moment';
import styles from './styles.module.scss';

export function ProDateRangePicker(props) {
  const {
    showIcon = false,
    year = false,
    buttonSize = 'default',
    placeholderStart = 'Başlanğıc',
    placeholderEnd = 'Son',
    rangeButtonsStyle = {},
    onChangeDate = () => {},
    notRequired = true,
    defaultStartValue = false,
    defaultEndValue = false,
    ...rest
  } = props;
  
  const [state, setState] = useState({
    startValue: defaultStartValue ? moment(defaultStartValue,'DD-MM-YYYY') : (notRequired ? undefined : moment().startOf('month')),
    endValue: defaultEndValue ? moment(defaultEndValue,'DD-MM-YYYY'): (notRequired ? undefined : moment().endOf('month')),
    selected: notRequired ? undefined : 'month',
  });

  const { startValue, endValue, selected } = state;

  function onChange(field, value) {
    setState({
      ...state,
      [field]: value || undefined,
      selected: undefined,
    });
  }

  function onStartChange(value) {
    onChange('startValue', value || undefined);
  }

  function onEndChange(value) {
    onChange('endValue', value || undefined);
  }

  function setRangeToDay() {
    setState({
      startValue: moment(),
      endValue: moment(),
      selected: 'day',
    });
  }

  function setRangeToWeek() {
    setState({
      startValue: moment().startOf('week'),
      endValue: moment().endOf('week'),
      selected: 'week',
    });
  }

  function setRangeToMonth() {
    setState({
      startValue: moment().startOf('month'),
      endValue: moment().endOf('month'),
      selected: 'month',
    });
  }

  function setRangeToYear() {
    setState({
      startValue: moment().startOf('year'),
      endValue: moment().endOf('year'),
      selected: 'year',
    });
  }

  // send start-end range after state change
  useEffect(() => {
    onChangeDate(startValue, endValue);
  }, [endValue, startValue]);

  return (
    <>
      <div className={styles.range}>
        <DatePicker
          format={dateFormat}
          value={startValue ? moment(startValue, dateFormat) : null}
          placeholder={placeholderStart}
          onChange={onStartChange}
          suffixIcon={!showIcon && <i />} // null not work
          showToday={false}
          getCalendarContainer={trigger => trigger.parentNode}
          allowClear={notRequired}
          {...rest}
        />
        <DatePicker
          format={dateFormat}
          value={endValue ? moment(endValue, dateFormat) : null}
          placeholder={placeholderEnd}
          onChange={onEndChange}
          suffixIcon={!showIcon && <i />}
          showToday={false}
          getCalendarContainer={trigger => trigger.parentNode}
          allowClear={notRequired}
          {...rest}
        />
      </div>

      <Row gutter={4} className={styles.rangeButtons} style={rangeButtonsStyle}>
        <Col span={8}>
          <Button
            type={selected === 'day' ? 'primary' : ''}
            onClick={setRangeToDay}
            size={buttonSize}
          >
            Bu gün
          </Button>
        </Col>
        <Col span={8}>
          <Button
            type={selected === 'week' ? 'primary' : ''}
            onClick={setRangeToWeek}
            size={buttonSize}
          >
            Bu həftə
          </Button>
        </Col>

        <Col span={8}>
          <Button
            type={selected === 'month' ? 'primary' : ''}
            onClick={setRangeToMonth}
            size={buttonSize}
          >
            Bu ay
          </Button>
          {year && (
            <Button
              type={selected === 'year' ? 'primary' : ''}
              onClick={setRangeToYear}
              size={buttonSize}
            >
              Bu il
            </Button>
          )}
        </Col>
      </Row>
    </>
  );
}

ProDateRangePicker.propTypes = {
  onChangeDate: PropTypes.func,
  buttonSize: PropTypes.string,
  showIcon: PropTypes.bool,
  year: PropTypes.bool,
};
