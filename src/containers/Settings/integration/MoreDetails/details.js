import React from 'react';
// components
import { Button, Modal, Col, Row } from 'antd';

import styles from './styles.module.scss';
import Section from './Section';

function Details(props) {
  const { visible, toggleVisible, data } = props;

  return (
    <Modal
      visible={visible}
      onCancel={() => toggleVisible(false)}
      closable={false}
      centered
      footer={null}
      className={styles.customModal}
      destroyOnClose
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => toggleVisible(false)}
      >
        <img
          id="warehouse"
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.MoreDetails}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
          <Col>
            <span className={styles.header}>Əlavə məlumat</span>
          </Col>
        </Row>

        <Section section="Şirkət adı" value={data.name || '-'} />
        <Section section="Email" value={data.login || '-'} />
        <Section section="Status" value="Qoşulub" />
      </div>
    </Modal>
  );
}

export default Details;
