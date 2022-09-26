import React from 'react';
import { Timeline as Timeliner, Row, Col, Spin } from 'antd';
import { connect } from 'react-redux';
import TimelineItem from './TimelineItem';

import styles from './styles.module.scss';

const Timeline = ({ selectedOrder, isLoading, visible = false }) => (
  <div className={styles.Timeline} style={visible ? {} : { display: 'none' }}>
    <Row>
      <Col span={18} offset={3}>
        <Timeliner>
          <Spin spinning={isLoading}>
            {selectedOrder.history.map(historyItem => (
              <Timeliner.Item key={historyItem.id}>
                <TimelineItem historyItem={historyItem} />
              </Timeliner.Item>
            ))}
          </Spin>
        </Timeliner>
      </Col>
    </Row>
  </div>
);

const mapStateToProps = state => ({
  // selectedOrder: state.ordersReducer.selectedOrder,
  isLoading: state.ordersReducer.isLoading,
});

export default connect(
  mapStateToProps,

  null
)(Timeline);
