import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { connect } from 'react-redux';

import { Modal, Radio, Button, Row, Col, Divider } from 'antd';
import { InfoBoxItem } from 'components/Lib';
import { today } from 'utils';

// actions
import { createPaymentUrl, resetTotalAndUrl } from 'store/actions/subscription';

import { usePlansContext } from '../plans-context';

import SelectedModules from '../InfoPanel/selected-modules';
import UsersWorkers from '../InfoPanel/users-workers';

import ModalInfoItem from './info-item';

import styles from '../styles.module.scss';

// prevent table rendering in report page when Modal open/close
const PlansModal = forwardRef((props, ref) => {
  const {
    createPaymentUrl,
    resetTotalAndUrl,
    loading,
    total,
    redirect_url,
  } = props;

  const { selectedPacks, limits, priceType } = usePlansContext();

  const [visible, setVisible] = useState(false);
  const [cardType, setCardType] = useState('v');
  const [redirected, setRedirected] = useState(false);

  // open modal from parent
  useImperativeHandle(ref, () => ({
    openModal() {
      setVisible(true);
    },
  }));

  function closeModal() {
    setVisible(false);
  }

  function afterClose() {
    resetTotalAndUrl();
    setRedirected(false);
  }

  function handleGetPaymentUrl() {
    const packages_ul = [];

    // get selected packs id
    for (const key of Object.keys(selectedPacks)) {
      const pack = selectedPacks[key];

      if (pack) {
        packages_ul.push(pack.id);
      }
    }

    const status = priceType === 'priceMonthly' ? 2 : 3;
    const userCount = limits.users;
    const employeeCount = limits.employees;

    createPaymentUrl({
      cardType,
      userCount,
      employeeCount,
      status,
      packages_ul,
    });
  }

  return (
    <Modal
      title="Ödəniş"
      visible={visible}
      onCancel={closeModal}
      afterClose={afterClose}
      footer={null}
      centered
    >
      <Row style={{ marginBottom: 12 }}>
        <Col span={8}>
          <h2>
            <strong>Ödəniş</strong>
          </h2>

          <ModalInfoItem label="Tarix" text={today} />
          <ModalInfoItem label="Ödəniləcək məbləğ" text={`${total} AZN.`} />
        </Col>

        <Col span={16}>
          <Divider type="vertical" className={styles.modalDivider} />

          <div style={{ paddingLeft: 16 }}>
            <SelectedModules />

            <UsersWorkers />
          </div>

          <div style={{ paddingLeft: 16 }}>
            <p>Ödəniş səhifəsinə keçid üçün plastik kart növünü seçin.</p>

            <Radio.Group
              onChange={e => setCardType(e.target.value)}
              value={cardType}
            >
              <Radio value="v">Visa</Radio>
              <Radio value="m">Master Card</Radio>
            </Radio.Group>
          </div>
        </Col>
      </Row>

      <div className={styles.modalButtons}>
        <Button onClick={closeModal}>imtina</Button>

        {redirect_url ? (
          redirected ? (
            <Button type="primary">Ödənişi təsdiq et</Button>
          ) : (
            <Button onClick={() => setRedirected(true)} type="primary">
              <a href={redirect_url} target="_blank" rel="noopener noreferrer">
                Ödəniş səhifəsinə keçid
              </a>
            </Button>
          )
        ) : (
          <Button
            type="primary"
            onClick={handleGetPaymentUrl}
            loading={loading}
          >
            Təsdiq et
          </Button>
        )}
      </div>
    </Modal>
  );
});

const mapStateToProps = state => ({
  loading: !!state.loadings.paymentUrl,
  total: state.subscriptionReducer.total,
  redirect_url: state.subscriptionReducer.redirect_url,
});

export default connect(
  mapStateToProps,
  { createPaymentUrl, resetTotalAndUrl },
  null,
  { forwardRef: true }
)(PlansModal);
