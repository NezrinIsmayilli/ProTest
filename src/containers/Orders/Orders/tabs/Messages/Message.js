import React from 'react';
import { Row, Col } from 'antd';
import styles from './styles.module.scss';

const Message = ({ author, date, message }) => (
  <Row className={styles.Message}>
    <Col span={1}>
      <img
        width={40}
        height={40}
        src="/img/icons/user.svg"
        alt="trash"
        className={styles.icon}
        style={{
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      />
    </Col>
    <Col span={23}>
      <div className={styles.infoContainer}>
        <span className={styles.author}>{author}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <span className={styles.message}>{message}</span>
    </Col>
  </Row>
);

export default Message;
