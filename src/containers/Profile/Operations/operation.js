import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon } from 'antd';
import { ProButton, ProWarningModal } from 'components/Lib';
import DefaultSideBar from '../Sidebar';
import DeleteToasts from './deleteToasts';
import Warning from './deleteToasts/warning';
import PasswordModal from './deleteToasts/passwordModal';
import styles from './index.module.sass';

function Operation() {
  const [details, setDetails] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [data, setData] = useState({});
  const removeStock = () => {
    setIsOpenWarningModal(true);
  };

  const handleWarningModalClose = () => {
    setIsOpenWarningModal(false);
    setData({});
  };

  const handleArchive = () => {
    setDetails(true);
    setIsOpenWarningModal(false);
  };

  return (
    <>
      <ProWarningModal
        open={isOpenWarningModal}
        titleIcon={<Icon type="warning" />}
        bodyTitle="Silinmiş məlumatlar geri qaytarılmayacaq! Davam etmək istədiyinizə əminsinizmi?"
        bodyContent=" "
        okFunc={() => handleArchive()}
        onCancel={handleWarningModalClose}
      />

      <DefaultSideBar />
      <DeleteToasts
        visible={passwordModal}
        toggleVisible={setPasswordModal}
        setData={setData}
        data={data}
      />
      <Warning
        visible={warningModal}
        toggleVisible={setWarningModal}
        setData={setData}
        removeStock={removeStock}
      />
      <PasswordModal
        visible={details}
        toggleVisible={setDetails}
        setPasswordModal={setPasswordModal}
        setWarningModal={setWarningModal}
        setData={setData}
        setIsOpenWarningModal={setIsOpenWarningModal}
        data={data}
      />
      <section className="scrollbar aside" style={{ padding: '0 32px' }}>
        <div className={styles.content}>
          <Row>
            <Row>
              <Col span={16} className={styles.integration}>
                <Col span={17} className={styles.desc}>
                  <div>
                    <h2>Əməliyyatların silinməsi</h2>
                    <p>
                      Əməliyyatların silinməsini yerinə yetirsəniz, sistemə
                      əlavə edilmiş Bron, Ticarət, Maliyyə və İstehsalat
                      əməliyyatlarının hamısı silinəcəkdir. Silinmiş
                      məlumatların geri qaytarılması mümkün olmayacaq.
                    </p>
                  </div>
                </Col>
                <Col span={6} className={styles.button}>
                  <div className={styles.btnIcons}>
                    <ProButton
                      shape="circle"
                      icon="delete"
                      onClick={removeStock}
                      style={{
                        backgroundColor: '#e56a6b',
                      }}
                    >
                      Əməliyyatları sil
                    </ProButton>
                  </div>
                </Col>
              </Col>
            </Row>
          </Row>
        </div>
      </section>
    </>
  );
}
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {}
)(Operation);
