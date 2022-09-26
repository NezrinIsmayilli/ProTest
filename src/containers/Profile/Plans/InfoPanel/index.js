import React, { Fragment, useRef } from 'react';

import { Icon, Row, Col, Button } from 'antd';
import { ButtonYellowFill } from 'components/Lib';

import { FaPen } from 'react-icons/fa';

import { usePlansContext } from '../plans-context';

import PlansModal from '../Modal';
import PriceTypeToggler from './price-type-toggler';
import Status from './status';
import SelectedModules from './selected-modules';
import UsersWorkers from './users-workers';
import Overallprice from './overall-price';

import styles from '../styles.module.scss';

function InfoPanel() {
  const modalRef = useRef(null);

  const { editModeOn, editModeOff, editMode: isEditMode } = usePlansContext();

  const openModal = () => {
    editModeOff({ reset: false });
    modalRef.current.openModal();
  };
  return (
    <Fragment>
      <div className={styles.infoPanelWrap}>
        <div className={styles.infoPanelContent}>
          <PriceTypeToggler />

          <Status />

          <SelectedModules />

          <UsersWorkers />
         
        </div>
      </div>

      <Overallprice />

      {isEditMode ? (
        <Row gutter={16}>
          <Col span={12}>
            <Button type="primary" size="large" block onClick={openModal}>
              Təsdiqlə
            </Button>
          </Col>

          <Col span={12}>
            <Button size="large" block onClick={editModeOff}>
              İmtina
            </Button>
          </Col>
        </Row>
      ) : (
        <ButtonYellowFill block size="large" onClick={editModeOn}>
          Planı dəyiş <Icon component={FaPen} />
        </ButtonYellowFill>
      )}

      <PlansModal ref={modalRef} />
    </Fragment>
  );
}

export default InfoPanel;
