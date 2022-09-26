import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Button } from 'antd';
import { Can, ExcelButton } from 'components/Lib';

import { fetchHrmPenalties } from 'store/actions/hrm/fines';
import { exportFileDownloadHandle } from 'utils';
import { currentYear, currentMonth } from 'utils/constants';

import { permissions, accessTypes } from 'config/permissions';
import Modal from './Modal';

import styles from '../styles.module.scss';

function SettingsPanel(props) {
  const {
    exportFileDownloadHandle,
    isLoadingExport,
    yearAndMonth,
    filters,
  } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const handleCancel = () => setModalOpen(false);

  const openModal = () => setModalOpen(true);

  return (
    <Fragment>
      <Row gutter={24} className={styles.settingsWrap}>
        <Col span={17} className={styles.textColsWrap}>
          <div className={styles.infoText}>
            Davamiyyət üzrə cərimələr cədvəli
          </div>
        </Col>

        <Col span={7} className={styles.buttonsCol}>
          <Can I={accessTypes.manage} a={permissions.lateness_report}>
            <Button
              icon="tool"
              type="link"
              onClick={openModal}
              className={styles.settingsButton}
            >
              Tənzimləmələr
            </Button>
          </Can>
          <Can I={accessTypes.manage} a={permissions.lateness_report}>
            <ExcelButton
              loading={isLoadingExport}
              onClick={() =>
                exportFileDownloadHandle(
                  'exportFinesReport',
                  `/hrm/report/lateness-penalties/export/${currentYear}/${currentMonth}`
                )
              }
            />
          </Can>
        </Col>
      </Row>
      <Modal
        handleCancel={handleCancel}
        modalOpen={modalOpen}
        yearAndMonth={yearAndMonth}
        filters={filters}
      />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  isLoadingExport: !!state.loadings.exportFinesReport,
});

export default connect(
  mapStateToProps,
  {
    exportFileDownloadHandle,
    fetchHrmPenalties,
  }
)(SettingsPanel);
