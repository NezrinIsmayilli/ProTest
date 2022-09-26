import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import styles from './styles.module.scss';

export function ProContent({ title, children, right, className }) {
  return (
    <div className={styles.content}>
      <Row>
        <Col span={24}>
          <div className={styles.header}>
            <p className={className}>{title}</p>
            {right}
          </div>
        </Col>
        <Col span={24}>
          <Row>
            <Col span={24}>{children}</Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

ProContent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  right: PropTypes.any,
};
