import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { Row, Col, Tooltip } from 'antd';
import Section from './Section';
import styles from './styles.module.scss';

function GoodTurnoverDetail(props) {
  const { row, filters } = props;
  return (
    <div className={styles.DetailsModal} style={{ padding: '50px 16px 32px' }}>
      <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
        <Col span={8} className={styles.headerCol}>
          <span className={styles.header}>
            <Tooltip placement="topLeft" title={row.product_name}>
              <span>{row.product_name}</span>
            </Tooltip>
          </span>
        </Col>
      </Row>
      <Section
        section="Anbar"
        value={
          <Tooltip placement="topLeft" title={row.stock_name || '-'}>
            <span>{row.stock_name || '-'} </span>
          </Tooltip>
        }
      />
      <Section
        section="Dövrün əvvəli"
        value={
          <Tooltip placement="topLeft" title={`${filters.dateFrom}`}>
            <span>{`${filters.dateFrom}`} </span>
          </Tooltip>
        }
      />
      <Section section="Dövrün sonu" value={`${filters.dateTo}`} />
      <Section
        section="Dövrün əvvəlinə"
        value={`${formatNumberToLocale(
          defaultNumberFormat(row.start_of_period || 0)
        )} ${row.unit_of_measurement_name || ''}`}
      />
      <Section
        section="Daxil olma"
        value={
          <Tooltip
            placement="topLeft"
            title={`${formatNumberToLocale(
              defaultNumberFormat(row.income || 0)
            )} ${row.unit_of_measurement_name || ''}`}
          >
            <span>
              {`${formatNumberToLocale(
                defaultNumberFormat(row.income || 0)
              )} ${row.unit_of_measurement_name || ''}`}
            </span>
          </Tooltip>
        }
      />

      <Section
        section="Xaric olma"
        value={
          <Tooltip
            placement="topLeft"
            title={`${formatNumberToLocale(
              defaultNumberFormat(row.outgo || 0)
            )} ${row.unit_of_measurement_name || ''}`}
          >
            <span>{`${formatNumberToLocale(
              defaultNumberFormat(row.outgo || 0)
            )} ${row.unit_of_measurement_name || ''}`}</span>
          </Tooltip>
        }
      />

      <Section
        section="Dövrün sonuna"
        value={
          <Tooltip
            placement="topLeft"
            title={`${formatNumberToLocale(
              defaultNumberFormat(row.endOfPeriod || 0)
            )} ${row.unit_of_measurement_name || ''}`}
          >
            <span>
              {`${formatNumberToLocale(
                defaultNumberFormat(row.endOfPeriod || 0)
              )} ${row.unit_of_measurement_name || ''}`}
            </span>
          </Tooltip>
        }
      />
    </div>
  );
}

export default GoodTurnoverDetail;
