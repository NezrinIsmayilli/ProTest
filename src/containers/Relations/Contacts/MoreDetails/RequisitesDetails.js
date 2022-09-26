import React from 'react';
import { Row, Col, Tooltip } from 'antd';
import IconButton from '../../utils/IconButton/index';
import Section from './Section';
import styles from './styles.module.scss';

const RequisitesDetails = row => {
  const {
    name,
    officialName,
    generalDirector,
    companyVoen,
    bankName,
    bankVoen,
    bankCode,
    correspondentAccount,
    settlementAccount,
    swift,
  } = row.row;

  return (
    <div className={styles.MoreDetails}>
      <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
        <Tooltip title={`${name || ''}`}>
          <Col span={12} className={styles.header}>
            {name || '-'}
          </Col>
        </Tooltip>

        <Col span={12} align="end">
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={window.print}
          />
        </Col>
      </Row>

      <Section
        section="Şirkət adı"
        value={
          <Tooltip title={`${officialName || ''}`}>
            <Col span={12} className={styles.ellipsis}>
              {officialName || '-'}
            </Col>
          </Tooltip>
        }
      />
      <Section section="Baş direktor" value={generalDirector || '-'} />
      <Section section="VÖEN (Şirkət)" value={companyVoen || '-'} />
      <Section section="Bank adı" value={bankName || '-'} />
      <Section section="VÖEN (Bank)" value={bankVoen || '-'} />
      <Section section="Kod" value={bankCode || '-'} />
      <Section
        section="Müxbir hesab (M/h)"
        value={correspondentAccount || '-'}
      />
      <Section
        section="Hesablaşma hesabı (H/h)"
        value={settlementAccount || '-'}
      />
      <Section section="S.W.I.F.T." value={swift || '-'} />
    </div>
  );
};
export default RequisitesDetails;
