import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Button, Spin } from 'antd';
import { ProTextArea } from 'components/Lib';
import { createMessage } from 'store/actions/orders';
import Message from './Message';
import styles from './styles.module.scss';

const Messages = ({
  visible = false,
  createMessage,
  selectedOrder,
  toggleFetchAction,
  isLoading,
  messagesLoading,
}) => {
  const [message, setMessage] = useState(undefined);

  const handleNewMessage = () => {
    createMessage({ order: selectedOrder.id, message }, () => {
      setMessage(undefined);
      toggleFetchAction();
    });
  };
  return (
    <div className={styles.Messages} style={visible ? {} : { display: 'none' }}>
      <Spin spinning={isLoading}>
        <div className={styles.messagesContainer}>
          {selectedOrder.messages.map(message => (
            <Message
              key={message.id}
              author={message.createdBy}
              date={message.createdAt}
              message={message.message}
            />
          ))}
        </div>
      </Spin>
      <div style={{ margin: '30px 28px 0 0' }}>
        <ProTextArea
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled
        />
      </div>
      <Row>
        <Col span={4}>
          <Button
            style={{
              backgroundColor: '#55AB80',
              width: '100%',
              fontSize: '14px',
              color: 'white',
              marginTop: '12px',
            }}
            onClick={handleNewMessage}
            size="large"
            loading={messagesLoading}
            disabled
          >
            Təsdiq et
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  // selectedOrder: state.ordersReducer.selectedOrder,
  isLoading: state.ordersReducer.isLoading,
  messagesLoading: state.loadings.addMessage,
});

export default connect(
  mapStateToProps,
  {
    createMessage,
  }
)(Messages);
