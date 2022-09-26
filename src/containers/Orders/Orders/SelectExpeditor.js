import React, { useState, useEffect } from 'react';
import { ProSelect, ProButton } from 'components/Lib';
import styles from './styles.module.scss';

const SelectExpeditor = props => {
  const {
    prevExpeditorId,
    expeditors,
    toggleExpeditorModal,
    updateToDeliveryStage,
  } = props;

  const [expeditorId, setExpeditorId] = useState(undefined);

  const handleExpeditorChange = newExpeditorId => {
    setExpeditorId(newExpeditorId);
  };
  const onClick = () => {
    updateToDeliveryStage(expeditorId);
    toggleExpeditorModal();
  };

  useEffect(() => {
    setExpeditorId(prevExpeditorId || undefined);
  }, [prevExpeditorId]);
  return (
    <div>
      <h2>Ekspeditoru seç</h2>
      <div>
        <span className={styles.selectLabel}>Ekspeditorlar</span>
        <ProSelect
          value={expeditorId}
          allowToClear={false}
          keys={['tenantPersonName', 'tenantPersonLastName']}
          onChange={handleExpeditorChange}
          data={expeditors.map(expeditor => ({
            ...expeditor,
            id: expeditor.tenantPersonId,
          }))}
        />
      </div>
      <div style={{ margin: '10px 0' }}>
        <ProButton
          onClick={onClick}
          disabled={!expeditorId}
          style={{ marginRight: '10px' }}
        >
          Təsdiq et
        </ProButton>
        <ProButton onClick={toggleExpeditorModal} type="danger">
          Ləğv et
        </ProButton>
      </div>
    </div>
  );
};

export default SelectExpeditor;
