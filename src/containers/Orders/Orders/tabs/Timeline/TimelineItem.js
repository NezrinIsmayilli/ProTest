import React, { useState } from 'react';
import { Row, Col, Button } from 'antd';
import { ProTextArea } from 'components/Lib';
import { connect } from 'react-redux';
import { updateHistory } from 'store/actions/orders';
import { historyStatuses } from 'utils';
import { ReactComponent as ArrowIcon } from 'assets/img/icons/arrow-down.svg';
import CustomTag from '../../../utils/CustomTag/index';
import styles from './styles.module.scss';

const TimelineItem = ({ historyItem, updateHistory }) => {
  const { id, operationId, createdAt, createdBy, description } = historyItem;
  const [isEditible, setIsEditible] = useState(false);
  const [information, setInformation] = useState(description);

  const handleUpdateTimeline = () => {
    updateHistory(id, { description: information }, () => setIsEditible(false));
  };
  return (
    <Row>
      <Col span={13}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.date}>{createdAt?.split(' ')[0]}</span>
          <span className={styles.time}>{createdAt?.split(' ')[1]}</span>
        </div>
      </Col>
      <Col span={11}>
        <div className={styles.TimelineDetails}>
          <div className={styles.userInfo}>
            <img
              width={40}
              height={40}
              src="/img/icons/user.svg"
              alt="user"
              className={styles.icon}
              style={{
                borderRadius: '50%',
                backgroundColor: '#FFF',
                marginRight: '10px',
              }}
            />
            {createdBy}
          </div>
          <CustomTag data={historyStatuses[operationId]} />
          <span className={styles.additional}>Əlavə məlumat</span>
          {isEditible ? (
            <>
              <ProTextArea
                value={information}
                onChange={e => setInformation(e.target.value)}
              />
              <Button
                size="middle"
                onClick={handleUpdateTimeline}
                style={{ fontSize: '12px' }}
                type="primary"
              >
                Yadda saxla
              </Button>
            </>
          ) : (
            <div style={{ width: '100%' }}>
              <Button
                onClick={() => setIsEditible(true)}
                className={styles.editButton}
              >
                <ArrowIcon
                  color="#464A4B"
                  fill="#464A4B"
                  style={{ marginRight: '10px' }}
                />
                Redaktə edin
              </Button>
              {information && (
                <div className={styles.description}>{information}</div>
              )}
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default connect(
  null,
  {
    updateHistory,
  }
)(TimelineItem);
