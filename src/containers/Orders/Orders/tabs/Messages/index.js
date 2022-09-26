/* eslint-disable no-unused-expressions */
import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Button, Spin } from 'antd';
import { ProTextArea } from 'components/Lib';
import { createMessage } from 'store/actions/orders';
import { toast } from 'react-toastify';
import Message from './Message';
import styles from './styles.module.scss';

const Messages = ({
  visible = false,
  createMessage,
  selectedOrder,
  toggleFetchAction,
  isLoading,
  messagesLoading,
  permissions,
}) => {
  const [message, setMessage] = useState(undefined);
  const [color, setColor] = useState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message, isLoading]);

  const handleNewMessage = () => {
    if (message?.length > 1) {
      createMessage({ order: selectedOrder.id, message }, () => {
        setMessage(undefined);
        toggleFetchAction();
      });
      setColor();
    } else {
      toast.error('2 simvoldan az olmamalıdır');
      setColor({ borderColor: '#f5222d' });
    }
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
          <div ref={messagesEndRef} />
        </div>
      </Spin>
      <div style={{ margin: '30px 28px 0 0' }}>
        <ProTextArea
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={!permissions.conversation.write}
          style={message?.length > 1 ? null : color}
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
            disabled={
              isLoading || messagesLoading || !permissions.conversation.write
            }
          >
            Təsdiq et
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedOrder: state.ordersReducer.selectedOrder,
  isLoading: state.ordersReducer.isLoading,
  messagesLoading: state.loadings.addMessage,
});

export default connect(
  mapStateToProps,
  {
    createMessage,
  }
)(Messages);
