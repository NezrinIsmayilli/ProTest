import React from 'react';
// ui
import { Row, Input } from 'antd';
import { ProFormItem } from 'components/Lib';

import { messages } from 'utils';
import styles from './styles.module.scss';

const baseRules120 = [
  {
    max: 120,
    message: messages.maxtextLimitMessage(120),
  },
  {
    min: 3,
    message: messages.mintextLimitMessage(3),
  },
];
const baseRules300 = [
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
    min: 8,
    message: messages.mintextLimitMessage(8),
  },
  {
    max: 30,
    message: messages.maxtextLimitMessage(30),
  },
];
const baseRules30 = [
  {
    min: 3,
    message: messages.mintextLimitMessage(3),
  },
  {
    max: 30,
    message: messages.maxtextLimitMessage(30),
  },
];
const baseRules50 = [
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
  const { form } = props;

  const { getFieldDecorator, getFieldError } = form;

  return (
    <>
      <Row className={styles.sectionHeader}>
        <span>Şəxsi məlumatlar</span>
      </Row>

      <ProFormItem
        label="Şirkətin adı"
        help={getFieldError('officialName')?.[0]}
      >
        {getFieldDecorator('officialName', {
          rules: baseRules120,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem
        label="Baş direktor"
        help={getFieldError('generalDirector')?.[0]}
      >
        {getFieldDecorator('generalDirector', {
          rules: baseRules120,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem
        label="VÖEN (Şirkət)"
        help={getFieldError('companyVoen')?.[0]}
      >
        {getFieldDecorator('companyVoen', {
          rules: baseRules300,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <Row className={styles.sectionHeader}>
        <span>Bank məlumatları</span>
      </Row>

      <ProFormItem label="Bank adı" help={getFieldError('bankName')?.[0]}>
        {getFieldDecorator('bankName', {
          rules: baseRules120,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem label="VÖEN (Bank)" help={getFieldError('bankVoen')?.[0]}>
        {getFieldDecorator('bankVoen', {
          rules: baseRules300,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem label="Kod" help={getFieldError('bankCode')?.[0]}>
        {getFieldDecorator('bankCode', {
          rules: baseRules30,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem
        label="Müxbir hesab (M/h)"
        help={getFieldError('correspondentAccount')?.[0]}
      >
        {getFieldDecorator('correspondentAccount', {
          rules: baseRules50,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem
        label="Hesablaşma hesabı (H/h)"
        help={getFieldError('settlementAccount')?.[0]}
      >
        {getFieldDecorator('settlementAccount', {
          rules: baseRules50,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>

      <ProFormItem label="S.W.I.F.T" help={getFieldError('swift')?.[0]}>
        {getFieldDecorator('swift', {
          rules: baseRules30x8,
        })(<Input placeholder="Yazın" />)}
      </ProFormItem>
    </>
  );
}

export default RequisitesTab;
