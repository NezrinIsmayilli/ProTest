import React, { useRef } from 'react';
import { connect } from 'react-redux';
// ui
import { Row, Col, Button, Input, Form } from 'antd';
import {
  ProfileLayout,
  ProFormItem,
  ProSelect,
  UserAvatar,
  ProMaskedInput,
} from 'components/Lib';

// utils
import { timezones } from 'utils/timezones.json';
import { defaultFormItemSize, messages } from 'utils';
// actions
import { editTenantInfo } from 'store/actions/profile/tenant';
import { uploadAttachment } from 'store/actions/attachment';

// shared
import { ProfileSkeleton } from '../shared';
import DefaultSideBar from '../Sidebar';

const { TextArea } = Input;

const baseRules = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    max: 100,
    message: messages.maxtextLimitMessage(100),
  },
];

function Company(props) {
  const {
    form,
    tenant,
    // tenantLoading,
    uploadLoading,
    editLoading,
    // actions
    editTenantInfo,
    uploadAttachment,
  } = props;
  const avatarRef = useRef(null);

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    // isFieldsTouched,
  } = form;

  const {
    attachment: tenantAttachment,
    name,
    email,
    phoneNumber,
    website,
    address,
    timezone,
    description,
  } = tenant || {};

  const handleSubmit = e => {
    e.preventDefault();

    validateFields((errors, values) => {
      if (!errors) {
        const { attachment, ...rest } = values;

        const data = {
          ...rest,
          attachment: attachment || tenantAttachment?.id || null,
        };

        const formData = avatarRef.current.getFormData();

        if (formData) {
          uploadAttachment(formData, params =>
            editTenantInfo({ ...data, attachment: params?.data?.id })
          );
        } else {
          editTenantInfo(data);
        }
      }
    });
  };

  if (!name) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <DefaultSideBar />
      <ProfileLayout>
        <Row gutter={24}>
          <Col span={24}>
            {getFieldDecorator('attachment')(
              <UserAvatar
                ref={avatarRef}
                loading={editLoading || uploadLoading}
                src={tenantAttachment?.url}
                attachment={tenantAttachment}
                setFieldsValue={setFieldsValue}
                name={name}
              />
            )}
          </Col>
          <Col span={12}>
            <ProFormItem label="Şirkətin adı" help={getFieldError('name')?.[0]}>
              {getFieldDecorator('name', {
                initialValue: name,
                rules: baseRules,
              })(<Input />)}
            </ProFormItem>

            <ProFormItem label="Əlaqə nömrəsi">
              {getFieldDecorator('phoneNumber', {
                initialValue: phoneNumber,
              })(
                <ProMaskedInput
                  placeholder="(+994) 99 999-99-99"
                  mask="mobilePhoneMask"
                />
              )}
            </ProFormItem>

            <ProFormItem label="Ünvan" help={getFieldError('address')?.[0]}>
              {getFieldDecorator('address', {
                initialValue: address,
                // rules: baseRules,
              })(<Input />)}
            </ProFormItem>
          </Col>

          {/* row 2 */}
          <Col span={12}>
            <ProFormItem label="Email" help={getFieldError('email')?.[0]}>
              {getFieldDecorator('email', {
                initialValue: email,
                rules: [
                  ...baseRules,
                  {
                    type: 'email',
                    message: messages.emailFormat,
                  },
                ],
              })(<Input />)}
            </ProFormItem>

            <ProFormItem label="Web sayt" help={getFieldError('website')?.[0]}>
              {getFieldDecorator('website', {
                initialValue: website,
                rules: [
                  {
                    type: 'url',
                    message: 'Format yalnışdır. Nümunə: prospect.az',
                    transform: value => `https://${value}`,
                  },
                ],
              })(<Input />)}
            </ProFormItem>

            <ProFormItem label="Timezone" help={getFieldError('timezone')?.[0]}>
              {getFieldDecorator('timezone', {
                initialValue: timezone,
                // rules: [
                //   {
                //     required: true,
                //     message: messages.requiredText,
                //   },
                // ],
              })(<ProSelect size={defaultFormItemSize} data={timezones} />)}
            </ProFormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <ProFormItem label="Ətraflı" autoHeight>
              {getFieldDecorator('description', {
                initialValue: description,
              })(<TextArea rows={3} allowClear />)}
            </ProFormItem>
          </Col>

          <Col span={12} style={{ marginTop: 24 }}>
            {/* SAVE BUTTON */}
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              onClick={handleSubmit}
              loading={editLoading || uploadLoading}
              // disabled={!isFieldsTouched()}
            >
              Yadda saxla
            </Button>
            {/* /SAVE BUTTON */}
            {/* delete BUTTON */}
            {/* <Button
            style={{ marginLeft: 16 }}
            type="danger"
            size="large"
            // onClick={handleSubmit}
            // loading={editLoading || uploadLoading}
          >
            Şirkəti sil
          </Button> */}
            {/* /delete BUTTON */}
          </Col>
        </Row>
      </ProfileLayout>
    </>
  );
}

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  // tenantLoading: !!state.loadings.tenant,
  editLoading: !!state.loadings.editTenantInfo,
  uploadLoading: !!state.loadings.uploadAttachment,
});

export default connect(
  mapStateToProps,
  { editTenantInfo, uploadAttachment }
)(Form.create({ name: 'company' })(Company));
