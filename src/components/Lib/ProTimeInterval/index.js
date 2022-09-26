/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Input } from 'antd';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

export function ProTimeInterval(props) {
  const {
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
    startValue:defaultStartValue ? defaultStartValue : undefined,
    endValue:defaultEndValue? defaultEndValue: undefined,
    selected: undefined,
  });

  const { startValue, endValue, selected } = state;

  function onChange(field, value) {
    setState({
      ...state,
      [field]: value || undefined,
      selected: undefined,
    });
  }

  function onStartChange(e) {
    onChange('startValue', e.target.value || undefined);
  }

  function onEndChange(e) {
    onChange('endValue', e.target.value || undefined);
  }

  function setRangeToDay() {
    setState({
      startValue: 30,
      endValue: 59,
      selected: 'firstInterval',
    });
  }

  function setRangeToWeek() {
    setState({
      startValue: 60,
      endValue: 89,
      selected: 'secondInterval',
    });
  }

  function setRangeToMonth() {
    setState({
      startValue: 90,
      endValue: 100,
      selected: 'thirdInterval',
    });
  }

  // send start-end range after state change
  useEffect(() => {
    onChangeDate(startValue, endValue);
  }, [endValue, startValue]);

  return (
    <>
      <div className={styles.range}>
        <Input
          value={startValue || null}
          placeholder={placeholderStart}
          onChange={onStartChange}
          allowClear={notRequired}
          {...rest}
        />
        <Input
          value={endValue || null}
          placeholder={placeholderEnd}
          onChange={onEndChange}
          allowClear={notRequired}
          {...rest}
        />
      </div>

      <Row gutter={4} className={styles.rangeButtons} style={rangeButtonsStyle}>
        <Col span={8}>
          <Button
            type={selected === 'firstInterval' ? 'primary' : ''}
            onClick={setRangeToDay}
            size={buttonSize}
          >
            > 30
          </Button>
        </Col>
        <Col span={8}>
          <Button
            type={selected === 'secondInterval' ? 'primary' : ''}
            onClick={setRangeToWeek}
            size={buttonSize}
          >
            > 60
          </Button>
        </Col>

        <Col span={8}>
          <Button
            type={selected === 'thirdInterval' ? 'primary' : ''}
            onClick={setRangeToMonth}
            size={buttonSize}
          >
            > 90
          </Button>
        </Col>
      </Row>
    </>
  );
}

ProTimeInterval.propTypes = {
  onChangeDate: PropTypes.func,
  buttonSize: PropTypes.string,
  showIcon: PropTypes.bool,
};
