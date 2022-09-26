import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Divider } from 'antd';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import styles from '../styles.module.scss';

const { TextArea } = Input;

export function DeleteModal({ row, deleteOperation, setVisible, visible }) {
  const [description, setDescription] = useState(undefined);
  const handleDelete = () => {
    setVisible(false);
    deleteOperation(row.id, description);
  };
  useEffect(() => {
    if (!visible) {
      setDescription(undefined);
    }
  }, [visible]);
  return (
    <Modal
      visible={visible}
      footer={null}
      className={styles.deleteModal}
      onCancel={() => setVisible(false)}
    >
      <div style={{ padding: 24, paddingBottom: 12 }}>
        <h6 className={styles.deleteModalTitle}>Silinmə səbəbini qeyd edin</h6>
        <TextArea
          rows={4}
          onChange={e => {
            setDescription(e.target.value);
          }}
          value={description}
        />

        <Divider style={{ marginBottom: 0 }} />
      </div>
      <div className={styles.modalAction}>
        <Button
          type="primary"
          onClick={handleDelete}
          style={{ marginRight: 6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MdCheckCircle size={18} style={{ marginRight: 4 }} />
            Təsdiq et
          </div>
        </Button>
        <Button
          type="primary"
          className={styles.rejectButton}
          onClick={() => setVisible(false)}
          style={{ marginRight: 6 }}
        >
          <MdClose size={18} style={{ marginRight: 4 }} />
          İmtina
        </Button>
      </div>
    </Modal>
  );
}
