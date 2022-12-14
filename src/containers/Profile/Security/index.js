import React from 'react';
import { connect } from 'react-redux';
// ui
import { Row, Col, Button, Input, Form, Popover } from 'antd';
import { ProfileLayout, ProFormItem } from 'components/Lib';

// utils
import { messages } from 'utils';
import { checkSpaceinValue } from 'utils/inputValidations';
// actions
import { changePassword } from 'store/actions/profile/main';

// shared
import { ProfileSkeleton } from '../shared';
import DefaultSidebar from '../Sidebar';
// styles
import styles from './styles.module.scss';

const oneLowerCharacter = /^(?=.*[a-z])/;
const oneUpperCharacter = /^(?=.*[A-Z])/;
const oneDigit = /(?=.*\d)/;
const oneNonWordCharacter = /([~?_=,.:;'"<*&{(^%$>\][+!@)}/|-])/;
const special_symbols = `(<*&(^%$>!@)`;
const {
  requiredText,
  mintextLimitMessage,
  maxtextLimitMessage,
  noWhitespaceMessage,
  passwordRepeatError,
  wrongInformation,
} = messages;
const whitespaceRule = {
  whitespace: true,
  message: noWhitespaceMessage,
  validator: (rule, value, callback) => {
    if (checkSpaceinValue(value)) {
      callback(true);
    } else {
      callback();
    }
  },
};
const requiredRule = {
  required: true,
  message: requiredText,
};

const passwordMinRule = {
  min: 6,
  message: mintextLimitMessage(6),
};

const passwordMaxRule = {
  max: 250,
  message: maxtextLimitMessage(250),
};
const rules = [
  {
    required: true,
    message: messages.requiredText,
  },
  {
    max: 100,
    message: messages.maxtextLimitMessage(100),
  },
];

function Security(props) {
  const {
    form,
    tenant,
    profile,
    profileLoading,
    changePasswordLoading,
    // actions
    changePassword,
  } = props;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    getFieldValue,
    resetFields,
  } = form;

  const { email, username } = profile || {};
  const fullName = profile?.name.concat(' ', profile.lastname);
  const company = tenant.name;
  const popOverContent = () => {
    const oldPassword = getFieldValue('oldPassword');
    const password = getFieldValue('newPassword');
    return (
      <div style={{ padding: '10px 20px', maxWidth: '340px' }}>
        <p
          className={styles.field}
          style={
            password && password?.length > 7
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? ??n az?? 8 simvoldan ibar??t olmal??d??r
        </p>
        <p
          className={styles.field}
          style={
            password && oneLowerCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? ??n az?? 1 ki??ik h??rfd??n ibar??t olmal??d??r
        </p>
        <p
          className={styles.field}
          style={
            password && oneUpperCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? ??n az?? 1 b??y??k h??rfd??n ibar??t olmal??d??r
        </p>
        <p
          className={styles.field}
          style={
            password && oneDigit.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? ??n az?? 1 r??q??md??n ibar??t olmal??d??r
        </p>
        <p
          className={styles.field}
          style={
            password && oneNonWordCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? ??n az?? 1 x??susi simvoldan {special_symbols} ibar??t olmal??d??r.
        </p>
        <p
          className={styles.field}
          style={
            password && (password !== fullName || password !== company)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? Daxil edilmi?? ??irk??t ad?? v?? ya tam ad?? il?? eyni ola bilm??z
        </p>
        <p
          className={styles.field}
          style={
            password && password !== oldPassword
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? Yeni ??ifr?? cari ??ifr?? il?? eyni ola bilm??z
        </p>
        <p
          className={styles.field}
          style={
            password && !checkSequence(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? Ard??c??ll??qdan ibar??t ola bilm??z
        </p>
      </div>
    );
  };
  const checkSequence = value => {
    let count = 0;
    for (let i = 1; i < value.length; i += 1) {
      if (value.charCodeAt(i) - value.charCodeAt(i - 1) === 1) count += 1;
      else count = 0;
      if (count === 2) return true;
    }
    return false;
  };
  const validateToNextPassword = (rule, value, callback) => {
    const oldPassword = getFieldValue('oldPassword');
    if (value?.length < 8) {
      return callback('??n az?? 8 simvoldan ibar??t olmal??d??r');
    }
    if (!oneLowerCharacter.test(value)) {
      return callback('??n az?? 1 ki??ik h??rfd??n ibar??t olmal??d??r');
    }
    if (!oneUpperCharacter.test(value)) {
      return callback('??n az?? 1 b??y??k h??rfd??n ibar??t olmal??d??r');
    }
    if (!oneDigit.test(value)) {
      return callback('??n az?? 1 r??q??md??n ibar??t olmal??d??r');
    }
    if (!oneNonWordCharacter.test(value)) {
      return callback(
        `??n az?? 1 x??susi simvoldan ${special_symbols} ibar??t olmal??d??r.`
      );
    }
    if (value === fullName || value === company) {
      return callback(
        'Daxil edilmi?? ??irk??t ad?? v?? ya tam ad?? il?? eyni ola bilm??z'
      );
    }
    if (value === oldPassword) {
      return callback('Yeni ??ifr?? cari ??ifr?? il?? eyni ola bilm??z');
    }
    if (value && checkSequence(value)) {
      return callback('??ifr?? ard??c??ll??qdan ibar??t ola bilm??z.');
    }
    return callback();
  };
  const handleSubmit = e => {
    e.preventDefault();

    validateFields((errors, values) => {
      if (!errors) {
        changePassword({
          data: values,
          onSuccessCallback: () => {
            resetFields();
          },
        });
      }
    });
  };

  const compareNewPasswords = (rule, value, callback) => {
    if (value && value !== getFieldValue('newPassword')) {
      callback(messages.passwordRepeatError);
    } else {
      callback();
    }
  };

  if (!email && profileLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <DefaultSidebar />
      <ProfileLayout>
        <Row gutter={24}>
          <Col span={12}>
            <ProFormItem label="??stifad????i ad??">
              <Input disabled value={username} />
            </ProFormItem>
            <ProFormItem noStyle style={{ marginBottom: '50px' }}>
              {getFieldDecorator('test', {})(
                <Popover
                  trigger="click"
                  placement="right"
                  arrowPointAtCenter
                  content={popOverContent()}
                  title="??ifr??:"
                >
                  <ProFormItem
                    label="Yeni ??ifr??"
                    help={getFieldError('newPassword')?.[0]}
                    style={{ marginBottom: '50px' }}
                  >
                    {getFieldDecorator('newPassword', {
                      rules: [
                        {
                          validator: validateToNextPassword,
                        },
                        whitespaceRule,
                        requiredRule,
                        passwordMinRule,
                        passwordMaxRule,
                      ],
                    })(<Input.Password />)}
                  </ProFormItem>
                </Popover>
              )}
            </ProFormItem>

            {/* SAVE BUTTON */}
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              onClick={handleSubmit}
              loading={changePasswordLoading}
            >
              Yadda saxla
            </Button>
            {/* /SAVE BUTTON */}
          </Col>

          {/* row 2 */}
          <Col span={12}>
            <ProFormItem
              label="Cari ??ifr??"
              help={getFieldError('oldPassword')?.[0]}
            >
              {getFieldDecorator('oldPassword', {
                rules,
              })(<Input.Password />)}
            </ProFormItem>

            <ProFormItem
              label="Yeni ??ifr??nin t??krar??"
              help={getFieldError('newPasswordRepeat')?.[0]}
            >
              {getFieldDecorator('newPasswordRepeat', {
                rules: [
                  ...rules,
                  {
                    validator: compareNewPasswords,
                  },
                ],
              })(<Input.Password />)}
            </ProFormItem>
          </Col>
        </Row>
      </ProfileLayout>
    </>
  );
}

const mapStateToProps = state => ({
  profile: state.profileReducer.profile,
  profileLoading: !!state.loadings.fetchProfile,
  changePasswordLoading: !!state.loadings.changePassword,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  { changePassword }
)(Form.create({ name: 'Security' })(Security));
