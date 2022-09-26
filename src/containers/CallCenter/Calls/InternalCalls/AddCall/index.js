/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Modal, Spin } from 'antd';
import { ProButton, ProSelect } from 'components/Lib';
import { createStock, editStock } from 'store/actions/stock';
import { toast } from 'react-toastify';
import styles from '../../styles.module.scss';

const AddCall = props => {
  const { visible, toggleVisible, operators } = props;
  const [operatorId, setOperatorId] = useState(undefined);

  const handleOperatorChange = newExpeditorId => {
    setOperatorId(newExpeditorId);
  };
  const onClick = () => {};

  return (
    <Modal
      visible={visible}
      onCancel={() => toggleVisible(false)}
      closable={false}
      footer={null}
      className={styles.customModal}
      destroyOnClose
      maskClosable
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
      <div className={styles.AddCallModal}>
        {/* <Spin spinning={actionLoading}> */}
        <div style={{ marginBottom: '20px' }}>
          <span className={styles.header}>Zəng et</span>
        </div>
        <div>
          <span className={styles.selectLabel}>Operatorlar</span>
          <ProSelect
            value={operatorId}
            allowToClear={false}
            keys={['tenantPersonName', 'tenantPersonLastName']}
            onChange={handleOperatorChange}
            // data={operators.map(operator => ({
            //   ...operator,
            //   id: operator.tenantPersonId,
            // }))}
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <ProButton
            onClick={onClick}
            disabled={!operatorId}
            style={{ marginRight: '10px' }}
          >
            Təsdiq et
          </ProButton>
          <ProButton onClick={() => toggleVisible(false)} type="danger">
            Ləğv et
          </ProButton>
        </div>
        {/* </Spin> */}
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.stockReducer.isLoading,
  actionLoading: state.stockReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  { createStock, editStock }
)(Form.create({ name: 'AddCall' })(AddCall));
