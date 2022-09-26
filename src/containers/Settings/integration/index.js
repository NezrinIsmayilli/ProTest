import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import { Can, ProButton, ProDots, ProDotsItem } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { logoutProJobs } from 'store/actions/auth';
import { toast } from 'react-toastify';
import logo from 'assets/img/logo-red.svg';
import swal from 'sweetalert';
import Login from './login';
import Details from './MoreDetails/details';
import styles from './index.module.sass';

function Integration({
  actionLoading,
  logoutProJobs,
  loginProJobsData,
  permissionsList,
}) {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  const removeStock = () => {
    swal({
      title: 'Diqqət!',
      text: 'Çıxış etmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Bəli'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        logoutProJobs();
        const integration = 'Uğurla çıxış edildi.';
        toast.success(integration);
      }
    });
  };

  const permissionsListIntegration = permissionsList.filter(
    permission => permission.key === 'msk_integrations'
  );

  return (
    <>
      <Login visible={visible} toggleVisible={setVisible} />
      <Details
        visible={details}
        toggleVisible={setDetails}
        data={loginProJobsData}
      />
      <div className={styles.body}>
        <div className={styles['btn-container']}>
          <Row>
            <Col span={16} className={styles.integration}>
              <Col span={6} className={styles.logo}>
                <div>
                  <a href="https://projobs.az/" target="blank">
                    <img src={logo} alt="ProJobs" />
                  </a>
                </div>
              </Col>
              <Col span={12} className={styles.desc}>
                <div>
                  <h2>Projobs.az</h2>
                  <p>
                    Projobs.az iş axtaranların və insan resursları
                    əməkdaşlarının işini asanlaşdırmaq üçün yaradılmış
                    portaldır.
                  </p>
                </div>
              </Col>
              <Col span={6} className={styles.button}>
                <div className={styles.btnIcons}>
                  {loginProJobsData.length === 0 ? (
                    <ProButton
                      shape="circle"
                      icon="poweroff"
                      onClick={() => setVisible(true)}
                      style={{
                        backgroundColor: '#e56a6b',
                      }}
                      loading={actionLoading}
                      disabled={permissionsListIntegration[0].permission !== 2}
                    >
                      Qoşul
                    </ProButton>
                  ) : (
                    <>
                      <ProButton
                        shape="circle"
                        icon="check-circle"
                        // onClick={() => setVisible(true)}
                        style={{
                          backgroundColor: '#55ab80',
                        }}
                        loading={actionLoading}
                      >
                        Qoşulub
                      </ProButton>

                      <Can
                        I={accessTypes.manage}
                        a={permissions.msk_integrations}
                      >
                        <ProDots placement="right">
                          <ProDotsItem
                            label="Əlavə məlumat"
                            icon="info"
                            onClick={() => setDetails(true)}
                          />
                          <ProDotsItem
                            label="Çıxış"
                            icon="logout"
                            onClick={removeStock}
                          />
                        </ProDots>
                      </Can>
                    </>
                  )}
                </div>
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
const mapStateToProps = state => ({
  actionLoading: state.authReducer.actionLoading,
  apiError: state.authReducer.apiError,
  loginProJobsData: state.authReducer.loginProJobsData,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  { logoutProJobs }
)(Integration);
