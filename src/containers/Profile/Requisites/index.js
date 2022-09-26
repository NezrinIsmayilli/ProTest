import React, { useEffect } from 'react';
import { connect } from 'react-redux';
// ui
import { Row, Col, Button, Input, Form } from 'antd';
import { ProFormItem } from 'components/Lib';

import { messages } from 'utils';
// actions
import {
  editRequisites,
  fetchRequisites,
} from 'store/actions/profile/requisites';
import { fetchProfileInfo } from 'store/actions/profile';
// shared
import DefaultSideBar from '../Sidebar';
import styles from './styles.module.scss';

const baseRules120 = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    max: 120,
    message: messages.maxtextLimitMessage(120),
  },
  {
    min: 3,
    message: messages.mintextLimitMessage(3),
  },
];

const baseRules30 = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    min: 3,
    message: messages.mintextLimitMessage(3),
  },
  {
    max: 30,
    message: messages.maxtextLimitMessage(30),
  },
];
const baseRules30x8 = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    min: 8,
    message: messages.mintextLimitMessage(8),
  },
  {
    max: 30,
    message: messages.maxtextLimitMessage(30),
  },
];

const baseRules34 = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    min: 3,
    message: messages.mintextLimitMessage(3),
  },
  {
    max: 50,
    message: messages.maxtextLimitMessage(50),
  },
];

function RequisitesTab(props) {
  const {
    form,
    requisitesData,
    fetchRequisites,
    editLoading,
    tenant,
    // actions
    editRequisites,
    profile,
    permissionsList,
    fetchProfileInfo,
  } = props;

  const { getFieldDecorator, getFieldError, validateFields } = form;

  useEffect(() => {
    fetchRequisites();
  }, [fetchRequisites]);

  useEffect(() => {
    if (!name) {
      fetchProfileInfo();
    }
  }, []);

  const {
    officialName,
    generalDirector,
    companyVoen,
    bankName,
    bankVoen,
    bankCode,
    correspondentAccount,
    settlementAccount,
    swift,
  } = requisitesData || {};

  const { name } = tenant || {};

  const handleSubmit = e => {
    e.preventDefault();

    validateFields((errors, values) => {
      if (!errors) {
        editRequisites({ ...values });
      }
    });
  };
  const permissionsListReq = permissionsList.filter(
    permission => permission.key === 'tenant_requisites'
  );

  return (
    <>
      <DefaultSideBar />
      <section
        className={`aside-without-navigation scrollbar ${styles.profileSection}`}
      >
        <div className={styles.content}>
          <Row gutter={24} className={styles.requisites}>
            <Col span={24}>
              <h1>Şirkət rekvizitləri</h1>
            </Col>
            <Col span={24} className={styles.header}>
              Şirkət məlumatları
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="Şirkətin adı"
                help={getFieldError('officialName')?.[0]}
              >
                {getFieldDecorator('officialName', {
                  initialValue: officialName === null ? name : officialName,
                  rules: baseRules120,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="Baş direktor"
                help={getFieldError('generalDirector')?.[0]}
              >
                {getFieldDecorator('generalDirector', {
                  initialValue: generalDirector,
                  rules: baseRules120,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="VÖEN (Şirkət)"
                help={getFieldError('companyVoen')?.[0]}
              >
                {getFieldDecorator('companyVoen', {
                  initialValue: companyVoen,
                  rules: baseRules30,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.header}>
              Bank məlumatları
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="Bank adı"
                help={getFieldError('bankName')?.[0]}
              >
                {getFieldDecorator('bankName', {
                  initialValue: bankName,
                  rules: baseRules120,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="VÖEN (Bank)"
                help={getFieldError('bankVoen')?.[0]}
              >
                {getFieldDecorator('bankVoen', {
                  initialValue: bankVoen,
                  rules: baseRules30,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem label="Kod" help={getFieldError('bankCode')?.[0]}>
                {getFieldDecorator('bankCode', {
                  initialValue: bankCode,
                  rules: baseRules30,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="Müxbir hesab (M/h)"
                help={getFieldError('correspondentAccount')?.[0]}
              >
                {getFieldDecorator('correspondentAccount', {
                  initialValue: correspondentAccount,
                  rules: baseRules34,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem
                label="Hesablaşma hesabı (H/h)"
                help={getFieldError('settlementAccount')?.[0]}
              >
                {getFieldDecorator('settlementAccount', {
                  initialValue: settlementAccount,
                  rules: baseRules34,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
            <Col span={24} className={styles.colStyle}>
              <ProFormItem label="S.W.I.F.T" help={getFieldError('swift')?.[0]}>
                {getFieldDecorator('swift', {
                  initialValue: swift,
                  rules: baseRules30x8,
                })(
                  <Input
                    placeholder="Yazın"
                    disabled={permissionsListReq[0]?.permission !== 2}
                  />
                )}
              </ProFormItem>
            </Col>
          </Row>
          {permissionsListReq[0]?.permission !== 2 ? null : (
            <Row gutter={24}>
              <Col span={12} style={{ marginTop: 24 }}>
                {/* SAVE BUTTON */}
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  onClick={handleSubmit}
                  loading={editLoading}
                >
                  Yadda saxla
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  profile: state.profileReducer.profile,
  tenant: state.tenantReducer.tenant,
  requisitesData: state.requisitesReducer.requisitesData,
  editLoading: !!state.loadings.editRequisites,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  { editRequisites, fetchRequisites, fetchProfileInfo }
)(Form.create({ name: 'company' })(RequisitesTab));
