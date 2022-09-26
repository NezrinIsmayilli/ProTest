import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProButton, ProModal, ProFormItem, ProSelect } from 'components/Lib';
import { Row, Col, Spin, Form } from 'antd';
import {
  createFBIntegration,
  fetchFbChannelInfo,
  fetchFbPagesList,
  changeFbPage,
  deactiveFbPage,
} from 'store/actions/settings/integrations';
import { messages } from 'utils';

import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

// shared components
import { toast } from 'react-toastify';

import styles from '../../index.module.sass';
import formStyle from './styles.module.scss';

function Integration(props) {
  const {
    createFBIntegration,
    fetchFbChannelInfo,
    fetchFbPagesList,
    changeFbPage,
    deactiveFbPage,

    fbIntegrationLoading,
    fbChannelInfo,
    fbPagesList,
    actionLoading,
    fbPageChangeLoading,
    fbPagedeactivateLoading,

    form,
  } = props;

  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    setFields,
    getFieldValue,
    resetFields,
  } = form;

  const requiredRule = {
    required: true,
    message: messages.requiredText,
  };

  useEffect(() => {
    fetchFbChannelInfo();
    fetchFbPagesList();
  }, [fetchFbChannelInfo, fetchFbPagesList]);

  useEffect(() => {
    setFieldsValue({ pageId: fbChannelInfo?.pageId });
  }, [fbChannelInfo, fbPagesList.length, setFieldsValue]);

  const responseFacebook = response => {
    if (response) {
      createFBIntegration({
        accessToken: response.accessToken,
        grantedScopes: response.grantedScopes,
        userId: response.userID,
        onSuccessCallback: () => {
          fetchFbChannelInfo();
          fetchFbPagesList();
        },
      });
    }
  };

  const [modalFbVisible, setModalFbVisible] = React.useState(false);

  const handleFbSettings = () => {
    setModalFbVisible(!modalFbVisible);
  };
  const handleFbReIntegrate = () => {
    changeFbPage({
      pageId: fbChannelInfo?.pageId,
      onSuccessCallback: () => {
        fetchFbChannelInfo();
        fetchFbPagesList();
      },
    });
  };

  const handleCancelFbIntegration = () => {
    deactiveFbPage({
      onSuccessCallback: () => {
        handleFbSettings();
        fetchFbChannelInfo();
        fetchFbPagesList();
      },
    });
  };

  const handleChangeFbPage = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { pageId } = values;

        if (pageId) {
          changeFbPage({ pageId, onSuccessCallback: () => handleFbSettings() });
        }
      }
    });
  };

  return (
    <div>
      <Row>
        <Col>
          <Spin size="large" spinning={actionLoading}>
            <table
              className={`${styles['table-msk']} ${styles['table-msk-integration']
                }`}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>Kanallar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Facebook</td>
                  <td>
                    <Spin size="small" spinning={fbIntegrationLoading}>
                      {fbChannelInfo.isActive && fbPagesList.length > 0 ? (
                        <ProButton icon="setting" onClick={handleFbSettings}>
                          Düzəliş et
                        </ProButton>
                      ) : !fbChannelInfo.isActive && fbPagesList.length > 0 ? (
                        <ProButton
                          icon="poweroff"
                          onClick={handleFbReIntegrate}
                          loading={fbPageChangeLoading}
                        >
                          Yenidən qoşul
                        </ProButton>
                      ) : (
                        <FacebookLogin
                          appId="1251457108613116"
                          callback={responseFacebook}
                          scope="email,pages_messaging,pages_show_list,pages_manage_ads,pages_manage_cta,pages_manage_metadata"
                          fields="name,email,picture"
                          version="12.0"
                          returnScopes
                          render={renderProps => (
                            <ProButton
                              icon="poweroff"
                              onClick={renderProps.onClick}
                            >
                              Qoşulmaq
                            </ProButton>
                          )}
                        />
                      )}
                    </Spin>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Whatsapp</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>İnstagram</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Telegram</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Twitter</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>E-mail</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Onlayn çat</td>
                  <td>
                    <ProButton icon="poweroff">Qoşulmaq</ProButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
      <ProModal
        maskClosable
        padding
        width={400}
        handleModal={() => setModalFbVisible(false)}
        isVisible={modalFbVisible}
      >
        <div className={formStyle.modalContainer}>
          <h2>Düzəliş et</h2>
          <Form onSubmit={handleChangeFbPage} noValidate>
            <ProFormItem
              label="Facebook səhifəsi"
              help={getFieldError('pageId')?.[0]}
            >
              {getFieldDecorator('pageId', {
                rules: [requiredRule],
              })(
                <ProSelect
                  data={fbPagesList}
                  placeholder="Səhifəni seçin"
                  key={['id']}
                />
              )}
            </ProFormItem>
            <div className={formStyle.formButtons}>
              <ProButton
                className={formStyle.cancelButton}
                onClick={handleCancelFbIntegration}
                loading={fbPagedeactivateLoading}
              >
                Qoşulmanı ləğv et
              </ProButton>
              <ProButton htmlType="submit" loading={fbPageChangeLoading}>
                Düzəliş et
              </ProButton>
            </div>
          </Form>
        </div>
      </ProModal>
    </div>
  );
}

Integration.propTypes = {};

const WrappedIntegration = Form.create({ name: 'integrationSettings' })(
  Integration
);

const mapStateToProps = state => ({
  actionLoading: state.IntegrationReducer.actionLoading,
  fbIntegrationLoading: state.IntegrationReducer.fbIntegrationLoading,
  fbChannelInfo: state.IntegrationReducer.fbChannelInfo,
  fbPagesList: state.IntegrationReducer.fbPagesList,
  fbPageChangeLoading: state.IntegrationReducer.fbPageChangeLoading,
  fbPagedeactivateLoading: state.IntegrationReducer.fbPagedeactivateLoading,
});

export default connect(
  mapStateToProps,
  {
    createFBIntegration,
    fetchFbChannelInfo,
    fetchFbPagesList,
    changeFbPage,
    deactiveFbPage,
  }
)(WrappedIntegration);
