import React, { forwardRef, useImperativeHandle } from 'react';
import { Col, Form, Input, Row } from 'antd';
import { ProContent, ProFormItem, ProMaskedInput } from 'components/Lib';
import { messages } from 'utils';

const emptyRule = {
  required: true,
  message: messages.requiredText,
};

// forward ContactForm ref
const ContactForm = (props, ref) => {
  const { form } = props;
  const { getFieldDecorator, getFieldError } = form;

  // expose form to control it from parent
  useImperativeHandle(ref, () => ({
    form,
  }));

  return (
    <Form ref={ref}>
      <ProContent title="2. Əlaqə">
        <Row gutter={16}>
          {/* Email - required */}
          <Col span={8}>
            <ProFormItem label="Email" help={getFieldError('email')?.[0]}>
              {getFieldDecorator('email', {
                rules: [
                  emptyRule,
                  {
                    type: 'email',
                    message: messages.emailFormat,
                  },
                  {
                    max: 50,
                    message: messages.maxtextLimitMessage(50),
                  },
                ],
              })(<Input />)}
            </ProFormItem>
          </Col>

          {/* Telefon - required */}
          <Col span={8}>
            <ProFormItem
              label="Telefon"
              help={getFieldError('phoneNumber')?.[0]}
            >
              {getFieldDecorator('phoneNumber', {
                rules: [
                  emptyRule,
                  {
                    min: 12,
                    message: 'Nömrə düzgün daxil edilməyib.',
                    transform: value =>
                      String(value)
                        .replace(/ /g, '')
                        .replace(/_/g, '')
                        .replace(/-/g, '')
                        .replace('(', '')
                        .replace(')', ''),
                  },
                  {
                    message: 'Nömrə düzgün daxil edilməyib.',
                    transform: value => {
                      if (value) {
                        const regex = /(\+|)994(012|060|099|010|050|051|055|070|077|099|12|60|99|10|50|51|55|70|77|99)\d{7}$/;
                        if (!regex.test(value)) return false;
                      }
                      return `(111) 11 111 11 11`;
                    },
                  },
                ],
              })(
                <ProMaskedInput style={{ height: 32 }} mask="mobilePhoneMask" />
              )}
            </ProFormItem>
          </Col>

          {/* Vebsayt */}
          <Col span={8}>
            <ProFormItem label="Vebsayt" help={getFieldError('website')?.[0]}>
              {getFieldDecorator('website', {
                initialValue: '',
                rules: [{ max: 30, message: messages.maxtextLimitMessage(30) }],
              })(<Input />)}
            </ProFormItem>
          </Col>
        </Row>
      </ProContent>
    </Form>
  );
};

export default Form.create({ name: 'contactForm' })(forwardRef(ContactForm));
