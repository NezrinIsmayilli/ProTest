import React, { useState } from 'react';
import { TimePicker, Row, Col } from 'antd';
import styles from './styles.module.scss';

const format = 'HH:mm';

export function ProTimeRangePicker(props) {
  const {
    startValue,
    endValue,
    onStartChange,
    onEndChange,
    scrollAreaId,
    id,
    disabled = false,
  } = props;

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  function getPopupContainer() {
    return scrollAreaId ? document.getElementById(scrollAreaId) : document.body;
  }

  return (
    <Row>
      <Col span={12}>
        <TimePicker
          disabled={disabled}
          hideDisabledOptions
          open={startOpen}
          onOpenChange={setStartOpen}
          value={startValue}
          onChange={onStartChange}
          id={id}
          format={format}
          placeholder="vaxt"
          className={`${styles.timeStart} ${
            startValue === undefined ? 'has-error' : ''
          }`}
          allowClear={false}
          getPopupContainer={getPopupContainer}
          disabledHours={() => {
            const minHour = -1;
            const maxHour = endValue ? endValue.hours() : 24;

            return Array.from({ length: 24 }, (val, key) => key).filter(
              hour => hour < minHour || hour > maxHour
            );
          }}
          disabledMinutes={startSelectedHour => {
            const minMinutes = -1;
            const maxMinutes =
              endValue && startSelectedHour >= endValue.hours()
                ? endValue.minutes()
                : 60;

            return Array.from({ length: 60 }, (val, key) => key).filter(
              minutes => minutes < minMinutes || minutes > maxMinutes
            );
          }}
        />
      </Col>

      <Col span={12}>
        <TimePicker
          hideDisabledOptions
          open={endOpen}
          disabled={disabled}
          onOpenChange={setEndOpen}
          value={endValue}
          onChange={onEndChange}
          format={format}
          placeholder="vaxt"
          allowClear={false}
          getPopupContainer={getPopupContainer}
          id={`${id}end`}
          disabledHours={() => {
            const minHour = startValue ? startValue.hours() : -1;
            const maxHour = 24;
            return Array.from({ length: 24 }, (val, key) => key).filter(
              hour => hour < minHour || hour > maxHour
            );
          }}
          disabledMinutes={endSelectedHour => {
            const minMinutes =
              startValue && endSelectedHour <= startValue.hours()
                ? startValue.minutes()
                : -1;
            const maxMinutes = 60;
            return Array.from({ length: 60 }, (val, key) => key).filter(
              minutes => minutes < minMinutes || minutes > maxMinutes
            );
          }}
          className={`${styles.timeEnd} ${
            endValue === undefined ? 'has-error' : ''
          }`}
        />
      </Col>
    </Row>
  );
}
